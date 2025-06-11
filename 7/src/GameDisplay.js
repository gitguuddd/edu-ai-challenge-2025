/**
 * Handles all display and UI operations for the Sea Battle game
 */
export class GameDisplay {
  constructor() {
    this.boardSize = 10;
  }

  /**
   * Prints both boards side by side
   * @param {Board} opponentBoard - The opponent's board
   * @param {Board} playerBoard - The player's board
   */
  printBoards(opponentBoard, playerBoard) {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    // Print column headers
    let header = '  ';
    for (let h = 0; h < this.boardSize; h++) {
      header += h + ' ';
    }
    console.log(header + '     ' + header);

    // Print rows with row numbers
    for (let i = 0; i < this.boardSize; i++) {
      let rowStr = i + ' ';

      // Opponent board row
      for (let j = 0; j < this.boardSize; j++) {
        rowStr += opponentBoard.grid[i][j] + ' ';
      }
      
      rowStr += '     ' + i + ' ';

      // Player board row
      for (let j = 0; j < this.boardSize; j++) {
        rowStr += playerBoard.grid[i][j] + ' ';
      }
      
      console.log(rowStr);
    }
    console.log('\n');
  }

  /**
   * Displays the game introduction
   * @param {number} numShips - Number of ships in the game
   */
  showGameIntro(numShips) {
    console.log("\nLet's play Sea Battle!");
    console.log(`Try to sink the ${numShips} enemy ships.`);
  }

  /**
   * Shows setup completion message
   * @param {number} numShips - Number of ships placed
   * @param {string} playerType - 'Player' or 'CPU'
   */
  showShipsPlaced(numShips, playerType) {
    console.log(`${numShips} ships placed randomly for ${playerType}.`);
  }

  /**
   * Shows boards creation message
   */
  showBoardsCreated() {
    console.log('Boards created.');
  }

  /**
   * Shows player hit message
   */
  showPlayerHit() {
    console.log('PLAYER HIT!');
  }

  /**
   * Shows player miss message
   */
  showPlayerMiss() {
    console.log('PLAYER MISS.');
  }

  /**
   * Shows ship sunk message for player
   */
  showPlayerSunkShip() {
    console.log('You sunk an enemy battleship!');
  }

  /**
   * Shows CPU turn header
   */
  showCPUTurnHeader() {
    console.log("\n--- CPU's Turn ---");
  }

  /**
   * Shows CPU targeting message
   * @param {string} location - The location being targeted
   */
  showCPUTargeting(location) {
    console.log(`CPU targets: ${location}`);
  }

  /**
   * Shows CPU hit message
   * @param {string} location - The location that was hit
   */
  showCPUHit(location) {
    console.log(`CPU HIT at ${location}!`);
  }

  /**
   * Shows CPU miss message
   * @param {string} location - The location that was missed
   */
  showCPUMiss(location) {
    console.log(`CPU MISS at ${location}.`);
  }

  /**
   * Shows CPU sunk ship message
   */
  showCPUSunkShip() {
    console.log('CPU sunk your battleship!');
  }

  /**
   * Shows player victory message
   */
  showPlayerVictory() {
    console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
  }

  /**
   * Shows CPU victory message
   */
  showCPUVictory() {
    console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
  }

  /**
   * Shows input validation error messages
   * @param {string} errorType - Type of error ('format', 'range', 'duplicate')
   * @param {number} boardSize - Size of the board for range errors
   */
  showInputError(errorType, boardSize = 10) {
    switch (errorType) {
      case 'format':
        console.log('Oops, input must be exactly two digits (e.g., 00, 34, 98).');
        break;
      case 'range':
        console.log(`Oops, please enter valid row and column numbers between 0 and ${boardSize - 1}.`);
        break;
      case 'duplicate':
        console.log('You already guessed that location!');
        break;
      case 'already_hit':
        console.log('You already hit that spot!');
        break;
      default:
        console.log('Invalid input. Please try again.');
    }
  }

  /**
   * Shows the game legend/instructions
   */
  showGameLegend() {
    console.log('\nGame Legend:');
    console.log('~ = Water (unknown)');
    console.log('S = Your ships');
    console.log('X = Hit');
    console.log('O = Miss');
    console.log('');
  }
} 