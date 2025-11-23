const QRCode = require('qrcode');
async function generate(text){ return await QRCode.toDataURL(text); }
module.exports = { generate };
