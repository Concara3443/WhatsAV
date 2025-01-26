const qrcode = require('qrcode-terminal');

module.exports = (client, qr) => {
  try{
      console.log("Soy yo", qr)
      qrcode.generate(qr, {small: true});
    } catch (e){
      console.log(String(e.stack))
    }
  }