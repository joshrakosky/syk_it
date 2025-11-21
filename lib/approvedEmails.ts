// Approved emails list for Stryker Christmas Store
// Add emails that are allowed to place orders

export const APPROVED_EMAILS = [
  'josh.rakosky@gmail.com',
  // Add more approved email addresses here
  // Examples:
  // 'user1@stryker.com',
  // 'user2@stryker.com',
  // 'user3@example.com',
]

// Check if an email is approved
export function isEmailApproved(email: string): boolean {
  const normalizedEmail = email.toLowerCase().trim()
  
  // If no approved emails list, allow all (for initial setup)
  if (APPROVED_EMAILS.length === 0) {
    return true
  }
  
  return APPROVED_EMAILS.includes(normalizedEmail)
}

