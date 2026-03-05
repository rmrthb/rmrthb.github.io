# 🔍 Barcode Scanner

A simple web-based barcode scanner that uses your phone's camera to scan product barcodes and retrieve information from Open Food Facts.

## Features

- 📷 Scan barcodes using your phone's camera
- ⚖️ Get product weight, name, brand, and ingredients
- 🚫 No app installation required — works in your browser
- 📱 Mobile-friendly design

## Usage

1. Visit the app URL in your mobile browser
2. Tap "Start Scan"
3. Allow camera access when prompted
4. Point your camera at a barcode
5. View the product information

## API

This app uses the [Open Food Facts API](https://world.openfoodfacts.org/data) which is free and requires no API key.

## Folder Structure

```
barcode-scanner/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── scanner.js
│   └── api.js
└── README.md
```