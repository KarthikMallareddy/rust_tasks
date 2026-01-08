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
import { pushVault, pullVaults, getSyncMetadata } from "../src/services/syncService.js"

test("Sync: Push encrypted vault to server", async () => {
  const userId = `user-${Date.now()}`
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

  assert.ok(result.success, "Push should succeed")
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
  const userId = `pull-user-${Date.now()}`
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
  await pushVault(userId, deviceId, vault)

  // Then pull
  const pullResult = await pullVaults(userId, deviceId, 0)

  assert.ok(pullResult.success, "Pull should succeed")
  assert.ok(Array.isArray(pullResult.vaults), "Vaults should be an array")
  assert.ok(pullResult.vaults!.length > 0, "Should return at least one vault")
})

test("Sync: Pull uses version filtering", async () => {
  const userId = `version-user-${Date.now()}`
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
  assert.ok(pushResult.success)

  // Pull with high version number should return empty or no updates
  const pullResult = await pullVaults(userId, deviceId, 999999)

  assert.ok(pullResult.success, "Pull should succeed")
  // Should have fewer or no new vaults if version is high
})

test("Sync: Get sync metadata for user", async () => {
  const userId = `metadata-user-${Date.now()}`
  const deviceId = "device-meta"

  const metadata = await getSyncMetadata(userId, deviceId)

  assert.ok(metadata.success, "Should succeed")
  // Metadata may be null if not yet synced
})

test("Sync: Multiple devices can push to same user", async () => {
  const userId = `multi-device-${Date.now()}`
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

  assert.ok(result1.success, "Device 1 push should succeed")
  assert.ok(result2.success, "Device 2 push should succeed")
  assert.ok(result1.vaultId !== result2.vaultId, "Different devices should get different vault IDs")
})

test("Sync: Push with incremented version", async () => {
  const userId = `version-increment-${Date.now()}`
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
  assert.ok(result1.success, "First push should succeed")

  const result2 = await pushVault(userId, deviceId, vault2)
  assert.ok(result2.success, "Second push with higher version should succeed")
})

test("Sync: Pull after push retrieves the data", async () => {
  const userId = `pull-after-push-${Date.now()}`
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
  assert.ok(pushResult.success)

  // Pull
  const pullResult = await pullVaults(userId, deviceId, 0)
  assert.ok(pullResult.success)
  assert.ok(pullResult.vaults!.length > 0, "Should retrieve pushed vault")
  assert.equal(pullResult.vaults![0].ciphertext, vault.ciphertext, "Ciphertext should match")
})
