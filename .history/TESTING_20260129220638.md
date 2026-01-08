# Test Suite Documentation

## Overview

This project includes comprehensive test coverage for:
- **Crypto Engine**: Cryptographic primitives (Argon2id, AES-256-GCM, vault operations)
- **Backend**: Authentication service, synchronization service, API routes

## Test Files Created

### Crypto Engine Tests

#### 1. `packages/crypto-engine/test/argon2.test.ts`
Tests for key derivation using Argon2id.

**Coverage:**
- ✅ Key derivation from master password
- ✅ Salt generation and consistency
- ✅ Different passwords produce different keys
- ✅ Custom Argon2id options
- ✅ Uint8Array password handling
- ✅ Non-extractable CryptoKey generation
- ✅ Random salt generation
- ✅ Fixed salt usage

**Run:** `npm run test` (from crypto-engine package)

#### 2. `packages/crypto-engine/test/aes.test.ts`
Tests for AES-256-GCM encryption and decryption.

**Coverage:**
- ✅ Encryption of vault entries
- ✅ Decryption returns correct entry
- ✅ Different ciphertexts for same entry (random IV)
- ✅ Metadata preservation
- ✅ Special characters handling
- ✅ Long password support
- ✅ Tampered ciphertext detection
- ✅ Wrong key rejection
- ✅ IV size validation (12 bytes)
- ✅ Large data handling (100KB+)

**Run:** `npm run test` (from crypto-engine package)

#### 3. `packages/crypto-engine/test/vault.test.ts`
Tests for high-level vault API (encryption/decryption workflows).

**Coverage:**
- ✅ Vault encryption with master password
- ✅ Vault decryption with correct password
- ✅ Wrong password rejection
- ✅ Vault entry validation
- ✅ Entry with missing site/username/password
- ✅ Factory function (createVaultEntry)
- ✅ Round-trip encryption/decryption
- ✅ Unique ciphertext per encryption
- ✅ Metadata preservation
- ✅ Wrong password detection

**Run:** `npm run test` (from crypto-engine package)

### Backend Tests

#### 4. `packages/backend/test/auth.test.ts`
Tests for authentication service.

**Coverage:**
- ✅ User registration
- ✅ Duplicate user prevention
- ✅ Session token generation
- ✅ User authentication with credentials
- ✅ Wrong email rejection
- ✅ Wrong verifier rejection
- ✅ User salt retrieval
- ✅ Non-existent user handling
- ✅ Unique token generation
- ✅ Field validation

**Run:** `npm run test` (from backend package)

#### 5. `packages/backend/test/sync.test.ts`
Tests for synchronization service.

**Coverage:**
- ✅ Push encrypted vault to server
- ✅ Missing userId validation
- ✅ Pull vaults for user
- ✅ Version filtering
- ✅ Sync metadata retrieval
- ✅ Multiple device support
- ✅ Encrypted metadata handling
- ✅ Full vault pull (version 0)
- ✅ Large vault data handling

**Run:** `npm run test` (from backend package)

#### 6. `packages/backend/test/routes.test.ts`
Tests for API route structures and validation.

**Coverage:**
- ✅ Health check endpoint
- ✅ Register request validation
- ✅ Login request validation
- ✅ Push request validation
- ✅ Pull request validation
- ✅ Error response structure
- ✅ Success response structure
- ✅ Bearer token extraction
- ✅ Missing auth header detection
- ✅ Invalid auth format rejection

**Run:** `npm run test` (from backend package)

---

## Running Tests

### Build and Test Everything
```bash
npm run test:all
```

### Test Individual Package

**Crypto Engine:**
```bash
cd packages/crypto-engine
npm run build
npm run test
```

**Backend:**
```bash
cd packages/backend
npm run build
npm run test
```

### Watch Mode (Auto-rerun on file changes)
```bash
npm run test:watch
```

### Test Coverage
```bash
npm run test:coverage
```

---

## Test Environment

- **Node.js**: Version 18.0.0 or higher (required for `--test` flag)
- **Framework**: Node.js native test runner (no external dependencies)
- **TypeScript**: Tests are compiled via `tsc` before running

### Key Testing Libraries
- `node:test` - Native Node.js test runner
- `node:assert` - Assertions

No external test frameworks like Jest or Mocha needed!

---

## Test Statistics

| Package | Test Files | Total Tests | Coverage Areas |
|---------|-----------|-------------|-----------------|
| crypto-engine | 3 files | ~40 tests | Key derivation, encryption, vault ops |
| backend | 3 files | ~30 tests | Auth, sync, API validation |
| **Total** | **6 files** | **~70 tests** | Full zero-knowledge flow |

---

## Security-Focused Test Cases

All tests validate zero-knowledge principles:

1. **Master password never exposed** - Tests verify password doesn't leak
2. **Encryption integrity** - Tests detect tampered ciphertext
3. **Key non-extractability** - CryptoKeys remain in memory
4. **Authentication without password** - Verifies SRP-style auth
5. **Metadata privacy** - All data encrypted, including metadata
6. **Wrong password detection** - Early rejection without revealing info

---

## Adding New Tests

To add new tests, follow this pattern:

```typescript
import { test } from "node:test"
import * as assert from "node:assert"

test("Feature: Description of what is tested", async () => {
  // Arrange
  const input = { /* ... */ }
  
  // Act
  const result = await functionToTest(input)
  
  // Assert
  assert.ok(result, "Assertion message")
  assert.equal(result.property, expectedValue)
})
```

Place test files in `test/` directory with `.test.ts` extension.

---

## CI/CD Integration

These tests are ready for GitHub Actions:

```yaml
- name: Test
  run: |
    npm run build
    npm run test
```

---

## Known Limitations

1. **No database mocking**: Backend tests use real MongoDB connection (ensure local instance running)
2. **CryptoKey inspection**: Cannot directly compare CryptoKey objects, only test behavior
3. **Memory wiping**: JavaScript best-effort only (noted in tests)
4. **Extension tests**: Not included (requires browser environment)

---

## Next Steps

1. **Set up CI/CD**: Integrate tests into GitHub Actions
2. **Add integration tests**: Test end-to-end flows
3. **Add performance benchmarks**: Measure crypto operations speed
4. **Browser compatibility**: Add browser tests for extension code
5. **Security audit tests**: Add penetration test scenarios

