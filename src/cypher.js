const crypto = require('crypto');

function cypher(mnemonic, key, iv = null) {
    const wordArray = mnemonic.split(' ');
    if (wordArray.length !== 14) {
        throw new Error('Exactly 14 words are required');
    }
    const firstWords = wordArray.slice(0, 13).join(' ');
    const algorithm = 'aes-256-gcm';
    const defaultIV = crypto.randomBytes(12);
    const keyBuffer = Buffer.from(key, 'hex');
    const mnemonicCypher = crypto.createCipheriv(algorithm, keyBuffer, iv || defaultIV);

    let cyphertext = mnemonicCypher.update(firstWords, 'utf8', 'hex');
    cyphertext += mnemonicCypher.final('hex');

    const authTag = mnemonicCypher.getAuthTag().toString('hex');

    if (iv == null) {
        return {
            cyphertext: cyphertext,
            authTag: authTag,
            iv: defaultIV.toString('hex')
        };
    } else {
        return {
            cyphertext: cyphertext,
            authTag: authTag,
            iv: iv.toString('hex')
        };
    }
}

module.exports = cypher;
