const crypto = require('crypto');
const { wordlist } = require('@scure/bip39/wordlists/english');

function generateEntropy(bits = 154) {
    const bytes = Math.ceil(bits / 8);
    const entropyBuffer = crypto.randomBytes(bytes);
    const entropyBinary = Array.from(entropyBuffer)
        .map(byte => byte.toString(2).padStart(8, '0'))
        .join('');
        return entropyBinary.slice(0, bits);
}

function validateEntropy(entropyBinary) {
    if (entropyBinary.length < 154) {
        throw new Error(`Entropy is too short. Expected 154 bits, got ${entropyBinary.length} bits.`);
    }
    return entropyBinary.slice(0, 154);
}

function entropyToMnemonic(entropyBinary) {
    const words = [];
    for (let i = 0; i < entropyBinary.length; i += 11) {
        const index = parseInt(entropyBinary.slice(i, i + 11), 2);
        words.push(wordlist[index]);
    }
    return words.join(' ');
}

function mnemonic(entropy = null) {
    let entropyBinary;
    if (entropy) {
        entropyBinary = validateEntropy(entropy);
    } else {
        entropyBinary = generateEntropy();
    }
    return entropyToMnemonic(entropyBinary);
}

module.exports = mnemonic;
