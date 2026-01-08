import { deriveMasterKey } from './src/kdf.js';
import { encryptData, decryptData } from './src/encryption.js';

const password = "MySuperSecretPassword";
const salt = crypto.getRandomValues(new Uint8Array(16));
const mySecret = "Netflix: P@ssword123";

async function runTest() {
    console.log("--- Sprint 1: Full Vault Test ---");

    // 1. KDF (Task 1.2)
    const masterKey = await deriveMasterKey(password, salt);
    
    // 2. Encrypt (Task 1.3)
    const blob = await encryptData(mySecret, masterKey);
    console.log("Encrypted Blob (What the server sees):", blob);

    // 3. Decrypt (Verification)
    const original = await decryptData(blob, masterKey);
    console.log("Decrypted Secret:", original);

    if (original === mySecret) {
        console.log("Verification Success: The vault is secure! ✅");
    }
}

runTest();