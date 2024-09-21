# Mnemonic Backup
![NPM Version](https://img.shields.io/npm/v/mnemonic-backup) ![NPM License](https://img.shields.io/npm/l/mnemonic-backup) ![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/mnemonic-backup)

> A mnemonic solution for backup/recovery codes.

Mnemonic Backup is an implementation of 14-word Mnemonic Backup Phrases. These backup phrases are intended for use as a more user-friendly/memorable alternative to traditional backup/recovery codes. The primary functionality of this library concerns the encryption of mnemonics, using keys derived from the same mnemonics via deterministic functions. In an implementation such as part of a user account system, backup phrases can be used to verify account ownership by using a backup phrase to decrypt a matching phrase from cyphertext associated with the account.

 To get started, install the library:
```bash
npm install mnemonic-backup
```
This library consists of five functions: **generateMnemonic**, **generateKey**, **prepareKey**, **encryptMnemonic**, and **decryptMnemonic**. These functions are used in the creation of mnemonic phrases, cryptographic keys, and for the encryption and decryption of Mnemonic Backup Phrases.

## Mnemonic Phrase Generation
The Mnemonic Phrase is generated using the `generateMnemonic`  function, where 11-bit segments of provided or internally generated entropy are used to create a mnemonic, using words from the BIP39 English wordlist, provided by **[@iacobus/bip39](https://www.npmjs.com/package/@iacobus/bip39)**.
```js
generateMnemonic(entropy);
```
This function expects a single optional `entropy` parameter, expecting 154 bits of entropy directly as bits when provided. This function acts as a proxy to the `mnemonic();` [function of the **mnemonic-key** library](https://www.npmjs.com/package/mnemonic-key#mnemonic-phrases). If no entropy is provided, the library will internally generate entropy.

*Example use with "entropy" provided:*
```js
const { generateMnemonic } = require('mnemonic-backup');

// 176 Bits of entropy in Hex
const entropy = "596F75206A757374206C6F7374205468652047616D65";

const mnemonic = generateMnemonic(entropy);
console.log("Mnemonic Phrase:", mnemonic);

// Sample Output:
// Mnemonic Phrase: floor knife elite stay fire ring like mistake inflict patient bench speak faith carbon

```
*The function returns a 14-word Mnemonic Phrase derived from the generated or provided entropy in the output.*

## Obtaining a Cryptographic Key

### Generating a Key
A Cryptographic Key is derived from the Mnemonic Phrase using the `getKey();` [function of the **mnemonic-key** library](https://www.npmjs.com/package/mnemonic-key#cryptographic-keys), which the `generateKey();` function acts as a proxy to. Keys are obtained from mnemonics using the **PBKDF2** (Password-Based Key Derivation Function 2) synchronous key derivation function.

### Using the `generateKey` function.
To generate the Cryptographic Key, the `generateKey` function is used. 
```js
generateKey(mnemonic, iterations);
```
This function expects a `mnemonic` parameter, which should be the Mnemonic Phrase. An optional `iterations` parameter may also be provided, allowing the number of iterations to be specified. If no number is provided, a default of *210,000* will be used, based on the [OWASP recommendations](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2) for **PBKDF2-HMAC-SHA512**.

*Example use without "iterations" provided:*
```js
const { generateKey } = require('mnemonic-backup');

// 14 Word Mnemonic Phrase
const mnemonic = "floor knife elite stay fire ring like mistake inflict patient bench speak faith carbon";

generateKey(mnemonic)
    .then((key) => {
        console.log("Cryptographic Key:", key);
    });

// Sample Output:
// Cryptographic Key: 5581d8bf77f333b1ec6c6b1ba28abbdd7a9d3c7d3857c99ae1cac47ee1734bc0

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
This function expects a `key` parameter, which should be the Cryptographic Key. A `pepper` and a `salt` parameter are expected, provided for peppering and salting the key. An optional `iterations` parameter may also be provided, allowing the number of iterations to be specified. If no number is provided, a default of *600,000* will be used, based on the [OWASP recommendations](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2) for **PBKDF2-HMAC-SHA256**.

*Example use with "iterations" provided:*
```js
const { prepareKey } = require('mnemonic-backup');

// Cryptographic Key
const key = "5581d8bf77f333b1ec6c6b1ba28abbdd7a9d3c7d3857c99ae1cac47ee1734bc0"

// Pepper and Salt
const pepper = "57686174206973207468652074727574683F20"
const salt = "4E6F7468696E67204D617474657273203A29";

// Iterations set to 750,000
const iterations = 750000;

const preparedKey = prepareKey(key, pepper, salt, iterations);
console.log("Prepared Key:", preparedKey);

// Sample Output:
// Prepared Key: 773b371566d8ebbc57d9d9ce581e6fcd13d3d57f617d366fcfebd2937f8a05da

```
*The function returns the prepared cryptographic key in the output.*

## Encrypting the Mnemonic Phrase
A cypher is created by [encrypting](https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options) the Mnemonic Phrase with **AES** (Advanced Encryption Standard) at a length of 256 bits using **GCM** (Galois/Counter Mode).
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

*Example use with "iv" provided:*
```js
const { encryptMnemonic } = require('mnemonic-backup');

// 14 Word Mnemonic Phrase
const mnemonic = "floor knife elite stay fire ring like mistake inflict patient bench speak faith carbon";

// Cryptographic Key (prepared key)
const key = "773b371566d8ebbc57d9d9ce581e6fcd13d3d57f617d366fcfebd2937f8a05da";

// Initialization Vector provided in Hex
const iv = "44494e4f5341555253212121";

const result = encryptMnemonic(mnemonic, key, iv);
    console.log("Cyphertext:", result.cyphertext);
    console.log("IV:", result.iv);
    console.log("Auth Tag:", result.authTag);

// Sample Output:
// Cyphertext: 4955bb6686bd53bb792298bcc039cba5e7e5dfe7e14150a8e5d0ade51d129d0874b251b76450293db1d67a6dfe5a8236bfe303568e8aaedd5566f02f0032874c512693ff58ce33a8d5c4d7f75481ff7158f72eefa081
// IV: 44494e4f5341555253212121
// Auth Tag: 8c7708ed8f31c292c89aae9ceb175102

```
*The function returns the Cyphertext, Initialization Vector, and Authentication Tag from the encryption of the Mnemonic Phrase in the output.*

## Decryption
A cypher/encrypted Mnemonic Phrase is [decrypted](https://nodejs.org/api/crypto.html#cryptocreatedecipherivalgorithm-key-iv-options) using the *cyphertext* and *authTag* from the encryption output, along with the same key and Initialization Vector used for encryption.
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
const key = "773b371566d8ebbc57d9d9ce581e6fcd13d3d57f617d366fcfebd2937f8a05da";

// cyphertext, iv, and authTag from Encryption
const cyphertext = "4955bb6686bd53bb792298bcc039cba5e7e5dfe7e14150a8e5d0ade51d129d0874b251b76450293db1d67a6dfe5a8236bfe303568e8aaedd5566f02f0032874c512693ff58ce33a8d5c4d7f75481ff7158f72eefa081";
const iv = "44494e4f5341555253212121";
const authTag = "8c7708ed8f31c292c89aae9ceb175102";

const decryptedMnemonic = decryptMnemonic(cyphertext, key, iv, authTag);
console.log("Decrypted Mnemonic:", decryptedMnemonic);

// Sample Output:
// Decrypted Mnemonic: floor knife elite stay fire ring like mistake inflict patient bench speak faith carbon

```
*The function returns the decrypted Mnemonic Phrase in the output.*
