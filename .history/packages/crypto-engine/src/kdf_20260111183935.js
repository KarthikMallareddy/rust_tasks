// packages/crypto-engine/src/kdf.js
import { argon2id } from 'hash-wasm';

/**
 * Story 1.1, Task 1: Locally convert password to a lock code (Master Key)
 */
export async function deriveMasterKey(password, salt) {
    const iterations = 4;
    const memory = 65536; // 64MB in KiB
    const parallelism = 4;
    const hashLength = 32;

    const result = await argon2id({
        password: password,
        salt: salt,
        iterations: iterations,
        memorySize: memory, // Corrected from 'memory' to 'memorySize'
        parallelism: parallelism,
        hashLength: hashLength,
        outputType: 'binary',
    });

    return result;
}