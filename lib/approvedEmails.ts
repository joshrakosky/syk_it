// Approved emails list for Stryker Christmas Store
// Add emails that are allowed to place orders

export const APPROVED_EMAILS = [
  'josh.rakosky@gmail.com',
  // Test emails for testing order flow
  'test1@stryker.com',
  'test2@stryker.com',
  'test3@stryker.com',
  'test4@stryker.com',
  'test5@stryker.com',
  'test6@stryker.com',
  'test7@stryker.com',
  'test8@stryker.com',
  'test9@stryker.com',
  'test10@stryker.com',
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

