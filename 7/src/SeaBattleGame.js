import { Board } from './Board.js';
import { CPUPlayer } from './CPUPlayer.js';
import { GameDisplay } from './GameDisplay.js';
import readline from 'readline';

/**
 * Main game class that orchestrates the Sea Battle game
 */
export class SeaBattleGame {
  constructor(config = {}) {
    this.boardSize = config.boardSize || 10;
    this.numShips = config.numShips || 3;
    this.shipLength = config.shipLength || 3;
    
    this.playerBoard = new Board(this.boardSize);
    this.cpuBoard = new Board(this.boardSize);
    this.cpuPlayer = new CPUPlayer(this.boardSize);
    this.display = new GameDisplay();
    
    // Only create readline interface if not in test mode
    if (!config.testMode) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    }
    
    this.gameOver = false;
  }

  /**
   * Initializes and starts the game
   */
  async start() {
    this.setupGame();
    this.display.showGameIntro(this.numShips);
    await this.gameLoop();
  }

  /**
   * Sets up the game boards and places ships
   */
  setupGame() {
    this.display.showBoardsCreated();
    
    // Set player board to show ships
    this.playerBoard.setAsPlayerBoard();
    
    // Place ships on both boards
    this.playerBoard.placeShipsRandomly(this.numShips, this.shipLength);
    this.display.showShipsPlaced(this.numShips, 'Player');
    
    this.cpuBoard.placeShipsRandomly(this.numShips, this.shipLength);
    this.display.showShipsPlaced(this.numShips, 'CPU');
  }

  /**
   * Main game loop handling turns
   */
  async gameLoop() {
    while (!this.gameOver) {
      // Check for game end conditions
      if (this.cpuBoard.getRemainingShips() === 0) {
        this.display.showPlayerVictory();
        this.display.printBoards(this.cpuBoard, this.playerBoard);
        this.endGame();
        return;
      }
      
      if (this.playerBoard.getRemainingShips() === 0) {
        this.display.showCPUVictory();
        this.display.printBoards(this.cpuBoard, this.playerBoard);
        this.endGame();
        return;
      }

      // Player turn
      this.display.printBoards(this.cpuBoard, this.playerBoard);
      const playerMadeValidGuess = await this.handlePlayerTurn();
      
      if (playerMadeValidGuess) {
        // Check if player won after their turn
        if (this.cpuBoard.getRemainingShips() === 0) {
          continue; // Let the loop handle the win condition
        }

        // CPU turn
        this.handleCPUTurn();
        
        // Check if CPU won after their turn
        if (this.playerBoard.getRemainingShips() === 0) {
          continue; // Let the loop handle the win condition
        }
      }
    }
  }

  /**
   * Handles the player's turn by prompting for input
   * @returns {Promise<boolean>} - True if player made a valid guess
   */
  async handlePlayerTurn() {
    if (!this.rl) {
      // In test mode, just return false to indicate no input was processed
      return false;
    }
    
    return new Promise((resolve) => {
      this.rl.question('Enter your guess (e.g., 00): ', (answer) => {
        const result = this.processPlayerGuess(answer);
        resolve(result);
      });
    });
  }

  /**
   * Processes the player's guess
   * @param {string} guess - The player's guess
   * @returns {boolean} - True if the guess was valid and processed
   */
  processPlayerGuess(guess) {
    // Validate input format
    if (!guess || guess.length !== 2) {
      this.display.showInputError('format');
      return false;
    }

    // Validate input range
    if (!this.cpuBoard.isValidLocation(guess)) {
      this.display.showInputError('range', this.boardSize);
      return false;
    }

    // Process the guess
    const result = this.cpuBoard.processGuess(guess);
    
    if (result.alreadyGuessed) {
      this.display.showInputError('duplicate');
      return false;
    }

    // Show result
    if (result.hit) {
      this.display.showPlayerHit();
      if (result.sunk) {
        this.display.showPlayerSunkShip();
      }
    } else {
      this.display.showPlayerMiss();
    }

    return true;
  }

  /**
   * Handles the CPU's turn
   */
  handleCPUTurn() {
    this.display.showCPUTurnHeader();
    
    const cpuGuess = this.cpuPlayer.makeGuess();
    
    // Show CPU targeting if in target mode
    if (this.cpuPlayer.getCurrentMode() === 'target') {
      this.display.showCPUTargeting(cpuGuess);
    }
    
    const result = this.playerBoard.processGuess(cpuGuess);
    
    // Update CPU AI with result
    this.cpuPlayer.processGuessResult(cpuGuess, result.hit, result.sunk);
    
    // Show result
    if (result.hit) {
      this.display.showCPUHit(cpuGuess);
      if (result.sunk) {
        this.display.showCPUSunkShip();
      }
    } else {
      this.display.showCPUMiss(cpuGuess);
    }
  }

  /**
   * Ends the game and closes readline interface
   */
  endGame() {
    this.gameOver = true;
    if (this.rl) {
      this.rl.close();
    }
  }

  /**
   * Gets the current game state for testing
   * @returns {Object} - Current game state
   */
  getGameState() {
    return {
      playerShipsRemaining: this.playerBoard.getRemainingShips(),
      cpuShipsRemaining: this.cpuBoard.getRemainingShips(),
      gameOver: this.gameOver,
      cpuMode: this.cpuPlayer.getCurrentMode()
    };
  }

  /**
   * Resets the game to initial state
   */
  reset() {
    this.playerBoard = new Board(this.boardSize);
    this.cpuBoard = new Board(this.boardSize);
    this.cpuPlayer.reset();
    this.gameOver = false;
  }
} 