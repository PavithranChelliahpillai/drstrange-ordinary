#!/bin/bash

echo "🚀 Setting up Drug Interaction AI Agents Hackathon Project"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install Dr. Strange dependencies
echo ""
echo "📦 Installing Dr. Strange dependencies..."
cd dr-strange
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. 🩺 Load Chrome Extension (Dr. Ordinary):"
echo "   - Open Chrome and go to chrome://extensions/"
echo "   - Enable 'Developer mode' (toggle in top right)"
echo "   - Click 'Load unpacked'"
echo "   - Select the 'dr-ordinary' folder"
echo ""
echo "2. 🔬 Start Dr. Strange Web App:"
echo "   cd dr-strange"
echo "   npm run dev"
echo "   - Then visit http://localhost:3000"
echo ""
echo "3. 🧪 Test the Integration:"
echo "   - Visit any webpage mentioning drugs (e.g., 'ibuprofen side effects')"
echo "   - Look for highlighted drug names"
echo "   - Click 'Check with Dr. Strange' buttons"
echo ""
echo "🎉 Happy hacking!" 