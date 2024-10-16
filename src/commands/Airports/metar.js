const config = require("../../../config/config.json");
const settings = require("../../../config/settings.json");
var axios = require("axios");
module.exports = {
    name: "metar",
    category: "Airports",
    aliases: ["mt"],
    cooldown: 3,
    usage: "metar <Airport ICAO> [Airport ICAO] [Airport ICAO] ...",
    description: "Returns the METAR data for the provided ICAO code.",
    memberpermissions: [],
    requiredroles: [],
    alloweduserids: [],
    minargs: 0,
    maxargs: 0,
    minplusargs: 0,
    maxplusargs: 0,
    argsmissing_message: "",
    argstoomany_message: "",
    run: async (client, message, args, plusArgs, contact, text, prefix) => {
        try {
            const icaoCodes = args.join(',');

            if (icaoCodes.length == 0) {
                return message.reply("Please provide at least one ICAO code.");
            }
            if (icaoCodes.length == 3) {
                return message.reply(`Please provide an ICAO, (Maybe search for the airport with ${prefix}search <Airport name>)`);
            }

            const options = {
                method: 'GET',
                url: 'https://aviationweather.gov/api/data/metar',
                params: { ids: icaoCodes, format: 'json', taf: 'false' },
                headers: { Accept: '*/*', 'User-Agent': 'Thunder Client (https://www.thunderclient.com)' }
            };

            axios.request(options).then(function (response) {

                const metarData = response.data;

                if (metarData.length === 0) {
                    return message.reply("No METAR data found for the provided ICAO codes.");
                }

                let replyMessage = "METAR Data:\n";
                metarData.forEach(metar => {
                    replyMessage += `\n*${metar.name} (${metar.icaoId})*\n`;
                    replyMessage += `Temperature: ${metar.temp}°C\n`;
                    replyMessage += `Dew Point: ${metar.dewp}°C\n`;
                    replyMessage += `Wind: ${metar.wdir}° at ${metar.wspd} knots\n`;
                    replyMessage += `Visibility: ${metar.visib}\n`;
                    replyMessage += `Altimeter: ${metar.altim} hPa\n`;
                    replyMessage += `Raw Observation:\n${metar.rawOb}\n`;
                });

                message.reply(replyMessage);

            }).catch(function (error) {
                if (error.code === 'ENOTFOUND') {
                    return message.reply("❌ ERROR | Unable to reach the aviation weather service. Please check your internet connection or try again later.");
                }
                console.error(error);
            });

        } catch (e) {
            console.log(String(e.stack));
            return message.reply(`❌ ERROR | An error occurred\n\`\`\`${e.message ? String(e.message).slice(0, 2000) : String(e).slice(0, 2000)}\`\`\``);
        }
    }
}