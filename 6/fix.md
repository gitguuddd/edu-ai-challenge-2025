# Enigma Machine Bug Fix

## Problem Description

The Enigma machine implementation in `enigma.js` was not functioning correctly as a proper cipher machine. The fundamental issue was that **encryption and decryption were not reciprocal** - a core property of the historical Enigma machine.

### Symptoms
- Encrypting a message and then decrypting the result with the same settings did not return the original message
- Example failure case:
  ```
  Original:  HELLOWORLD
  Encrypted: VDACACJJRA  (with settings: rotors 0,0,0 rings 0,0,0 plugboard QW,ER)
  Decrypted: HRLLOQOEBD  (should have been HELLOWORLD)
  ```

### Root Cause
The bug was located in the `encryptChar()` method of the `Enigma` class. The implementation was missing the **second plugboard transformation** that occurs after the signal returns from the reflector.

In a historical Enigma machine, the electrical signal passes through the plugboard **twice**:
1. **Entry**: Before going through the rotors to the reflector
2. **Exit**: After returning from the reflector through the rotors

The original code only applied the plugboard transformation once (at entry), missing the critical exit transformation.


### Fixed Code
```javascript
encryptChar(c) {
  if (!alphabet.includes(c)) return c;
  this.stepRotors();
  c = plugboardSwap(c, this.plugboardPairs);        // ✓ Entry plugboard
  for (let i = this.rotors.length - 1; i >= 0; i--) {
    c = this.rotors[i].forward(c);                   // ✓ Forward through rotors
  }

  c = REFLECTOR[alphabet.indexOf(c)];                // ✓ Reflector

  for (let i = 0; i < this.rotors.length; i++) {
    c = this.rotors[i].backward(c);                  // ✓ Backward through rotors
  }
  
  c = plugboardSwap(c, this.plugboardPairs);        // ✓ Exit plugboard (ADDED)
  return c;
}
```