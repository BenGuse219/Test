import { createRequestHandler } from "@remix-run/server-runtime";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";

// @ts-ignore - This will be available after build
import * as build from "./build/server/index.js";

const handleRequest = createRequestHandler(build as any, "production");

export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> {
  try {
    // Convert Lambda event to Web Request
    const url = new URL(event.rawPath, `https://${event.requestContext.domainName}`);
    if (event.rawQueryString) {
      url.search = event.rawQueryString;
    }

    const request = new Request(url.toString(), {
      method: event.requestContext.http.method,
      headers: new Headers(event.headers as Record<string, string>),
      body:
        event.body && event.isBase64Encoded
          ? Buffer.from(event.body, "base64").toString()
          : event.body,
    });

    // Handle the request with Remix
    const response = await handleRequest(request, {
      context,
      event,
    });

    // Convert Web Response to Lambda response
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const body = await response.text();

    return {
      statusCode: response.status,
      headers,
      body,
    };
  } catch (error) {
    console.error("Error handling request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
}
