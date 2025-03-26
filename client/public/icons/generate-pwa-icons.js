// This is a helper script to generate various sized PNG icons from the SVG
// You can run this manually using Node.js if you need to regenerate icons

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Special icons
const specialIcons = [
  { name: 'browse-icon-192x192.png', size: 192, text: 'B' },
  { name: 'mylist-icon-192x192.png', size: 192, text: 'L' },
  { name: 'badge-72x72.png', size: 72, text: 'M', isRound: true }
];

async function generateIcons() {
  try {
    // We would normally load the SVG here and convert it
    // but in this demo we'll just create icons programmatically

    // Generate standard icons
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#7C3AED');
      gradient.addColorStop(1, '#4C1D95');
      
      // Draw rounded rectangle
      const radius = size / 4; // Adjust radius as needed
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw M in the center
      ctx.fillStyle = 'white';
      ctx.font = `bold ${size / 2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', size / 2, size / 2);
      
      // Save to file
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(__dirname, `icon-${size}x${size}.png`), buffer);
      console.log(`Generated icon-${size}x${size}.png`);
    }
    
    // Generate special icons
    for (const icon of specialIcons) {
      const canvas = createCanvas(icon.size, icon.size);
      const ctx = canvas.getContext('2d');
      
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, icon.size, icon.size);
      gradient.addColorStop(0, '#7C3AED');
      gradient.addColorStop(1, '#4C1D95');
      
      if (icon.isRound) {
        // Draw circle
        ctx.beginPath();
        ctx.arc(icon.size / 2, icon.size / 2, icon.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      } else {
        // Draw rounded rectangle
        const radius = icon.size / 4;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(icon.size - radius, 0);
        ctx.quadraticCurveTo(icon.size, 0, icon.size, radius);
        ctx.lineTo(icon.size, icon.size - radius);
        ctx.quadraticCurveTo(icon.size, icon.size, icon.size - radius, icon.size);
        ctx.lineTo(radius, icon.size);
        ctx.quadraticCurveTo(0, icon.size, 0, icon.size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Draw text in the center
      ctx.fillStyle = 'white';
      ctx.font = `bold ${icon.size / 2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon.text, icon.size / 2, icon.size / 2);
      
      // Save to file
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(__dirname, icon.name), buffer);
      console.log(`Generated ${icon.name}`);
    }
    
    console.log('All icons generated successfully');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// This would be run manually to generate icons
// generateIcons();

// For this demo, we'll just document that the icons would be generated
console.log('This script would generate PWA icons. Run it manually with Node.js if needed.');