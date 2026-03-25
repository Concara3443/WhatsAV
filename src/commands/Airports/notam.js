module.exports = {
    name: "notam",
    category: "Airports",
    aliases: ["notams"],
    cooldown: 5,
    usage: "notam <Airport ICAO>",
    description: "Returns active NOTAMs for the provided ICAO code. (Currently unavailable)",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            // NOTAM API temporarily unavailable
            // aviationweather.gov and FAA APIs are blocking requests

            return message.reply(`⚠️ *NOTAM Service Temporarily Unavailable*

The NOTAM API is currently not accessible.

*Alternatives:*
• ICAO: https://www.icao.int/safety/iStars/
• FAA: https://notams.aim.faa.gov/
• EAD: https://www.ead.eurocontrol.int/

_We're working on finding a reliable NOTAM source._`);

        } catch (e) {
            console.error('NOTAM error:', e);
            return message.reply(`Error: ${e.message}`);
        }
    }
};
