import { Ship } from './Ship.js';

/**
 * Represents a game board in the Sea Battle game
 */
export class Board {
  constructor(size = 10) {
    this.size = size;
    this.grid = this.createGrid();
    this.ships = [];
    this.guesses = [];
  }

  /**
   * Creates an empty grid filled with water symbols
   * @returns {string[][]} - 2D array representing the board
   */
  createGrid() {
    return Array(this.size).fill(null).map(() => Array(this.size).fill('~'));
  }

  /**
   * Places ships randomly on the board
   * @param {number} numberOfShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   */
  placeShipsRandomly(numberOfShips, shipLength) {
    let placedShips = 0;
    
    while (placedShips < numberOfShips) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const { startRow, startCol } = this.getRandomStartPosition(orientation, shipLength);
      
      const shipLocations = this.generateShipLocations(startRow, startCol, orientation, shipLength);
      
      if (this.canPlaceShip(shipLocations)) {
        const ship = new Ship(shipLocations, shipLength);
        this.ships.push(ship);
        this.markShipOnGrid(shipLocations);
        placedShips++;
      }
    }
  }

  /**
   * Gets a random starting position for ship placement
   * @param {string} orientation - 'horizontal' or 'vertical'
   * @param {number} shipLength - Length of the ship
   * @returns {Object} - Object with startRow and startCol properties
   */
  getRandomStartPosition(orientation, shipLength) {
    if (orientation === 'horizontal') {
      return {
        startRow: Math.floor(Math.random() * this.size),
        startCol: Math.floor(Math.random() * (this.size - shipLength + 1))
      };
    } else {
      return {
        startRow: Math.floor(Math.random() * (this.size - shipLength + 1)),
        startCol: Math.floor(Math.random() * this.size)
      };
    }
  }

  /**
   * Generates ship locations based on starting position and orientation
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {string} orientation - 'horizontal' or 'vertical'
   * @param {number} shipLength - Length of the ship
   * @returns {string[]} - Array of location strings
   */
  generateShipLocations(startRow, startCol, orientation, shipLength) {
    const locations = [];
    for (let i = 0; i < shipLength; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      locations.push(`${row}${col}`);
    }
    return locations;
  }

  /**
   * Checks if a ship can be placed at the given locations
   * @param {string[]} locations - Array of location strings
   * @returns {boolean} - True if ship can be placed
   */
  canPlaceShip(locations) {
    return locations.every(location => {
      const [row, col] = this.parseLocation(location);
      
      // Check if location is within bounds
      if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
        return false;
      }
      
      // Check if location overlaps with existing ships
      for (const ship of this.ships) {
        if (ship.locations.includes(location)) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Marks ship locations on the grid (for player board)
   * @param {string[]} locations - Array of location strings
   */
  markShipOnGrid(locations) {
    locations.forEach(location => {
      const [row, col] = this.parseLocation(location);
      if (this.isPlayerBoard) {
        this.grid[row][col] = 'S';
      }
    });
  }

  /**
   * Processes a guess at the given location
   * @param {string} location - The location to guess (e.g., "34")
   * @returns {Object} - Result object with hit, sunk, and alreadyGuessed properties
   */
  processGuess(location) {
    if (this.guesses.includes(location)) {
      return { hit: false, sunk: false, alreadyGuessed: true };
    }

    this.guesses.push(location);
    const [row, col] = this.parseLocation(location);

    for (const ship of this.ships) {
      if (ship.hit(location)) {
        this.grid[row][col] = 'X';
        return { 
          hit: true, 
          sunk: ship.isSunk(), 
          alreadyGuessed: false 
        };
      }
    }

    this.grid[row][col] = 'O';
    return { hit: false, sunk: false, alreadyGuessed: false };
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
   * Validates if a location string is valid
   * @param {string} location - Location string to validate
   * @returns {boolean} - True if valid
   */
  isValidLocation(location) {
    if (!location || location.length !== 2) return false;
    
    const [row, col] = this.parseLocation(location);
    return !isNaN(row) && !isNaN(col) && 
           row >= 0 && row < this.size && 
           col >= 0 && col < this.size;
  }

  /**
   * Gets the number of ships remaining (not sunk)
   * @returns {number} - Number of ships still afloat
   */
  getRemainingShips() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }

  /**
   * Sets this board as a player board (shows ships)
   */
  setAsPlayerBoard() {
    this.isPlayerBoard = true;
  }
} 