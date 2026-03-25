module.exports = {
    name: "zulu",
    category: "Information",
    aliases: ["utc", "time", "hora"],
    cooldown: 2,
    usage: "zulu [offset]",
    description: "Shows current Zulu (UTC) time and converts to local times.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            const now = new Date();

            const zuluTime = now.toISOString().slice(11, 19);
            const zuluDate = now.toISOString().slice(0, 10);

            const hours = now.getUTCHours().toString().padStart(2, '0');
            const minutes = now.getUTCMinutes().toString().padStart(2, '0');
            const day = now.getUTCDate().toString().padStart(2, '0');
            const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const month = monthNames[now.getUTCMonth()];

            let reply = `*Zulu Time* 🕐\n\n`;
            reply += `*UTC:* ${hours}:${minutes}Z\n`;
            reply += `*Date:* ${day} ${month} ${now.getUTCFullYear()}\n`;
            reply += `*METAR format:* ${day}${hours}${minutes}Z\n\n`;

            // Common timezone offsets
            const offsets = [
                { name: 'Los Angeles (PST)', offset: -8 },
                { name: 'New York (EST)', offset: -5 },
                { name: 'London (GMT)', offset: 0 },
                { name: 'Madrid (CET)', offset: 1 },
                { name: 'Dubai (GST)', offset: 4 },
                { name: 'Tokyo (JST)', offset: 9 },
                { name: 'Sydney (AEDT)', offset: 11 },
            ];

            reply += `*World Times:*\n`;

            offsets.forEach(tz => {
                const localTime = new Date(now.getTime() + tz.offset * 60 * 60 * 1000);
                const localHours = localTime.getUTCHours().toString().padStart(2, '0');
                const localMinutes = localTime.getUTCMinutes().toString().padStart(2, '0');
                const offsetStr = tz.offset >= 0 ? `+${tz.offset}` : tz.offset;
                reply += `${tz.name}: ${localHours}:${localMinutes} (UTC${offsetStr})\n`;
            });

            // If user provided offset, calculate specific time
            if (args[0]) {
                const offset = parseFloat(args[0]);
                if (!isNaN(offset)) {
                    const customTime = new Date(now.getTime() + offset * 60 * 60 * 1000);
                    const customHours = customTime.getUTCHours().toString().padStart(2, '0');
                    const customMinutes = customTime.getUTCMinutes().toString().padStart(2, '0');
                    reply += `\n*UTC${offset >= 0 ? '+' : ''}${offset}:* ${customHours}:${customMinutes}`;
                }
            }

            return message.reply(reply);

        } catch (e) {
            console.error('Zulu error:', e);
            return message.reply(`Error: ${e.message}`);
        }
    }
};
