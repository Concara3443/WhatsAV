const axios = require("axios");

module.exports = {
    name: "taf",
    category: "Airports",
    aliases: ["forecast"],
    cooldown: 3,
    usage: "taf <Airport ICAO> [Airport ICAO] ...",
    description: "Returns the TAF (Terminal Aerodrome Forecast) for the provided ICAO codes.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length === 0) {
                return message.reply("Please provide at least one ICAO code.");
            }

            for (const code of args) {
                if (code.length !== 4) {
                    return message.reply(`The code "${code}" is invalid. You must provide an ICAO code (4 characters).`);
                }
            }

            const icaoCodes = args.join(',').toUpperCase();

            const options = {
                method: 'GET',
                url: 'https://aviationweather.gov/api/data/taf',
                params: {
                    ids: icaoCodes,
                    format: 'json'
                },
            };

            const response = await axios.request(options);
            const tafData = response.data;

            if (!tafData || tafData.length === 0) {
                return message.reply("No TAF data found for the provided ICAO codes.");
            }

            let replyMessage = "*TAF Data:*\n";

            tafData.forEach(taf => {
                replyMessage += `\n*${taf.name || taf.icaoId} (${taf.icaoId})*\n`;

                if (taf.issueTime) {
                    replyMessage += `Issued: ${taf.issueTime}\n`;
                }
                if (taf.validTimeFrom && taf.validTimeTo) {
                    replyMessage += `Valid: ${taf.validTimeFrom} to ${taf.validTimeTo}\n`;
                }

                replyMessage += `\nRaw TAF:\n${taf.rawTAF}\n`;
            });

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
