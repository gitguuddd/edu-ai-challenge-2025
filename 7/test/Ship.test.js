import { Ship } from '../src/Ship.js';

describe('Ship', () => {
  test('should create a ship with given locations', () => {
    const locations = ['00', '01', '02'];
    const ship = new Ship(locations);
    
    expect(ship.locations).toEqual(locations);
    expect(ship.length).toBe(3);
    expect(ship.hits).toEqual(['', '', '']);
  });

  test('should create a ship with custom length', () => {
    const locations = ['00', '01'];
    const ship = new Ship(locations, 2);
    
    expect(ship.length).toBe(2);
    expect(ship.hits).toEqual(['', '']);
  });

  test('should hit a ship at valid location', () => {
    const ship = new Ship(['00', '01', '02']);
    
    const result = ship.hit('01');
    
    expect(result).toBe(true);
    expect(ship.hits[1]).toBe('hit');
  });

  test('should not hit a ship at invalid location', () => {
    const ship = new Ship(['00', '01', '02']);
    
    const result = ship.hit('99');
    
    expect(result).toBe(false);
    expect(ship.hits).toEqual(['', '', '']);
  });

  test('should not hit a ship at already hit location', () => {
    const ship = new Ship(['00', '01', '02']);
    ship.hit('01');
    
    const result = ship.hit('01');
    
    expect(result).toBe(false);
    expect(ship.hits[1]).toBe('hit');
  });

  test('should not be sunk initially', () => {
    const ship = new Ship(['00', '01', '02']);
    
    expect(ship.isSunk()).toBe(false);
  });

  test('should be sunk when all parts are hit', () => {
    const ship = new Ship(['00', '01', '02']);
    
    ship.hit('00');
    ship.hit('01');
    ship.hit('02');
    
    expect(ship.isSunk()).toBe(true);
  });

  test('should not be sunk when only some parts are hit', () => {
    const ship = new Ship(['00', '01', '02']);
    
    ship.hit('00');
    ship.hit('01');
    
    expect(ship.isSunk()).toBe(false);
  });

  test('should check if location is part of ship', () => {
    const ship = new Ship(['00', '01', '02']);
    
    expect(ship.hasLocation('01')).toBe(true);
    expect(ship.hasLocation('99')).toBe(false);
  });

  test('should check if location has been hit', () => {
    const ship = new Ship(['00', '01', '02']);
    ship.hit('01');
    
    expect(ship.isHitAt('01')).toBe(true);
    expect(ship.isHitAt('00')).toBe(false);
    expect(ship.isHitAt('99')).toBe(false);
  });

  test('should not mutate original locations array', () => {
    const originalLocations = ['00', '01', '02'];
    const ship = new Ship(originalLocations);
    
    ship.locations.push('03');
    
    expect(originalLocations).toEqual(['00', '01', '02']);
  });
}); 