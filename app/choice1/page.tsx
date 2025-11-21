'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import StrykerLogo from '@/components/StrykerLogo'

export default function Choice1Page() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const selectedProduct = products.find(p => p.id === selectedProductId)
  
  // Get the appropriate thumbnail based on selected color
  const getThumbnailUrl = () => {
    if (!selectedProduct) return null
    
    const productWithColors = selectedProduct as any
    
    // If color is selected, use color-specific thumbnail
    if (selectedColor === 'Black' && productWithColors.thumbnail_url_black) {
      return productWithColors.thumbnail_url_black
    }
    if (selectedColor === 'White' && productWithColors.thumbnail_url_white) {
      return productWithColors.thumbnail_url_white
    }
    
    // Default to black thumbnail if available, otherwise use default thumbnail
    return productWithColors.thumbnail_url_black || selectedProduct.thumbnail_url
  }

  useEffect(() => {
    // Check if email exists in session
    const email = sessionStorage.getItem('orderEmail')
    if (!email) {
      router.push('/')
      return
    }

    // Load products for choice 1
    loadProducts()
  }, [router])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('christmas_products')
        .select('*, thumbnail_url_black, thumbnail_url_white')
        .eq('category', 'choice1')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (!selectedProductId) {
      setError('Please select a product')
      return
    }

    if (selectedProduct?.requires_color && !selectedColor) {
      setError('Please select a color')
      return
    }

    if (selectedProduct?.requires_size && !selectedSize) {
      setError('Please select a size')
      return
    }

    // Store selection in sessionStorage
    sessionStorage.setItem('choice1', JSON.stringify({
      productId: selectedProductId,
      color: selectedColor || null,
      size: selectedSize || null
    }))

    router.push('/choice2')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <StrykerLogo className="text-2xl mb-2" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Choice 1</h1>
            <p className="text-gray-600">Select your first product</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => {
                const productId = e.target.value
                setSelectedProductId(productId)
                setSelectedSize('')
                setError('')
                
                // Default to Black if product requires color and has Black option
                const product = products.find(p => p.id === productId)
                if (product?.requires_color && product.available_colors?.includes('Black')) {
                  setSelectedColor('Black')
                } else {
                  setSelectedColor('')
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white"
            >
              <option value="">-- Choose a product --</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="border-t pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {getThumbnailUrl() ? (
                    <img
                      src={getThumbnailUrl() || ''}
                      alt={selectedProduct.name}
                      className="w-full rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 rounded-lg shadow-md flex items-center justify-center border-2 border-gray-300">
                      <div className="text-center p-4">
                        <div className="text-4xl mb-2">📦</div>
                        <div className="text-sm text-gray-500 font-medium">{selectedProduct.name}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h2>
                  {selectedProduct.description && (
                    <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                  )}
                  {selectedProduct.specs && (
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 mb-1">Specifications:</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{selectedProduct.specs}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedProduct.requires_color && selectedProduct.available_colors && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => {
                      setSelectedColor(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white"
                  >
                    <option value="">-- Select color --</option>
                    {selectedProduct.available_colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedProduct.requires_size && selectedProduct.available_sizes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => {
                      setSelectedSize(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white"
                  >
                    <option value="">-- Select size --</option>
                    {selectedProduct.available_sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={handleContinue}
              className="px-6 py-2 text-black rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#ffb500] focus:ring-offset-2 font-medium"
              style={{ backgroundColor: '#ffb500' }}
            >
              Continue to Choice 2 →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

