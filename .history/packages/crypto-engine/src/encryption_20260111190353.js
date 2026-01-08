// packages/crypto-engine/src/encryption.js

/**
 * Task 1.3: Encrypts data using the Master Key.
 * Fulfills Story 2.1 by creating "Locked Blobs".
 */
export async function encryptData(plaintext, masterKey) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // 1. Generate a random IV (Initialization Vector) 
    // This ensures even same passwords look different when encrypted.
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 2. Prepare the key for the Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
        'raw', masterKey, 'AES-GCM', false, ['encrypt']
    );

    // 3. Encrypt the data
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        data
    );

    // 4. Return as a "Blob" (Combined IV + Encrypted Data)
    return {
        iv: Buffer.from(iv).toString('base64'),
        content: Buffer.from(ciphertext).toString('base64')
    };
}