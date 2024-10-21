const config = require("../../../config/config.json");
const settings = require("../../../config/settings.json");
const { fetchData } = require("../../utils/api.js");
var axios = require("axios");
module.exports = {
    name: "runway",
    category: "Airports",
    aliases: ["rw"],
    cooldown: 3,
    usage: "runway <Airport ICAO>",
    description: "Returns the runways with favorable wind at an airport",
    memberpermissions: [],
    requiredroles: [],
    alloweduserids: [],
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            const icaoCodes = args.join(',');

            if (icaoCodes.length == 0) {
                return message.reply("Please provide at least one ICAO code.");
            }

            for (const code of args) {
                if (code.length !== 4) {
                    return message.reply(`The code "${code}" is invalid. You must provide an icao code.`);
                }
            }

            const options = {
                method: 'GET',
                url: 'https://aviationweather.gov/api/data/metar',
                params: { ids: icaoCodes, format: 'json', taf: 'false' },
            };

            axios.request(options).then(function (response) {

                const metarData = response.data;

                if (metarData.length === 0) {
                    return message.reply("No METAR data found for the provided ICAO codes.");
                }

                const endpoint = `https://aerodatabox.p.rapidapi.com/airports/icao/${args}/runways`;
                fetchData(endpoint, {}).then(function (response) {

                    if (response.length === 0) {
                        return message.reply("No runway data found for the provided ICAO code.");
                    }


                    const wdir = metarData[0].wdir;
                    const wspd = metarData[0].wspd;
                    const wgst = metarData[0].wgst;

                    let replyMessage = `Wind direction: ${wdir}°, Wind speed: ${wspd} knots`;
                    if (wgst !== null) {
                        replyMessage += `, Gusts: ${wgst} knots`;
                    }
                    replyMessage += '\n\n';

                    response.forEach((item) => {
                        const rwheading = item.trueHdg; //float
                        const isclosed = item.isClosed;

                        if (!isclosed) {
                            const windDifference = Math.abs(wdir - rwheading);
                            item.windDifference = windDifference;

                        }
                    });

                    const openRunways = response.filter(item => !item.isClosed);
                    openRunways.sort((a, b) => a.windDifference - b.windDifference);

                    const topRunways = openRunways.slice(0,  Math.floor(openRunways.length / 2));

                    topRunways.forEach((item) => {
                        replyMessage += `*Runway ${item.name}* with heading ${item.trueHdg}° is ${item.length.meter} meters long and ${item.width.meter} meters wide. Wind difference: ${item.windDifference.toFixed(1)}°\n\n`;
                    });

                    message.reply(replyMessage);

                }).catch(error => {
                    console.error(error);
                });

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