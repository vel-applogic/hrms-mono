# Sentry Error Lookup

Parse the error text provided in `$ARGUMENTS` and look up the error in Sentry.

## Steps

1. **Parse the input** — Extract the following from the pasted error text:
   - `Request ID` — the value after "Request ID:" (e.g., `260207:101949-798c9c58-5444-4d7c-b261-168d8a73777a`)
   - `Status` — the HTTP status code (e.g., `500`)
   - `Message` — the error message (first line or text before "Status:")

2. **Search Sentry for the error** — Use the Sentry MCP tools to find the issue:
   - The request ID is stored as the `request-id` tag in Sentry
   - Search across all 2 HRMS projects in parallel: `hrms-api-backend`, `hrms-web`
   - For each project, use `list_error_events` with query `request-id:<requestId>`
   - Use whichever project returns results
   - If none return results, try `raw_sentry_api` to search events with the tag across each project

3. **Get issue details** — Once found:
   - Use `get_sentry_issue` with `include_latest_event: true` to get the full stacktrace
   - Use `get_stack_frames` with `in_app_only: true` to get relevant application frames

4. **Report findings** — Present a summary:
   - Error type and message
   - The relevant stack trace (app frames only)
   - Which file and function caused the error
   - Link to the Sentry issue if available
   - Suggest a fix if the cause is clear from the stack trace
