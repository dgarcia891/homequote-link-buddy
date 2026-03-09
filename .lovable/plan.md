

# Clean Up Test Analytics Data

## What will be deleted
Only events that are clearly test data:
- Events with `visitor_id = 'test-visitor'` or `visitor_id = 'test-123'`
- Events with `event_type = 'test_ip_check'`
- Events with `page_path = '/test'` or `/ip-test`

## What will be kept
All real page view events (with UUID-formatted visitor IDs) even if they have `null` IP addresses — these are legitimate historical visits.

## Action
Run a DELETE query via the insert tool to remove only the test records.

