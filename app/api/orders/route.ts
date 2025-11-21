import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Generate unique order number
function generateOrderNumber(): string {
  const prefix = 'STRYKER'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
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
    const orderNumber = generateOrderNumber()

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
      .select('name, customer_item_number')
      .eq('id', choice2.productId)
      .single()

    // Create order items
    const orderItems = [
      {
        order_id: order.id,
        product_id: choice1.productId,
        product_name: product1?.name || 'Unknown Product',
        customer_item_number: product1?.customer_item_number || null,
        color: choice1.color || null,
        size: choice1.size || null
      },
      {
        order_id: order.id,
        product_id: choice2.productId,
        product_name: product2?.name || 'Unknown Product',
        customer_item_number: product2?.customer_item_number || null,
        color: choice2.color || null,
        size: choice2.size || null
      }
    ]

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

