# Drug Interaction AI Agents

A hackathon project using AI agents to recognize patterns in drug-drug interactions.

## Components

### 🩺 Dr. Ordinary - Chrome Extension
A Chrome extension that uses web agents to recognize when a user is searching about a particular drug and informs them of possible drug-drug and drug-food conflicts.

**Features:**
- Detects drug searches on web pages
- Real-time drug interaction warnings
- Food-drug conflict alerts
- Non-intrusive user interface

### 🔬 Dr. Strange - Web Application
An online website that allows doctors/pharmacists to enter 2 drugs and predictively return potential conflicts that can then be tested by the doctor and later verified (similar to AlphaFold predictive algorithm).

**Features:**
- Predictive drug interaction analysis
- Doctor/pharmacist interface
- Conflict verification system
- Research and testing workflow

## Project Structure

```
├── dr-ordinary/          # Chrome Extension
│   ├── manifest.json
│   ├── content/          # Content scripts
│   ├── background/       # Background scripts
│   └── popup/           # Extension popup UI
├── dr-strange/          # Web Application
│   ├── frontend/        # React/Next.js frontend
│   ├── backend/         # Node.js/Python backend
│   └── models/          # AI models and data
└── shared/              # Shared utilities and data
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Chrome browser (for extension development)

### Installation
1. Clone the repository
2. Install dependencies for each component
3. Follow individual setup instructions in each directory

## Development

Each component has its own development workflow. See individual README files in:
- `dr-ordinary/README.md`
- `dr-strange/README.md`
