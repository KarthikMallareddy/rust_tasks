/**
 * Tests for AES-256-GCM encryption/decryption
 *
 * Test coverage:
 * - Encryption and decryption of vault entries
 * - Integrity verification (GCM authentication)
 * - IV handling
 * - Error handling for tampered ciphertext
 * - Round-trip encryption/decryption
 */
import { test } from "node:test";
import * as assert from "node:assert";
import { encrypt, decrypt } from "../src/aes.js";
import { deriveKey } from "../src/argon2.js";
let derivedKey;
test("AES-GCM: Setup - derive key for tests", async () => {
    const masterPassword = "TestPassword";
    const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    derivedKey = await deriveKey(masterPassword, salt);
    assert.ok(derivedKey.encryptionKey, "Key should be derived");
});
test("AES-GCM: Encrypt vault entry", async () => {
    const entry = {
        site: "example.com",
        username: "user@example.com",
        password: "SuperSecretPassword123!",
    };
    const encrypted = await encrypt(entry, derivedKey);
    assert.ok(encrypted.ciphertext, "Ciphertext should exist");
    assert.ok(encrypted.iv, "IV should exist");
    assert.ok(encrypted.salt, "Salt should exist");
    assert.equal(encrypted.algorithm, "AES-256-GCM", "Algorithm should be AES-256-GCM");
    assert.equal(encrypted.derivationAlgorithm, "Argon2id", "Derivation should be Argon2id");
});
test("AES-GCM: Decrypt returns correct entry", async () => {
    const entry = {
        site: "github.com",
        username: "developer",
        password: "GitHubToken2024",
    };
    const encrypted = await encrypt(entry, derivedKey);
    const decrypted = await decrypt(encrypted, derivedKey);
    assert.deepEqual(decrypted, entry, "Decrypted entry should match original");
});
test("AES-GCM: Encryption produces different ciphertexts for same entry", async () => {
    const entry = {
        site: "test.com",
        username: "testuser",
        password: "testpass",
    };
    const encrypted1 = await encrypt(entry, derivedKey);
    const encrypted2 = await encrypt(entry, derivedKey);
    // Different IVs should produce different ciphertexts
    assert.notEqual(encrypted1.ciphertext, encrypted2.ciphertext, "Different IVs should produce different ciphertexts");
    assert.notEqual(encrypted1.iv, encrypted2.iv, "IVs should be different");
});
test("AES-GCM: Handles metadata in vault entry", async () => {
    const entry = {
        site: "bank.com",
        username: "john@example.com",
        password: "BankPassword!",
        metadata: {
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-29T00:00:00Z",
            pin: "1234",
            securityQuestion: "What is your pet's name?",
        },
    };
    const encrypted = await encrypt(entry, derivedKey);
    const decrypted = await decrypt(encrypted, derivedKey);
    assert.deepEqual(decrypted, entry, "Entry with metadata should be preserved");
});
test("AES-GCM: Handles special characters in passwords", async () => {
    const entry = {
        site: "unicode.example",
        username: "user",
        password: "Pässwörd!@#$%^&*()_+-=[]{}|;:',.<>?/",
    };
    const encrypted = await encrypt(entry, derivedKey);
    const decrypted = await decrypt(encrypted, derivedKey);
    assert.equal(decrypted.password, entry.password, "Special characters should be preserved");
});
test("AES-GCM: Handles long passwords", async () => {
    const longPassword = "A".repeat(10000) + "SecureEnding!";
    const entry = {
        site: "longpass.com",
        username: "user",
        password: longPassword,
    };
    const encrypted = await encrypt(entry, derivedKey);
    const decrypted = await decrypt(encrypted, derivedKey);
    assert.equal(decrypted.password, entry.password, "Long passwords should be preserved");
});
test("AES-GCM: Detects tampered ciphertext", async () => {
    const entry = {
        site: "secure.com",
        username: "user",
        password: "password",
    };
    const encrypted = await encrypt(entry, derivedKey);
    // Tamper with ciphertext
    const tamperedCiphertext = encrypted.ciphertext.slice(0, -2) + "XX";
    const tamperedEncrypted = {
        ...encrypted,
        ciphertext: tamperedCiphertext,
    };
    await assert.rejects(async () => await decrypt(tamperedEncrypted, derivedKey), /Decryption failed/, "Tampered ciphertext should throw error");
});
test("AES-GCM: Rejects decryption with wrong key", async () => {
    const entry = {
        site: "secure.com",
        username: "user",
        password: "password",
    };
    const encrypted = await encrypt(entry, derivedKey);
    // Derive a different key
    const wrongPassword = "DifferentPassword";
    const wrongSalt = new Uint8Array([5, 4, 3, 2, 1, 0, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6]);
    const wrongKey = await deriveKey(wrongPassword, wrongSalt);
    await assert.rejects(async () => await decrypt(encrypted, wrongKey), /Decryption failed/, "Wrong key should fail decryption");
});
test("AES-GCM: IV is always 12 bytes (96 bits)", async () => {
    const entry = {
        site: "test.com",
        username: "user",
        password: "pass",
    };
    const encrypted = await encrypt(entry, derivedKey);
    const ivBuffer = Buffer.from(encrypted.iv, "base64");
    assert.equal(ivBuffer.length, 12, "IV should be 12 bytes for GCM");
});
test("AES-GCM: Large vault entry encryption/decryption", async () => {
    const largeNotes = "X".repeat(100000); // 100KB of data
    const entry = {
        site: "largedata.com",
        username: "user",
        password: "pass",
        metadata: {
            notes: largeNotes,
        },
    };
    const encrypted = await encrypt(entry, derivedKey);
    const decrypted = await decrypt(encrypted, derivedKey);
    assert.equal(decrypted.metadata?.notes, largeNotes, "Large data should be preserved");
});
//# sourceMappingURL=aes.test.js.map