require('dotenv').config();
const config = require("../../../config/config.json");
const settings = require("../../../config/settings.json");
const { fetchData } = require("../../utils/api.js");
var axios = require("axios");
module.exports = {
    name: "search",
    category: "Airports",
    aliases: [],
    cooldown: 3,
    usage: "search <Airport name>",
    description: "Returns the information of the provided Airport name.",
    memberpermissions: [],
    requiredroles: [],
    alloweduserids: [],
    run: async (client, message, args, chatId, text, prefix) => {
        try {

            query = args.join(' ');
            if (query.length < 3) {
                return message.reply("The search query must be at least 3 characters long.");
            }

            const endpoint = `https://aerodatabox.p.rapidapi.com/airports/search/term`;

            const params = {
                q: args.join(' '),
                limit: '5'
            };

            fetchData(endpoint, params).then(function (response) {
                if (response.count === 0) {
                    return message.reply("No airports found for the given search query.");
                }

                let replyMessage = "Airports found:\n";
                response.items.forEach((item, index) => {
                    replyMessage += `${index + 1}. *${item.name.trim()}* (${item.iata}/${item.icao}) - ${item.municipalityName}, ${item.countryCode}\n\n`;
                });

                message.reply(replyMessage);
            }).catch(error => {
                console.error(error);
            });

        } catch (e) {
            console.log(String(e.stack));
            return message.reply(`❌ ERROR | An error occurred\n\`\`\`${e.message ? String(e.message).slice(0, 2000) : String(e).slice(0, 2000)}\`\`\``);
        }
    }
}