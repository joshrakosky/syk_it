// Approved emails list for Stryker Christmas Store
// Add emails that are allowed to place orders

export const APPROVED_EMAILS = [
  'josh.rakosky@gmail.com',
  // Team test emails for order testing
  'team1@stryker.com',
  'team2@stryker.com',
  'team3@stryker.com',
  'team4@stryker.com',
  'team5@stryker.com',
  'team6@stryker.com',
  'team7@stryker.com',
  'team8@stryker.com',
  'team9@stryker.com',
  'team10@stryker.com',
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

