/**
 * Tests for authentication service and routes
 * 
 * Test coverage:
 * - User registration
 * - User authentication
 * - Session token generation
 * - Salt retrieval
 * - Error handling
 */

import { test } from "node:test"
import * as assert from "node:assert"
import { registerUser, authenticateUser, generateSessionToken, getUserSalt } from "../src/services/authService.js"

test("Auth: Register new user", async () => {
  const email = `test-${Date.now()}@example.com`
  const salt = "testSalt123"
  const verifier = "testVerifier456"

  const user = await registerUser(email, salt, verifier)

  assert.ok(user.id, "User ID should be generated")
  assert.equal(user.email, email, "Email should match")
  assert.equal(user.salt, salt, "Salt should match")
  assert.equal(user.verifier, verifier, "Verifier should match")
})

test("Auth: Prevent duplicate user registration", async () => {
  const email = `duplicate-${Date.now()}@example.com`
  const salt = "salt123"
  const verifier = "verifier123"

  await registerUser(email, salt, verifier)

  try {
    await registerUser(email, salt, verifier)
    assert.fail("Should have thrown error for duplicate email")
  } catch (error: any) {
    assert.ok(error.message.includes("already exists") || error.code === 11000)
  }
})

test("Auth: Generate session token", async () => {
  const userId = "test-user-123"
  const token = await generateSessionToken(userId)

  assert.ok(token, "Token should be generated")
  assert.ok(typeof token === "string", "Token should be a string")
  assert.ok(token.length > 20, "Token should be long enough")
})

test("Auth: Authenticate user with correct credentials", async () => {
  const email = `auth-test-${Date.now()}@example.com`
  const salt = "authSalt"
  const verifier = "authVerifier"

  // Register user
  const user = await registerUser(email, salt, verifier)

  // Authenticate
  const authResult = await authenticateUser(email, "challenge", verifier)

  assert.ok(authResult.success, "Authentication should succeed")
  assert.ok(authResult.user, "User should be returned")
  assert.equal(authResult.user?.email, email, "Email should match")
})

test("Auth: Reject authentication with wrong email", async () => {
  const email = `auth-test-${Date.now()}@example.com`
  const salt = "authSalt"
  const verifier = "authVerifier"

  // Register user
  await registerUser(email, salt, verifier)

  // Try to authenticate with wrong email
  const authResult = await authenticateUser("wrong@example.com", "challenge", verifier)

  assert.ok(!authResult.success, "Authentication should fail with wrong email")
})

test("Auth: Reject authentication with wrong verifier", async () => {
  const email = `auth-test-${Date.now()}@example.com`
  const salt = "authSalt"
  const verifier = "correctVerifier"

  // Register user
  await registerUser(email, salt, verifier)

  // Try to authenticate with wrong verifier
  const authResult = await authenticateUser(email, "challenge", "wrongVerifier")

  assert.ok(!authResult.success, "Authentication should fail with wrong verifier")
})

test("Auth: Get user salt for login", async () => {
  const email = `salt-test-${Date.now()}@example.com`
  const salt = "uniqueSalt789"
  const verifier = "verifier"

  // Register user
  await registerUser(email, salt, verifier)

  // Get salt
  const userSalt = await getUserSalt(email)

  assert.ok(userSalt, "Salt should be returned")
  assert.equal(userSalt, salt, "Salt should match registered salt")
})

test("Auth: Get salt for non-existent user returns null", async () => {
  const userSalt = await getUserSalt("nonexistent@example.com")

  assert.equal(userSalt, null, "Should return null for non-existent user")
})

test("Auth: Session token is unique for each generation", async () => {
  const userId = "test-user"
  const token1 = await generateSessionToken(userId)
  const token2 = await generateSessionToken(userId)

  assert.notEqual(token1, token2, "Tokens should be unique")
})

test("Auth: User registration stores all required fields", async () => {
  const email = `fields-test-${Date.now()}@example.com`
  const salt = "testSalt"
  const verifier = "testVerifier"

  const user = await registerUser(email, salt, verifier)

  assert.ok(user.id, "ID should exist")
  assert.ok(user.email, "Email should exist")
  assert.ok(user.salt, "Salt should exist")
  assert.ok(user.verifier, "Verifier should exist")
  assert.ok(user.createdAt, "CreatedAt should exist")
})
