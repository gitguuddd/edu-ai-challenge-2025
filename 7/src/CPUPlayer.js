import { HuntStrategy, TargetStrategy } from './AIStrategy.js';

/**
 * Represents the CPU player with hunt and target AI modes
 * Now uses Strategy pattern for pluggable AI behavior
 */
export class CPUPlayer {
  constructor(boardSize = 10, strategyType = 'adaptive') {
    this.boardSize = boardSize;
    this.guesses = [];
    this.mode = 'hunt';
    this.targetQueue = [];
    this.strategyType = strategyType;
    
    // Initialize strategies
    this.huntStrategy = new HuntStrategy(boardSize);
    this.targetStrategy = new TargetStrategy(boardSize);
    this.currentStrategy = this.huntStrategy;
  }

  /**
   * Makes a guess using the current AI strategy
   * @returns {string} - The location to guess (e.g., "34")
   */
  makeGuess() {
    let guess;

    if (this.mode === 'target' && this.targetQueue.length > 0) {
      const originalQueueLength = this.targetQueue.length;
      guess = this.targetStrategy.makeGuess(this.guesses, this.targetQueue);
      
      // If the queue is now empty after the strategy call, switch to hunt mode
      if (this.targetQueue.length === 0 && originalQueueLength > 0) {
        this.mode = 'hunt';
        this.currentStrategy = this.huntStrategy;
      }
    } else {
      this.mode = 'hunt';
      this.currentStrategy = this.huntStrategy;
      guess = this.huntStrategy.makeGuess(this.guesses);
    }

    this.guesses.push(guess);
    return guess;
  }

  /**
   * Makes a random guess for hunt mode (kept for backward compatibility)
   * @returns {string} - Random valid location
   */
  makeRandomGuess() {
    return this.huntStrategy.makeGuess(this.guesses);
  }

  /**
   * Processes the result of a guess and updates AI state
   * @param {string} location - The location that was guessed
   * @param {boolean} wasHit - Whether the guess was a hit
   * @param {boolean} wasSunk - Whether the hit sunk a ship
   */
  processGuessResult(location, wasHit, wasSunk) {
    const context = {
      targetQueue: this.targetQueue,
      guesses: this.guesses
    };

    if (wasHit) {
      if (wasSunk) {
        // Ship was sunk, go back to hunt mode
        this.mode = 'hunt';
        this.targetQueue = [];
        this.currentStrategy = this.huntStrategy;
      } else {
        // Hit but not sunk, switch to target mode
        this.mode = 'target';
        this.currentStrategy = this.targetStrategy;
        this.targetStrategy.processResult(location, wasHit, wasSunk, context);
      }
    } else if (this.mode === 'target' && this.targetQueue.length === 0) {
      // Miss in target mode with no more targets, go back to hunt
      this.mode = 'hunt';
      this.currentStrategy = this.huntStrategy;
    }
  }

  /**
   * Adds adjacent locations to the target queue
   * @param {string} location - The location that was hit
   */
  addAdjacentTargets(location) {
    const [row, col] = this.parseLocation(location);
    const adjacent = [
      { r: row - 1, c: col },
      { r: row + 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 }
    ];

    for (const adj of adjacent) {
      if (this.isValidLocation(adj.r, adj.c) && !this.hasGuessed(adj.r, adj.c)) {
        const adjLocation = `${adj.r}${adj.c}`;
        if (!this.targetQueue.includes(adjLocation)) {
          this.targetQueue.push(adjLocation);
        }
      }
    }
  }

  /**
   * Parses a location string into row and column numbers
   * @param {string} location - Location string (e.g., "34")
   * @returns {number[]} - Array with [row, col]
   */
  parseLocation(location) {
    return [parseInt(location[0]), parseInt(location[1])];
  }

  /**
   * Checks if a location is valid (within board bounds)
   * @param {number} row - Row number
   * @param {number} col - Column number
   * @returns {boolean} - True if valid
   */
  isValidLocation(row, col) {
    return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
  }

  /**
   * Checks if a location has already been guessed
   * @param {number} row - Row number
   * @param {number} col - Column number
   * @returns {boolean} - True if already guessed
   */
  hasGuessed(row, col) {
    const location = `${row}${col}`;
    return this.guesses.includes(location);
  }

  /**
   * Gets the current AI mode
   * @returns {string} - Current mode ('hunt' or 'target')
   */
  getCurrentMode() {
    return this.mode;
  }

  /**
   * Resets the CPU player state
   */
  reset() {
    this.huntStrategy = new HuntStrategy(this.boardSize);
    this.targetStrategy = new TargetStrategy(this.boardSize);
    this.currentStrategy = this.huntStrategy;
    this.guesses = [];
    this.mode = 'hunt';
    this.targetQueue = [];
  }

  /**
   * Get all guesses made so far
   * @returns {string[]} - Array of guessed locations
   */
  getGuesses() {
    return this.guesses;
  }
} 