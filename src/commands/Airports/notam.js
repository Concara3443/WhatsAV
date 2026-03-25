const axios = require("axios");

module.exports = {
    name: "notam",
    category: "Airports",
    aliases: ["notams"],
    cooldown: 5,
    usage: "notam <Airport ICAO>",
    description: "Returns the active NOTAMs for the provided ICAO code.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length === 0) {
                return message.reply("Please provide at least one ICAO code.");
            }

            const icaoCode = args[0].toUpperCase();
            if (icaoCode.length !== 4) {
                return message.reply(`The code "${icaoCode}" is invalid. You must provide an ICAO code (4 characters).`);
            }

            const options = {
                method: 'GET',
                url: 'https://aviationweather.gov/api/data/notam',
                params: {
                    icao: icaoCode,
                    format: 'raw',
                    type: 'all'
                },
            };

            const response = await axios.request(options);
            const notamData = response.data;

            if (!notamData || notamData.trim().length === 0) {
                return message.reply(`No NOTAMs found for ${icaoCode}.`);
            }

            // Split NOTAMs and limit to first 10
            const notams = notamData.split('\n\n').filter(n => n.trim().length > 0);
            const limitedNotams = notams.slice(0, 10);

            let replyMessage = `*NOTAMs for ${icaoCode}*\n`;
            replyMessage += `Showing ${limitedNotams.length} of ${notams.length} NOTAMs\n\n`;

            limitedNotams.forEach((notam, index) => {
                replyMessage += `*${index + 1}.* ${notam.trim()}\n\n`;
            });

            if (notams.length > 10) {
                replyMessage += `_... and ${notams.length - 10} more NOTAMs_`;
            }

            return message.reply(replyMessage);

        } catch (e) {
            if (e.code === 'ENOTFOUND') {
                return message.reply("Unable to reach the aviation weather service. Please try again later.");
            }
            console.log(String(e.stack));
            return message.reply(`An error occurred: ${e.message}`);
        }
    }
};
