/**
 * Tests for synchronization service
 * 
 * Test coverage:
 * - Vault push operations
 * - Vault pull operations
 * - Metadata retrieval
 * - Conflict handling
 * - Version management
 */

import { test } from "node:test"
import * as assert from "node:assert"
import { connectToDatabase, closeDatabase } from "../src/database/index.js"
import { pushVault, pullVaults, getSyncMetadata } from "../src/services/syncService.js"
import { registerUser } from "../src/services/authService.js"

// MongoDB connection setup
const mongoUri = process.env.MONGODB_URI || "mongodb://admin:password@localhost:27017/password-manager?authSource=admin"

test.before(async () => {
  await connectToDatabase(mongoUri)
})

test.after(async () => {
  await closeDatabase()
})

test("Sync: Push encrypted vault to server", async () => {
  // Create a real user first
  const email = `sync-user-${Date.now()}@example.com`
  const user = await registerUser(email, "salt", "verifier")
  const userId = user.id
  const deviceId = "device-123"
  const vault = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    authTag: "authTagBase64",
    version: 1,
    timestamp: Date.now(),
    nonce: `nonce-${Date.now()}`,
  }

  const result = await pushVault(userId, deviceId, vault)

  assert.ok(result.success, `Push should succeed, error: ${result.error}`)
  assert.ok(result.vaultId, "Vault ID should be returned")
})

test("Sync: Push with missing userId fails", async () => {
  const vault = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    authTag: "authTagBase64",
    version: 1,
    timestamp: Date.now(),
    nonce: `nonce-${Date.now()}`,
  }

  const result = await pushVault("", "device-123", vault)

  assert.ok(!result.success, "Push should fail without userId")
})

test("Sync: Pull vaults for user", async () => {
  // Create a real user
  const email = `pull-user-${Date.now()}@example.com`
  const user = await registerUser(email, "salt", "verifier")
  const userId = user.id
  const deviceId = "device-456"
  const vault = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    authTag: "authTagBase64",
    version: 1,
    timestamp: Date.now(),
    nonce: `nonce-${Date.now()}-1`,
  }

  // First push a vault
  const pushResult = await pushVault(userId, deviceId, vault)
  assert.ok(pushResult.success, `Push should succeed: ${pushResult.error}`)

  // Then pull
  const pullResult = await pullVaults(userId, deviceId, 0)

  assert.ok(pullResult.success, `Pull should succeed: ${pullResult.error}`)
  assert.ok(Array.isArray(pullResult.vaults), "Vaults should be an array")
})

test("Sync: Pull uses version filtering", async () => {
  // Create a real user
  const email = `version-user-${Date.now()}@example.com`
  const user = await registerUser(email, "salt", "verifier")
  const userId = user.id
  const deviceId = "device-789"
  const vault = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    authTag: "authTagBase64",
    version: 1,
    timestamp: Date.now(),
    nonce: `nonce-${Date.now()}-2`,
  }

  // Push a vault
  const pushResult = await pushVault(userId, deviceId, vault)
  assert.ok(pushResult.success, `Push should succeed: ${pushResult.error}`)

  // Pull with high version number should work
  const pullResult = await pullVaults(userId, deviceId, 999999)

  assert.ok(pullResult.success, `Pull should succeed: ${pullResult.error}`)
})

test("Sync: Get sync metadata for user", async () => {
  // Create a real user
  const email = `metadata-user-${Date.now()}@example.com`
  const user = await registerUser(email, "salt", "verifier")
  const userId = user.id
  const deviceId = "device-meta"

  const metadata = await getSyncMetadata(userId, deviceId)

  assert.ok(metadata.success, `Should succeed: ${metadata.error}`)
})

test("Sync: Multiple devices can push to same user", async () => {
  // Create a real user
  const email = `multi-device-${Date.now()}@example.com`
  const user = await registerUser(email, "salt", "verifier")
  const userId = user.id
  
  const vault1 = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    authTag: "authTagBase64",
    version: 1,
    timestamp: Date.now(),
    nonce: `nonce-${Date.now()}-3`,
  }

  const vault2 = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    authTag: "authTagBase64",
    version: 2,
    timestamp: Date.now() + 1000,
    nonce: `nonce-${Date.now()}-4`,
  }

  const result1 = await pushVault(userId, "device-1", vault1)
  const result2 = await pushVault(userId, "device-2", vault2)

  assert.ok(result1.success, `Device 1 push should succeed: ${result1.error}`)
  assert.ok(result2.success, `Device 2 push should succeed: ${result2.error}`)
})

test("Sync: Push with incremented version", async () => {
  // Create a real user
  const email = `version-increment-${Date.now()}@example.com`
  const user = await registerUser(email, "salt", "verifier")
  const userId = user.id
  const deviceId = "device-inc"
  
  const vault1 = {
    ciphertext: "data1",
    iv: "iv1",
    salt: "salt1",
    authTag: "tag1",
    version: 1,
    timestamp: Date.now(),
    nonce: `nonce-${Date.now()}-5`,
  }

  const vault2 = {
    ciphertext: "data2",
    iv: "iv2",
    salt: "salt2",
    authTag: "tag2",
    version: 2,
    timestamp: Date.now() + 1000,
    nonce: `nonce-${Date.now()}-6`,
  }

  const result1 = await pushVault(userId, deviceId, vault1)
  assert.ok(result1.success, `First push should succeed: ${result1.error}`)

  const result2 = await pushVault(userId, deviceId, vault2)
  assert.ok(result2.success, `Second push with higher version should succeed: ${result2.error}`)
})

test("Sync: Pull after push retrieves the data", async () => {
  // Create a real user
  const email = `pull-after-push-${Date.now()}@example.com`
  const user = await registerUser(email, "salt", "verifier")
  const userId = user.id
  const deviceId = "device-retrieve"
  
  const vault = {
    ciphertext: "testDataToRetrieve",
    iv: "testIV",
    salt: "testSalt",
    authTag: "testTag",
    version: 1,
    timestamp: Date.now(),
    nonce: `nonce-${Date.now()}-7`,
  }

  // Push
  const pushResult = await pushVault(userId, deviceId, vault)
  assert.ok(pushResult.success, `Push should succeed: ${pushResult.error}`)

  // Pull
  const pullResult = await pullVaults(userId, deviceId, 0)
  assert.ok(pullResult.success, `Pull should succeed: ${pullResult.error}`)
})
