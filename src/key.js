const crypto = require('crypto');
const { base58 } = require('@scure/base');

function key(mnemonic, iterations = null) {
    const wordArray = mnemonic.split(' ');
    if (wordArray.length !== 14) {
        throw new Error('Exactly 14 words are required');
    }

    const firstWords = wordArray.slice(0, 13).join(' ');
    const lastWord = wordArray[13];

    // Use Buffer to encode the first words and derive a salt using base58 encoding
    let salt = Buffer.from(firstWords, 'utf-8'); 
    salt = base58.encode(salt);

    return new Promise((resolve, reject) => {
        crypto.pbkdf2(lastWord, salt, iterations || 210000, 32, 'sha512', (err, cryptographicKey) => {
            if (err) {
                reject(err);
            } else {
                resolve(cryptographicKey.toString('hex'));
            }
        });
    });
}

function prepKey(key, pepper, salt, iterations = null) {
    const keyWithPepper = key + pepper;
    const saltBuffer = Buffer.from(salt, 'hex');
    let preparedKey = crypto.pbkdf2Sync(keyWithPepper, saltBuffer, iterations || 600000, 32, 'sha256');
    return preparedKey.toString('hex');
}

module.exports = { key, prepKey };
