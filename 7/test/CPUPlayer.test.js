import { CPUPlayer } from '../src/CPUPlayer.js';

describe('CPUPlayer', () => {
  test('should create CPU player with default board size', () => {
    const cpu = new CPUPlayer();
    
    expect(cpu.boardSize).toBe(10);
    expect(cpu.guesses).toEqual([]);
    expect(cpu.mode).toBe('hunt');
    expect(cpu.targetQueue).toEqual([]);
  });

  test('should create CPU player with custom board size', () => {
    const cpu = new CPUPlayer(5);
    
    expect(cpu.boardSize).toBe(5);
  });

  test('should make random guess in hunt mode', () => {
    const cpu = new CPUPlayer();
    
    const guess = cpu.makeGuess();
    
    expect(typeof guess).toBe('string');
    expect(guess).toHaveLength(2);
    expect(cpu.guesses).toContain(guess);
  });

  test('should not make duplicate guesses', () => {
    const cpu = new CPUPlayer(3); // Small board to force duplicates quickly
    const guesses = new Set();
    
    // Make several guesses
    for (let i = 0; i < 5; i++) {
      const guess = cpu.makeGuess();
      expect(guesses.has(guess)).toBe(false);
      guesses.add(guess);
    }
  });

  test('should parse location correctly', () => {
    const cpu = new CPUPlayer();
    
    expect(cpu.parseLocation('34')).toEqual([3, 4]);
    expect(cpu.parseLocation('00')).toEqual([0, 0]);
    expect(cpu.parseLocation('99')).toEqual([9, 9]);
  });

  test('should validate location correctly', () => {
    const cpu = new CPUPlayer(5);
    
    expect(cpu.isValidLocation(0, 0)).toBe(true);
    expect(cpu.isValidLocation(4, 4)).toBe(true);
    expect(cpu.isValidLocation(5, 0)).toBe(false);
    expect(cpu.isValidLocation(0, 5)).toBe(false);
    expect(cpu.isValidLocation(-1, 0)).toBe(false);
  });

  test('should check if location has been guessed', () => {
    const cpu = new CPUPlayer();
    cpu.guesses = ['34', '56'];
    
    expect(cpu.hasGuessed(3, 4)).toBe(true);
    expect(cpu.hasGuessed(5, 6)).toBe(true);
    expect(cpu.hasGuessed(1, 2)).toBe(false);
  });

  test('should switch to target mode on hit', () => {
    const cpu = new CPUPlayer();
    
    cpu.processGuessResult('34', true, false);
    
    expect(cpu.mode).toBe('target');
    expect(cpu.targetQueue.length).toBeGreaterThan(0);
  });

  test('should return to hunt mode when ship is sunk', () => {
    const cpu = new CPUPlayer();
    cpu.mode = 'target';
    cpu.targetQueue = ['35', '33'];
    
    cpu.processGuessResult('34', true, true);
    
    expect(cpu.mode).toBe('hunt');
    expect(cpu.targetQueue).toEqual([]);
  });

  test('should add adjacent targets correctly', () => {
    const cpu = new CPUPlayer();
    
    cpu.addAdjacentTargets('55');
    
    const expectedTargets = ['45', '65', '54', '56'];
    expectedTargets.forEach(target => {
      expect(cpu.targetQueue).toContain(target);
    });
  });

  test('should not add invalid adjacent targets', () => {
    const cpu = new CPUPlayer(5);
    
    cpu.addAdjacentTargets('00');
    
    // Should not add negative coordinates
    expect(cpu.targetQueue).not.toContain('-10');
    expect(cpu.targetQueue).not.toContain('0-1');
    
    // Should only contain valid adjacent targets
    const validTargets = cpu.targetQueue.filter(target => {
      const [row, col] = cpu.parseLocation(target);
      return cpu.isValidLocation(row, col);
    });
    expect(validTargets).toHaveLength(cpu.targetQueue.length);
  });

  test('should not add already guessed adjacent targets', () => {
    const cpu = new CPUPlayer();
    cpu.guesses = ['45', '54'];
    
    cpu.addAdjacentTargets('55');
    
    expect(cpu.targetQueue).not.toContain('45');
    expect(cpu.targetQueue).not.toContain('54');
  });

  test('should use target queue in target mode', () => {
    const cpu = new CPUPlayer();
    cpu.mode = 'target';
    cpu.targetQueue = ['34'];
    
    const guess = cpu.makeGuess();
    
    expect(guess).toBe('34');
    expect(cpu.targetQueue).toEqual([]);
  });

  test('should return to hunt mode when target queue is empty', () => {
    const cpu = new CPUPlayer();
    cpu.mode = 'target';
    cpu.targetQueue = [];
    
    cpu.processGuessResult('34', false, false);
    
    expect(cpu.mode).toBe('hunt');
  });

  test('should get current mode', () => {
    const cpu = new CPUPlayer();
    
    expect(cpu.getCurrentMode()).toBe('hunt');
    
    cpu.mode = 'target';
    expect(cpu.getCurrentMode()).toBe('target');
  });

  test('should reset correctly', () => {
    const cpu = new CPUPlayer();
    cpu.guesses = ['34', '56'];
    cpu.mode = 'target';
    cpu.targetQueue = ['78'];
    
    cpu.reset();
    
    expect(cpu.guesses).toEqual([]);
    expect(cpu.mode).toBe('hunt');
    expect(cpu.targetQueue).toEqual([]);
  });

  test('should handle target mode with already guessed location', () => {
    const cpu = new CPUPlayer();
    cpu.mode = 'target';
    cpu.targetQueue = ['12'];
    cpu.guesses = ['12']; // Already guessed the target
    
    const guess = cpu.makeGuess();
    
    // Should fall back to hunt mode and make a random guess
    expect(cpu.mode).toBe('hunt');
    expect(typeof guess).toBe('string');
    expect(guess).toHaveLength(2);
  });

  test('should not add duplicate targets to queue', () => {
    const cpu = new CPUPlayer();
    cpu.targetQueue = ['45'];
    
    cpu.addAdjacentTargets('55');
    
    // Count occurrences of '45' in target queue
    const count45 = cpu.targetQueue.filter(target => target === '45').length;
    expect(count45).toBe(1);
  });
}); 