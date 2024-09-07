const crypto = require('crypto');

function validateIV(iv) {
    if (iv && Buffer.from(iv, 'hex').length !== 12) {
        throw new Error('Invalid IV length: IV must be 12 bytes (24 hex characters) for AES-GCM');
    }
    return iv ? Buffer.from(iv, 'hex') : crypto.randomBytes(12); 
}

function createCipher(algorithm, keyBuffer, ivBuffer) {
    return crypto.createCipheriv(algorithm, keyBuffer, ivBuffer);
}

function encryptMnemonic(mnemonic, cipher) {
    let cyphertext = cipher.update(mnemonic, 'utf8', 'hex'); 
    cyphertext += cipher.final('hex');
    return cyphertext;
}

function cypher(mnemonic, key, iv = null) {
    const wordArray = mnemonic.split(' ');

    if (wordArray.length !== 14) {
        throw new Error(`Exactly 14 words are required in the mnemonic`);
    }
    
    const algorithm = 'aes-256-gcm';
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = validateIV(iv);
    
    const cipher = createCipher(algorithm, keyBuffer, ivBuffer);
    const cyphertext = encryptMnemonic(mnemonic, cipher);

    const authTag = cipher.getAuthTag().toString('hex');

    return {
        cyphertext: cyphertext,
        authTag: authTag,
        iv: ivBuffer.toString('hex')
    };
}

module.exports = cypher;
