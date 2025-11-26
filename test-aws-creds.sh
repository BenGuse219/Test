#!/bin/bash

# AWS STS GetCallerIdentity using AWS Signature Version 4
# This will test if credentials work

AWS_SERVICE="sts"
AWS_REGION="${AWS_REGION:-us-east-1}"
ENDPOINT="https://sts.amazonaws.com/"

# Get current date/time
DATE=$(date -u +"%Y%m%dT%H%M%SZ")
DATESTAMP=$(date -u +"%Y%m%d")

# Request parameters
REQUEST_PARAMS="Action=GetCallerIdentity&Version=2011-06-15"

# Create canonical request
CANONICAL_URI="/"
CANONICAL_QUERYSTRING=""
CANONICAL_HEADERS="host:sts.amazonaws.com\nx-amz-date:${DATE}\n"
SIGNED_HEADERS="host;x-amz-date"
PAYLOAD_HASH=$(echo -n "" | openssl dgst -sha256 | awk '{print $2}')

CANONICAL_REQUEST="POST\n${CANONICAL_URI}\n${CANONICAL_QUERYSTRING}\n${CANONICAL_HEADERS}\n${SIGNED_HEADERS}\n${PAYLOAD_HASH}"

# Create string to sign
ALGORITHM="AWS4-HMAC-SHA256"
CREDENTIAL_SCOPE="${DATESTAMP}/${AWS_REGION}/${AWS_SERVICE}/aws4_request"
STRING_TO_SIGN="${ALGORITHM}\n${DATE}\n${CREDENTIAL_SCOPE}\n$(echo -n "$CANONICAL_REQUEST" | openssl dgst -sha256 | awk '{print $2}')"

# Calculate signature
kSecret="AWS4${AWS_SECRET_ACCESS_KEY}"
kDate=$(echo -n "$DATESTAMP" | openssl dgst -sha256 -hmac "$kSecret" | awk '{print $2}')
kRegion=$(echo -n "$AWS_REGION" | openssl dgst -sha256 -hmac "$(echo -n "$kDate" | xxd -r -p)" | awk '{print $2}')
kService=$(echo -n "$AWS_SERVICE" | openssl dgst -sha256 -hmac "$(echo -n "$kRegion" | xxd -r -p)" | awk '{print $2}')
kSigning=$(echo -n "aws4_request" | openssl dgst -sha256 -hmac "$(echo -n "$kService" | xxd -r -p)" | awk '{print $2}')
SIGNATURE=$(echo -n "$STRING_TO_SIGN" | openssl dgst -sha256 -hmac "$(echo -n "$kSigning" | xxd -r -p)" | awk '{print $2}')

# Make the request
curl -X POST "${ENDPOINT}" \
  -H "Host: sts.amazonaws.com" \
  -H "X-Amz-Date: ${DATE}" \
  -H "Authorization: ${ALGORITHM} Credential=${AWS_ACCESS_KEY_ID}/${CREDENTIAL_SCOPE}, SignedHeaders=${SIGNED_HEADERS}, Signature=${SIGNATURE}" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -d "${REQUEST_PARAMS}" 2>&1
