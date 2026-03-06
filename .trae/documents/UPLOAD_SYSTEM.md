# Upload System

This document describes the architecture and workflow of the file upload and parsing system in Taxwise.

## 1. Architecture
The upload system is built around a Supabase Edge Function (`upload-statement`) to ensure scalability and avoid client-side and server-side bundler issues.

## 2. Workflow
1.  **File Upload**: The user uploads a CSV or PDF file through the client interface.
2.  **Edge Function Invocation**: The client invokes the `upload-statement` Edge Function, passing the file to be processed.
3.  **Parsing**: The Edge Function uses Deno-compatible libraries (`pdf-parse`, `papaparse`) to parse the file and extract transactions.
4.  **Deduplication**: A unique `fingerprint` is generated for each transaction to prevent duplicates.
5.  **Data Insertion**: The new, unique transactions are inserted into the `transactions` table in the database.

## 3. Error Handling
If any errors occur during the process (e.g., invalid file format), the Edge Function will return a specific error message to the client, which will then be displayed to the user.
