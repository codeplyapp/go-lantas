import fs from 'node:fs';
import path from 'node:path';

const pngPath = path.resolve('public/mascot/mascot.png');
const svgPath = path.resolve('public/mascot/mascot.svg');

if (fs.existsSync(pngPath)) {
  const buffer = fs.readFileSync(pngPath);
  const base64 = buffer.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024" width="100%" height="100%">
  <image href="data:image/png;base64,${base64}" xlink:href="data:image/png;base64,${base64}" width="1024" height="1024" preserveAspectRatio="xMidYMid meet"/>
</svg>\n`;

  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  console.log('Generated self-contained SVG at:', svgPath, 'Size:', fs.statSync(svgPath).size);
} else {
  console.error('PNG not found at:', pngPath);
}
