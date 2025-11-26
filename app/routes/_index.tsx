import { json, unstable_parseMultipartFormData, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Anthropic } from "@anthropic-ai/sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { useRef, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "HandyBid AI - Quick Estimates in the Field" },
    { name: "description", content: "Generate professional bid estimates instantly with AI" }
  ];
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  try {
    const contentType = request.headers.get("content-type") || "";
    let description = "";
    const uploadedImages: Array<{ buffer: Buffer; contentType: string }> = [];

    if (contentType.includes("multipart/form-data")) {
      // Handle file uploads
      const formData = await unstable_parseMultipartFormData(request, async ({ name, data, filename }) => {
        if (name === "photos" && filename) {
          const chunks = [];
          for await (const chunk of data) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          // Upload to S3
          const bucketName = process.env.PHOTO_BUCKET_NAME;
          if (bucketName) {
            const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
            const key = `uploads/${Date.now()}-${filename}`;

            await s3Client.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: buffer,
                ContentType: filename?.endsWith('.png') ? 'image/png' :
                           filename?.endsWith('.jpg') || filename?.endsWith('.jpeg') ? 'image/jpeg' :
                           'image/*',
              })
            );
          }

          // Store for vision API
          uploadedImages.push({
            buffer,
            contentType: filename?.endsWith('.png') ? 'image/png' : 'image/jpeg',
          });

          // Return the key as a string for the form data
          return `photo-${uploadedImages.length - 1}`;
        }

        // For non-file fields, collect as string
        const chunks = [];
        for await (const chunk of data) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks).toString();
      });

      description = formData.get("description")?.toString() || "";
    } else {
      // Regular form submission without files
      const formData = await request.formData();
      description = formData.get("description")?.toString() || "";
    }

    if (!description || description.length === 0) {
      return json({ error: "Please describe the job.", estimate: null, pdfUrl: null });
    }

    // Use context client if available (Lambda), or create new one (Local Dev)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const contextClient = (context as any)?.anthropic;

    const client = contextClient instanceof Anthropic
      ? contextClient
      : new Anthropic({ apiKey });

    if (!client.apiKey) {
      return json({ error: "Missing API Key configuration. Please set ANTHROPIC_API_KEY.", estimate: null, pdfUrl: null });
    }

    // Build message content with vision support
    const messageContent: any[] = [];

    // Add uploaded images for vision analysis
    if (uploadedImages.length > 0) {
      for (const img of uploadedImages) {
        messageContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: img.contentType,
            data: img.buffer.toString('base64'),
          },
        });
      }
    }

    // Add the text prompt
    messageContent.push({
      type: "text",
      text: uploadedImages.length > 0
        ? `You are an expert construction estimator. I've provided photos of the job site along with a description.
           Analyze the images carefully and create a detailed, itemized bid estimate.

           Include:
           - Labor costs (estimated hours × hourly rate)
           - Materials needed with quantities and costs
           - Any special considerations based on what you see in the photos
           - Subtotal, tax (8%), and total

           Format the response as a clean, professional estimate with clear sections.

           Job Description: ${description}

           Based on the photos and description, provide a comprehensive bid.`
        : `You are an expert construction estimator. Create a detailed, itemized bid estimate for the following job.

           Include:
           - Labor costs (estimated hours × hourly rate)
           - Materials needed with quantities and costs
           - Subtotal, tax (8%), and total

           Format the response as a clean, professional estimate with clear sections.

           Job Description: ${description}`,
    });

    const msg = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 3000,
      messages: [{ role: "user", content: messageContent }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : "No text response";

    return json({
      estimate: text,
      error: null,
      photoCount: uploadedImages.length,
      pdfUrl: null // We'll add PDF generation next
    });
  } catch (err: any) {
    console.error("Error in action:", err);
    return json({
      error: err.message || "Failed to generate estimate",
      estimate: null,
      pdfUrl: null
    });
  }
};

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadPDF = () => {
    if (!actionData?.estimate) return;

    const params = new URLSearchParams({
      estimate: encodeURIComponent(actionData.estimate),
      description: encodeURIComponent(jobDescription),
    });

    window.location.href = `/download-pdf?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              H
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">HandyBid AI</h1>
              <p className="text-xs text-slate-500">Professional Estimates in Seconds</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Input Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">New Estimate</h2>

              <Form method="post" encType="multipart/form-data" className="space-y-4">
                {/* Job Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-900 placeholder-slate-400"
                    placeholder="Describe the work needed... (e.g., 'Replace kitchen faucet, fix leaking pipe under sink, install new garbage disposal')"
                    required
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Photos (Optional)
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-colors">
                      <div className="text-center">
                        <svg className="mx-auto h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-slate-600">
                          Click to upload photos
                        </p>
                        <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        name="photos"
                        accept="image/png,image/jpeg,image/jpg"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="flex-1 text-sm text-slate-700 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all ${
                    isSubmitting
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing & Generating...
                    </span>
                  ) : (
                    'Generate Estimate'
                  )}
                </button>
              </Form>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">How it works</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  <span>Describe the job in detail</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  <span>Upload photos for AI visual analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  <span>Get instant itemized estimates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  <span>Download PDF to share with customers</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="h-6 w-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                    <p className="text-sm text-red-700">{actionData.error}</p>
                  </div>
                </div>
              </div>
            )}

            {actionData?.estimate ? (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Bid Estimate</h3>
                    {actionData.photoCount > 0 && (
                      <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                        {actionData.photoCount} {actionData.photoCount === 1 ? 'photo' : 'photos'} analyzed
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{actionData.estimate}</div>
                  </div>
                </div>
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
                <div className="text-center text-slate-400">
                  <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm font-medium">Your estimate will appear here</p>
                  <p className="text-xs mt-1">Fill out the form to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}