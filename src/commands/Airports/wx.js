const axios = require('axios');

module.exports = {
    name: "wx",
    category: "Airports",
    aliases: ["weather", "tiempo"],
    cooldown: 3,
    usage: "wx <ICAO>",
    description: "Shows a human-readable weather summary for an airport.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length === 0) {
                return message.reply("Please provide an ICAO code. Example: `wx LEMD`");
            }

            const icao = args[0].toUpperCase();
            if (icao.length !== 4) {
                return message.reply("Invalid ICAO code. It must be 4 characters.");
            }

            const response = await axios.get('https://aviationweather.gov/api/data/metar', {
                params: { ids: icao, format: 'json' }
            });

            const data = response.data;
            if (!data || data.length === 0) {
                return message.reply(`No weather data found for ${icao}.`);
            }

            const metar = data[0];

            // Build human-readable weather
            let reply = `*Weather at ${metar.name || icao}* ✈️\n`;
            reply += `_(${metar.icaoId})_\n\n`;

            // Temperature
            if (metar.temp !== undefined) {
                reply += `🌡️ *Temperature:* ${metar.temp}°C`;
                if (metar.dewp !== undefined) {
                    reply += ` (Dew point: ${metar.dewp}°C)`;
                }
                reply += '\n';
            }

            // Wind
            if (metar.wdir !== undefined && metar.wspd !== undefined) {
                let windDesc = '';
                if (metar.wdir === 0 && metar.wspd === 0) {
                    windDesc = 'Calm';
                } else if (metar.wdir === 'VRB') {
                    windDesc = `Variable at ${metar.wspd} kt`;
                } else {
                    windDesc = `${metar.wdir}° at ${metar.wspd} kt`;
                    if (metar.wgst) {
                        windDesc += ` (gusts ${metar.wgst} kt)`;
                    }
                }
                reply += `💨 *Wind:* ${windDesc}\n`;
            }

            // Visibility
            if (metar.visib !== undefined) {
                let visDesc = metar.visib >= 9999 ? '10+ km (CAVOK)' : `${metar.visib} SM`;
                reply += `👁️ *Visibility:* ${visDesc}\n`;
            }

            // Pressure
            if (metar.altim !== undefined) {
                const hPa = metar.altim;
                const inHg = (hPa / 33.8639).toFixed(2);
                reply += `📊 *Pressure:* ${hPa} hPa (${inHg} inHg)\n`;
            }

            // Weather phenomena
            if (metar.wxString) {
                const wxDescriptions = {
                    'RA': 'Rain', 'SN': 'Snow', 'DZ': 'Drizzle',
                    'FG': 'Fog', 'BR': 'Mist', 'HZ': 'Haze',
                    'TS': 'Thunderstorm', 'SH': 'Showers',
                    'GR': 'Hail', 'FZ': 'Freezing', 'BL': 'Blowing',
                    '+': 'Heavy', '-': 'Light', 'VC': 'Vicinity'
                };

                let wxText = metar.wxString;
                for (const [code, desc] of Object.entries(wxDescriptions)) {
                    wxText = wxText.replace(new RegExp(code, 'g'), desc + ' ');
                }
                reply += `🌧️ *Weather:* ${wxText.trim()}\n`;
            }

            // Clouds
            if (metar.clouds && metar.clouds.length > 0) {
                const cloudTypes = {
                    'FEW': 'Few', 'SCT': 'Scattered',
                    'BKN': 'Broken', 'OVC': 'Overcast',
                    'CLR': 'Clear', 'SKC': 'Sky Clear',
                    'NSC': 'No Significant Cloud'
                };

                const cloudDescs = metar.clouds.map(c => {
                    const type = cloudTypes[c.cover] || c.cover;
                    return c.base ? `${type} at ${c.base * 100}ft` : type;
                });
                reply += `☁️ *Clouds:* ${cloudDescs.join(', ')}\n`;
            }

            // Flight category
            if (metar.fltcat) {
                const catEmoji = {
                    'VFR': '🟢', 'MVFR': '🔵',
                    'IFR': '🔴', 'LIFR': '🟣'
                };
                reply += `\n${catEmoji[metar.fltcat] || '⚪'} *Flight Category:* ${metar.fltcat}\n`;
            }

            // Observation time
            if (metar.obsTime) {
                const obsTime = new Date(metar.obsTime * 1000);
                reply += `\n🕐 _Observed: ${obsTime.toUTCString()}_`;
            }

            return message.reply(reply);

        } catch (e) {
            console.error('WX error:', e);
            if (e.code === 'ENOTFOUND') {
                return message.reply("Unable to reach weather service. Try again later.");
            }
            return message.reply(`❌ Error: ${e.message}`);
        }
    }
};
