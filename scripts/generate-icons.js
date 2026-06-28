const fs = require('fs')
const path = require('path')

// SVG icône BricoMaroc
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#1B7A56"/>
  <text x="256" y="320" font-size="280" text-anchor="middle" fill="white">🔧</text>
</svg>`

// Créer un SVG simple comme PNG (base64)
const svg192 = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="30" fill="#1B7A56"/>
  <text x="96" y="130" font-size="100" text-anchor="middle" fill="white">🔧</text>
</svg>`

const svg512 = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#1B7A56"/>
  <text x="256" y="340" font-size="280" text-anchor="middle" fill="white">🔧</text>
</svg>`

fs.writeFileSync(path.join(__dirname, '../public/icons/icon-192.svg'), svg192)
fs.writeFileSync(path.join(__dirname, '../public/icons/icon-512.svg'), svg512)

console.log('SVG icons created!')