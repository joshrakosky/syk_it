'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import StrykerLogo from '@/components/StrykerLogo'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'

export default function ReviewPage() {
  const router = useRouter()
  const [choice1, setChoice1] = useState<any>(null)
  const [choice2, setChoice2] = useState<any>(null)
  const [shipping, setShipping] = useState<any>(null)
  const [product1, setProduct1] = useState<any>(null)
  const [product2, setProduct2] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if email, choices, and shipping exist
    const email = sessionStorage.getItem('orderEmail')
    const choice1Data = sessionStorage.getItem('choice1')
    const choice2Data = sessionStorage.getItem('choice2')
    const shippingData = sessionStorage.getItem('shipping')
    
    if (!email || !choice1Data || !choice2Data || !shippingData) {
      router.push('/')
      return
    }

    // Parse stored data
    const parsedChoice1 = JSON.parse(choice1Data)
    const parsedChoice2 = JSON.parse(choice2Data)
    const parsedShipping = JSON.parse(shippingData)

    setChoice1(parsedChoice1)
    setChoice2(parsedChoice2)
    setShipping(parsedShipping)

    // Load product details
    loadProducts(parsedChoice1.productId, parsedChoice2.productId)
  }, [router])

  const loadProducts = async (product1Id: string, product2Id: string) => {
    try {
      const [product1Result, product2Result] = await Promise.all([
        supabase.from('christmas_products').select('*').eq('id', product1Id).single(),
        supabase.from('christmas_products').select('*').eq('id', product2Id).single()
      ])

      if (product1Result.error) throw product1Result.error
      if (product2Result.error) throw product2Result.error

      setProduct1(product1Result.data)
      setProduct2(product2Result.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load product information')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setError('')
    setSubmitting(true)

    try {
      const email = sessionStorage.getItem('orderEmail')!

      // Submit order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          shipping,
          choice1,
          choice2
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit order')
      }

      const orderData = await response.json()
      
      // Store order number for confirmation page
      sessionStorage.setItem('orderNumber', orderData.order_number)
      
      // Clear selections
      sessionStorage.removeItem('choice1')
      sessionStorage.removeItem('choice2')
      sessionStorage.removeItem('shipping')
      
      router.push('/confirmation')
    } catch (err: any) {
      setError(err.message || 'Failed to submit order. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-12 px-4 relative">
      <AdminExportButton />
      <HelpIcon />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <StrykerLogo className="text-2xl mb-2" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Order</h1>
            <p className="text-gray-600">Please review your selections and shipping information before submitting, and feel free to screenshot this information for your convenience.</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {/* Choice 1 Section */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choice 1</h2>
            {product1 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{product1.name}</p>
                {choice1.color && <p className="text-sm text-gray-600">Color: {choice1.color}</p>}
                {choice1.size && <p className="text-sm text-gray-600">Size: {choice1.size}</p>}
              </div>
            )}
          </div>

          {/* Choice 2 Section */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choice 2</h2>
            {product2 && (
              <div className="bg-gray-50 rounded-lg p-4">
                {choice2.hasMultipleItems ? (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{product2.name}</p>
                    {choice2.kitType === 'polo-cap' && (
                      <>
                        <p className="text-sm text-gray-600">Polo: {choice2.poloColor} - {choice2.poloSize}</p>
                        <p className="text-sm text-gray-600">Cap: {choice2.capColor} - {choice2.capSize}</p>
                      </>
                    )}
                    {choice2.kitType === 'polo-beanie' && (
                      <>
                        <p className="text-sm text-gray-600">Polo: {choice2.poloColor} - {choice2.poloSize}</p>
                        <p className="text-sm text-gray-600">Beanie: {choice2.beanieColor} - {choice2.beanieSize}</p>
                      </>
                    )}
                    {choice2.kitType === 'tile-beanie' && (
                      <>
                        <p className="text-sm text-gray-600">Tile Mate: {choice2.tileColor} - {choice2.tileSize}</p>
                        <p className="text-sm text-gray-600">Beanie: {choice2.beanieColor} - {choice2.beanieSize}</p>
                      </>
                    )}
                    {choice2.kitType === 'tile-cap' && (
                      <>
                        <p className="text-sm text-gray-600">Tile Mate: {choice2.tileColor} - {choice2.tileSize}</p>
                        <p className="text-sm text-gray-600">Cap: {choice2.capColor} - {choice2.capSize}</p>
                      </>
                    )}
                    {choice2.kitType === 'tile-earbuds' && (
                      <>
                        <p className="text-sm text-gray-600">Tile Mate: {choice2.tileColor} - {choice2.tileSize}</p>
                        <p className="text-sm text-gray-600">Earbuds: {choice2.earbudsColor}</p>
                      </>
                    )}
                    {choice2.kitType === 'airtag-cap' && (
                      <>
                        <p className="text-sm text-gray-600">AirTag: {choice2.airtagColor} - {choice2.airtagSize}</p>
                        <p className="text-sm text-gray-600">Cap: {choice2.capColor} - {choice2.capSize}</p>
                      </>
                    )}
                    {choice2.kitType === 'airtag-beanie' && (
                      <>
                        <p className="text-sm text-gray-600">AirTag: {choice2.airtagColor} - {choice2.airtagSize}</p>
                        <p className="text-sm text-gray-600">Beanie: {choice2.beanieColor} - {choice2.beanieSize}</p>
                      </>
                    )}
                    {choice2.kitType === 'tech-organizer-power-bank' && (
                      <>
                        <p className="text-sm text-gray-600">Tech Organizer: {choice2.poloColor}</p>
                        <p className="text-sm text-gray-600">Power Bank: {choice2.capColor}</p>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-gray-900">{product2.name}</p>
                    {choice2.color && <p className="text-sm text-gray-600">Color: {choice2.color}</p>}
                    {choice2.size && <p className="text-sm text-gray-600">Size: {choice2.size}</p>}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Shipping Information Section */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{shipping.name}</p>
              <p className="text-sm text-gray-600">{shipping.address}</p>
              {shipping.address2 && <p className="text-sm text-gray-600">{shipping.address2}</p>}
              <p className="text-sm text-gray-600">
                {shipping.city}, {shipping.state} {shipping.zip}
              </p>
              <p className="text-sm text-gray-600">{shipping.country}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/shipping')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 text-black rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#ffb500] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ backgroundColor: '#ffb500' }}
            >
              {submitting ? 'Submitting...' : 'Submit Order →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

