const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    authStrategy: new LocalAuth({
        dataPath: 'session'
    })
});

// Definir algunas colecciones globales
client.commands = new Map();
client.cooldowns = new Map();
client.aliases = new Map();
client.categories = fs.readdirSync('./src/commands/');

// const handlers = ['events', 'commands', 'antiCrash'];
const handlers = ['events', 'commands'];

handlers.forEach(h => {
    const handler = require(`./handlers/${h}`);
    if (typeof handler === 'function') {
      handler(client);
    } else {
      console.error(`Handler ${h} is not a function`);
    }
  });

client.initialize();