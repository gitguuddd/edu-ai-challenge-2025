# 🔍 Service Analyzer

> An AI-powered console application for comprehensive service analysis using OpenAI's GPT-4o-mini

## 📋 Overview

Service Analyzer is a lightweight, interactive console application that leverages OpenAI's advanced language models to provide detailed analysis of digital services and platforms. Whether you have just a service name or a detailed description, this tool generates comprehensive reports covering business model, target audience, technical insights, and competitive positioning.

## ✨ Features

### 🎯 **Dual Analysis Modes**
- **Service Name Analysis**: Comprehensive analysis based on service identification by name
- **Raw Description Analysis**: Focused analysis from user-provided service descriptions

### 📊 **Comprehensive Analysis Coverage**
- **📚 Brief History**: Founding details, key milestones, and evolution
- **👥 Target Audience**: Primary user segments and demographics  
- **⚡ Core Features**: Top 2-4 key functionalities and capabilities
- **🎯 Unique Selling Points**: Key differentiators and competitive advantages
- **💰 Business Model**: Revenue streams and monetization strategies
- **🔧 Tech Stack Insights**: Technology stack hints and architectural insights
- **💪 Perceived Strengths**: Standout features and competitive advantages
- **⚠️ Perceived Weaknesses**: Known limitations and potential drawbacks

### 📄 **Professional Report Generation**
- Automatically formatted Markdown reports

## 🚀 Installation

### Prerequisites
- **Node.js** >= 16.0.0
- **OpenAI API Key** with GPT-4o-mini access

### Setup Steps


1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_actual_api_key_here
   ```

4. **Start the application**
   ```bash
   npm start
   ```

## 💡 Usage

### Interactive Menu
Upon starting, you'll see the main interface:

```
Welcome to Service Analyzer!

=== Service Analyzer ===
1. Analyze by service name
2. Analyze by raw description
3. Exit
========================
Select an option (1-3): 
```

### Option 1: Service Name Analysis
```
Enter service name: Spotify
Analyzing via service name....
Enter filename to save report (will add .md if missing): spotify-analysis
Report saved to: spotify-analysis.md
```

### Option 2: Raw Description Analysis
```
Enter raw description: A music streaming platform that offers millions of songs, podcasts, and playlists with both free and premium tiers
Analyzing via raw description....
Enter filename to save report (will add .md if missing): music-streaming-analysis
Report saved to: music-streaming-analysis.md
```

### File Structure
```
9/
├── index.js          # Main application entry point
├── prompt.js         # OpenAI integration and prompt engineering
├── output.js         # Report generation and file handling
├── examples/         # Prompt few shot examples
│   ├── spotify.json
│   └── nordVPN.json
├── package.json      # Dependencies and scripts
├── .env.example      # Environment template
└── README.md         # This file
```

