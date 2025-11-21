/**
 * Script to place test orders for 10 emails
 * Run with: node scripts/place-test-orders.js
 */

require('dotenv').config({ path: '.env.local' });

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
];

const SHIPPING_DATA = {
  name: 'Test User',
  address: '123 Test Street',
  city: 'Test City',
  state: 'CA',
  zip: '12345',
  country: 'USA'
};

async function placeTestOrder(email, orderIndex) {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
    : 'http://localhost:3000';
  
  console.log(`\n[${orderIndex + 1}/10] Placing order for ${email}...`);
  
  try {
    // Get products from Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get first choice1 product
    const { data: choice1Products, error: choice1Error } = await supabase
      .from('christmas_products')
      .select('id, name, available_colors, available_sizes')
      .eq('category', 'choice1')
      .limit(1);
    
    if (choice1Error) throw choice1Error;
    if (!choice1Products || choice1Products.length === 0) {
      throw new Error('No choice1 products found');
    }
    
    // Get first choice2 product
    const { data: choice2Products, error: choice2Error } = await supabase
      .from('christmas_products')
      .select('id, name, has_multiple_items, polo_colors, cap_colors, beanie_colors, available_colors, available_sizes')
      .eq('category', 'choice2')
      .limit(1);
    
    if (choice2Error) throw choice2Error;
    if (!choice2Products || choice2Products.length === 0) {
      throw new Error('No choice2 products found');
    }
    
    const choice1Product = choice1Products[0];
    const choice2Product = choice2Products[0];
    
    // Prepare choice1 data
    const choice1 = {
      productId: choice1Product.id,
      color: choice1Product.available_colors?.[0] || null,
      size: choice1Product.available_sizes?.[0] || null
    };
    
    // Prepare choice2 data
    let choice2;
    if (choice2Product.has_multiple_items) {
      if (choice2Product.polo_colors && choice2Product.cap_colors) {
        // Polo + Cap kit
        choice2 = {
          productId: choice2Product.id,
          hasMultipleItems: true,
          kitType: 'polo-cap',
          poloColor: choice2Product.polo_colors[0],
          poloSize: 'M',
          capColor: choice2Product.cap_colors[0],
          capSize: 'M/L'
        };
      } else if (choice2Product.polo_colors && choice2Product.beanie_colors) {
        // Polo + Beanie kit
        choice2 = {
          productId: choice2Product.id,
          hasMultipleItems: true,
          kitType: 'polo-beanie',
          poloColor: choice2Product.polo_colors[0],
          poloSize: 'M',
          beanieColor: choice2Product.beanie_colors[0],
          beanieSize: 'OSFA'
        };
      } else {
        // Other multi-item (use first available)
        choice2 = {
          productId: choice2Product.id,
          hasMultipleItems: true,
          kitType: 'polo-cap',
          poloColor: choice2Product.polo_colors?.[0] || null,
          capColor: choice2Product.cap_colors?.[0] || null
        };
      }
    } else {
      // Single item
      choice2 = {
        productId: choice2Product.id,
        hasMultipleItems: false,
        color: choice2Product.available_colors?.[0] || null,
        size: choice2Product.available_sizes?.[0] || null
      };
    }
    
    // Submit order via API
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
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Order placed successfully: ${result.order_number}`);
      return result.order_number;
    } else {
      console.error(`❌ Failed to place order: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error placing order: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting test order placement for 10 emails...\n');
  
  const orderNumbers = [];
  
  for (let i = 0; i < TEST_EMAILS.length; i++) {
    const orderNumber = await placeTestOrder(TEST_EMAILS[i], i);
    if (orderNumber) {
      orderNumbers.push(orderNumber);
    }
    // Small delay between orders
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ Test complete! Placed ${orderNumbers.length}/10 orders`);
  console.log('📋 Order numbers:', orderNumbers.join(', '));
  
  // Verify orders in database
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: orders, error } = await supabase
        .from('christmas_orders')
        .select('order_number, email, created_at')
        .in('email', TEST_EMAILS)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        console.log('\n📊 Orders in database:');
        orders?.forEach(order => {
          console.log(`  - ${order.order_number}: ${order.email}`);
        });
      }
    }
  } catch (error) {
    console.error('Error verifying orders:', error.message);
  }
}

// Run tests
runTests().catch(console.error);

