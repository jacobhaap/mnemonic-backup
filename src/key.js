const crypto = require('crypto');
const { base58 } = require('@scure/base');

function key(mnemonic, iterations = null) {
    const wordArray = mnemonic.split(' ');
    if (wordArray.length !== 14) {
        throw new Error('Exactly 14 words are required');
    }

    const firstWords = wordArray.slice(0, 13).join(' ');
    const lastWord = wordArray[13];

    let salt = new TextEncoder().encode(firstWords);
    salt = base58.encode(salt);

    return new Promise((resolve, reject) => {
        crypto.pbkdf2(lastWord, salt, iterations || 210000, 32, 'sha512', (err, derivedKey) => {
            if (err) {
                reject(err);
            } else {
                resolve(derivedKey.toString('hex'));
            }
        });
    });
}

module.exports = key;
