import readline from 'readline';
import 'dotenv/config'
import { extractFilterParams } from './prompt.js';

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
  console.log('\n=== Data Filterer ===');
  console.log('1. Search for an item');
  console.log('2. Exit');
  console.log('=====================');
};

const performSearch = async () => {
  try {
    const query = await askQuestion('Please enter your query: ');
    
    if (!query || query.trim().length === 0) {
      console.log('Error: Query cannot be empty');
      return;
    }

    console.log('Processing your request...\n');
    
    const result = await extractFilterParams(query.trim());
    
    if (result.count === 0) {
      console.log('No items found matching your search criteria.');
    } else {
      // Display results
      console.log('Filtered Products:');
      result.results.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}, Category: ${product.category}, Price: $${product.price}, Rating: ${product.rating}/5, In Stock: ${product.in_stock ? 'Yes' : 'No'}`);
      });
    }

  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
};

const handleChoice = async (choice) => {
  switch (choice.trim()) {
    case '1':
      await performSearch();
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

console.log('Welcome to Data Filterer!');
await showMenuAndPrompt();
