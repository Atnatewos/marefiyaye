#!/usr/bin/env bash
# Logs in as admin and writes cookies to admin-cookies.txt
curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c admin-cookies.txt \
  -d '{"email":"admin@marefiyaye.com","password":"ChangeMeStrong123!"}' \
  | grep -o '"role":"[^"]*"'
echo " (admin cookies refreshed)"