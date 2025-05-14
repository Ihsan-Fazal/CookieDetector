# Cookie Detector

This project is a Chrome extension that detects and blocks cookies, and checks URLs for potential phishing threats using local techniques.



1. Open Chrome and navigate to `chrome://extensions/`.

2. Enable "Developer mode" by toggling the switch in the top right corner.

3. Click on "Load unpacked".

## Usage

1. Click on the extension icon in the Chrome toolbar.

2. Enter a URL in the input field and click "Check Link" to verify if the URL is potentially malicious.

3. The extension will display a message indicating whether the URL is safe or a phishing website.

4. The extension will also display a list of cookies detected on the current page, categorized by risk level.

## Development

### Files

- `popup.js`: Handles the UI interactions and communicates with the background script.
- `background.js`: Manages the cookie data and URL scanning logic.
- `virusScanner.js`: Contains the logic for scanning URLs using local techniques.

### Running the Extension

1. Make changes to the code as needed.

2. Reload the extension in the Chrome extensions page (`chrome://extensions/`) by clicking the reload icon.

3. Test the changes by interacting with the extension.

## Contributing

Feel free to submit issues or pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.