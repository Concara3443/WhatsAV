const config = require("../../../config/config.json");
const settings = require("../../../config/settings.json");
var axios = require("axios");
const { Location } = require('whatsapp-web.js');
module.exports = {
    name: "ainfo",
    category: "Airports",
    aliases: ["ai"],
    cooldown: 3,
    usage: "ainfo <Airport ICAO/ Airpot IATA>",
    description: "Returns information about the provided airport.",
    memberpermissions: [],
    requiredroles: [],
    alloweduserids: [],
    minargs: 0,
    maxargs: 0,
    minplusargs: 0,
    maxplusargs: 0,
    argsmissing_message: "",
    argstoomany_message: "",
    run: async (client, message, args, plusArgs, chatId, text, prefix) => {
        try {

            args = args.join(" ")

            if (args.length === 0 || (args.length !== 3 && args.length !== 4)) {
                return message.reply("Please provide an ICAO or IATA code.");
            }

            var iType = args.length == 3 ? "iata" : "icao";

            const options = {
                method: 'GET',
                url: `https://aerodatabox.p.rapidapi.com/airports/${iType}/${args}`,
                headers: {
                    'x-rapidapi-key': '1a81ea4217mshdb75d2819e9277cp11e1bcjsn94eb148edf29',
                    'x-rapidapi-host': 'aerodatabox.p.rapidapi.com'
                }
            };

            try {
                const response = await axios.request(options);
                const data = response.data;

                let replyMessage = `*${data.fullName} (${data.shortName})*`;

                if (data.icao) replyMessage += `\n- *ICAO*: ${data.icao}`;
                if (data.iata) replyMessage += `\n- *IATA*: ${data.iata}`;
                if (data.timeZone) replyMessage += `\n- *Time Zone*: ${data.timeZone}`;
                if (data.urls.webSite) replyMessage += `\n- *Website*: ${data.urls.webSite}`;
                if (data.urls.wikipedia) replyMessage += `\n- *Wikipedia*: ${data.urls.wikipedia}`;
                if (data.urls.twitter) replyMessage += `\n- *Twitter*: ${data.urls.twitter}`;
                if (data.urls.flightRadar) replyMessage += `\n- *Flight Radar*: ${data.urls.flightRadar}`;

                const location = new Location(data.location.lat, data.location.lon, {
                    name: data.fullName,
                    url: data.urls.googleMaps
                });

                message.reply(replyMessage).then(() => {
                    client.sendMessage(chatId, location)
                }).catch(error => {
                    console.error(error);
                    message.reply("❌ ERROR | Failed to send location.");
                });

            } catch (error) {
                console.error(error);
                message.reply("❌ ERROR | Failed to fetch airport information.");
            }

        } catch (e) {
            console.log(String(e.stack));
            return message.reply(`❌ ERROR | An error occurred\n\`\`\`${e.message ? String(e.message).slice(0, 2000) : String(e).slice(0, 2000)}\`\`\``);
        }
    }
}