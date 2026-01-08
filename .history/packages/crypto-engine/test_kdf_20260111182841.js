// packages/crypto-engine/test-kdf.js
import { deriveMasterKey } from './src/kdf.js';

const myPassword = "SuperSecretPassword123!";
const mySalt = new Uint8Array(16); // A real app would generate a random salt

console.log("Starting Key Derivation...");
const startTime = performance.now();

deriveMasterKey(myPassword, mySalt).then(masterKey => {
    const endTime = performance.now();
    console.log("Master Key Derived (Binary):", masterKey);
    console.log(`Time taken: ${(endTime - startTime).toFixed(2)}ms`);
    console.log("Zero-Knowledge Goal: Password turned into a key locally! ✅");
});