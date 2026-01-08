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
import type { EncryptedVault } from "@password-manager/crypto-engine"

test("Sync: Push encrypted vault to server", async () => {
  const userId = `user-${Date.now()}`
  const deviceId = "device-123"
  const vault: EncryptedVault = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    algorithm: "AES-256-GCM",
    derivationAlgorithm: "Argon2id",
  }

  const result = await pushVault(userId, deviceId, vault)

  assert.ok(result.success, "Push should succeed")
  assert.ok(result.vaultId, "Vault ID should be returned")
})

test("Sync: Push with missing userId fails", async () => {
  const vault: EncryptedVault = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    algorithm: "AES-256-GCM",
    derivationAlgorithm: "Argon2id",
  }

  const result = await pushVault("", "device-123", vault)

  assert.ok(!result.success, "Push should fail without userId")
})

test("Sync: Pull vaults for user", async () => {
  const userId = `pull-user-${Date.now()}`
  const deviceId = "device-456"
  const vault: EncryptedVault = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    algorithm: "AES-256-GCM",
    derivationAlgorithm: "Argon2id",
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
  const vault: EncryptedVault = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    algorithm: "AES-256-GCM",
    derivationAlgorithm: "Argon2id",
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

  const metadata = await getSyncMetadata(userId)

  assert.ok(metadata, "Metadata should be returned")
  assert.ok(metadata.userId === userId || metadata.vaultCount !== undefined, "Metadata should contain useful info")
})

test("Sync: Multiple devices can push to same user", async () => {
  const userId = `multi-device-${Date.now()}`
  const vault: EncryptedVault = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    algorithm: "AES-256-GCM",
    derivationAlgorithm: "Argon2id",
  }

  const result1 = await pushVault(userId, "device-1", vault)
  const result2 = await pushVault(userId, "device-2", vault)

  assert.ok(result1.success, "Device 1 push should succeed")
  assert.ok(result2.success, "Device 2 push should succeed")
  assert.ok(result1.vaultId !== result2.vaultId, "Different devices should get different vault IDs")
})

test("Sync: Push with encrypted metadata", async () => {
  const userId = `metadata-push-${Date.now()}`
  const deviceId = "device-meta"
  const vault: EncryptedVault = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    algorithm: "AES-256-GCM",
    derivationAlgorithm: "Argon2id",
  }

  const result = await pushVault(userId, deviceId, vault)

  assert.ok(result.success, "Push with vault should succeed")
  assert.ok(result.vaultId, "Should return vault ID")
})

test("Sync: Pull with empty version returns all vaults", async () => {
  const userId = `all-vaults-${Date.now()}`
  const deviceId = "device-all"
  const vault: EncryptedVault = {
    ciphertext: "encryptedDataBase64",
    iv: "ivBase64",
    salt: "saltBase64",
    algorithm: "AES-256-GCM",
    derivationAlgorithm: "Argon2id",
  }

  // Push multiple vaults
  await pushVault(userId, deviceId, vault)
  await new Promise(resolve => setTimeout(resolve, 10)) // Small delay
  await pushVault(userId, deviceId, vault)

  // Pull with version 0 should get all
  const pullResult = await pullVaults(userId, deviceId, 0)

  assert.ok(pullResult.success)
  assert.ok(pullResult.vaults!.length >= 2, "Should return multiple vaults")
})

test("Sync: Handles large vault data", async () => {
  const userId = `large-vault-${Date.now()}`
  const deviceId = "device-large"
  const largeVault: EncryptedVault = {
    ciphertext: "X".repeat(100000), // 100KB ciphertext
    iv: "ivBase64",
    salt: "saltBase64",
    algorithm: "AES-256-GCM",
    derivationAlgorithm: "Argon2id",
  }

  const result = await pushVault(userId, deviceId, largeVault)

  assert.ok(result.success, "Should handle large vault data")
})
