const { mnemonic, getKey } = require('mnemonic-key');
const prepKey = require('./key');
const cypher = require('./cypher');
const decypher = require('./decypher');

function generateMnemonic(entropy = null) {
    return mnemonic(entropy);
}

function generateKey(mnemonic, iterations = null) {
    return getKey(mnemonic, iterations);
}

function prepareKey(key, pepper, salt, iterations = null) {
    return prepKey(key, pepper, salt, iterations)
}

function encryptMnemonic(mnemonic, key, iv = null) {
    return cypher(mnemonic, key, iv);
}

function decryptMnemonic(cyphertext, key, iv, authTag) {
    return decypher(cyphertext, key, iv, authTag);
}

module.exports = {
    generateMnemonic,
    generateKey,
    prepareKey,
    encryptMnemonic,
    decryptMnemonic
};
