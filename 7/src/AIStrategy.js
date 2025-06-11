/**
 * Base AI Strategy class (Strategy Pattern)
 */
export class AIStrategy {
  constructor(boardSize = 10) {
    this.boardSize = boardSize;
  }

  /**
   * Make a guess - must be implemented by subclasses
   * @param {string[]} guesses - Array of previous guesses
   * @returns {string} - Location to guess
   */
  makeGuess(guesses) {
    throw new Error('makeGuess must be implemented by subclass');
  }

  /**
   * Process the result of a guess - can be overridden
   * @param {string} location - The guessed location
   * @param {boolean} hit - Whether it was a hit
   * @param {boolean} sunk - Whether a ship was sunk
   * @param {Object} context - Additional context (like targetQueue)
   */
  processResult(location, hit, sunk, context) {
    // Default implementation - can be overridden
  }
}

/**
 * Hunt strategy - random guessing
 */
export class HuntStrategy extends AIStrategy {
  makeGuess(guesses) {
    let guess;
    do {
      const row = Math.floor(Math.random() * this.boardSize);
      const col = Math.floor(Math.random() * this.boardSize);
      guess = `${row}${col}`;
    } while (guesses.includes(guess));
    
    return guess;
  }
}

/**
 * Target strategy - systematic targeting around hits
 */
export class TargetStrategy extends AIStrategy {
  makeGuess(guesses, targetQueue = []) {
    if (targetQueue.length > 0) {
      let guess;
      do {
        guess = targetQueue.shift();
      } while (guess && guesses.includes(guess) && targetQueue.length > 0);
      
      if (guess && !guesses.includes(guess)) {
        return guess;
      }
    }
    
    // Fallback to random if no valid targets
    return new HuntStrategy(this.boardSize).makeGuess(guesses);
  }

  processResult(location, hit, sunk, context) {
    if (hit && !sunk) {
      this.addAdjacentTargets(location, context.targetQueue, context.guesses);
    } else if (sunk) {
      context.targetQueue.length = 0; // Clear queue when ship is sunk
    }
  }

  addAdjacentTargets(location, targetQueue, guesses) {
    const [row, col] = [parseInt(location[0]), parseInt(location[1])];
    const adjacent = [
      { r: row - 1, c: col },
      { r: row + 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 }
    ];

    for (const adj of adjacent) {
      if (this.isValidLocation(adj.r, adj.c)) {
        const adjLocation = `${adj.r}${adj.c}`;
        if (!guesses.includes(adjLocation) && !targetQueue.includes(adjLocation)) {
          targetQueue.push(adjLocation);
        }
      }
    }
  }

  isValidLocation(row, col) {
    return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
  }
} 