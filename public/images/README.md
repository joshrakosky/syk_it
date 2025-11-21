# Product Images

Place product thumbnail images in this `public/images/` directory. Each color variant should have its own thumbnail.

## Image Path Format

All images should be placed in `/public/images/` and referenced as `/images/filename.jpg` in the database.

## Choice 1 Products

### Tile Mate 4 Pack
- `/images/tile-mate-4pack-black.jpg` - Black
- `/images/tile-mate-4pack-white.jpg` - White

### OGIO Surge RSS Pack
- `/images/ogio-surge-rss-black-pindot.jpg` - Black Pindot (default)

### Brooks Brothers Oxford Backpack
- `/images/brooks-brothers-oxford-deep-black.jpg` - Deep Black
- `/images/brooks-brothers-oxford-navy-blazer.jpg` - Navy Blazer

### The North Face Fall Line Backpack
- `/images/north-face-fall-line-black.jpg` - Black
- `/images/north-face-fall-line-black-heather.jpg` - Black Heather
- `/images/north-face-fall-line-cosmic-blue-grey-heather.jpg` - Cosmic Blue/Grey Heather

### OGIO Gear Mega Cube
- `/images/ogio-mega-cube.jpg` - Default thumbnail

### Fleece Jackets
**The North Face Men's Skyline Full-Zip Fleece Jacket:**
- `/images/north-face-mens-skyline-tnf-black.jpg` - TNF Black
- `/images/north-face-mens-skyline-dark-grey-heather.jpg` - Dark Grey Heather
- `/images/north-face-mens-skyline-urban-navy-heather.jpg` - Urban Navy Heather

**The North Face Women's Skyline Full-Zip Fleece Jacket:**
- `/images/north-face-womens-skyline-tnf-black.jpg` - TNF Black
- `/images/north-face-womens-skyline-dark-grey-heather.jpg` - Dark Grey Heather
- `/images/north-face-womens-skyline-urban-navy-heather.jpg` - Urban Navy Heather

**The North Face Sweater Fleece Jacket (Men's & Women's):**
- `/images/north-face-sweater-fleece-black-heather.jpg` - Black Heather
- `/images/north-face-sweater-fleece-medium-grey-heather.jpg` - Medium Grey Heather

**The North Face Highest Peak Full-Zip Fleece Jacket:**
- `/images/north-face-highest-peak-black.jpg` - Black
- `/images/north-face-highest-peak-navy.jpg` - Navy
- `/images/north-face-highest-peak-gray.jpg` - Gray
- `/images/north-face-highest-peak-charcoal.jpg` - Charcoal

**Under Armour Men's Unstoppable Fleece Full-Zip:**
- `/images/under-armour-mens-unstoppable-black.jpg` - Black
- `/images/under-armour-mens-unstoppable-navy.jpg` - Navy
- `/images/under-armour-mens-unstoppable-gray.jpg` - Gray
- `/images/under-armour-mens-unstoppable-charcoal.jpg` - Charcoal

**Under Armour Women's Unstoppable Fleece Full-Zip Jacket:**
- `/images/under-armour-womens-unstoppable-black.jpg` - Black
- `/images/under-armour-womens-unstoppable-navy.jpg` - Navy
- `/images/under-armour-womens-unstoppable-gray.jpg` - Gray

## Choice 2 Products (Kits)

### Adidas Polo Thumbnails (for Kit 3, Kit 6, Kit 7, Kit 12)
- `/images/adidas-polo-black.jpg` - Black
- `/images/adidas-polo-grey.jpg` - Grey
- `/images/adidas-polo-navy.jpg` - Navy
- `/images/adidas-polo-purple.jpg` - Purple
- `/images/adidas-polo-royal-blue.jpg` - Royal Blue

### New Era Cap Thumbnails (for Kit 3, Kit 9, Kit 10, Kit 12)
- `/images/new-era-cap-black.jpg` - Black
- `/images/new-era-cap-graphite.jpg` - Graphite
- `/images/new-era-cap-royal.jpg` - Royal

### The North Face Beanie Thumbnails (for Kit 6, Kit 7, Kit 8, Kit 11)
- `/images/north-face-beanie-asphalt-grey.jpg` - Asphalt Grey
- `/images/north-face-beanie-tnf-black.jpg` - TNF Black
- `/images/north-face-beanie-tnf-medium-grey-heather.jpg` - TNF Medium Grey Heather
- `/images/north-face-beanie-tnf-yellow.jpg` - TNF Yellow
- `/images/north-face-beanie-urban-navy.jpg` - Urban Navy

### Tile Mate Thumbnails (for Kit 1, Kit 8, Kit 9)
- `/images/tile-mate-black.jpg` - Black
- `/images/tile-mate-white.jpg` - White

### Tech Organizer and Power Bank
- `/images/tech-organizer-power-bank-black.jpg` - Black (default)

### 4 Pack of Shirts
- `/images/4-pack-shirts.jpg` - Default thumbnail

## Image Requirements

- **Recommended size**: 800x800px or larger (square aspect ratio)
- **Format**: JPG, PNG, or WebP
- **File size**: Keep under 500KB for fast loading
- **Naming**: Use lowercase with hyphens (e.g., `adidas-polo-black.jpg`)

## Database Configuration

Images are configured in the database using the `color_thumbnails` JSONB field:

```json
{
  "Black": "/images/product-black.jpg",
  "White": "/images/product-white.jpg",
  "Navy": "/images/product-navy.jpg"
}
```

For kits with multiple items, use:
- `polo_thumbnails` - For polo color thumbnails
- `cap_thumbnails` - For cap color thumbnails  
- `beanie_thumbnails` - For beanie color thumbnails

## Adding Images

1. Save images to `public/images/` directory with descriptive filenames
2. Update the database `color_thumbnails` JSONB field with the correct paths
3. Images will automatically display based on color selection
4. If an image is missing, a placeholder will be shown

## Placeholder Behavior

If a thumbnail is not found, the system will:
1. Show a placeholder icon with the product name
2. Display "Select color to view" message
3. Once a color is selected, show the corresponding thumbnail if available
