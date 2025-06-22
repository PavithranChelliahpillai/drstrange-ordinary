# 🔬 Dr. Strange - AI Drug Interaction Predictor

Advanced web application that allows doctors and pharmacists to predict potential drug interactions using AI algorithms, similar to AlphaFold's predictive approach.

## Features

- **AI-Powered Prediction**: Machine learning models analyze drug combinations
- **Confidence Scoring**: Each prediction includes confidence levels (65-95%)
- **Severity Classification**: High, Medium, and Low risk categorization
- **Mechanism Analysis**: Detailed explanation of interaction mechanisms
- **Management Recommendations**: Clinical guidance for healthcare professionals
- **Dr. Ordinary Integration**: Seamless integration with the Chrome extension
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Custom Components
- **Icons**: Lucide React
- **API**: Next.js API Routes
- **AI Integration**: Ready for OpenAI/Hugging Face integration

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Setup

1. **Clone and navigate to the project**:
   ```bash
   git clone <your-repo-url>
   cd Calhacks/dr-strange
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (optional for AI integration):
   ```bash
   cp .env.example .env.local
   # Add your API keys:
   # OPENAI_API_KEY=your_openai_key
   # HUGGINGFACE_API_KEY=your_huggingface_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Interaction Analysis

1. Enter the first drug name in the "Primary Drug" field
2. Enter the second drug name in the "Secondary Drug" field
3. Click "Analyze Interactions"
4. View detailed results including:
   - Risk severity level
   - Confidence percentage
   - Interaction mechanism
   - Management recommendations

### Integration with Dr. Ordinary

The application automatically detects when launched from the Dr. Ordinary Chrome extension:
- Drug names are pre-filled from URL parameters
- Seamless workflow from web browsing to detailed analysis

## API Endpoints

### POST /api/predict

Predict drug interactions between two medications.

**Request Body**:
```json
{
  "drug1": "warfarin",
  "drug2": "aspirin"
}
```

**Response**:
```json
{
  "success": true,
  "interactions": [
    {
      "id": "direct-0",
      "drug1": "warfarin",
      "drug2": "aspirin",
      "severity": "high",
      "description": "Increased risk of bleeding when used together",
      "mechanism": "Both drugs affect platelet aggregation and coagulation cascade",
      "management": "Monitor INR closely, consider dose adjustment or alternative therapy",
      "confidence": 0.92
    }
  ],
  "metadata": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0",
    "model": "DrugInteractionAI-v1"
  }
}
```

### GET /api/predict

Get API information and available endpoints.

## File Structure

```
dr-strange/
├── app/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage component
│   └── api/
│       └── predict/
│           └── route.ts   # Drug interaction API
├── components/            # Reusable React components (future)
├── lib/                   # Utility functions (future)
├── public/               # Static assets
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies and scripts
```

## AI Integration

The application is designed to integrate with various AI services:

### OpenAI Integration (Future)
```typescript
// Example integration with OpenAI
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "You are a pharmaceutical expert analyzing drug interactions..."
    },
    {
      role: "user",
      content: `Analyze the interaction between ${drug1} and ${drug2}`
    }
  ]
});
```

### Hugging Face Integration (Future)
```typescript
// Example integration with Hugging Face
const response = await fetch('https://api-inference.huggingface.co/models/drug-interaction-model', {
  headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
  method: 'POST',
  body: JSON.stringify({ inputs: { drug1, drug2 } })
});
```

## Current Limitations

- **Mock Data**: Currently uses simulated predictions (replace with real AI models)
- **Limited Database**: Small set of known interactions (expandable)
- **No User Authentication**: Open access (add auth for production)
- **No Data Persistence**: No database integration yet

## Production Deployment

### Vercel Deployment

1. **Connect to Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on git push

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Development

### Adding New Features

1. **Create new components** in the `components/` directory
2. **Add API routes** in `app/api/`
3. **Update styling** in `globals.css` or component-specific styles
4. **Test thoroughly** with various drug combinations

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Maintain consistent naming conventions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security Considerations

- **Input Validation**: Always validate drug names and user inputs
- **Rate Limiting**: Implement API rate limiting for production
- **HTTPS**: Use HTTPS in production
- **Data Privacy**: Ensure no sensitive medical data is logged

## Future Enhancements

- [ ] Real AI model integration
- [ ] User authentication and profiles
- [ ] Drug interaction database expansion
- [ ] Dosage-specific interactions
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Integration with EHR systems
- [ ] Clinical trial data integration
- [ ] Drug allergy checking
- [ ] Personalized medicine recommendations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

⚠️ **Important**: This application is for educational and research purposes only. Always consult with qualified healthcare professionals before making any medical decisions. The AI predictions should be verified against clinical documentation and current medical literature. 