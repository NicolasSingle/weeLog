// Run this script with: node generate-icon.js
const fs = require('fs');
// Minimal 32x32 PNG - a simple blue square icon
const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOklEQVRYR+3QMQEAAAjDMFB/tN0Q8AfSzL7pAgMDg8EwDMMwDMMwDMMwDMMwDMMwDMMwjP8G3AC70y1w9gB7IQAAAABJRU5ErkJggg==';
fs.writeFileSync('src-tauri/icons/icon.png', Buffer.from(iconBase64, 'base64'));
console.log('Icon created at src-tauri/icons/icon.png');
