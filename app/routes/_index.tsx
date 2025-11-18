import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Hello World - Remix on Lambda (Auto-Deployed!)" },
    { name: "description", content: "Simple Remix app running on AWS Lambda with CloudFront - Deployed via GitHub Actions" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center"
      }}>
        <h1 style={{
          fontSize: "3rem",
          color: "#4338ca",
          marginBottom: "1rem"
        }}>
          Hello World! 👋
        </h1>
        <p style={{
          fontSize: "1.25rem",
          color: "#64748b",
          marginBottom: "2rem"
        }}>
          Welcome to Remix running on AWS Lambda with CloudFront
          <br />
          <span style={{ fontSize: "1rem", color: "#94a3b8" }}>
            🚀 Deployed automatically via GitHub Actions
          </span>
        </p>
        <div style={{
          backgroundColor: "#f1f5f9",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          textAlign: "left"
        }}>
          <h2 style={{ color: "#334155", marginBottom: "1rem" }}>
            Stack:
          </h2>
          <ul style={{ color: "#475569" }}>
            <li>⚡ Remix - Full-stack web framework</li>
            <li>🔧 AWS Lambda - Serverless compute</li>
            <li>🌐 CloudFront - CDN for global distribution</li>
            <li>🏗️ AWS CDK - Infrastructure as Code</li>
          </ul>
        </div>
        <p style={{
          marginTop: "2rem",
          color: "#94a3b8",
          fontSize: "0.9rem"
        }}>
          Deployed with AWS CDK | Timestamp: {new Date().toISOString()}
        </p>
      </div>
    </div>
  );
}
