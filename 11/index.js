import readline from 'readline';
import fs from 'fs';
import path from 'path';
import 'dotenv/config'
import { transcribeAudio, summarizeAndAnalyzeText } from './prompt.js';
import { writeMarkdownFile, writeJsonFile } from './output.js';

// Polyfill for Node.js versions < 20 to support OpenAI file uploads
if (typeof globalThis.File === 'undefined') {
  const { File } = await import('node:buffer');
  globalThis.File = File;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let isShuttingDown = false;

const gracefulShutdown = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n\nGoodbye!');
  rl.close();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

const showMenu = () => {
  console.log('\n=== Audio Transcriber ===');
  console.log('1. Transcribe and summarize audio');
  console.log('2. Exit application');
  console.log('=========================');
  console.log('Note: This app works with audio files in the current directory');
  console.log('Supported formats: mp3, wav, m4a, mpeg, mpga, webm, flac, aac, ogg');
};

const getAudioFiles = () => {
  try {
    const files = fs.readdirSync(process.cwd());
    const supportedExtensions = ['.mp3', '.wav', '.m4a', '.mpeg', '.mpga', '.webm', '.flac', '.aac', '.ogg'];
    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return supportedExtensions.includes(ext) && 
             fs.statSync(path.join(process.cwd(), file)).isFile();
    });
    return audioFiles;
  } catch (error) {
    console.log('Error reading directory:', error.message);
    return [];
  }
};

const showFileSelection = (audioFiles) => {
  console.log('\n=== Available Audio Files ===');
  audioFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  console.log(`${audioFiles.length + 1}. Back to main menu`);
  console.log('==============================');
};

const selectAudioFile = async () => {
  const audioFiles = getAudioFiles();
  
  if (audioFiles.length === 0) {
    console.log('\nNo supported audio files found in the current directory.');
    console.log('Please add audio files to the current directory and try again.');
    console.log('Supported formats: mp3, wav, m4a, mpeg, mpga, webm, flac, aac, ogg');
    return null;
  }

  showFileSelection(audioFiles);
  
  const selection = await askQuestion(`\nSelect an audio file (1-${audioFiles.length}) or ${audioFiles.length + 1} to go back: `);
  
  const selectedIndex = parseInt(selection.trim()) - 1;
  
  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex > audioFiles.length) {
    console.log('Invalid selection. Please enter a valid number.');
    return await selectAudioFile(); // Retry selection
  }
  
  // Check if user wants to go back to main menu
  if (selectedIndex === audioFiles.length) {
    return 'BACK_TO_MENU';
  }
  
  return audioFiles[selectedIndex];
};

const performTranscription = async () => {
  try {
    const selectedFile = await selectAudioFile();
    
    if (!selectedFile || selectedFile === 'BACK_TO_MENU') {
      return;
    }

    console.log(`\nSelected file: ${selectedFile}`);
    console.log('Transcribing your audio file...\n');
    
    const {transcription, duration} = await transcribeAudio(selectedFile);
    console.log('Transcription complete');
    await writeMarkdownFile('transcription.md', transcription);

    console.log('Summarizing and analyzing your transcription...\n');
    const {summary, word_count, frequently_mentioned_topics, speaking_speed} = await summarizeAndAnalyzeText(transcription, duration);
    console.log('Summarization and analysis complete');
    await writeMarkdownFile('summary.md', summary);
    const analytics = {
        word_count,
        speaking_speed_wpm: speaking_speed,
        frequently_mentioned_topics
    }
    await writeJsonFile('analysis.json', analytics)

    console.log('=== Transcription Results ===');
    console.log('Summary:');
    console.log(summary);
    console.log('Analytics:');
    console.log(analytics);
    console.log('============================');

  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
};

const handleChoice = async (choice) => {
  switch (choice.trim()) {
    case '1':
      await performTranscription();
      break;
    case '2':
      gracefulShutdown();
      return;
    default:
      console.log('Invalid choice. Please select 1 or 2.');
      break;
  }
  await showMenuAndPrompt();
};

const showMenuAndPrompt = async () => {
  if (isShuttingDown) return;
  
  showMenu();
  try {
    const choice = await askQuestion('Select an option (1-2): ');
    await handleChoice(choice);
  } catch (err) {
    console.log(`Error: ${err.message}`);
    await showMenuAndPrompt();
  }
};

console.log('Welcome to Audio Transcriber!');
await showMenuAndPrompt();
