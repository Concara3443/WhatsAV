require('dotenv').config();
const config = require("../../../config/config.json");
const settings = require("../../../config/settings.json");
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
    minargs: 0,
    maxargs: 0,
    minplusargs: 0,
    maxplusargs: 0,
    argsmissing_message: "",
    argstoomany_message: "",
    run: async (client, message, args, plusArgs, contact, text, prefix) => {
        try {

            query = args.join(' ');
            if (query.length < 3) {
                return message.reply("The search query must be at least 3 characters long.");
            }

            const options = {
                method: 'GET',
                url: 'https://aerodatabox.p.rapidapi.com/airports/search/term',
                params: {
                    q: args.join(' '),
                    limit: '5'
            },
                headers: {
                    'x-rapidapi-key': process.env.RAPID_API_KEY,
                    'x-rapidapi-host': 'aerodatabox.p.rapidapi.com'
                }
            };

            try {
                const response = await axios.request(options);
                if (response.data.count === 0) {
                    return message.reply("No airports found for the given search query.");
                }

                let replyMessage = "Airports found:\n";
                response.data.items.forEach((item, index) => {
                    replyMessage += `${index + 1}. *${item.name.trim()}* (${item.iata}/${item.icao}) - ${item.municipalityName}, ${item.countryCode}\n\n`;
                });

                message.reply(replyMessage);
            } catch (error) {
                console.error(error);
            }

        } catch (e) {
            console.log(String(e.stack));
            return message.reply(`❌ ERROR | An error occurred\n\`\`\`${e.message ? String(e.message).slice(0, 2000) : String(e).slice(0, 2000)}\`\`\``);
        }
    }
}