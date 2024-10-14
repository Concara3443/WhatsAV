const qrcode = require('qrcode-terminal');

module.exports = qr => {
    try{
        qrcode.generate(qr, {small: true});
    } catch (e){
      console.log(String(e.stack))
    }
  }