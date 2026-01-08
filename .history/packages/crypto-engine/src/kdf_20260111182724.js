// packages/crypto-engine/src/kdf.js
import { argon2id } from 'hash-wasm';

/**
 * Story 1.1, Task 1: Locally convert password to a lock code (Master Key)
 * Turns a master password + salt into a 256-bit cryptographic key.
 */
export async function deriveMasterKey(password, salt) {
    // These settings follow industry standards for "high security"
    const params = {
        password: password,
        salt: salt,           // Random data to prevent pre-computed attacks
        iterations: 4,        // Number of math "folds"
        memory: 65536,        // 64MB of RAM required (stops GPU hackers)
        parallelism: 4,       // Uses multiple processor cores
        hashLength: 32,       // Results in a 256-bit key
        outputType: 'binary', // We need binary format for encryption later
    };

    return await argon2id(params);
}