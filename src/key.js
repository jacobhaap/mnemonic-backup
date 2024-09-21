const crypto = require('crypto');

function prepKey(key, pepper, salt, iterations = null) {
    const keyWithPepper = key + pepper;
    const saltBuffer = Buffer.from(salt, 'hex');
    let preparedKey = crypto.pbkdf2Sync(keyWithPepper, saltBuffer, iterations || 600000, 32, 'sha256');
    return preparedKey.toString('hex');
}

module.exports = prepKey;
