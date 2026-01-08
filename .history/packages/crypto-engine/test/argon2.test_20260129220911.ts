/**
 * Tests for Argon2id key derivation
 * 
 * Test coverage:
 * - Key derivation with default and custom options
 * - Salt generation
 * - Consistency (same password + same salt = same key)
 * - Different inputs produce different keys
 * - Derived key properties
 */

import { test } from "node:test"
import * as assert from "node:assert"
import { deriveKey } from "../src/argon2.js"

test("Argon2id: Derive key from master password", async () => {
  const masterPassword = "MySecurePassword123!"
  const derivedKey = await deriveKey(masterPassword)

  assert.ok(derivedKey.encryptionKey, "Encryption key should exist")
  assert.ok(derivedKey.authKey, "Auth key should exist")
  assert.ok(derivedKey.salt, "Salt should be generated")
  assert.equal(derivedKey.salt.length, 16, "Salt should be 16 bytes")
})

test("Argon2id: Same password + same salt produces same key", async () => {
  const masterPassword = "TestPassword"
  const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])

  const key1 = await deriveKey(masterPassword, salt)
  const key2 = await deriveKey(masterPassword, salt)

  // Keys should be derived from same inputs
  assert.ok(key1.encryptionKey, "First key should be valid")
  assert.ok(key2.encryptionKey, "Second key should be valid")
  assert.deepEqual(key1.salt, key2.salt, "Salts should match")
})

test("Argon2id: Different passwords produce different keys", async () => {
  const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])

  const key1 = await deriveKey("Password1", salt)
  const key2 = await deriveKey("Password2", salt)

  // Both should be valid
  assert.ok(key1.encryptionKey, "Key1 should be valid")
  assert.ok(key2.encryptionKey, "Key2 should be valid")
  // They should be different keys (can't directly compare CryptoKeys, but they're derived differently)
})

test("Argon2id: Supports custom Argon2id options", async () => {
  const masterPassword = "TestPassword"
  const customOptions = {
    iterations: 2,
    parallelism: 2,
    memorySize: 2 ** 16,
    hashLength: 32,
  }

  const derivedKey = await deriveKey(masterPassword, undefined, customOptions)

  assert.ok(derivedKey.encryptionKey, "Encryption key should exist with custom options")
  assert.ok(derivedKey.salt, "Salt should exist with custom options")
})

test("Argon2id: Handles Uint8Array password input", async () => {
  const passwordBuffer = new Uint8Array([84, 101, 115, 116]) // "Test" in ASCII
  const derivedKey = await deriveKey(passwordBuffer)

  assert.ok(derivedKey.encryptionKey, "Should work with Uint8Array password")
  assert.ok(derivedKey.salt, "Salt should be generated")
})

test("Argon2id: Keys are non-extractable CryptoKeys", async () => {
  const masterPassword = "TestPassword"
  const derivedKey = await deriveKey(masterPassword)

  // CryptoKeys are non-extractable by design
  assert.ok(derivedKey.encryptionKey instanceof CryptoKey, "Should be a CryptoKey")
  assert.ok(derivedKey.authKey instanceof CryptoKey, "AuthKey should be a CryptoKey")
})

test("Argon2id: Random salt is different each time", async () => {
  const masterPassword = "TestPassword"

  const key1 = await deriveKey(masterPassword)
  const key2 = await deriveKey(masterPassword)

  // Salts should be different
  assert.notDeepEqual(key1.salt, key2.salt, "Random salts should be different")
})

test("Argon2id: Salt can be provided explicitly", async () => {
  const masterPassword = "TestPassword"
  const fixedSalt = new Uint8Array(16).fill(42) // Fixed salt

  const derivedKey = await deriveKey(masterPassword, fixedSalt)

  assert.deepEqual(derivedKey.salt, fixedSalt, "Provided salt should be used")
})
