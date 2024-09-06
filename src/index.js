const mnemonic = require('./mnemonic');
const key = require('./key');
const cypher = require('./cypher');
const decypher = require('./decypher');

function generateMnemonic(entropy = null) {
    return mnemonic(entropy);
}

function generateKey(mnemonic, iterations = null) {
    return key(mnemonic, iterations);
}

function encryptMnemonic(mnemonic, key, iv = null) {
    return cypher(mnemonic, key, iv);
}

function decryptMnemonic(cyphertext, key, iv, authTag) {
    return decypher(cyphertext, key, iv, authTag);
}

module.exports = { generateMnemonic, generateKey, encryptMnemonic, decryptMnemonic };
