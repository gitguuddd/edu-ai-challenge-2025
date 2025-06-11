import { SeaBattleGame } from '../src/SeaBattleGame.js';

describe('SeaBattleGame', () => {
  test('should create game with default configuration', () => {
    const game = new SeaBattleGame({ testMode: true });
    
    expect(game.boardSize).toBe(10);
    expect(game.numShips).toBe(3);
    expect(game.shipLength).toBe(3);
    expect(game.gameOver).toBe(false);
  });

  test('should create game with custom configuration', () => {
    const config = {
      boardSize: 5,
      numShips: 2,
      shipLength: 2,
      testMode: true
    };
    const game = new SeaBattleGame(config);
    
    expect(game.boardSize).toBe(5);
    expect(game.numShips).toBe(2);
    expect(game.shipLength).toBe(2);
  });

  test('should setup game correctly', () => {
    const game = new SeaBattleGame({ boardSize: 5, numShips: 1, shipLength: 3, testMode: true });
    
    game.setupGame();
    
    expect(game.playerBoard.ships.length).toBe(1);
    expect(game.cpuBoard.ships.length).toBe(1);
    expect(game.playerBoard.isPlayerBoard).toBe(true);
  });

  test('should process valid player guess', () => {
    const game = new SeaBattleGame({ boardSize: 5, numShips: 1, shipLength: 3, testMode: true });
    game.setupGame();
    
    const result = game.processPlayerGuess('00');
    
    expect(typeof result).toBe('boolean');
  });

  test('should reject invalid player guess format', () => {
    const game = new SeaBattleGame({ testMode: true });
    
    expect(game.processPlayerGuess('')).toBe(false);
    expect(game.processPlayerGuess('1')).toBe(false);
    expect(game.processPlayerGuess('123')).toBe(false);
    expect(game.processPlayerGuess('ab')).toBe(false);
  });

  test('should reject out of range player guess', () => {
    const game = new SeaBattleGame({ boardSize: 5, testMode: true });
    
    expect(game.processPlayerGuess('55')).toBe(false);
    expect(game.processPlayerGuess('59')).toBe(false);
    expect(game.processPlayerGuess('95')).toBe(false);
  });

  test('should reject duplicate player guess', () => {
    const game = new SeaBattleGame({ boardSize: 5, numShips: 1, shipLength: 3, testMode: true });
    game.setupGame();
    
    const firstResult = game.processPlayerGuess('00');
    const secondResult = game.processPlayerGuess('00');
    
    expect(firstResult).toBe(true);
    expect(secondResult).toBe(false);
  });

  test('should handle CPU turn', () => {
    const game = new SeaBattleGame({ boardSize: 5, numShips: 1, shipLength: 3, testMode: true });
    game.setupGame();
    
    const initialGuesses = game.cpuPlayer.guesses.length;
    game.handleCPUTurn();
    
    expect(game.cpuPlayer.guesses.length).toBe(initialGuesses + 1);
  });

  test('should get game state correctly', () => {
    const game = new SeaBattleGame({ numShips: 2, testMode: true });
    game.setupGame();
    
    const state = game.getGameState();
    
    expect(state.playerShipsRemaining).toBe(2);
    expect(state.cpuShipsRemaining).toBe(2);
    expect(state.gameOver).toBe(false);
    expect(state.cpuMode).toBe('hunt');
  });

  test('should reset game correctly', () => {
    const game = new SeaBattleGame({ numShips: 2, testMode: true });
    game.setupGame();
    game.gameOver = true;
    
    game.reset();
    
    expect(game.gameOver).toBe(false);
    expect(game.playerBoard.ships.length).toBe(0);
    expect(game.cpuBoard.ships.length).toBe(0);
    expect(game.cpuPlayer.guesses.length).toBe(0);
  });

  test('should end game correctly', () => {
    const game = new SeaBattleGame({ testMode: true });
    
    game.endGame();
    
    expect(game.gameOver).toBe(true);
  });

  test('should detect player victory condition', () => {
    const game = new SeaBattleGame({ boardSize: 5, numShips: 1, shipLength: 1, testMode: true });
    game.setupGame();
    
    // Sink all CPU ships
    const cpuShipLocation = game.cpuBoard.ships[0].locations[0];
    game.processPlayerGuess(cpuShipLocation);
    
    const state = game.getGameState();
    expect(state.cpuShipsRemaining).toBe(0);
  });

  test('should detect CPU victory condition', () => {
    const game = new SeaBattleGame({ boardSize: 5, numShips: 1, shipLength: 1, testMode: true });
    game.setupGame();
    
    // Sink all player ships
    const playerShipLocation = game.playerBoard.ships[0].locations[0];
    game.playerBoard.processGuess(playerShipLocation);
    
    const state = game.getGameState();
    expect(state.playerShipsRemaining).toBe(0);
  });

  test('should handle player guess hit', () => {
    const game = new SeaBattleGame({ boardSize: 5, numShips: 1, shipLength: 3, testMode: true });
    game.setupGame();
    
    // Find a ship location
    const shipLocation = game.cpuBoard.ships[0].locations[0];
    const result = game.processPlayerGuess(shipLocation);
    
    expect(result).toBe(true);
    
    // Check that the location was marked as hit
    const [row, col] = game.cpuBoard.parseLocation(shipLocation);
    expect(game.cpuBoard.grid[row][col]).toBe('X');
  });

  test('should handle player guess miss', () => {
    const game = new SeaBattleGame({ boardSize: 5, numShips: 1, shipLength: 3, testMode: true });
    game.setupGame();
    
    // Find an empty location
    let emptyLocation = null;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const location = `${i}${j}`;
        const hasShip = game.cpuBoard.ships.some(ship => ship.hasLocation(location));
        if (!hasShip) {
          emptyLocation = location;
          break;
        }
      }
      if (emptyLocation) break;
    }
    
    if (emptyLocation) {
      const result = game.processPlayerGuess(emptyLocation);
      
      expect(result).toBe(true);
      
      // Check that the location was marked as miss
      const [row, col] = game.cpuBoard.parseLocation(emptyLocation);
      expect(game.cpuBoard.grid[row][col]).toBe('O');
    }
  });

  test('should update CPU AI after hit', () => {
    const game = new SeaBattleGame({ boardSize: 5, numShips: 1, shipLength: 3, testMode: true });
    game.setupGame();
    
    // Simulate CPU hitting a ship
    const playerShipLocation = game.playerBoard.ships[0].locations[0];
    const result = game.playerBoard.processGuess(playerShipLocation);
    
    game.cpuPlayer.processGuessResult(playerShipLocation, result.hit, result.sunk);
    
    if (result.hit && !result.sunk) {
      expect(game.cpuPlayer.getCurrentMode()).toBe('target');
      expect(game.cpuPlayer.targetQueue.length).toBeGreaterThan(0);
    }
  });

  test('should handle ship sinking', () => {
    const game = new SeaBattleGame({ boardSize: 5, numShips: 1, shipLength: 1, testMode: true });
    game.setupGame();
    
    // Hit all locations of a ship to sink it
    const shipLocations = game.cpuBoard.ships[0].locations;
    shipLocations.forEach(location => {
      game.processPlayerGuess(location);
    });
    
    const state = game.getGameState();
    expect(state.cpuShipsRemaining).toBe(0);
  });
}); 