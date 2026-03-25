const axios = require('axios');

module.exports = {
    name: "metar",
    category: "Airports",
    aliases: ["mt"],
    cooldown: 3,
    usage: "metar <ICAO> [ICAO] [ICAO] ...",
    description: "Returns raw METAR data for the provided ICAO codes.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length === 0) {
                return message.reply("Please provide at least one ICAO code.\nExample: `metar LEMD KJFK`");
            }

            for (const code of args) {
                if (code.length !== 4) {
                    return message.reply(`"${code}" is invalid. ICAO codes are 4 characters.`);
                }
            }

            const icaoCodes = args.join(',').toUpperCase();

            const response = await axios.get('https://aviationweather.gov/api/data/metar', {
                params: { ids: icaoCodes, format: 'json' }
            });

            const data = response.data;

            if (!data || data.length === 0) {
                return message.reply("No METAR data found for the provided ICAO codes.");
            }

            let reply = `*METAR* (${data.length} station${data.length > 1 ? 's' : ''})\n\n`;

            data.forEach(m => {
                reply += `*${m.icaoId}*\n`;
                reply += `\`${m.rawOb}\`\n\n`;
            });

            reply += `_Use \`wx <ICAO>\` for decoded weather_`;

            return message.reply(reply);

        } catch (e) {
            console.error('METAR error:', e.message);
            return message.reply(`Error: ${e.message}`);
        }
    }
};
