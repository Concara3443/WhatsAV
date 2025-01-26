const fetch = require('node-fetch');
module.exports = {
    name: "amendments",
    category: "AIP",
    aliases: ["enmiendas", "amdt", "enmienda", "amendments"],
    cooldown: 5,
    usage: "amendments",
    description: "Fetches and displays amendments information from AIP Spain.",
    memberpermissions: [],
    requiredroles: [],
    alloweduserids: [],
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            const url = 'https://scrapeninja.p.rapidapi.com/scrape';
            const headers = {
                "Content-Type": "application/json",
                "x-rapidapi-host": "scrapeninja.p.rapidapi.com",
                "x-rapidapi-key": process.env.RAPIDAPI_KEY
            };
            
            const payload = {
                "url": "https://aip.enaire.es/AIP/ENMIENDAS-es.html",
                "method": "GET",
                "retryNum": 1,
                "geo": "eu",
                "extractor": "\nfunction extract(input, cheerio) {\n    let $ = cheerio.load(input);\n    let results = [];\n\n    $('tr.enmienda, tr.airacInner').each((index, element) => {\n        let row = $(element);\n        let name = row.find('td.id').text().replace('NUEVO', '').trim();\n        let description = row.find('td.desc').text() || row.find('td.wef1').text();\n        let isNew = row.find('td.id .nuevo').length > 0 ? \"True\" : \"False\";\n        let urls = {};\n\n        row.find('td.iconos a').each((i, el) => {\n            let url = $(el).attr('href');\n            let type = $(el).attr('title');\n            if (type && url) {\n                urls[type] = `https://aip.enaire.es/AIP/${url}`;\n            }\n        });\n\n        results.push({\n            name: name,\n            description: description,\n            urls: urls,\n            new: isNew\n        });\n    });\n\n    return results;\n}\n"
            };

            const options = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            };

            const response = await fetch(url, options);
            const responseJson = await response.json();

            if (!responseJson || !Array.isArray(responseJson.extractor.result) || responseJson.extractor.result.length === 0) {
                return message.reply("No amendments found.");
            }

            let replyMessage = "Amendments from AIP Spain:\n";
            responseJson.extractor.result.forEach((item, index) => {
                let name = item.new === "True" ? `${item.name} *NEW*` : item.name;
                let description = item.description.includes("FUTURO") ? item.description.replace("FUTURO", "FUTURO ") : item.description;
                replyMessage += `${index + 1}. ${name} - ${description}\n`;
                for (const [type, url] of Object.entries(item.urls)) {
                    replyMessage += `${type}: ${url}\n`;
                }
            });

            message.reply(replyMessage);
        } catch (e) {
            console.error(e);
            message.reply('An error occurred while fetching the amendments information.');
        }
    }
};
