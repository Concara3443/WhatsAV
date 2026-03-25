const { fetchData } = require("../../utils/api.js");
const { Location } = require('whatsapp-web.js');
module.exports = {
    name: "ainfo",
    category: "Airports",
    aliases: ["ai"],
    cooldown: 3,
    usage: "ainfo <Airport ICAO/ Airpot IATA>",
    description: "Returns information about the provided airport.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length !== 1) {
                return message.reply("Please provide an ICAO or IATA code.");
            }

            const code = args[0].toUpperCase();
            if (code.length !== 3 && code.length !== 4) {
                return message.reply("Please provide a valid ICAO (4 chars) or IATA (3 chars) code.");
            }

            const iType = code.length === 3 ? "iata" : "icao";
            const endpoint = `https://aerodatabox.p.rapidapi.com/airports/${iType}/${code}`;

            fetchData(endpoint, {}).then(function (response) {

                let replyMessage = `*${response.fullName} (${response.shortName})*`;

                if (response.icao) replyMessage += `\n- *ICAO*: ${response.icao}`;
                if (response.iata) replyMessage += `\n- *IATA*: ${response.iata}`;
                if (response.timeZone) replyMessage += `\n- *Time Zone*: ${response.timeZone}`;
                if (response.urls.webSite) replyMessage += `\n- *Website*: ${response.urls.webSite}`;
                if (response.urls.wikipedia) replyMessage += `\n- *Wikipedia*: ${response.urls.wikipedia}`;
                if (response.urls.twitter) replyMessage += `\n- *Twitter*: ${response.urls.twitter}`;
                if (response.urls.flightRadar) replyMessage += `\n- *Flight Radar*: ${response.urls.flightRadar}`;

                const location = new Location(response.location.lat, response.location.lon, {
                    name: response.fullName,
                    url: response.urls.googleMaps
                });

                message.reply(replyMessage).then(() => {
                    client.sendMessage(chatId, location)
                }).catch(error => {
                    console.error(error);
                    message.reply("❌ ERROR | Failed to send location.");
                });

            }).catch(error => {
                console.error(error);
                message.reply("❌ ERROR | Failed to fetch airport information.");
            });

        } catch (e) {
            console.log(String(e.stack));
            return message.reply(`❌ ERROR | An error occurred\n\`\`\`${e.message ? String(e.message).slice(0, 2000) : String(e).slice(0, 2000)}\`\`\``);
        }
    }
}