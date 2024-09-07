const crypto = require('crypto');

function decypher(cyphertext, key, iv, authTag) {

    if (!cyphertext || !key || !iv || !authTag) {
        throw new Error('Missing required parameters for decryption');
    }

    const algorithm = 'aes-256-gcm';
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);

    decipher.setAuthTag(authTagBuffer);

    let decypheredText = decipher.update(cyphertext, 'hex', 'utf8');
    decypheredText += decipher.final('utf8');

    return decypheredText;
}

module.exports = decypher;
