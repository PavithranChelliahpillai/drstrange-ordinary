# 🩺 Dr. Ordinary - Chrome Extension

AI-powered drug interaction detector that warns users about potential conflicts when searching for medications online.

## Features

- **Real-time Drug Detection**: Automatically detects drug names mentioned on web pages
- **Interaction Warnings**: Shows immediate alerts for potential drug-drug and drug-food interactions
- **Non-intrusive UI**: Highlights drug mentions with hover details and warning popups
- **Dr. Strange Integration**: Direct links to detailed analysis in the Dr. Strange web application
- **Context Menu**: Right-click selected text to check interactions

## Installation

### Development Mode

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd Calhacks/dr-ordinary
   ```

2. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dr-ordinary` folder

3. **Test the extension**:
   - Visit any webpage mentioning drugs (try searching for "ibuprofen side effects")
   - Look for highlighted drug names and interaction warnings

### Production Build

For production deployment, you would:
1. Create icons (16x16, 48x48, 128x128 pixels) in the `icons/` folder
2. Test thoroughly across different websites
3. Submit to Chrome Web Store

## File Structure

```
dr-ordinary/
├── manifest.json          # Extension configuration
├── content/
│   ├── detector.js        # Main content script for drug detection
│   └── styles.css         # Styling for highlights and warnings
├── background/
│   └── service-worker.js  # Background service worker
├── popup/
│   ├── popup.html         # Extension popup interface
│   └── popup.js           # Popup functionality
└── icons/                 # Extension icons (add these)
```

## How It Works

1. **Content Script Injection**: The extension injects `detector.js` into all web pages
2. **Text Analysis**: Scans page content for drug keywords using regex patterns
3. **Real-time Monitoring**: Uses MutationObserver to detect dynamically loaded content
4. **Interaction Database**: Checks detected drugs against known interaction patterns
5. **Visual Feedback**: Highlights drug mentions and shows warning popups
6. **Integration**: Provides links to Dr. Strange for detailed analysis

## Drug Detection

The extension recognizes common drug names including:
- Generic names (e.g., ibuprofen, metformin, warfarin)
- Brand names (e.g., Advil, Glucophage, Coumadin)
- Both prescription and over-the-counter medications

## Interaction Warnings

Warnings are categorized by severity:
- **High Risk**: Red warnings for dangerous combinations
- **Medium Risk**: Yellow warnings for moderate interactions
- **Low Risk**: Blue warnings for minor interactions

## Customization

You can modify the drug detection by editing:
- `drugKeywords` array in `detector.js` for drug recognition
- `drugInteractions` object in `detector.js` for interaction rules
- CSS styles in `styles.css` for visual appearance

## Privacy & Security

- No personal data is collected or transmitted
- All processing happens locally in the browser
- Drug interaction data is stored locally within the extension

## Development

### Adding New Drugs
```javascript
// In detector.js, add to drugKeywords array
this.drugKeywords = [
  // ... existing drugs ...
  'newdrug', 'anotherdrug'
];
```

### Adding New Interactions
```javascript
// In detector.js, add to drugInteractions object
this.drugInteractions = {
  // ... existing interactions ...
  'newdrug': {
    drugs: ['interactingdrug1', 'interactingdrug2'],
    foods: ['alcohol', 'grapefruit'],
    severity: 'medium'
  }
};
```

## Integration with Dr. Strange

The extension integrates seamlessly with the Dr. Strange web application:
- Warning popups include "Check with Dr. Strange" buttons
- Background script handles opening Dr. Strange with drug parameters
- Context menu allows checking selected text

## Known Limitations

- Detection based on exact keyword matching (no fuzzy matching yet)
- Limited drug database (expandable for production)
- English language only
- No personalized drug profiles

## Future Enhancements

- AI-powered drug name recognition
- User medication profiles
- Personalized interaction checking
- Multi-language support
- Integration with medical databases
- Dosage-specific warnings

## Support

For issues or feature requests, please check the main project documentation or create an issue in the repository. 