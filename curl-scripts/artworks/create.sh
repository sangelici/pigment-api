#!/bin/bash

API="http://localhost:4741"
URL_PATH="/artworks"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "artwork": {
      "title": "'"${TITLE}"'",
      "description": "'"${DESCRIPTION}"'",
      "medium": "'"${MEDIUM}"'",
      "size": "'"${SIZE}"'",
      "price": "'"${PRICE}"'"
    }
  }'

echo
