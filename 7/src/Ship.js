/**
 * Represents a ship in the Sea Battle game
 */
export class Ship {
  constructor(locations, length = 3) {
    this.locations = [...locations]; // Copy array to avoid mutation
    this.hits = new Array(length).fill('');
    this.length = length;
  }

  /**
   * Attempts to hit the ship at a specific location
   * @param {string} location - The location to hit (e.g., "34")
   * @returns {boolean} - True if hit was successful, false if already hit or invalid
   */
  hit(location) {
    const index = this.locations.indexOf(location);
    if (index >= 0 && this.hits[index] !== 'hit') {
      this.hits[index] = 'hit';
      return true;
    }
    return false;
  }

  /**
   * Checks if the ship is completely sunk
   * @returns {boolean} - True if all parts of the ship are hit
   */
  isSunk() {
    return this.hits.every(hit => hit === 'hit');
  }

  /**
   * Checks if a location is part of this ship
   * @param {string} location - The location to check
   * @returns {boolean} - True if location is part of this ship
   */
  hasLocation(location) {
    return this.locations.includes(location);
  }

  /**
   * Checks if a location has been hit on this ship
   * @param {string} location - The location to check
   * @returns {boolean} - True if location has been hit
   */
  isHitAt(location) {
    const index = this.locations.indexOf(location);
    return index >= 0 && this.hits[index] === 'hit';
  }
} 