# Approved Emails Configuration

## How to Add Approved Emails

Edit the file: `lib/approvedEmails.ts`

Add email addresses to the `APPROVED_EMAILS` array:

```typescript
export const APPROVED_EMAILS = [
  'user1@stryker.com',
  'user2@stryker.com',
  'user3@example.com',
  // Add more emails here
]
```

## Important Notes

- **Case-insensitive**: Email matching is case-insensitive
- **Empty list = All allowed**: If the array is empty, all emails are allowed (useful for initial setup/testing)
- **Production**: Make sure to add actual approved emails before going live

## Testing

1. Add your test email to the list
2. Try accessing with an unapproved email - should show error
3. Try accessing with approved email - should proceed

## Example

```typescript
export const APPROVED_EMAILS = [
  'john.doe@stryker.com',
  'jane.smith@stryker.com',
  'test@example.com', // Remove before production
]
```

