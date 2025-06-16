import readline from 'readline';
import 'dotenv/config'
import { analyzerPrompt } from './prompt.js';
import { generateReport } from './output.js';

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
  console.log('\n=== Service Analyzer ===');
  console.log('1. Analyze by service name');
  console.log('2. Analyze by raw description');
  console.log('3. Exit');
  console.log('========================');
};


const validateInput = (input, minLength, fieldName) => {
  if (!input || input.trim().length === 0) {
    return `${fieldName} cannot be empty`;
  }
  if (input.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return null;
};

const validateFilename = (filename) => {
  if (!filename || filename.trim().length === 0) {
    return null;
  }
  const trimmed = filename.trim();
  return trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`;
};


const performAnalysis = async (mode, promptText, validationMinLength) => {
  try {
    const input = await askQuestion(promptText);
    const fieldName = mode === 'serviceName' ? 'Service name' : 'Description';
    const error = validateInput(input, validationMinLength, fieldName);
    
    if (error) {
      console.log(`Error: ${error}`);
      return;
    }

    console.log(`Analyzing via ${mode === 'serviceName' ? 'service name' : 'raw description'}....`);
    const response = await analyzerPrompt(mode, input);

    const filenameInput = await askQuestion('Enter filename to save report (will add .md if missing): ');
    const filename = validateFilename(filenameInput);
    
    if (!filename) {
      console.log('Error: Filename cannot be empty');
      return;
    }

    await generateReport(filename, response, input);
    console.log(`Report saved to: ${filename}`);

  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
};

const handleChoice = async (choice) => {
  switch (choice.trim()) {
    case '1':
      await performAnalysis('serviceName', 'Enter service name: ', 2);
      break;
    case '2':
      await performAnalysis('rawDescription', 'Enter raw description: ', 5);
      break;
    case '3':
      gracefulShutdown();
      return;
    default:
      console.log('Invalid choice. Please select 1, 2, or 3.');
      break;
  }
  await showMenuAndPrompt();
};

const showMenuAndPrompt = async () => {
  if (isShuttingDown) return;
  
  showMenu();
  try {
    const choice = await askQuestion('Select an option (1-3): ');
    await handleChoice(choice);
  } catch (err) {
    console.log(`Error: ${err.message}`);
    await showMenuAndPrompt();
  }
};

console.log('Welcome to Service Analyzer!');
await showMenuAndPrompt();
