/**
 * Script to place a few new test orders with different kit types
 * Run with: node scripts/place-new-test-orders.js
 */

require('dotenv').config({ path: '.env.local' });

const TEST_ORDERS = [
  {
    email: 'test1@stryker.com',
    choice1ProductName: 'OGIO Gear Mega Cube',
    choice2ProductName: 'Tile Mate 2 Pack & Skull Candy Earbuds'
  },
  {
    email: 'test2@stryker.com',
    choice1ProductName: 'Brooks Brothers Oxford Backpack',
    choice2ProductName: 'Adidas Men\'s Polo & New Era Cap'
  },
  {
    email: 'test3@stryker.com',
    choice1ProductName: 'The North Face Fall Line Backpack',
    choice2ProductName: 'Adidas Women\'s Polo & The North Face Beanie'
  },
  {
    email: 'test4@stryker.com',
    choice1ProductName: 'OGIO Surge RSS Pack',
    choice2ProductName: 'Apple AirTag & New Era Cap'
  },
  {
    email: 'test5@stryker.com',
    choice1ProductName: 'Tile Mate 4 Pack',
    choice2ProductName: 'Tech Organizer & Power Bank'
  }
];

const SHIPPING_DATA = {
  name: 'Test User',
  address: '123 Test Street',
  city: 'Test City',
  state: 'CA',
  zip: '12345',
  country: 'USA'
};

async function placeTestOrder(orderConfig, orderIndex) {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
    : 'http://localhost:3000';
  
  console.log(`\n[${orderIndex + 1}/${TEST_ORDERS.length}] Placing order for ${orderConfig.email}...`);
  console.log(`  Choice 1: ${orderConfig.choice1ProductName}`);
  console.log(`  Choice 2: ${orderConfig.choice2ProductName}`);
  
  try {
    // Get products from Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get choice1 product
    const { data: choice1Products, error: choice1Error } = await supabase
      .from('christmas_products')
      .select('id, name, available_colors, available_sizes')
      .eq('category', 'choice1')
      .eq('name', orderConfig.choice1ProductName)
      .single();
    
    if (choice1Error) throw choice1Error;
    if (!choice1Products) {
      throw new Error(`Choice1 product not found: ${orderConfig.choice1ProductName}`);
    }
    
    // Get choice2 product
    const { data: choice2Products, error: choice2Error } = await supabase
      .from('christmas_products')
      .select('id, name, has_multiple_items, polo_colors, cap_colors, beanie_colors, available_colors, available_sizes')
      .eq('category', 'choice2')
      .eq('name', orderConfig.choice2ProductName)
      .single();
    
    if (choice2Error) throw choice2Error;
    if (!choice2Products) {
      throw new Error(`Choice2 product not found: ${orderConfig.choice2ProductName}`);
    }
    
    const choice1Product = choice1Products;
    const choice2Product = choice2Products;
    
    // Prepare choice1 data
    const choice1 = {
      productId: choice1Product.id,
      color: choice1Product.available_colors?.[0] || null,
      size: choice1Product.available_sizes?.[0] || null
    };
    
    // Prepare choice2 data based on product type
    let choice2;
    if (choice2Product.has_multiple_items) {
      // Check for Tech Organizer & Power Bank first (has polo_colors and cap_colors but no sizes)
      if (choice2Product.name?.includes('Tech Organizer')) {
        choice2 = {
          productId: choice2Product.id,
          hasMultipleItems: true,
          kitType: 'tech-organizer-power-bank',
          poloColor: choice2Product.polo_colors?.[0] || 'Black',
          capColor: choice2Product.cap_colors?.[0] || 'Black'
        };
      } else if (choice2Product.polo_colors && choice2Product.cap_colors) {
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
      } else if (choice2Product.name?.includes('Earbuds')) {
        // Tile + Earbuds kit
        choice2 = {
          productId: choice2Product.id,
          hasMultipleItems: true,
          kitType: 'tile-earbuds',
          tileColor: choice2Product.polo_colors?.[0] || 'Black',
          tileSize: '2 Pack'
        };
      } else if (choice2Product.name?.includes('AirTag') && choice2Product.cap_colors) {
        // AirTag + Cap
        choice2 = {
          productId: choice2Product.id,
          hasMultipleItems: true,
          kitType: 'airtag-cap',
          airtagColor: 'White',
          airtagSize: '1 Pack',
          capColor: choice2Product.cap_colors[0],
          capSize: 'M/L'
        };
      } else {
        // Default fallback
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
        email: orderConfig.email,
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
  console.log('🚀 Starting new test order placement...\n');
  
  const orderNumbers = [];
  
  for (let i = 0; i < TEST_ORDERS.length; i++) {
    const orderNumber = await placeTestOrder(TEST_ORDERS[i], i);
    if (orderNumber) {
      orderNumbers.push(orderNumber);
    }
    // Small delay between orders
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ Test complete! Placed ${orderNumbers.length}/${TEST_ORDERS.length} orders`);
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
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        console.log('\n📊 All orders in database:');
        orders?.forEach(order => {
          console.log(`  - ${order.order_number}: ${order.email}`);
        });
        
        // Show order items breakdown
        console.log('\n📦 Order items breakdown:');
        for (const order of orders || []) {
          const { data: items } = await supabase
            .from('christmas_order_items')
            .select('product_name, customer_item_number, color, size')
            .eq('order_id', order.id)
            .order('created_at');
          
          console.log(`\n  ${order.order_number} (${order.email}):`);
          items?.forEach(item => {
            console.log(`    - ${item.product_name} (${item.customer_item_number || 'N/A'}) - ${item.color || 'N/A'} / ${item.size || 'N/A'}`);
          });
        }
      }
    }
  } catch (error) {
    console.error('Error verifying orders:', error.message);
  }
}

// Run tests
runTests().catch(console.error);

