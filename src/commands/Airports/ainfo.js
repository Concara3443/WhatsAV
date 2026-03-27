const { fetchData } = require("../../utils/api.js");
const axios = require('axios');

// Verificar si una URL existe
async function urlExists(url) {
    try {
        const response = await axios.head(url, { timeout: 5000, validateStatus: (s) => s < 500 });
        return response.status === 200;
    } catch (e) {
        return false;
    }
}

// Obtener información de la guía VFR de ENAIRE
async function getVfrGuideInfo(icao) {
    const htmlUrl = `https://guiavfr.enaire.es/contenido_GuiaVFR/AD/LE_guiaVFR_${icao}.html`;

    try {
        const response = await axios.get(htmlUrl, { timeout: 10000 });
        const html = response.data;

        const info = {
            exists: true,
            htmlUrl,
            pdfUrl: null,
            imageUrl: null,
            name: null,
            elevation: null,
            coordinates: null,
            runways: [],
            frequencies: []
        };

        // Extraer nombre del aeropuerto
        const nameMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (nameMatch) {
            info.name = nameMatch[1].replace('Guía VFR - ', '').trim();
        }

        // Extraer elevación
        const elevMatch = html.match(/Elevaci[oó]n[:\s]*(\d+)\s*(?:ft|FT)/i);
        if (elevMatch) {
            info.elevation = elevMatch[1] + ' ft';
        }

        // Extraer coordenadas
        const coordMatch = html.match(/(\d{6,7}[NS])\s*(\d{6,7}[EWO])/i);
        if (coordMatch) {
            info.coordinates = `${coordMatch[1]} ${coordMatch[2]}`;
        }

        // Extraer pistas (RWY)
        const rwyMatches = html.match(/RWY\s*(\d{2}[LRC]?)\s*[\/\\]\s*(\d{2}[LRC]?)/gi);
        if (rwyMatches) {
            info.runways = [...new Set(rwyMatches)];
        }

        // Extraer frecuencias
        const freqMatches = html.match(/(\d{3}\.\d{2,3})\s*(?:MHz)?/g);
        if (freqMatches) {
            info.frequencies = [...new Set(freqMatches)].slice(0, 5);
        }

        // Verificar si existe el PDF
        const pdfUrl = `https://guiavfr.enaire.es/contenido_GuiaVFR/AD/LE_guiaVFR_${icao}.pdf`;
        if (await urlExists(pdfUrl)) {
            info.pdfUrl = pdfUrl;
        }

        // Verificar si existe la imagen
        const imageUrl = `https://guiavfr.enaire.es/contenido_GuiaVFR/AD/LE_guiaVFR_${icao}_img/LE_guiaVFR_${icao}_VAC.png`;
        if (await urlExists(imageUrl)) {
            info.imageUrl = imageUrl;
        }

        return info;
    } catch (e) {
        return null;
    }
}

// Obtener charts españoles para aeropuertos que sí están en la API
async function getSpanishCharts(icao) {
    if (!icao || !icao.startsWith("LE")) return null;

    const result = { aipUrl: null, vfrHtmlUrl: null, vfrPdfUrl: null, imageUrl: null };

    const aipUrl = `https://aip.enaire.es/AIP/contenido_AIP/AD/AD2/${icao}/LE_AD_2_${icao}_en.pdf`;
    const vfrHtmlUrl = `https://guiavfr.enaire.es/contenido_GuiaVFR/AD/LE_guiaVFR_${icao}.html`;
    const vfrPdfUrl = `https://guiavfr.enaire.es/contenido_GuiaVFR/AD/LE_guiaVFR_${icao}.pdf`;
    const imageUrl = `https://guiavfr.enaire.es/contenido_GuiaVFR/AD/LE_guiaVFR_${icao}_img/LE_guiaVFR_${icao}_VAC.png`;

    const [aipExists, vfrHtmlExists, vfrPdfExists, imageExists] = await Promise.all([
        urlExists(aipUrl),
        urlExists(vfrHtmlUrl),
        urlExists(vfrPdfUrl),
        urlExists(imageUrl)
    ]);

    if (aipExists) result.aipUrl = aipUrl;
    if (vfrHtmlExists) result.vfrHtmlUrl = vfrHtmlUrl;
    if (vfrPdfExists) result.vfrPdfUrl = vfrPdfUrl;
    if (imageExists) result.imageUrl = imageUrl;

    return (result.aipUrl || result.vfrHtmlUrl || result.vfrPdfUrl || result.imageUrl) ? result : null;
}

module.exports = {
    name: "ainfo",
    category: "Airports",
    aliases: ["ai"],
    cooldown: 3,
    usage: "ainfo <ICAO/IATA>",
    description: "Returns information about the provided airport. Supports Spanish VFR guide for LE* airports.",
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

            let foundInApi = false;

            try {
                const response = await fetchData(endpoint, {});

                // Verificar que la respuesta tiene datos válidos
                if (!response || (!response.fullName && !response.icao && !response.iata)) {
                    throw new Error('Airport not found in API');
                }

                const airportName = response.fullName || response.shortName || response.icao || code;
                const shortName = response.shortName || '';
                let replyMessage = shortName ? `*${airportName} (${shortName})*` : `*${airportName}*`;

                if (response.icao) replyMessage += `\n- *ICAO*: ${response.icao}`;
                if (response.iata) replyMessage += `\n- *IATA*: ${response.iata}`;
                if (response.timeZone) replyMessage += `\n- *Time Zone*: ${response.timeZone}`;
                if (response.urls?.webSite) replyMessage += `\n- *Website*: ${response.urls.webSite}`;
                if (response.urls?.wikipedia) replyMessage += `\n- *Wikipedia*: ${response.urls.wikipedia}`;
                if (response.urls?.flightRadar) replyMessage += `\n- *Flight Radar*: ${response.urls.flightRadar}`;

                // Check for Spanish charts
                const icaoCode = response.icao || code;
                if (icaoCode.startsWith("LE")) {
                    const spanishData = await getSpanishCharts(icaoCode);
                    if (spanishData) {
                        replyMessage += `\n\n*Spain AIP/VFR:*`;
                        if (spanishData.aipUrl) replyMessage += `\n- *AIP*: ${spanishData.aipUrl}`;
                        if (spanishData.vfrPdfUrl) replyMessage += `\n- *VFR PDF*: ${spanishData.vfrPdfUrl}`;
                        if (spanishData.vfrHtmlUrl) replyMessage += `\n- *VFR Web*: ${spanishData.vfrHtmlUrl}`;
                    }
                }

                await message.reply(replyMessage);

                // Send location
                if (response.location?.lat && response.location?.lon) {
                    try {
                        await client.sock.sendMessage(chatId, {
                            location: {
                                degreesLatitude: response.location.lat,
                                degreesLongitude: response.location.lon,
                                name: response.fullName,
                                url: response.urls?.googleMaps || ''
                            }
                        });
                    } catch (e) { /* ignore */ }
                }

                // Send VFR chart image if available (Spanish airports)
                if (icaoCode.startsWith("LE")) {
                    const spanishData = await getSpanishCharts(icaoCode);
                    if (spanishData?.imageUrl) {
                        try {
                            await client.sock.sendMessage(chatId, {
                                image: { url: spanishData.imageUrl },
                                caption: `*VFR Chart - ${icaoCode}*`
                            });
                        } catch (e) { /* ignore */ }
                    }
                }

            } catch (apiError) {
                // API failed - try VFR guide for Spanish ICAO codes
                if (code.length === 4 && code.startsWith("LE")) {
                    const vfrInfo = await getVfrGuideInfo(code);

                    if (vfrInfo && vfrInfo.exists) {
                        let replyMessage = `*${vfrInfo.name || code}*\n_(VFR Guide)_`;

                        replyMessage += `\n\n- *ICAO*: ${code}`;
                        if (vfrInfo.elevation) replyMessage += `\n- *Elevation*: ${vfrInfo.elevation}`;
                        if (vfrInfo.coordinates) replyMessage += `\n- *Coordinates*: ${vfrInfo.coordinates}`;
                        if (vfrInfo.runways.length > 0) replyMessage += `\n- *Runways*: ${vfrInfo.runways.join(', ')}`;
                        if (vfrInfo.frequencies.length > 0) replyMessage += `\n- *Frequencies*: ${vfrInfo.frequencies.join(', ')}`;

                        replyMessage += `\n\n*Links:*`;
                        replyMessage += `\n- *VFR Web*: ${vfrInfo.htmlUrl}`;
                        if (vfrInfo.pdfUrl) replyMessage += `\n- *VFR PDF*: ${vfrInfo.pdfUrl}`;

                        await message.reply(replyMessage);

                        // Send image if exists
                        if (vfrInfo.imageUrl) {
                            try {
                                await client.sock.sendMessage(chatId, {
                                    image: { url: vfrInfo.imageUrl },
                                    caption: `*VFR Chart - ${code}*`
                                });
                            } catch (e) { /* ignore */ }
                        }
                    } else {
                        return message.reply(`Airport not found: ${code}`);
                    }
                } else {
                    return message.reply(`Airport not found: ${code}`);
                }
            }

        } catch (e) {
            console.error('ainfo error:', e);
            return message.reply(`Error fetching airport information.`);
        }
    }
}
