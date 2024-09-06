const crypto = require('crypto');

function decypher(cyphertext, key, iv, authTag) {
    const algorithm = 'aes-256-gcm';
    const keyBuffer = Buffer.from(key, 'hex');
    const decypheredMnemonic = crypto.createDecipheriv(algorithm, keyBuffer, Buffer.from(iv, 'hex'));

    decypheredMnemonic.setAuthTag(Buffer.from(authTag, 'hex'));

    let decypheredText = decypheredMnemonic.update(cyphertext, 'hex', 'utf8');
    decypheredText += decypheredMnemonic.final('utf8');

    return decypheredText;
}

module.exports = decypher;
