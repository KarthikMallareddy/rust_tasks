/**
 * Tests for high-level Vault API
 * 
 * Test coverage:
 * - Encryption and decryption workflows
 * - Vault entry validation
 * - Error handling
 * - Zero-knowledge principles
 */

import { test } from "node:test"
import * as assert from "node:assert"
import {
  encryptVault,
  decryptVault,
  validateVaultEntry,
  createVaultEntry,
} from "../src/vault.js"
import type { VaultEntry } from "../src/types.js"

test("Vault: Encrypt vault with master password", async () => {
  const masterPassword = "MyMasterPassword123!"
  const entry: VaultEntry = {
    site: "example.com",
    username: "user@example.com",
    password: "SecretPassword",
  }

  const encrypted = await encryptVault(masterPassword, entry)

  assert.ok(encrypted.ciphertext, "Ciphertext should exist")
  assert.ok(encrypted.iv, "IV should exist")
  assert.ok(encrypted.salt, "Salt should exist")
  assert.equal(encrypted.algorithm, "AES-256-GCM")
  assert.equal(encrypted.derivationAlgorithm, "Argon2id")
})

test("Vault: Decrypt vault with correct password", async () => {
  const masterPassword = "TestPassword123"
  const entry: VaultEntry = {
    site: "github.com",
    username: "developer",
    password: "GithubToken2024",
  }

  const encrypted = await encryptVault(masterPassword, entry)
  const result = await decryptVault(masterPassword, encrypted)

  assert.ok(result.success, "Decryption should succeed")
  assert.deepEqual(result.data, entry, "Decrypted data should match original")
})

test("Vault: Reject decryption with wrong password", async () => {
  const masterPassword = "CorrectPassword"
  const wrongPassword = "WrongPassword"
  const entry: VaultEntry = {
    site: "secure.com",
    username: "user",
    password: "password",
  }

  const encrypted = await encryptVault(masterPassword, entry)
  const result = await decryptVault(wrongPassword, encrypted)

  assert.ok(!result.success, "Decryption with wrong password should fail")
  assert.ok(result.error, "Error message should be provided")
})

test("Vault: Validate correct vault entry", () => {
  const validEntry: VaultEntry = {
    site: "example.com",
    username: "user",
    password: "password",
  }

  assert.ok(validateVaultEntry(validEntry), "Valid entry should pass validation")
})

test("Vault: Reject entry with missing site", () => {
  const invalidEntry = {
    site: "",
    username: "user",
    password: "password",
  } as VaultEntry

  assert.ok(!validateVaultEntry(invalidEntry), "Entry with empty site should fail validation")
})

test("Vault: Reject entry with missing username", () => {
  const invalidEntry = {
    site: "example.com",
    username: "",
    password: "password",
  } as VaultEntry

  assert.ok(!validateVaultEntry(invalidEntry), "Entry with empty username should fail validation")
})

test("Vault: Reject entry with missing password", () => {
  const invalidEntry = {
    site: "example.com",
    username: "user",
    password: "",
  } as VaultEntry

  assert.ok(!validateVaultEntry(invalidEntry), "Entry with empty password should fail validation")
})

test("Vault: Create vault entry with factory function", () => {
  const entry = createVaultEntry("github.com", "user", "pass123")

  assert.ok(entry, "Entry should be created")
  assert.equal(entry.site, "github.com")
  assert.equal(entry.username, "user")
  assert.equal(entry.password, "pass123")
})

test("Vault: Round-trip encryption/decryption preserves data", async () => {
  const masterPassword = "MasterPass"
  const entries: VaultEntry[] = [
    {
      site: "github.com",
      username: "dev",
      password: "token123",
    },
    {
      site: "gmail.com",
      username: "email@gmail.com",
      password: "gmailpass",
      metadata: {
        created: "2024-01-01",
      },
    },
  ]

  for (const entry of entries) {
    const encrypted = await encryptVault(masterPassword, entry)
    const result = await decryptVault(masterPassword, encrypted)

    assert.ok(result.success, `Should decrypt entry for ${entry.site}`)
    assert.deepEqual(result.data, entry, `Data should match for ${entry.site}`)
  }
})

test("Vault: Each encryption produces unique ciphertext", async () => {
  const masterPassword = "TestPassword"
  const entry: VaultEntry = {
    site: "test.com",
    username: "user",
    password: "pass",
  }

  const encrypted1 = await encryptVault(masterPassword, entry)
  const encrypted2 = await encryptVault(masterPassword, entry)

  assert.notEqual(
    encrypted1.ciphertext,
    encrypted2.ciphertext,
    "Different encryptions should produce different ciphertexts"
  )
  assert.notEqual(
    encrypted1.iv,
    encrypted2.iv,
    "Different encryptions should have different IVs"
  )
  assert.notEqual(
    encrypted1.salt,
    encrypted2.salt,
    "Different encryptions should have different salts"
  )
})

test("Vault: Handle vault entry with metadata", async () => {
  const masterPassword = "TestPassword"
  const entry: VaultEntry = {
    site: "bank.com",
    username: "john",
    password: "bankpass",
    metadata: {
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-29T00:00:00Z",
      securityQuestion: "What is your pet's name?",
      answer: "Fluffy",
    },
  }

  const encrypted = await encryptVault(masterPassword, entry)
  const result = await decryptVault(masterPassword, encrypted)

  assert.ok(result.success, "Should decrypt")
  assert.deepEqual(result.data.metadata, entry.metadata, "Metadata should be preserved")
})

test("Vault: Detect wrong password early in workflow", async () => {
  const masterPassword = "CorrectPassword"
  const entry: VaultEntry = {
    site: "test.com",
    username: "user",
    password: "password",
  }

  const encrypted = await encryptVault(masterPassword, entry)
  const wrongResult = await decryptVault("WrongPassword", encrypted)

  assert.ok(!wrongResult.success, "Wrong password should be detected")
  assert.ok(wrongResult.error, "Error should describe the issue")
})
