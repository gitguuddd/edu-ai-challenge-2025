#!/usr/bin/env node

import { SeaBattleGame } from './src/SeaBattleGame.js';

/**
 * Entry point for the Sea Battle CLI game
 */
async function main() {
  try {
    const game = new SeaBattleGame();
    await game.start();
  } catch (error) {
    console.error('An error occurred while running the game:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nGame interrupted. Thanks for playing!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nGame terminated. Thanks for playing!');
  process.exit(0);
});

// Start the game
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
