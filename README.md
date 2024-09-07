# Mnemonic Backup
![NPM Version](https://img.shields.io/npm/v/mnemonic-backup) ![NPM License](https://img.shields.io/npm/l/mnemonic-backup) ![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/mnemonic-backup)

> A mnemonic solution for backup/recovery codes.

Mnemonic Backup is an implementation of 14-word Mnemonic Backup Phrases, designed for use cases such as backup and recovery codes. To get started, install install the library:
```bash
npm install mnemonic-backup
```
This library consists of five functions: **generateMnemonic**, **generateKey**, **prepareKey**, **encryptMnemonic**, and **decryptMnemonic**. These functions are used in the creation of mnemonic phrases, cryptographic keys, and for the encryption and decryption of Mnemonic Backup Phrases.

## Mnemonic Phrase Generation
The Mnemonic Phrase is generated using the `generateMnemonic`  function, entropy is used to obtain a mnemonic by mapping 11-bit segments to words in the BIP39 English wordlist from **@scure/bip39**.
```js
generateMnemonic(entropy);
```
This function expects a single optional `entropy` parameter, expecting 154 bits of entropy directly as bits when provided. If the `entropy` parameter is not provided, entropy is generated locally with the Node.js **Crypto** module's `crypto.randomBytes();` function.

*Example use with "entropy" provided:*
```js
const { generateMnemonic } = require('mnemonic-backup');

// 176 Bits of entropy in Hex
const hex = "596F75206A757374206C6F7374205468652047616D65";
// Obtain Bits from Hex
const entropy = hex.split('').map(char => parseInt(char, 16).toString(2).padStart(4, '0')).join('');

const mnemonic = generateMnemonic(entropy);
console.log("Mnemonic Phrase:", mnemonic);

// Function Output 
// Mnemonic Phrase: floor knife elite stay fire ring like mistake inflict patient bench speak faith casual

```
*The function returns a 14-word Mnemonic Phrase derived from the generated or provided entropy in the output.*

## Obtaining a Cryptographic Key

### Generating a Key
A Cryptographic Key is derived from the last word of the 14 word Mnemonic Phrase using the **PBKDF2** (Password-Based Key Derivation Function 2) asynchronous key derivation function.
```js
crypto.pbkdf2(password, salt, iterations, keylen, digest, callback);
```
In this setup, the last word of the Mnemonic Phrase is supplied as the `password`. A Buffer is obtained from the first 13 words of the Mnemonic Phrase, then encoded in base58 (**@scure/base**) to derive a `salt`. A number of `iterations` is provided, the requested byte length of the key (`keylen`) is set to *32*, and the `digest` is set to *SHA512*.

### Using the `generateKey` function.
To generate the Cryptographic Key, the `generateKey` function is used. 
```js
generateKey(mnemonic, iterations);
```
This function expects a `mnemonic` parameter, which should be the Mnemonic Phrase. An optional `iterations` parameter may also be provided, allowing the number of iterations to be specified. If no number is provided, a default of *210,000* will be used, based on the [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2) recommendations for **PBKDF2-HMAC-SHA512**.

*Example use without "iterations" provided:*
```js
const { generateKey } = require('mnemonic-backup');

// 14 Word Mnemonic Phrase
const mnemonic = "floor knife elite stay fire ring like mistake inflict patient bench speak faith casual";

generateKey(mnemonic)
    .then((key) => {
        console.log("Cryptographic Key:", key);
    });

// Function Output
// Cryptographic Key: 1b0b26d1325109b4b2235c83960c185d8651633523d95e33f6f1551299ec7b68

```
*The function returns a Cryptographic Key derived from the provided Mnemonic Phrase in the output.*

### Preparing a Key
The Cryptographic Key is prepared with salting and peppering, using the **PBKDF2** synchronous key derivation function.
```js
crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
```
Here, the Cryptographic Key is peppered and supplied as the `password`. A Buffer of a salt is provided as `salt`, a number of `iterations` is provided, the requested byte length of the key (`keylen`) is set to *32*, and the `digest` is set to *SHA256*.

### Using the `prepareKey` function
To prepare a Cryptographic Key, the `prepareKey` function is used.
```js
prepareKey(key, pepper, salt, iterations);
```
This function expects a `key` parameter, which should be the Cryptographic Key. A `pepper` and a `salt` parameter are expected, provided for peppering and salting the key. An optional `iterations` parameter may also be provided, allowing the number of iterations to be specified. If no number is provided, a default of *600,000* will be used, based on the [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2) recommendations for **PBKDF2-HMAC-SHA256**.

*Example use with "iterations" provided:*
```js
const { prepareKey } = require('./src/index');

// Cryptographic Key
const key = "1b0b26d1325109b4b2235c83960c185d8651633523d95e33f6f1551299ec7b68"

// Pepper and Salt
const pepper = "54455354494E4720534F4D455448494E47"
const salt = "48454C4C4F";

// Iterations set to 750,000
const iterations = 750000;

const preparedKey = prepareKey(key, pepper, salt, iterations);
console.log("Prepared Key:", preparedKey);

// Function Output 
// Prepared Key: fa73e7bf88788dd087e3e620ded7e4fc0e43c771213ea1e867ff486a2349c37d

```
*The function returns the prepared cryptographic key in the output.*

## Encrypting the Mnemonic Phrase
A cypher is created by encrypting the Mnemonic Phrase with **AES** (Advanced Encryption Standard) at a length of 256 bits using **GCM** (Galois/Counter Mode).
```js
crypto.createCipheriv(algorithm, key, iv[, options]);
```
In this setup, the `algorithm` is *aes-256-gcm*, with the `key` being a Buffer of a provided cryptographic key. A Buffer of an Initialization Vector (`iv`) is also provided. The Mnemonic Phrase is then encrypted using `.update(mnemonic, 'utf8', 'hex');`, and an Authentication Tag is returned with `.getAuthTag().toString('hex');` as a hexadecimal string.

### Using the `encryptMnemonic` function
To encrypt the Mnemonic Phrase/create a cypher, the `encryptMnemonic` function is used.
```js
encryptMnemonic(mnemonic, key, iv);
```
This function expects a `mnemonic` parameter, which should be a Mnemonic Phrase, and a `key` parameter, which should be a cryptographic key (using a prepared key is recommended). An optional Initialization Vector (`iv`) parameter is accepted, which is expected to be provided as a hexadecimal string (24 characters). If no Initialization Vector is provided, a Buffer of 12 random bytes (`crypto.randomBytes(12);`) is used.

*Example use:*
```js
const { encryptMnemonic } = require('mnemonic-backup');

// 14 Word Mnemonic Phrase
const mnemonic = "floor knife elite stay fire ring like mistake inflict patient bench speak faith casual";

// Cryptographic Key (prepared key)
const key = "fa73e7bf88788dd087e3e620ded7e4fc0e43c771213ea1e867ff486a2349c37d";

// Initialization Vector provided in Hex
const iv = "44494e4f5341555253212121";

const result = encryptMnemonic(mnemonic, key, iv);
    console.log("Cyphertext:", result.cyphertext);
    console.log("IV:", result.iv);
    console.log("Auth Tag:", result.authTag);

// Function Output
// Cyphertext: 6e8cbaafd728268b6af57b6efcd8127c1320add5eafde1bf96d254e76a7fb57e9935ecc291650124a6ac5d8a5489de070ff8e2cd34ae141a0abf06315193d1d604194c36958f5025261ef72ba9b46634d6809173599a
// IV: 44494e4f5341555253212121
// Auth Tag: b9b59deb711ac178d48efa3f6ae5ddb5

```
*The function returns the Cyphertext, Initialization Vector, and Authentication Tag from the encryption of the Mnemonic Phrase in the output.*

## Decryption
A cypher/encrypted Mnemonic Phrase is decrypted using the *cyphertext* and *authTag* from the encryption output, along with the same key and Initialization Vector used for encryption.
```js
crypto.createDecipheriv(algorithm, key, iv[, options]);
```
The `algorithm` used for decryption is the same used for encryption, *aes-256-gcm*, with the `key` being a Buffer of a provided cryptographic key. A Buffer of an Initialization Vector (`iv`) is also provided. The Authentication Tag (*authTag*) is set using `.setAuthTag(authTagBuffer);` with a Buffer of the Authentication Tag.

### Using the `decryptMnemonic` function
To decrypt the cyphertext of a Mnemonic Phrase, the `decryptMnemonic` function is used.
```js
decryptMnemonic(cyphertext, key, iv, authTag);
```
This function expects a `cyphertext` parameter, containing the cyphertext of the encrypted Mnemonic Phrase, along with a `key`, an `iv`, and an `authTag` parameter, expecting the same cryptographic key, initilization vector, and authentication tag used during encryption.

*Example use:*
```js
const { decryptMnemonic } = require('mnemonic-backup');

// Cryptographic Key
const key = "fa73e7bf88788dd087e3e620ded7e4fc0e43c771213ea1e867ff486a2349c37d";

// cyphertext, iv, and authTag from Encryption
const cyphertext = "6e8cbaafd728268b6af57b6efcd8127c1320add5eafde1bf96d254e76a7fb57e9935ecc291650124a6ac5d8a5489de070ff8e2cd34ae141a0abf06315193d1d604194c36958f5025261ef72ba9b46634d6809173599a";
const iv = "44494e4f5341555253212121";
const authTag = "b9b59deb711ac178d48efa3f6ae5ddb5";

const decryptedMnemonic = decryptMnemonic(cyphertext, key, iv, authTag);
console.log("Decrypted Mnemonic:", decryptedMnemonic);

// Function Output
// Decrypted Mnemonic: floor knife elite stay fire ring like mistake inflict patient bench speak faith casual

```
*The function returns the decrypted Mnemonic Phrase in the output.*
