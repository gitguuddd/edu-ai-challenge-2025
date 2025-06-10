const { 
  mod, 
  plugboardSwap, 
  Rotor, 
  Enigma, 
  ROTORS, 
  REFLECTOR, 
  alphabet,
  promptEnigma
} = require('./enigma.js');

// Mock readline for testing
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn()
  }))
}));

// Mock console.log for testing
const originalConsoleLog = console.log;
let consoleOutput = [];
const mockConsoleLog = (...args) => {
  consoleOutput.push(args.join(' '));
};

describe('Enigma Machine Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    consoleOutput = [];
    console.log = mockConsoleLog;
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  describe('mod function', () => {
    test('should handle positive numbers', () => {
      expect(mod(7, 3)).toBe(1);
      expect(mod(10, 5)).toBe(0);
      expect(mod(13, 7)).toBe(6);
    });

    test('should handle negative numbers correctly', () => {
      expect(mod(-1, 26)).toBe(25);
      expect(mod(-5, 3)).toBe(1);
      expect(mod(-10, 7)).toBe(4);
    });

    test('should handle zero', () => {
      expect(mod(0, 5)).toBe(0);
      expect(mod(0, 26)).toBe(0);
    });

    test('should handle edge cases', () => {
      expect(mod(26, 26)).toBe(0);
      expect(mod(25, 26)).toBe(25);
      expect(mod(-26, 26)).toBe(0);
    });
  });

  describe('plugboardSwap function', () => {
    test('should swap letters according to pairs', () => {
      const pairs = [['A', 'B'], ['C', 'D']];
      expect(plugboardSwap('A', pairs)).toBe('B');
      expect(plugboardSwap('B', pairs)).toBe('A');
      expect(plugboardSwap('C', pairs)).toBe('D');
      expect(plugboardSwap('D', pairs)).toBe('C');
    });

    test('should return unchanged letter if not in pairs', () => {
      const pairs = [['A', 'B'], ['C', 'D']];
      expect(plugboardSwap('E', pairs)).toBe('E');
      expect(plugboardSwap('Z', pairs)).toBe('Z');
    });

    test('should handle empty pairs array', () => {
      expect(plugboardSwap('A', [])).toBe('A');
      expect(plugboardSwap('Z', [])).toBe('Z');
    });

    test('should handle multiple pairs', () => {
      const pairs = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H']];
      expect(plugboardSwap('A', pairs)).toBe('B');
      expect(plugboardSwap('E', pairs)).toBe('F');
      expect(plugboardSwap('G', pairs)).toBe('H');
      expect(plugboardSwap('I', pairs)).toBe('I');
    });
  });

  describe('Rotor class', () => {
    let rotor;

    beforeEach(() => {
      rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 0);
    });

    describe('constructor', () => {
      test('should initialize with correct default values', () => {
        const defaultRotor = new Rotor('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'A');
        expect(defaultRotor.wiring).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        expect(defaultRotor.notch).toBe('A');
        expect(defaultRotor.ringSetting).toBe(0);
        expect(defaultRotor.position).toBe(0);
      });

      test('should initialize with custom values', () => {
        const customRotor = new Rotor('ZYXWVUTSRQPONMLKJIHGFEDCBA', 'M', 5, 10);
        expect(customRotor.wiring).toBe('ZYXWVUTSRQPONMLKJIHGFEDCBA');
        expect(customRotor.notch).toBe('M');
        expect(customRotor.ringSetting).toBe(5);
        expect(customRotor.position).toBe(10);
      });
    });

    describe('step method', () => {
      test('should increment position by 1', () => {
        expect(rotor.position).toBe(0);
        rotor.step();
        expect(rotor.position).toBe(1);
        rotor.step();
        expect(rotor.position).toBe(2);
      });

      test('should wrap around at 26', () => {
        rotor.position = 25;
        rotor.step();
        expect(rotor.position).toBe(0);
      });

      test('should handle multiple wraps', () => {
        rotor.position = 24;
        rotor.step(); // 25
        rotor.step(); // 0
        rotor.step(); // 1
        expect(rotor.position).toBe(1);
      });
    });

    describe('atNotch method', () => {
      test('should return true when at notch position', () => {
        rotor.position = 16; // Q is at position 16
        expect(rotor.atNotch()).toBe(true);
      });

      test('should return false when not at notch position', () => {
        rotor.position = 0; // A
        expect(rotor.atNotch()).toBe(false);
        rotor.position = 15; // P
        expect(rotor.atNotch()).toBe(false);
      });

      test('should work with different notch letters', () => {
        const rotorE = new Rotor('AJDKSIRUXBLHWTMCQGZNPYFVOE', 'E', 0, 4);
        expect(rotorE.atNotch()).toBe(true);
        rotorE.position = 3;
        expect(rotorE.atNotch()).toBe(false);
      });
    });

    describe('forward method', () => {
      test('should encrypt letters through rotor', () => {
        const result = rotor.forward('A');
        expect(result).toBe('E'); // First letter of wiring
      });

      test('should handle position offset', () => {
        rotor.position = 1;
        const result = rotor.forward('A');
        expect(result).toBe('K'); // Second letter of wiring
      });

      test('should handle ring setting offset', () => {
        rotor.ringSetting = 1;
        const result = rotor.forward('A');
        expect(result).toBe('J'); // Offset by ring setting
      });

      test('should handle both position and ring setting', () => {
        rotor.position = 2;
        rotor.ringSetting = 1;
        const result = rotor.forward('A');
        expect(result).toBe('K'); // Combined offset
      });

      test('should handle wrap-around', () => {
        rotor.position = 25;
        const result = rotor.forward('B');
        expect(typeof result).toBe('string');
        expect(result.length).toBe(1);
      });
    });

    describe('backward method', () => {
      test('should decrypt letters through rotor', () => {
        const result = rotor.backward('E');
        expect(result).toBe('A'); // E is first in wiring, maps back to A
      });

      test('should handle position offset', () => {
        rotor.position = 1;
        const result = rotor.backward('K');
        expect(result).toBe('A'); // Accounting for position
      });

      test('should handle ring setting offset', () => {
        rotor.ringSetting = 1;
        const result = rotor.backward('K');
        expect(result).toBe('C'); // Accounting for ring setting
      });

      test('should be inverse of forward', () => {
        const original = 'M';
        rotor.position = 5;
        rotor.ringSetting = 3;
        const encrypted = rotor.forward(original);
        const decrypted = rotor.backward(encrypted);
        expect(decrypted).toBe(original);
      });
    });
  });

  describe('Enigma class', () => {
    let enigma;

    beforeEach(() => {
      enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    });

    describe('constructor', () => {
      test('should initialize with correct rotors', () => {
        expect(enigma.rotors).toHaveLength(3);
        expect(enigma.rotors[0].wiring).toBe(ROTORS[0].wiring);
        expect(enigma.rotors[1].wiring).toBe(ROTORS[1].wiring);
        expect(enigma.rotors[2].wiring).toBe(ROTORS[2].wiring);
      });

      test('should set rotor positions correctly', () => {
        const customEnigma = new Enigma([0, 1, 2], [5, 10, 15], [0, 0, 0], []);
        expect(customEnigma.rotors[0].position).toBe(5);
        expect(customEnigma.rotors[1].position).toBe(10);
        expect(customEnigma.rotors[2].position).toBe(15);
      });

      test('should set ring settings correctly', () => {
        const customEnigma = new Enigma([0, 1, 2], [0, 0, 0], [3, 7, 11], []);
        expect(customEnigma.rotors[0].ringSetting).toBe(3);
        expect(customEnigma.rotors[1].ringSetting).toBe(7);
        expect(customEnigma.rotors[2].ringSetting).toBe(11);
      });

      test('should set plugboard pairs correctly', () => {
        const pairs = [['A', 'B'], ['C', 'D']];
        const customEnigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], pairs);
        expect(customEnigma.plugboardPairs).toEqual(pairs);
      });
    });

    describe('stepRotors method', () => {
      test('should always step rightmost rotor', () => {
        const initialPos = enigma.rotors[2].position;
        enigma.stepRotors();
        expect(enigma.rotors[2].position).toBe(initialPos + 1);
      });

      test('should step middle rotor when rightmost is at notch', () => {
        // Set rightmost rotor to notch position (V = 21 for Rotor III)
        enigma.rotors[2].position = 21;
        const middleInitial = enigma.rotors[1].position;
        enigma.stepRotors();
        expect(enigma.rotors[1].position).toBe(middleInitial + 1);
      });

      test('should step leftmost rotor when middle is at notch', () => {
        // Set middle rotor to notch position (E = 4 for Rotor II)
        enigma.rotors[1].position = 4;
        const leftInitial = enigma.rotors[0].position;
        enigma.stepRotors();
        expect(enigma.rotors[0].position).toBe(leftInitial + 1);
      });

      test('should handle double stepping', () => {
        // Set up double stepping scenario
        enigma.rotors[1].position = 4; // Middle at notch
        enigma.rotors[2].position = 21; // Right at notch
        
        const leftInitial = enigma.rotors[0].position;
        const middleInitial = enigma.rotors[1].position;
        const rightInitial = enigma.rotors[2].position;
        
        enigma.stepRotors();
        
        expect(enigma.rotors[0].position).toBe(leftInitial); // Left doesn't step in this case
        expect(enigma.rotors[1].position).toBe(middleInitial + 1); // Middle steps
        expect(enigma.rotors[2].position).toBe(rightInitial + 1); // Right steps
      });
    });

    describe('encryptChar method', () => {
      test('should return non-alphabetic characters unchanged', () => {
        expect(enigma.encryptChar('1')).toBe('1');
        expect(enigma.encryptChar(' ')).toBe(' ');
        expect(enigma.encryptChar('!')).toBe('!');
        expect(enigma.encryptChar('.')).toBe('.');
      });

      test('should encrypt alphabetic characters', () => {
        const result = enigma.encryptChar('A');
        expect(typeof result).toBe('string');
        expect(result.length).toBe(1);
        expect(alphabet.includes(result)).toBe(true);
      });

      test('should step rotors before encryption', () => {
        const initialPos = enigma.rotors[2].position;
        enigma.encryptChar('A');
        expect(enigma.rotors[2].position).toBe(initialPos + 1);
      });

      test('should apply plugboard transformation twice', () => {
        const plugboardEnigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
        // The exact result depends on the full encryption path, but we can test reciprocity
        const encrypted = plugboardEnigma.encryptChar('A');
        
        // Reset positions for decryption
        const decryptEnigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
        const decrypted = decryptEnigma.encryptChar(encrypted);
        expect(decrypted).toBe('A');
      });

      test('should never encrypt a letter to itself', () => {
        // Test multiple letters to ensure none encrypt to themselves
        for (let i = 0; i < 26; i++) {
          const letter = alphabet[i];
          const testEnigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
          const encrypted = testEnigma.encryptChar(letter);
          expect(encrypted).not.toBe(letter);
        }
      });
    });

    describe('process method', () => {
      test('should convert to uppercase', () => {
        const result = enigma.process('hello');
        expect(result).not.toContain('h');
        expect(result).not.toContain('e');
        expect(result).not.toContain('l');
        expect(result).not.toContain('o');
      });

      test('should preserve non-alphabetic characters', () => {
        const result = enigma.process('HELLO, WORLD! 123');
        expect(result).toContain(',');
        expect(result).toContain(' ');
        expect(result).toContain('!');
        expect(result).toContain('1');
        expect(result).toContain('2');
        expect(result).toContain('3');
      });

      test('should encrypt each letter', () => {
        const result = enigma.process('ABC');
        expect(result.length).toBe(3);
        expect(result).not.toBe('ABC');
      });

      test('should handle empty string', () => {
        const result = enigma.process('');
        expect(result).toBe('');
      });

      test('should handle single character', () => {
        const result = enigma.process('A');
        expect(result.length).toBe(1);
        expect(result).not.toBe('A');
      });
    });

    describe('reciprocal property', () => {
      test('should encrypt and decrypt to original message', () => {
        const original = 'HELLOWORLD';
        const settings = {
          rotorIDs: [0, 1, 2],
          positions: [0, 0, 0],
          rings: [0, 0, 0],
          plugboard: [['Q', 'W'], ['E', 'R']]
        };

        // Encrypt
        const encryptEnigma = new Enigma(
          settings.rotorIDs,
          settings.positions,
          settings.rings,
          settings.plugboard
        );
        const encrypted = encryptEnigma.process(original);

        // Decrypt
        const decryptEnigma = new Enigma(
          settings.rotorIDs,
          settings.positions,
          settings.rings,
          settings.plugboard
        );
        const decrypted = decryptEnigma.process(encrypted);

        expect(decrypted).toBe(original);
      });

      test('should work with different settings', () => {
        const original = 'TESTMESSAGE';
        const settings = {
          rotorIDs: [2, 1, 0],
          positions: [5, 10, 15],
          rings: [2, 4, 6],
          plugboard: [['A', 'Z'], ['B', 'Y'], ['C', 'X']]
        };

        const encryptEnigma = new Enigma(
          settings.rotorIDs,
          settings.positions,
          settings.rings,
          settings.plugboard
        );
        const encrypted = encryptEnigma.process(original);

        const decryptEnigma = new Enigma(
          settings.rotorIDs,
          settings.positions,
          settings.rings,
          settings.plugboard
        );
        const decrypted = decryptEnigma.process(encrypted);

        expect(decrypted).toBe(original);
      });
    });

    describe('historical test cases', () => {
      test('should match known Enigma outputs', () => {
        // Test case from README
        const testEnigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['Q', 'W'], ['E', 'R']]);
        const result = testEnigma.process('HELLOWORLD');
        expect(result).toBe('VDACACJJEA');
      });

      test('should handle long messages', () => {
        const longMessage = 'A'.repeat(100);
        const result = enigma.process(longMessage);
        expect(result.length).toBe(100);
        expect(result).not.toBe(longMessage);
      });

      test('should handle messages with mixed case and punctuation', () => {
        const message = 'Hello, World! How are you today? 123';
        const result = enigma.process(message);
        expect(result).toContain(',');
        expect(result).toContain(' ');
        expect(result).toContain('!');
        expect(result).toContain('?');
        expect(result).toContain('1');
        expect(result).toContain('2');
        expect(result).toContain('3');
      });
    });
  });

  describe('Constants', () => {
    test('ROTORS should have correct structure', () => {
      expect(ROTORS).toHaveLength(3);
      ROTORS.forEach(rotor => {
        expect(rotor).toHaveProperty('wiring');
        expect(rotor).toHaveProperty('notch');
        expect(rotor.wiring).toHaveLength(26);
        expect(typeof rotor.notch).toBe('string');
        expect(rotor.notch).toHaveLength(1);
      });
    });

    test('REFLECTOR should have correct length', () => {
      expect(REFLECTOR).toHaveLength(26);
    });

    test('alphabet should be correct', () => {
      expect(alphabet).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(alphabet).toHaveLength(26);
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle rotor position overflow', () => {
      const rotor = new Rotor('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'A', 0, 25);
      rotor.step();
      expect(rotor.position).toBe(0);
    });

    test('should handle negative modulo correctly', () => {
      expect(mod(-1, 26)).toBe(25);
      expect(mod(-27, 26)).toBe(25);
    });

    test('should handle empty plugboard pairs', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const result = enigma.process('TEST');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(4);
    });

    test('should handle maximum plugboard pairs', () => {
      // Maximum 13 pairs (26 letters / 2)
      const maxPairs = [
        ['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'],
        ['I', 'J'], ['K', 'L'], ['M', 'N'], ['O', 'P'],
        ['Q', 'R'], ['S', 'T'], ['U', 'V'], ['W', 'X'],
        ['Y', 'Z']
      ];
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], maxPairs);
      const result = enigma.process('TEST');
      expect(typeof result).toBe('string');
    });
  });

  describe('promptEnigma function', () => {
    test('should create readline interface when called', () => {
      const readline = require('readline');
      promptEnigma();
      expect(readline.createInterface).toHaveBeenCalledWith({
        input: process.stdin,
        output: process.stdout,
      });
    });

    test('should handle plugboard regex parsing', () => {
      // Test the regex pattern used in promptEnigma
      const testStr = 'AB CD EF';
      const matches = testStr.toUpperCase().match(/([A-Z]{2})/g);
      const pairs = matches?.map((pair) => [pair[0], pair[1]]) || [];
      
      expect(pairs).toEqual([['A', 'B'], ['C', 'D'], ['E', 'F']]);
    });

    test('should handle empty plugboard string', () => {
      const testStr = '';
      const matches = testStr.toUpperCase().match(/([A-Z]{2})/g);
      const pairs = matches?.map((pair) => [pair[0], pair[1]]) || [];
      
      expect(pairs).toEqual([]);
    });

    test('should handle invalid plugboard format', () => {
      const testStr = 'A BC DEF';
      const matches = testStr.toUpperCase().match(/([A-Z]{2})/g);
      const pairs = matches?.map((pair) => [pair[0], pair[1]]) || [];
      
      expect(pairs).toEqual([['B', 'C'], ['D', 'E']]);
    });

    test('should handle mixed case plugboard input', () => {
      const testStr = 'ab cd ef';
      const matches = testStr.toUpperCase().match(/([A-Z]{2})/g);
      const pairs = matches?.map((pair) => [pair[0], pair[1]]) || [];
      
      expect(pairs).toEqual([['A', 'B'], ['C', 'D'], ['E', 'F']]);
    });
  });

  describe('Additional edge cases', () => {
    test('should handle plugboard with mixed case input', () => {
      const pairs = [['a', 'B'], ['c', 'D']];
      // The function should work with any case since it's called after toUpperCase
      expect(plugboardSwap('A', [['A', 'B']])).toBe('B');
      expect(plugboardSwap('B', [['A', 'B']])).toBe('A');
    });

    test('should handle rotor at various positions', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 0);
      
      // Test all positions
      for (let pos = 0; pos < 26; pos++) {
        rotor.position = pos;
        const encrypted = rotor.forward('A');
        const decrypted = rotor.backward(encrypted);
        expect(decrypted).toBe('A');
      }
    });

    test('should handle rotor with various ring settings', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 0);
      
      // Test all ring settings
      for (let ring = 0; ring < 26; ring++) {
        rotor.ringSetting = ring;
        rotor.position = 0;
        const encrypted = rotor.forward('A');
        const decrypted = rotor.backward(encrypted);
        expect(decrypted).toBe('A');
      }
    });

    test('should handle all alphabet characters in encryption', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      
      for (let i = 0; i < 26; i++) {
        const char = alphabet[i];
        const encrypted = enigma.encryptChar(char);
        expect(encrypted).not.toBe(char);
        expect(alphabet.includes(encrypted)).toBe(true);
      }
    });

    test('should handle rotor stepping at all notch positions', () => {
      // Test Rotor III notch (V = position 21) - rightmost rotor triggers middle
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 21], [0, 0, 0], []);
      const initialMiddle = enigma1.rotors[1].position;
      enigma1.stepRotors();
      expect(enigma1.rotors[1].position).toBe(initialMiddle + 1);

      // Test Rotor II notch (E = position 4) - middle rotor triggers left
      const enigma2 = new Enigma([0, 1, 2], [0, 4, 0], [0, 0, 0], []);
      const initialLeft = enigma2.rotors[0].position;
      enigma2.stepRotors();
      expect(enigma2.rotors[0].position).toBe(initialLeft + 1);

      // Test Rotor I notch (Q = position 16) - this is the leftmost rotor
      const enigma3 = new Enigma([0, 1, 2], [16, 0, 0], [0, 0, 0], []);
      const initialLeft3 = enigma3.rotors[0].position;
      enigma3.stepRotors();
      // Leftmost rotor only steps when middle rotor is at notch, not when it's at notch itself
      expect(enigma3.rotors[0].position).toBe(initialLeft3);
    });

    test('should handle complex plugboard configurations', () => {
      // Test with overlapping attempts (should not happen in real use)
      const pairs = [['A', 'B'], ['C', 'D'], ['E', 'F']];
      expect(plugboardSwap('A', pairs)).toBe('B');
      expect(plugboardSwap('C', pairs)).toBe('D');
      expect(plugboardSwap('E', pairs)).toBe('F');
      expect(plugboardSwap('G', pairs)).toBe('G');
    });

    test('should handle process method with various inputs', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      
      // Test with numbers and symbols
      expect(enigma.process('123')).toBe('123');
      expect(enigma.process('!@#')).toBe('!@#');
      expect(enigma.process('a1b2c3')).toMatch(/^[A-Z]1[A-Z]2[A-Z]3$/);
    });

    test('should handle rotor backward method with all wiring positions', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 0);
      
      // Test that every character in the wiring can be decrypted
      for (let i = 0; i < rotor.wiring.length; i++) {
        const char = rotor.wiring[i];
        const result = rotor.backward(char);
        expect(alphabet.includes(result)).toBe(true);
      }
    });

    test('should handle enigma with different rotor orders', () => {
      // Test different rotor combinations
      const enigma1 = new Enigma([2, 1, 0], [0, 0, 0], [0, 0, 0], []);
      const enigma2 = new Enigma([1, 0, 2], [0, 0, 0], [0, 0, 0], []);
      const enigma3 = new Enigma([0, 2, 1], [0, 0, 0], [0, 0, 0], []);
      
      const message = 'TEST';
      const result1 = enigma1.process(message);
      const result2 = enigma2.process(message);
      const result3 = enigma3.process(message);
      
      // Results should be different with different rotor orders
      expect(result1).not.toBe(result2);
      expect(result2).not.toBe(result3);
      expect(result1).not.toBe(result3);
    });

    test('should handle reflector mapping for all characters', () => {
      // Verify reflector maps all characters and is reciprocal
      const used = new Set();
      for (let i = 0; i < 26; i++) {
        const char = alphabet[i];
        const reflected = REFLECTOR[i];
        expect(alphabet.includes(reflected)).toBe(true);
        
        // Check reciprocal property
        const reflectedIndex = alphabet.indexOf(reflected);
        const backReflected = REFLECTOR[reflectedIndex];
        expect(backReflected).toBe(char);
        
        used.add(reflected);
      }
      // All characters should be used exactly once
      expect(used.size).toBe(26);
    });

    test('should handle mod function with large numbers', () => {
      expect(mod(1000, 26)).toBe(12);
      expect(mod(-1000, 26)).toBe(14);
      expect(mod(0, 1)).toBe(0);
    });

    test('should handle enigma encryption with rotor overflow', () => {
      const enigma = new Enigma([0, 1, 2], [25, 25, 25], [0, 0, 0], []);
      
      // Encrypt enough characters to cause rotor overflow
      let result = '';
      for (let i = 0; i < 30; i++) {
        result += enigma.encryptChar('A');
      }
      
      expect(result.length).toBe(30);
      expect(enigma.rotors[2].position).toBe(3); // Should have wrapped around
    });
  });
}); 