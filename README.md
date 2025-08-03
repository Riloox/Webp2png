\# WebP to PNG Converter Chrome Extension



\## Overview

This Chrome extension automatically converts WebP images to PNG format when downloaded from the browser. It intercepts the download process, processes the image using the HTML5 Canvas API, and saves it as a PNG file.



\## Features

\- Converts WebP images to PNG during download.

\- Preserves the original filename with a `.png` extension.

\- Fallback to original WebP file if conversion fails.

\- Lightweight and easy to install.



\## Installation

1\. Create a directory (e.g., `webp-to-png-extension`).

2\. Save the following files in the directory:

&nbsp;  - `manifest.json`

&nbsp;  - `background.js`

&nbsp;  - `icon.png` (a 128x128 PNG image for the extension icon)

3\. Load the extension in Chrome:

&nbsp;  - Go to `chrome://extensions/`.

&nbsp;  - Enable "Developer mode" (top right).

&nbsp;  - Click "Load unpacked" and select the extension directory.



\## Usage

\- Right-click any WebP image on a webpage and select "Save image as...".

\- The extension will automatically convert and save it as a PNG file.

\- If conversion fails (e.g., corrupted image), the original WebP file is saved instead.



\## Files

\- `manifest.json`: Defines the extension's metadata and permissions.

\- `background.js`: Contains the logic to intercept and convert WebP downloads.

\- `icon.png`: The extension's icon (128x128 pixels).



\## Customization

\- To convert to JPG instead of PNG, modify the `canvas.toBlob` call in `background.js` to use `'image/jpeg'` and update the filename extension to `.jpg`.

\- Replace `icon.png` with your own 128x128 PNG image for a custom icon.



\## Requirements

\- Google Chrome browser.

\- Permissions: `downloads`, `downloads.open`, `downloads.shelf`.



\## Troubleshooting

\- Ensure the extension is enabled in `chrome://extensions/`.

\- Check for conflicts with other extensions (e.g., security tools).

\- Verify the `background.js` script is correctly handling the download event.



\## License

This project is open-source. Feel free to modify and distribute it under the MIT License.

