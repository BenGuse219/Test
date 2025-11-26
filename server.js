import { createRequestHandler } from "@remix-run/server-runtime";
// @ts-ignore - This will be available after build
import * as build from "./build/server/index.js";
const handleRequest = createRequestHandler(build, "production");
export async function handler(event, context) {
    try {
        // Convert Lambda event to Web Request
        const url = new URL(event.rawPath, `https://${event.requestContext.domainName}`);
        if (event.rawQueryString) {
            url.search = event.rawQueryString;
        }
        const request = new Request(url.toString(), {
            method: event.requestContext.http.method,
            headers: new Headers(event.headers),
            body: event.body && event.isBase64Encoded
                ? Buffer.from(event.body, "base64").toString()
                : event.body,
        });
        // Handle the request with Remix
        const response = await handleRequest(request, {
            context,
            event,
        });
        // Convert Web Response to Lambda response
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });
        const body = await response.text();
        return {
            statusCode: response.status,
            headers,
            body,
        };
    }
    catch (error) {
        console.error("Error handling request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
}
