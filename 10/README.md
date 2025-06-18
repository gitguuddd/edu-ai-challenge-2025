# 🔍 Data Filterer

> An AI-powered console application for intelligent product filtering using OpenAI's GPT-4.1-mini

## 📋 Overview

Data Filterer is a lightweight, interactive console application that leverages OpenAI's advanced language models to provide intelligent product filtering based on natural language queries. Simply describe what you're looking for in plain English, and the AI will filter through the product database to find exactly what matches your criteria.


## 🚀 Installation

### Prerequisites
- **Node.js** >= 16.0.0
- **OpenAI API Key** with GPT-4.1-mini access

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

3. **Start the application**
   ```bash
   npm start
   ```

## 💡 Usage

### Interactive Menu
Upon starting, you'll see the main interface:

```
Welcome to Data Filterer!

=== Data Filterer ===
1. Search for an item
2. Exit
=====================
Select an option (1-2): 
```

### Search Examples

```
Please enter your query: electronics under $100
Please enter your query: kitchen items with high ratings
Please enter your query: kitchen appliances between $40 and $150
Please enter your query: fitness equipment over $200
Please enter your query: electronics that are available
```


## 📁 File Structure
```
10/
├── index.js          # Main application entry point
├── prompt.js         # OpenAI integration and filtering logic
├── products.json     # Product database
├── package.json      # Dependencies and scripts
├── .env.example      # Environment template
└── README.md         # This file
```

