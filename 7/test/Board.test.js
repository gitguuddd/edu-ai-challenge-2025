import { Board } from '../src/Board.js';
import { Ship } from '../src/Ship.js';

describe('Board', () => {
  test('should create board with default size', () => {
    const board = new Board();
    
    expect(board.size).toBe(10);
    expect(board.grid).toHaveLength(10);
    expect(board.grid[0]).toHaveLength(10);
    expect(board.ships).toEqual([]);
    expect(board.guesses).toEqual([]);
  });

  test('should create board with custom size', () => {
    const board = new Board(5);
    
    expect(board.size).toBe(5);
    expect(board.grid).toHaveLength(5);
    expect(board.grid[0]).toHaveLength(5);
  });

  test('should fill grid with water symbols', () => {
    const board = new Board(3);
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        expect(board.grid[row][col]).toBe('~');
      }
    }
  });

  test('should place ships randomly', () => {
    const board = new Board();
    
    board.placeShipsRandomly(2, 3);
    
    expect(board.ships).toHaveLength(2);
    expect(board.ships[0].locations).toHaveLength(3);
    expect(board.ships[1].locations).toHaveLength(3);
  });

  test('should generate ship locations correctly', () => {
    const board = new Board();
    
    const horizontalLocations = board.generateShipLocations(2, 3, 'horizontal', 3);
    expect(horizontalLocations).toEqual(['23', '24', '25']);
    
    const verticalLocations = board.generateShipLocations(2, 3, 'vertical', 3);
    expect(verticalLocations).toEqual(['23', '33', '43']);
  });

  test('should validate ship placement correctly', () => {
    const board = new Board();
    
    expect(board.canPlaceShip(['00', '01', '02'])).toBe(true);
    
    // Place a ship and try to place another overlapping ship
    const ship = new Ship(['00', '01', '02'], 3);
    board.ships.push(ship);
    board.markShipOnGrid(['00', '01', '02']);
    expect(board.canPlaceShip(['01', '02', '03'])).toBe(false);
  });

  test('should parse location correctly', () => {
    const board = new Board();
    
    expect(board.parseLocation('34')).toEqual([3, 4]);
    expect(board.parseLocation('00')).toEqual([0, 0]);
    expect(board.parseLocation('99')).toEqual([9, 9]);
  });

  test('should validate location format', () => {
    const board = new Board();
    
    expect(board.isValidLocation('34')).toBe(true);
    expect(board.isValidLocation('00')).toBe(true);
    expect(board.isValidLocation('99')).toBe(true);
    expect(board.isValidLocation('9')).toBe(false);
    expect(board.isValidLocation('abc')).toBe(false);
    expect(board.isValidLocation('')).toBe(false);
  });

  test('should validate location range', () => {
    const board = new Board(5);
    
    expect(board.isValidLocation('44')).toBe(true);
    expect(board.isValidLocation('55')).toBe(false);
    expect(board.isValidLocation('50')).toBe(false);
    expect(board.isValidLocation('05')).toBe(false);
  });

  test('should process guess correctly - miss', () => {
    const board = new Board();
    
    const result = board.processGuess('00');
    
    expect(result.hit).toBe(false);
    expect(result.sunk).toBe(false);
    expect(result.alreadyGuessed).toBe(false);
    expect(board.grid[0][0]).toBe('O');
    expect(board.guesses).toContain('00');
  });

  test('should process guess correctly - hit', () => {
    const board = new Board();
    board.placeShipsRandomly(1, 1);
    const shipLocation = board.ships[0].locations[0];
    
    const result = board.processGuess(shipLocation);
    
    expect(result.hit).toBe(true);
    expect(result.alreadyGuessed).toBe(false);
    expect(board.guesses).toContain(shipLocation);
  });

  test('should detect already guessed location', () => {
    const board = new Board();
    board.processGuess('00');
    
    const result = board.processGuess('00');
    
    expect(result.alreadyGuessed).toBe(true);
  });

  test('should count remaining ships correctly', () => {
    const board = new Board();
    board.placeShipsRandomly(2, 1);
    
    expect(board.getRemainingShips()).toBe(2);
    
    // Sink one ship
    const firstShipLocation = board.ships[0].locations[0];
    board.processGuess(firstShipLocation);
    
    expect(board.getRemainingShips()).toBe(1);
  });

  test('should mark ship on grid for player board', () => {
    const board = new Board();
    board.setAsPlayerBoard();
    
    board.markShipOnGrid(['00', '01']);
    
    expect(board.grid[0][0]).toBe('S');
    expect(board.grid[0][1]).toBe('S');
  });

  test('should not mark ship on grid for CPU board', () => {
    const board = new Board();
    // Don't set as player board
    
    board.markShipOnGrid(['00', '01']);
    
    expect(board.grid[0][0]).toBe('~');
    expect(board.grid[0][1]).toBe('~');
  });

  test('should get random start position within bounds', () => {
    const board = new Board(5);
    
    for (let i = 0; i < 10; i++) {
      const pos = board.getRandomStartPosition('horizontal', 3);
      expect(pos.startRow).toBeGreaterThanOrEqual(0);
      expect(pos.startRow).toBeLessThan(5);
      expect(pos.startCol).toBeGreaterThanOrEqual(0);
      expect(pos.startCol).toBeLessThanOrEqual(2); // 5 - 3 = 2
    }
  });
}); 