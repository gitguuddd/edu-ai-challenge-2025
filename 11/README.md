# 🎵 Audio Transcriber

> An AI-powered console application for intelligent audio transcription and analysis using OpenAI's Whisper and GPT-4.1-mini

## 📋 Overview

Audio Transcriber is a lightweight, interactive console application that leverages OpenAI's advanced AI models to provide accurate audio transcription and intelligent analysis. Simply select an audio file from your current directory, and the AI will transcribe the content and provide detailed analysis including word count, speaking speed, summary, and frequently mentioned topics.

## 🚀 Installation

### Prerequisites
- **Node.js** >= 16.0.0
- **OpenAI API Key** with Whisper and GPT-4o-mini access

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
Welcome to Audio Transcriber!

=== Audio Transcriber ===
1. Transcribe and summarize audio
2. Exit application
=========================
Note: This app works with audio files in the current directory
Supported formats: mp3, wav, m4a, mpeg, mpga, webm, flac, aac, ogg
Select an option (1-2): 
```

### Audio File Selection

```
=== Available Audio Files ===
1. meeting_recording.mp3
2. interview.wav
3. podcast_episode.m4a
4. Back to main menu
==============================

Select an audio file (1-3) or 4 to go back: 2

Selected file: interview.wav
Transcribing your audio file...
```

### Example output
```
=== Transcription Results ===
Summary:
The patient presents with sharp chest pain lasting a few seconds, starting three days ago, located over the heart and sometimes radiating to the neck. The pain worsens with coughing or lying down and improves when leaning forward. The patient rates the pain as 6/10 and has no other symptoms like shortness of breath or palpitations. They recently recovered from the flu and have no significant past medical history or medications except occasional Tylenol. The patient's father recently died of a heart attack, raising concern. The patient is a healthy 25-year-old engineering student working part-time as a postman, with occasional alcohol use and no smoking or drug use. The healthcare provider plans to perform an ECG and possibly blood tests to investigate further and reassures the patient to avoid excessive worry until results are available.
Analytics:
{
  word_count: 868,
  speaking_speed_wpm: 116,
  frequently_mentioned_topics: [
    { topic: 'chest pain', mentions: 12 },
    { topic: 'heart attack', mentions: 6 },
    { topic: 'symptoms', mentions: 7 },
    { topic: 'medical history', mentions: 5 },
    { topic: 'tests (ECG, blood work)', mentions: 3 }
  ]
}
============================
```


## 📁 File Structure
```
11/
├── index.js          # Main application entry point
├── prompt.js         # OpenAI integration and transcription logic
├── output.js         # File output utilities (MD/JSON)
├── package.json      # Dependencies and scripts
├── .env.example      # Environment template
└── README.md         # This file
```
