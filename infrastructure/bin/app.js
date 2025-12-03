#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const remix_lambda_stack_1 = require("../lib/remix-lambda-stack");
const app = new cdk.App();
new remix_lambda_stack_1.RemixLambdaStack(app, 'RemixLambdaStack', {
    // Let CDK auto-discover account and region from credentials
    description: 'Simple Remix app deployed to Lambda with CloudFront',
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHVDQUFxQztBQUNyQyxpREFBbUM7QUFDbkMsa0VBQTZEO0FBRTdELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLElBQUkscUNBQWdCLENBQUMsR0FBRyxFQUFFLGtCQUFrQixFQUFFO0lBQzVDLDREQUE0RDtJQUM1RCxXQUFXLEVBQUUscURBQXFEO0NBQ25FLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcclxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInO1xyXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgeyBSZW1peExhbWJkYVN0YWNrIH0gZnJvbSAnLi4vbGliL3JlbWl4LWxhbWJkYS1zdGFjayc7XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xyXG5cclxubmV3IFJlbWl4TGFtYmRhU3RhY2soYXBwLCAnUmVtaXhMYW1iZGFTdGFjaycsIHtcclxuICAvLyBMZXQgQ0RLIGF1dG8tZGlzY292ZXIgYWNjb3VudCBhbmQgcmVnaW9uIGZyb20gY3JlZGVudGlhbHNcclxuICBkZXNjcmlwdGlvbjogJ1NpbXBsZSBSZW1peCBhcHAgZGVwbG95ZWQgdG8gTGFtYmRhIHdpdGggQ2xvdWRGcm9udCcsXHJcbn0pO1xyXG4iXX0=