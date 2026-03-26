const { fetchData } = require("../../utils/api.js");
const { Location, MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');

// Helper function to check if a Spanish AIP/VFR chart exists
async function checkSpanishCharts(icao) {
    if (!icao || !icao.startsWith("LE")) return null;

    const result = { charts: [], imageUrl: null };
    const aipUrl = `https://aip.enaire.es/AIP/contenido_AIP/AD/AD2/${icao}/LE_AD_2_${icao}_en.pdf`;
    const vfrUrl = `https://guiavfr.enaire.es/contenido_GuiaVFR/AD/LE_guiaVFR_${icao}.html`;
    const vfrImageUrl = `https://guiavfr.enaire.es/contenido_GuiaVFR/AD/LE_guiaVFR_${icao}_img/LE_guiaVFR_${icao}_ADC.png`;

    try {
        const aipResponse = await axios.head(aipUrl, { timeout: 5000, validateStatus: (s) => s < 500 });
        if (aipResponse.status === 200) result.charts.push({ type: "AIP", url: aipUrl });
    } catch (e) { /* ignore */ }

    try {
        const vfrResponse = await axios.head(vfrUrl, { timeout: 5000, validateStatus: (s) => s < 500 });
        if (vfrResponse.status === 200) result.charts.push({ type: "VFR Guide", url: vfrUrl });
    } catch (e) { /* ignore */ }

    try {
        const imgResponse = await axios.head(vfrImageUrl, { timeout: 5000, validateStatus: (s) => s < 500 });
        if (imgResponse.status === 200) result.imageUrl = vfrImageUrl;
    } catch (e) { /* ignore */ }

    return (result.charts.length > 0 || result.imageUrl) ? result : null;
}

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

            fetchData(endpoint, {}).then(async function (response) {

                let replyMessage = `*${response.fullName} (${response.shortName})*`;

                if (response.icao) replyMessage += `\n- *ICAO*: ${response.icao}`;
                if (response.iata) replyMessage += `\n- *IATA*: ${response.iata}`;
                if (response.timeZone) replyMessage += `\n- *Time Zone*: ${response.timeZone}`;
                if (response.urls.webSite) replyMessage += `\n- *Website*: ${response.urls.webSite}`;
                if (response.urls.wikipedia) replyMessage += `\n- *Wikipedia*: ${response.urls.wikipedia}`;
                if (response.urls.twitter) replyMessage += `\n- *Twitter*: ${response.urls.twitter}`;
                if (response.urls.flightRadar) replyMessage += `\n- *Flight Radar*: ${response.urls.flightRadar}`;

                // Check for Spanish AIP charts
                let spanishData = null;
                if (response.icao && response.icao.startsWith("LE")) {
                    spanishData = await checkSpanishCharts(response.icao);
                    if (spanishData && spanishData.charts.length > 0) {
                        replyMessage += `\n\n*📄 AIP Spain:*`;
                        spanishData.charts.forEach(chart => {
                            replyMessage += `\n- *${chart.type}*: ${chart.url}`;
                        });
                    }
                }

                const location = new Location(response.location.lat, response.location.lon, {
                    name: response.fullName,
                    url: response.urls.googleMaps
                });

                await message.reply(replyMessage);
                await client.sendMessage(chatId, location);

                // Send VFR chart image if available
                if (spanishData && spanishData.imageUrl) {
                    try {
                        const media = await MessageMedia.fromUrl(spanishData.imageUrl, { unsafeMime: true });
                        await client.sendMessage(chatId, media, { caption: `*VFR Chart - ${response.icao}*` });
                    } catch (imgError) {
                        console.error('Error sending VFR image:', imgError);
                    }
                }

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