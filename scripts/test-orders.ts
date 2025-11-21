/**
 * Test script to place orders for 10 test emails
 * This verifies the order flow and reporting functionality
 */

const TEST_EMAILS = [
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

const SHIPPING_DATA = {
  name: 'Test User',
  address: '123 Test Street',
  city: 'Test City',
  state: 'CA',
  zip: '12345',
  country: 'USA'
}

async function placeTestOrder(email: string, orderIndex: number) {
  const baseUrl = 'http://localhost:3000'
  
  // Step 1: Landing page - enter email
  console.log(`\n[${orderIndex + 1}/10] Placing order for ${email}...`)
  
  // We'll use the API directly since we have the backend
  // First, get available products
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Get products for choice1
  const { data: choice1Products } = await supabase
    .from('christmas_products')
    .select('id, name, available_colors, available_sizes')
    .eq('category', 'choice1')
    .limit(1)
  
  // Get products for choice2
  const { data: choice2Products } = await supabase
    .from('christmas_products')
    .select('id, name, has_multiple_items, polo_colors, cap_colors, available_colors, available_sizes')
    .eq('category', 'choice2')
    .limit(1)
  
  if (!choice1Products || choice1Products.length === 0 || !choice2Products || choice2Products.length === 0) {
    console.error('No products found')
    return
  }
  
  const choice1Product = choice1Products[0]
  const choice2Product = choice2Products[0]
  
  // Prepare choice1 data
  const choice1 = {
    productId: choice1Product.id,
    color: choice1Product.available_colors?.[0] || null,
    size: choice1Product.available_sizes?.[0] || null
  }
  
  // Prepare choice2 data
  let choice2: any
  if (choice2Product.has_multiple_items) {
    // Multi-item product (like polo-cap)
    if (choice2Product.polo_colors && choice2Product.cap_colors) {
      choice2 = {
        productId: choice2Product.id,
        hasMultipleItems: true,
        kitType: 'polo-cap',
        poloColor: choice2Product.polo_colors[0],
        poloSize: 'M', // Default size
        capColor: choice2Product.cap_colors[0],
        capSize: 'M/L' // Default cap size
      }
    } else {
      // Single item with color/size
      choice2 = {
        productId: choice2Product.id,
        hasMultipleItems: false,
        color: choice2Product.available_colors?.[0] || null,
        size: choice2Product.available_sizes?.[0] || null
      }
    }
  } else {
    choice2 = {
      productId: choice2Product.id,
      hasMultipleItems: false,
      color: choice2Product.available_colors?.[0] || null,
      size: choice2Product.available_sizes?.[0] || null
    }
  }
  
  // Submit order via API
  try {
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        shipping: SHIPPING_DATA,
        choice1,
        choice2
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log(`✅ Order placed successfully: ${result.order_number}`)
      return result.order_number
    } else {
      console.error(`❌ Failed to place order: ${result.error}`)
      return null
    }
  } catch (error: any) {
    console.error(`❌ Error placing order: ${error.message}`)
    return null
  }
}

async function runTests() {
  console.log('Starting test order placement for 10 emails...\n')
  
  const orderNumbers: string[] = []
  
  for (let i = 0; i < TEST_EMAILS.length; i++) {
    const orderNumber = await placeTestOrder(TEST_EMAILS[i], i)
    if (orderNumber) {
      orderNumbers.push(orderNumber)
    }
    // Small delay between orders
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log(`\n✅ Test complete! Placed ${orderNumbers.length}/10 orders`)
  console.log('Order numbers:', orderNumbers.join(', '))
  
  // Verify orders in database
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data: orders } = await supabase
      .from('christmas_orders')
      .select('order_number, email')
      .in('email', TEST_EMAILS)
      .order('created_at', { ascending: false })
    
    console.log('\n📊 Orders in database:')
    orders?.forEach(order => {
      console.log(`  - ${order.order_number}: ${order.email}`)
    })
  }
}

// Run if executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

export { runTests, placeTestOrder }

