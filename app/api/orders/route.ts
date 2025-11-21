import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Generate unique order number in format syk-001, syk-002, etc.
async function generateOrderNumber(): Promise<string> {
  // Get the highest existing order number
  const { data: orders, error } = await supabase
    .from('christmas_orders')
    .select('order_number')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching orders:', error)
    // Fallback: start from 1 if there's an error
    return 'syk-001'
  }

  if (!orders || orders.length === 0) {
    // First order
    return 'syk-001'
  }

  // Extract number from existing order (e.g., "syk-001" -> 1)
  const lastOrderNumber = orders[0].order_number
  const match = lastOrderNumber.match(/syk-(\d+)/i)
  
  if (match) {
    const lastNumber = parseInt(match[1], 10)
    const nextNumber = lastNumber + 1
    return `syk-${String(nextNumber).padStart(3, '0')}`
  }

  // If format doesn't match, start from 1
  return 'syk-001'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, shipping, choice1, choice2 } = body

    // Validate required fields
    if (!email || !shipping || !choice1 || !choice2) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for duplicate order by email
    const { data: existingOrder } = await supabase
      .from('christmas_orders')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingOrder) {
      return NextResponse.json(
        { error: 'An order already exists for this email address' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = await generateOrderNumber()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('christmas_orders')
      .insert({
        email: email.toLowerCase(),
        order_number: orderNumber,
        shipping_name: shipping.name,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_zip: shipping.zip,
        shipping_country: shipping.country || 'USA'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Get product names and customer item numbers for order items
    const { data: product1 } = await supabase
      .from('christmas_products')
      .select('name, customer_item_number')
      .eq('id', choice1.productId)
      .single()

    const { data: product2 } = await supabase
      .from('christmas_products')
      .select('name, customer_item_number, has_multiple_items')
      .eq('id', choice2.productId)
      .single()

    // Create order items
    const orderItems: any[] = [
      {
        order_id: order.id,
        product_id: choice1.productId,
        product_name: product1?.name || 'Unknown Product',
        customer_item_number: product1?.customer_item_number || null,
        color: choice1.color || null,
        size: choice1.size || null
      }
    ]

    // Handle choice2 - check if it has multiple items
    if (choice2.hasMultipleItems && product2?.has_multiple_items) {
      const kitType = choice2.kitType || 'polo-cap'
      
      // Handle different kit types
      if (kitType === 'polo-cap') {
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Polo`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.poloColor || null,
          size: choice2.poloSize || null
        })
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Cap`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.capColor || null,
          size: choice2.capSize || null
        })
      } else if (kitType === 'polo-beanie') {
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Polo`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.poloColor || null,
          size: choice2.poloSize || null
        })
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Beanie`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.beanieColor || null,
          size: choice2.beanieSize || 'OSFA'
        })
      } else if (kitType === 'tile-beanie') {
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Tile Mate`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.tileColor || null,
          size: choice2.tileSize || null
        })
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Beanie`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.beanieColor || null,
          size: choice2.beanieSize || 'OSFA'
        })
      } else if (kitType === 'tile-cap') {
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Tile Mate`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.tileColor || null,
          size: choice2.tileSize || null
        })
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Cap`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.capColor || null,
          size: choice2.capSize || null
        })
      } else if (kitType === 'airtag-cap') {
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Apple AirTag`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.airtagColor || 'White',
          size: choice2.airtagSize || null
        })
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Cap`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.capColor || null,
          size: choice2.capSize || null
        })
      } else if (kitType === 'airtag-beanie') {
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Apple AirTag`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.airtagColor || 'White',
          size: choice2.airtagSize || null
        })
        orderItems.push({
          order_id: order.id,
          product_id: choice2.productId,
          product_name: `${product2?.name || 'Unknown Product'} - Beanie`,
          customer_item_number: product2?.customer_item_number || null,
          color: choice2.beanieColor || null,
          size: choice2.beanieSize || 'OSFA'
        })
      }
    } else {
      // Single item selection
      orderItems.push({
        order_id: order.id,
        product_id: choice2.productId,
        product_name: product2?.name || 'Unknown Product',
        customer_item_number: product2?.customer_item_number || null,
        color: choice2.color || null,
        size: choice2.size || null
      })
    }

    const { error: itemsError } = await supabase
      .from('christmas_order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      order_id: order.id
    })

  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

