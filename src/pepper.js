const crypto = require('crypto');

const pepper = crypto.randomBytes(32).toString('hex');
console.log(pepper);