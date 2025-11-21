'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import StrykerLogo from '@/components/StrykerLogo'
import AdminExportButton from '@/components/AdminExportButton'

export default function Choice2Page() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  // Multiple items state (for polo + cap/beanie kits)
  const [poloColor, setPoloColor] = useState<string>('')
  const [poloSize, setPoloSize] = useState<string>('')
  const [capColor, setCapColor] = useState<string>('')
  const [capSize, setCapSize] = useState<string>('')
  const [beanieColor, setBeanieColor] = useState<string>('')
  const [beanieSize, setBeanieSize] = useState<string>('') // For Beanie size (OSFA)
  const [tileColor, setTileColor] = useState<string>('') // For Tile Mate kits
  const [tileSize, setTileSize] = useState<string>('') // For Tile Mate size (1 Pack, 2 Pack, 4 Pack)
  const [airtagSize, setAirtagSize] = useState<string>('') // For AirTag size (1 Pack)
  const [airtagColor, setAirtagColor] = useState<string>('White') // For AirTag color (always White)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const productWithItems = selectedProduct as any
  
  // Get thumbnails for multiple items
  const getPoloThumbnail = () => {
    if (!productWithItems?.polo_thumbnails || !poloColor) return null
    return productWithItems.polo_thumbnails[poloColor] || null
  }
  
  const getCapThumbnail = () => {
    if (!productWithItems?.cap_thumbnails || !capColor) return null
    return productWithItems.cap_thumbnails[capColor] || null
  }
  
  const getBeanieThumbnail = () => {
    if (!productWithItems?.beanie_thumbnails || !beanieColor) return null
    return productWithItems.beanie_thumbnails[beanieColor] || null
  }
  
  const getTileThumbnail = () => {
    if (!productWithItems?.polo_thumbnails || !tileColor) return null
    // Reuse polo_thumbnails field for Tile Mate color thumbnails
    return productWithItems.polo_thumbnails[tileColor] || null
  }
  
  const getFirstItemLabel = () => {
    const kitType = getKitType()
    if (kitType === 'polo-cap' || kitType === 'polo-beanie') return 'Polo'
    if (kitType === 'tile-beanie' || kitType === 'tile-cap') return 'Tile Mate'
    if (kitType === 'airtag-cap' || kitType === 'airtag-beanie') return 'Apple AirTag'
    return 'Item 1'
  }
  
  const getSecondItemLabel = () => {
    const kitType = getKitType()
    if (kitType === 'polo-cap' || kitType === 'tile-cap' || kitType === 'airtag-cap') return 'Cap'
    if (kitType === 'polo-beanie' || kitType === 'tile-beanie' || kitType === 'airtag-beanie') return 'Beanie'
    return 'Item 2'
  }
  
  // Determine kit type
  const getKitType = () => {
    if (!productWithItems?.has_multiple_items) return 'single'
    
    // Check if it's Tile Mate (only Black/White in polo_colors, no polo_sizes)
    const isTileMate = productWithItems.polo_colors && 
                       productWithItems.polo_colors.length === 2 &&
                       productWithItems.polo_colors.includes('Black') && 
                       productWithItems.polo_colors.includes('White') &&
                       !productWithItems.polo_sizes
    
    // Check if it's Airtag (no polo_colors at all)
    const isAirtag = !productWithItems.polo_colors
    
    if (isTileMate && productWithItems.beanie_colors) return 'tile-beanie'
    if (isTileMate && productWithItems.cap_colors) return 'tile-cap'
    if (productWithItems.polo_colors && productWithItems.cap_colors) return 'polo-cap'
    if (productWithItems.polo_colors && productWithItems.beanie_colors) return 'polo-beanie'
    if (isAirtag && productWithItems.cap_colors) return 'airtag-cap'
    if (isAirtag && productWithItems.beanie_colors) return 'airtag-beanie'
    
    return 'single'
  }

  useEffect(() => {
    // Check if email and choice1 exist
    const email = sessionStorage.getItem('orderEmail')
    const choice1 = sessionStorage.getItem('choice1')
    
    if (!email || !choice1) {
      router.push('/')
      return
    }

    loadProducts()
  }, [router])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('christmas_products')
        .select('*, polo_colors, polo_sizes, cap_colors, cap_sizes, beanie_colors, polo_thumbnails, cap_thumbnails, beanie_thumbnails, has_multiple_items')
        .eq('category', 'choice2')

      if (error) throw error
      
      // Sort products alphabetically
      const sortedProducts = (data || []).sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
      
      setProducts(sortedProducts)
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

    // Handle multiple items (various combinations)
    if (productWithItems?.has_multiple_items) {
      const kitType = getKitType()
      
      // Validate based on kit type
      if (kitType === 'polo-cap') {
        if (!poloColor) { setError('Please select a polo color'); return }
        if (!poloSize) { setError('Please select a polo size'); return }
        if (!capColor) { setError('Please select a cap color'); return }
        if (!capSize) { setError('Please select a cap size'); return }
        
        sessionStorage.setItem('choice2', JSON.stringify({
          productId: selectedProductId,
          poloColor, poloSize, capColor, capSize,
          kitType: 'polo-cap',
          hasMultipleItems: true
        }))
      } else if (kitType === 'polo-beanie') {
        if (!poloColor) { setError('Please select a polo color'); return }
        if (!poloSize) { setError('Please select a polo size'); return }
        if (!beanieColor) { setError('Please select a beanie color'); return }
        if (!beanieSize) { setError('Please select a beanie size'); return }
        
        sessionStorage.setItem('choice2', JSON.stringify({
          productId: selectedProductId,
          poloColor, poloSize, beanieColor, beanieSize,
          kitType: 'polo-beanie',
          hasMultipleItems: true
        }))
      } else if (kitType === 'tile-beanie') {
        if (!tileColor) { setError('Please select a Tile Mate color'); return }
        if (!tileSize) { setError('Please select a Tile Mate size'); return }
        if (!beanieColor) { setError('Please select a beanie color'); return }
        if (!beanieSize) { setError('Please select a beanie size'); return }
        
        sessionStorage.setItem('choice2', JSON.stringify({
          productId: selectedProductId,
          tileColor, tileSize, beanieColor, beanieSize,
          kitType: 'tile-beanie',
          hasMultipleItems: true
        }))
      } else if (kitType === 'tile-cap') {
        if (!tileColor) { setError('Please select a Tile Mate color'); return }
        if (!tileSize) { setError('Please select a Tile Mate size'); return }
        if (!capColor) { setError('Please select a cap color'); return }
        if (!capSize) { setError('Please select a cap size'); return }
        
        sessionStorage.setItem('choice2', JSON.stringify({
          productId: selectedProductId,
          tileColor, tileSize, capColor, capSize,
          kitType: 'tile-cap',
          hasMultipleItems: true
        }))
      } else if (kitType === 'airtag-cap') {
        if (!airtagColor) { setError('Please select an AirTag color'); return }
        if (!airtagSize) { setError('Please select an AirTag size'); return }
        if (!capColor) { setError('Please select a cap color'); return }
        if (!capSize) { setError('Please select a cap size'); return }
        
        sessionStorage.setItem('choice2', JSON.stringify({
          productId: selectedProductId,
          airtagColor, airtagSize, capColor, capSize,
          kitType: 'airtag-cap',
          hasMultipleItems: true
        }))
      } else if (kitType === 'airtag-beanie') {
        if (!airtagColor) { setError('Please select an AirTag color'); return }
        if (!airtagSize) { setError('Please select an AirTag size'); return }
        if (!beanieColor) { setError('Please select a beanie color'); return }
        if (!beanieSize) { setError('Please select a beanie size'); return }
        
        sessionStorage.setItem('choice2', JSON.stringify({
          productId: selectedProductId,
          airtagColor, airtagSize, beanieColor, beanieSize,
          kitType: 'airtag-beanie',
          hasMultipleItems: true
        }))
      }
    } else {
      // Handle single item selection
      if (selectedProduct?.requires_color && !selectedColor) {
        setError('Please select a color')
        return
      }

      if (selectedProduct?.requires_size && !selectedSize) {
        setError('Please select a size')
        return
      }

      // Store single item selection
      sessionStorage.setItem('choice2', JSON.stringify({
        productId: selectedProductId,
        color: selectedColor || null,
        size: selectedSize || null,
        hasMultipleItems: false
      }))
    }

    router.push('/shipping')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-12 px-4 relative">
      <AdminExportButton />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <StrykerLogo className="text-2xl mb-2" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Choice 2</h1>
            <p className="text-gray-600">Select your second product (kits)</p>
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
                setSelectedColor('')
                setSelectedSize('')
                setPoloColor('')
                setPoloSize('')
                setCapColor('')
                setCapSize('')
                setBeanieColor('')
                setBeanieSize('')
                setTileColor('')
                setTileSize('')
                setAirtagSize('')
                setAirtagColor('White')
                setError('')
                
                // Default to first color/size if product has multiple items
                const product = products.find(p => p.id === productId)
                const productWithDefaults = product as any
                if (productWithDefaults?.has_multiple_items) {
                  if (productWithDefaults.polo_colors && productWithDefaults.polo_colors.length > 0) {
                    // Check if it's Tile Mate (Black/White) or Polo
                    if (productWithDefaults.polo_colors.includes('Black') && productWithDefaults.polo_colors.includes('White') && productWithDefaults.polo_colors.length === 2) {
                      setTileColor(productWithDefaults.polo_colors[0])
                      // Extract pack size from product name (e.g., "Tile Mate 2 Pack & ..." -> "2 Pack")
                      const packMatch = productWithDefaults.name.match(/Tile Mate (\d+ Pack)/i)
                      if (packMatch && productWithDefaults.available_sizes) {
                        const packSize = packMatch[1]
                        if (productWithDefaults.available_sizes.includes(packSize)) {
                          setTileSize(packSize)
                        } else if (productWithDefaults.available_sizes.length > 0) {
                          setTileSize(productWithDefaults.available_sizes[0])
                        }
                      } else if (productWithDefaults.available_sizes && productWithDefaults.available_sizes.length > 0) {
                        setTileSize(productWithDefaults.available_sizes[0])
                      }
                    } else {
                      setPoloColor(productWithDefaults.polo_colors[0])
                    }
                  }
                  if (productWithDefaults.cap_colors && productWithDefaults.cap_colors.length > 0) {
                    setCapColor(productWithDefaults.cap_colors[0])
                  }
                  if (productWithDefaults.cap_sizes && productWithDefaults.cap_sizes.length > 0) {
                    setCapSize(productWithDefaults.cap_sizes[0])
                  }
                  if (productWithDefaults.beanie_colors && productWithDefaults.beanie_colors.length > 0) {
                    setBeanieColor(productWithDefaults.beanie_colors[0])
                    // Beanies are always OSFA
                    setBeanieSize('OSFA')
                  }
                  // Default AirTag size to "1 Pack" and color to "White"
                  if (productWithDefaults.available_sizes && productWithDefaults.available_sizes.includes('1 Pack') && !productWithDefaults.polo_colors) {
                    setAirtagSize('1 Pack')
                    setAirtagColor('White')
                  }
                } else if (product?.requires_color && product.available_colors && product.available_colors.length > 0) {
                  setSelectedColor(product.available_colors[0])
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
              {/* Multiple Items Layout */}
              {productWithItems?.has_multiple_items ? (() => {
                const kitType = getKitType()
                const hasPolo = kitType === 'polo-cap' || kitType === 'polo-beanie'
                const hasTile = kitType === 'tile-beanie' || kitType === 'tile-cap'
                const hasCap = kitType === 'polo-cap' || kitType === 'tile-cap' || kitType === 'airtag-cap'
                const hasBeanie = kitType === 'polo-beanie' || kitType === 'tile-beanie' || kitType === 'airtag-beanie'
                const hasAirtag = kitType === 'airtag-cap' || kitType === 'airtag-beanie'
                
                return (
                  <>
                    <div className="mb-4">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        {selectedProduct.name}
                      </h2>
                      {selectedProduct.description && (
                        <p className="text-gray-600 mb-4 whitespace-pre-line">{selectedProduct.description}</p>
                      )}
                    </div>
                    
                    {/* Two Products Side by Side with Dropdowns Under Each */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* First Item Section */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {getFirstItemLabel()}
                        </h3>
                        {/* First Item Image */}
                        <div className="mb-4">
                          {hasPolo && getPoloThumbnail() ? (
                            <img src={getPoloThumbnail() || ''} alt="Polo" className="w-full rounded-lg shadow-md" />
                          ) : hasTile && getTileThumbnail() ? (
                            <img src={getTileThumbnail() || ''} alt="Tile Mate" className="w-full rounded-lg shadow-md" />
                          ) : hasAirtag ? (
                            <div className="w-full aspect-square bg-gray-100 rounded-lg shadow-md flex items-center justify-center border-2 border-gray-300">
                              <div className="text-center p-4">
                                <div className="text-4xl mb-2">📱</div>
                                <div className="text-sm text-gray-500 font-medium">Apple AirTag</div>
                                <div className="text-xs text-gray-400 mt-1">White (included)</div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full aspect-square bg-gray-100 rounded-lg shadow-md flex items-center justify-center border-2 border-gray-300">
                              <div className="text-center p-4">
                                <div className="text-4xl mb-2">📦</div>
                                <div className="text-sm text-gray-500 font-medium">Select color to view</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* First Item Dropdowns */}
                        {hasPolo && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Polo Color *</label>
                              <select value={poloColor} onChange={(e) => { setPoloColor(e.target.value); setError('') }} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white">
                                <option value="">-- Select polo color --</option>
                                {productWithItems.polo_colors?.map((color: string) => <option key={color} value={color}>{color}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Polo Size *</label>
                              <select value={poloSize} onChange={(e) => { setPoloSize(e.target.value); setError('') }} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white">
                                <option value="">-- Select polo size --</option>
                                {productWithItems.polo_sizes?.map((size: string) => <option key={size} value={size}>{size}</option>)}
                              </select>
                            </div>
                          </div>
                        )}
                        
                        {hasTile && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Tile Mate Color *</label>
                              <select value={tileColor} onChange={(e) => { setTileColor(e.target.value); setError('') }} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white">
                                <option value="">-- Select Tile Mate color --</option>
                                {productWithItems.polo_colors?.map((color: string) => <option key={color} value={color}>{color}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Tile Mate Size *</label>
                              <select value={tileSize} onChange={(e) => { setTileSize(e.target.value); setError('') }} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white">
                                <option value="">-- Select pack size --</option>
                                {productWithItems.available_sizes?.map((size: string) => <option key={size} value={size}>{size}</option>)}
                              </select>
                            </div>
                          </div>
                        )}
                        
                        {hasAirtag && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">AirTag Color *</label>
                              <select value={airtagColor} onChange={(e) => { setAirtagColor(e.target.value); setError('') }} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white">
                                <option value="White">White</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">AirTag Size *</label>
                              <select value={airtagSize} onChange={(e) => { setAirtagSize(e.target.value); setError('') }} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white">
                                <option value="">-- Select pack size --</option>
                                <option value="1 Pack">1 Pack</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Second Item Section */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {getSecondItemLabel()}
                        </h3>
                        {/* Second Item Image */}
                        <div className="mb-4">
                          {hasCap && getCapThumbnail() ? (
                            <img src={getCapThumbnail() || ''} alt="Cap" className="w-full rounded-lg shadow-md" />
                          ) : hasBeanie && getBeanieThumbnail() ? (
                            <img src={getBeanieThumbnail() || ''} alt="Beanie" className="w-full rounded-lg shadow-md" />
                          ) : (
                            <div className="w-full aspect-square bg-gray-100 rounded-lg shadow-md flex items-center justify-center border-2 border-gray-300">
                              <div className="text-center p-4">
                                <div className="text-4xl mb-2">{hasCap ? '🧢' : '🧶'}</div>
                                <div className="text-sm text-gray-500 font-medium">Select color to view</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Second Item Dropdowns */}
                        {hasCap && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Cap Color *</label>
                              <select value={capColor} onChange={(e) => { setCapColor(e.target.value); setError('') }} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white">
                                <option value="">-- Select cap color --</option>
                                {productWithItems.cap_colors?.map((color: string) => <option key={color} value={color}>{color}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Cap Size *</label>
                              <select value={capSize} onChange={(e) => { setCapSize(e.target.value); setError('') }} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white">
                                <option value="">-- Select cap size --</option>
                                {productWithItems.cap_sizes?.map((size: string) => <option key={size} value={size}>{size}</option>)}
                              </select>
                            </div>
                          </div>
                        )}
                        
                        {hasBeanie && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Beanie Color *</label>
                              <select value={beanieColor} onChange={(e) => { setBeanieColor(e.target.value); setError('') }} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white">
                                <option value="">-- Select beanie color --</option>
                                {productWithItems.beanie_colors?.map((color: string) => <option key={color} value={color}>{color}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Beanie Size *</label>
                              <select value={beanieSize} onChange={(e) => { setBeanieSize(e.target.value); setError('') }} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffb500] focus:border-transparent text-black bg-white">
                                <option value="">-- Select size --</option>
                                <option value="OSFA">OSFA</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )
              })() : (
                /* Single Item Layout */
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      {selectedProduct.thumbnail_url ? (
                        <img
                          src={selectedProduct.thumbnail_url}
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
                        <p className="text-gray-600 mb-4 whitespace-pre-line">{selectedProduct.description}</p>
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
                </>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => router.push('/choice1')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={handleContinue}
              className="px-6 py-2 text-black rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#ffb500] focus:ring-offset-2 font-medium"
              style={{ backgroundColor: '#ffb500' }}
            >
              Continue to Shipping →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

