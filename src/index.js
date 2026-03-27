require('dotenv').config();
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

// Directorio para la sesión
const AUTH_FOLDER = path.join(__dirname, '..', 'auth_info_baileys');

// Crear carpeta de sesión si no existe
if (!fs.existsSync(AUTH_FOLDER)) {
    fs.mkdirSync(AUTH_FOLDER, { recursive: true });
}

// Colecciones globales
const commands = new Map();
const cooldowns = new Map();
const aliases = new Map();
const categories = fs.readdirSync(path.join(__dirname, 'commands'));

// Cargar comandos
function loadCommands() {
    let amount = 0;
    const commandsPath = path.join(__dirname, 'commands');

    fs.readdirSync(commandsPath).forEach((dir) => {
        const dirPath = path.join(commandsPath, dir);
        if (!fs.statSync(dirPath).isDirectory()) return;

        const commandFiles = fs.readdirSync(dirPath).filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            try {
                const pull = require(path.join(dirPath, file));
                if (pull.name) {
                    commands.set(pull.name, pull);
                    amount++;
                } else {
                    console.log(file, `error -> missing a help.name`);
                    continue;
                }
                if (pull.aliases && Array.isArray(pull.aliases)) {
                    pull.aliases.forEach((alias) => aliases.set(alias, pull.name));
                }
            } catch (e) {
                console.error(`Error loading command ${file}:`, e.message);
            }
        }
    });
    console.log(`${amount} Commands Loaded`);
}

// Función principal para conectar
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`Using Baileys v${version.join('.')}, isLatest: ${isLatest}`);

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['WhatsAV', 'Chrome', '120.0.0'],
        markOnlineOnConnect: true,
        syncFullHistory: false,
    });

    // Objeto cliente compatible con los comandos existentes
    const client = {
        sock,
        commands,
        cooldowns,
        aliases,
        categories,
        info: {
            me: {
                user: null,
                server: 's.whatsapp.net'
            }
        }
    };

    // Guardar credenciales cuando cambien
    sock.ev.on('creds.update', saveCreds);

    // Manejar actualizaciones de conexión
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\nScan this QR code with WhatsApp:\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

            console.log('Connection closed, reason:', reason);

            if (reason === DisconnectReason.badSession) {
                console.log('Bad session, delete auth folder and scan again');
                fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
                connectToWhatsApp();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log('Connection closed, reconnecting...');
                connectToWhatsApp();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log('Connection lost, reconnecting...');
                connectToWhatsApp();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log('Connection replaced, another session opened. Close current session first.');
                process.exit(1);
            } else if (reason === DisconnectReason.loggedOut) {
                console.log('Device logged out, delete auth folder and scan again');
                fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
                connectToWhatsApp();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log('Restart required, restarting...');
                connectToWhatsApp();
            } else if (reason === DisconnectReason.timedOut) {
                console.log('Connection timed out, reconnecting...');
                connectToWhatsApp();
            } else {
                console.log('Unknown disconnect reason:', reason);
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            // Actualizar información del bot
            const me = sock.user;
            client.info.me.user = me?.id?.split(':')[0] || me?.id?.split('@')[0];
            client.info.me.lid = me?.lid?.split(':')[0] || me?.lid?.split('@')[0];
            client.info.me.fullJid = me?.id;
            client.info.me.fullLid = me?.lid;

            console.log('##############################');
            console.log('#                            #');
            console.log('#      Bot is ready!         #');
            console.log('#                            #');
            console.log('##############################');
            console.log(`Logged in as: ${client.info.me.user}`);
            console.log(`LID: ${client.info.me.lid}`);
        }
    });

    // Manejar mensajes
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            try {
                await handleMessage(client, msg);
            } catch (e) {
                console.error('Error handling message:', e);
            }
        }
    });

    return sock;
}

// Función para limpiar caracteres invisibles de WhatsApp
function cleanWhatsAppText(text) {
    if (!text) return '';
    return text
        .replace(/[\u200B-\u200D\uFEFF\u00A0\u2060\u180E]/g, '')
        .replace(/[\u200E\u200F\u202A-\u202E]/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .trim();
}

// Levenshtein distance para encontrar comandos similares
function levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Buscar comandos similares
function findSimilarCommands(input, maxDistance = 3) {
    const suggestions = [];
    const allCommands = [...commands.keys()];

    for (const cmdName of allCommands) {
        const distance = levenshtein(input.toLowerCase(), cmdName.toLowerCase());
        if (distance <= maxDistance && distance > 0) {
            suggestions.push({ name: cmdName, distance });
        }
    }

    for (const [alias, cmdName] of aliases.entries()) {
        const distance = levenshtein(input.toLowerCase(), alias.toLowerCase());
        if (distance <= maxDistance && distance > 0) {
            suggestions.push({ name: `${alias} (-> ${cmdName})`, distance });
        }
    }

    return suggestions
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
        .map(s => s.name);
}

// Obtener texto del mensaje
function getMessageText(msg) {
    return msg.message?.conversation ||
           msg.message?.extendedTextMessage?.text ||
           msg.message?.imageMessage?.caption ||
           msg.message?.videoMessage?.caption ||
           '';
}

// Obtener menciones del mensaje
function getMentions(msg) {
    return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

// Manejar mensajes entrantes
async function handleMessage(client, msg) {
    // Ignorar mensajes del bot
    if (msg.key.fromMe) return;

    // Ignorar mensajes sin contenido de texto
    const rawText = getMessageText(msg);
    if (!rawText) return;

    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const cleanBody = cleanWhatsAppText(rawText);

    if (!cleanBody) return;

    // Crear objeto message compatible con comandos existentes
    const message = {
        from: chatId,
        fromMe: msg.key.fromMe,
        body: cleanBody,
        id: msg.key.id,
        timestamp: msg.messageTimestamp,
        reply: async (text) => {
            await client.sock.sendMessage(chatId, { text }, { quoted: msg });
        },
        getMentions: () => getMentions(msg)
    };

    // Mensaje de bienvenida
    const welcomeMessages = [
        "hi! how does whatsav work?",
        "hi how does whatsav work",
        "how does whatsav work",
        "how does whatsav work?"
    ];

    if (!isGroup && welcomeMessages.includes(cleanBody.toLowerCase())) {
        const welcomeReply = `*Welcome to WhatsAV!*

I'm an aviation bot that provides real-time flight data.

*Quick Start:*
Just type a command directly! No prefix needed.

*Popular Commands:*
- \`metar LEMD\` - Weather at Madrid airport
- \`taf KJFK\` - Forecast for JFK
- \`ainfo LEIG\` - Airport info with VFR chart
- \`notam LEBL\` - NOTAMs for Barcelona
- \`airac\` - Current AIRAC cycle
- \`help\` - All commands

*Example:*
Try typing: \`ainfo LEIG\`

*In Groups:*
Mention me + command: @WhatsAV metar LEMD

_Created by Guillermo Cortes_
_guillermocort.es_`;

        return message.reply(welcomeReply);
    }

    let args = [];
    let cmd = "";

    if (isGroup) {
        const botId = client.info.me.user;
        const botLid = client.info.me.lid;
        const mentions = getMentions(msg);

        // Verificar si el bot fue mencionado (por número o por LID)
        const botMentioned = mentions.some(jid => {
            const jidNumber = jid.split('@')[0].split(':')[0];
            return jidNumber === botId || jidNumber === botLid || jid.includes(botId) || (botLid && jid.includes(botLid));
        });

        if (!botMentioned) return;

        // Extraer comando removiendo la mención
        const bodyWithoutMention = cleanBody
            .replace(/@\d+/g, '')
            .replace(/@[\w\s]+/g, '')
            .trim();

        args = bodyWithoutMention.split(/ +/).filter(Boolean);
        if (args.length === 0) {
            return message.reply(`*WhatsAV*\n\nMention me + command:\n\`@WhatsAV help\`\n\`@WhatsAV metar LEMD\``);
        }
        cmd = args.shift().toLowerCase();
    } else {
        args = cleanBody.split(/ +/).filter(Boolean);
        if (args.length === 0) return;
        cmd = args.shift().toLowerCase();
    }

    let command = commands.get(cmd);
    if (!command) command = commands.get(aliases.get(cmd));

    if (command) {
        try {
            // Validar argumentos mínimos
            if (command.minargs && command.minargs > 0 && args.length < command.minargs) {
                return message.reply(
                    command.argsmissing_message && command.argsmissing_message.trim().length > 0
                        ? command.argsmissing_message
                        : command.usage
                            ? "Usage: " + command.usage
                            : "Wrong Command Usage"
                );
            }

            // Validar argumentos máximos
            if (command.maxargs && command.maxargs > 0 && args.length > command.maxargs) {
                return message.reply(
                    command.argsmissing_message && command.argsmissing_message.trim().length > 0
                        ? command.argsmissing_message
                        : command.usage
                            ? "Usage: " + command.usage
                            : "Wrong Command Usage"
                );
            }

            // Ejecutar el comando
            await command.run(client, message, args, chatId, cleanBody, "");
        } catch (error) {
            console.error('Command error:', error);
            message.reply("There was an error executing that command.");
        }
    } else {
        // Sugerencias solo en privado
        if (!isGroup && cmd.length >= 2) {
            const similar = findSimilarCommands(cmd);

            let reply = `Command not found: \`${cmd}\`\n`;

            if (similar.length > 0) {
                reply += `\n*Did you mean?*\n`;
                similar.forEach(s => {
                    reply += `- \`${s}\`\n`;
                });
            }

            reply += `\n_Type \`help\` to see all commands_`;

            return message.reply(reply);
        }
    }
}

// Anti-crash handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Iniciar
loadCommands();
connectToWhatsApp();
