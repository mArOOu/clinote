/* eslint-disable */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const outDir = path.join(process.cwd(), "public", "icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function makeSvg(size, isMaskable = false) {
  const pad = isMaskable ? size * 0.18 : size * 0.08;
  const inner = size - pad * 2;
  const rx = isMaskable ? 0 : size * 0.22;

  return `<?xml version="1.0" encoding="utf-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${isMaskable ? "#0f766e" : "transparent"}"/>
  ${
    !isMaskable
      ? `<rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${rx}" fill="#0f766e"/>`
      : ""
  }
  <g transform="translate(${size / 2}, ${size / 2})" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="0" cy="0" r="${size * 0.28}" fill="none" stroke="#ffffff" stroke-width="${size * 0.03}" opacity="0.28"/>
    <path d="M 0 -${size * 0.22} L 0 ${size * 0.22}" stroke-width="${size * 0.055}"/>
    <path d="M -${size * 0.22} 0 L ${size * 0.22} 0" stroke-width="${size * 0.055}"/>
    <circle cx="0" cy="0" r="${size * 0.075}" fill="#0f766e" stroke="#ffffff" stroke-width="${size * 0.04}"/>
  </g>
</svg>`;
}

async function run() {
  const svg512 = makeSvg(512, false);
  const svgMaskable = makeSvg(512, true);

  fs.writeFileSync(path.join(outDir, "icon.svg"), makeSvg(512, false));

  await sharp(Buffer.from(svg512))
    .resize(192, 192)
    .png()
    .toFile(path.join(outDir, "icon-192.png"));

  await sharp(Buffer.from(svg512))
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, "icon-512.png"));

  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, "icon-maskable.png"));

  await sharp(Buffer.from(svg512))
    .resize(180, 180)
    .png()
    .toFile(path.join(process.cwd(), "public", "apple-touch-icon.png"));

  await sharp(Buffer.from(svg512))
    .resize(32, 32)
    .png()
    .toFile(path.join(process.cwd(), "public", "favicon-32x32.png"));

  console.log("Icons generated successfully!");
}

run().catch(console.error);
