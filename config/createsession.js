const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

console.log("WhatsAV Session Creator");
console.log("=======================");
console.log("Scan the QR code with WhatsApp to link your account.\n");

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "C:\\Users\\Administrator\\Documents\\Github\\WhatsAV\\.wwebjs_auth"
  }),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("\nScan the QR code above with your WhatsApp app.");
});

client.on("ready", () => {
  console.log("\nWhatsApp session created successfully!");
  console.log("You can now start the bot with: npm start");
  process.exit(0);
});

client.on("auth_failure", (msg) => {
  console.error("Authentication failed:", msg);
  process.exit(1);
});

client.initialize();
