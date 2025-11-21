'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import StrykerLogo from '@/components/StrykerLogo'

export default function ShippingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA'
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Check if email and both choices exist
    const email = sessionStorage.getItem('orderEmail')
    const choice1 = sessionStorage.getItem('choice1')
    const choice2 = sessionStorage.getItem('choice2')
    
    if (!email || !choice1 || !choice2) {
      router.push('/')
      return
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate required fields
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zip) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      // Get selections from sessionStorage
      const email = sessionStorage.getItem('orderEmail')!
      const choice1 = JSON.parse(sessionStorage.getItem('choice1')!)
      const choice2 = JSON.parse(sessionStorage.getItem('choice2')!)

      // Submit order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          shipping: formData,
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
      
      router.push('/confirmation')
    } catch (err: any) {
      setError(err.message || 'Failed to submit order. Please try again.')
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <StrykerLogo className="text-2xl mb-2" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Information</h1>
            <p className="text-gray-600">Please provide your shipping details</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white"
                >
                  <option value="USA">USA</option>
                  <option value="Canada">Canada</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/choice2')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 text-black rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#ffb500] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                style={{ backgroundColor: '#ffb500' }}
              >
                {submitting ? 'Submitting...' : 'Submit Order →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

