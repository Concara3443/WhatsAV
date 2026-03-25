const axios = require('axios');

module.exports = {
    name: "amendments",
    category: "AIP",
    aliases: ["enmiendas", "amdt", "enmienda"],
    cooldown: 5,
    usage: "amendments",
    description: "Fetches and displays amendments information from AIP Spain.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (!process.env.RAPIDAPI_KEY) {
                return message.reply("❌ ERROR | RAPIDAPI_KEY is not configured. Please set it in the .env file.");
            }

            await message.reply("⏳ Fetching AIP amendments...");

            const response = await axios({
                method: 'POST',
                url: 'https://scrapeninja.p.rapidapi.com/scrape',
                headers: {
                    'Content-Type': 'application/json',
                    'x-rapidapi-host': 'scrapeninja.p.rapidapi.com',
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY
                },
                data: {
                    url: 'https://aip.enaire.es/AIP/ENMIENDAS-es.html',
                    method: 'GET',
                    retryNum: 1,
                    geo: 'eu',
                    extractor: `
function extract(input, cheerio) {
    let $ = cheerio.load(input);
    let results = [];

    $('tr.enmienda, tr.airacInner').each((index, element) => {
        let row = $(element);
        let name = row.find('td.id').text().replace('NUEVO', '').trim();
        let description = row.find('td.desc').text() || row.find('td.wef1').text();
        let isNew = row.find('td.id .nuevo').length > 0 ? "True" : "False";
        let urls = {};

        row.find('td.iconos a').each((i, el) => {
            let url = $(el).attr('href');
            let type = $(el).attr('title');
            if (type && url) {
                urls[type] = 'https://aip.enaire.es/AIP/' + url;
            }
        });

        results.push({
            name: name,
            description: description,
            urls: urls,
            new: isNew
        });
    });

    return results;
}
`
                }
            });

            const data = response.data;

            if (!data || !data.extractor || !Array.isArray(data.extractor.result) || data.extractor.result.length === 0) {
                return message.reply("No amendments found or unable to parse the AIP page.");
            }

            const results = data.extractor.result;
            let replyMessage = `*AIP Spain Amendments*\n_Total: ${results.length} amendments_\n\n`;

            // Limitar a 15 para no exceder el límite de WhatsApp
            const limitedResults = results.slice(0, 15);

            limitedResults.forEach((item, index) => {
                const name = item.new === "True" ? `${item.name} 🆕` : item.name;
                const description = item.description ? item.description.trim() : 'No description';
                replyMessage += `*${index + 1}. ${name}*\n`;
                replyMessage += `${description}\n`;

                const urlEntries = Object.entries(item.urls || {});
                if (urlEntries.length > 0) {
                    urlEntries.forEach(([type, url]) => {
                        replyMessage += `📎 ${type}: ${url}\n`;
                    });
                }
                replyMessage += '\n';
            });

            if (results.length > 15) {
                replyMessage += `_... and ${results.length - 15} more amendments_`;
            }

            return message.reply(replyMessage);

        } catch (e) {
            console.error('Amendments error:', e.message);
            if (e.response) {
                console.error('Response status:', e.response.status);
                console.error('Response data:', e.response.data);
            }
            return message.reply(`❌ Error fetching amendments: ${e.message}`);
        }
    }
};
