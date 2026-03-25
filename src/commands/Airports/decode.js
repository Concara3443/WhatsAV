const axios = require('axios');

module.exports = {
    name: "decode",
    category: "Airports",
    aliases: ["dmetar", "decodemetar"],
    cooldown: 3,
    usage: "decode <ICAO>",
    description: "Decodes METAR into detailed human-readable format with all information.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length === 0) {
                return message.reply("Please provide an ICAO code. Example: `decode LEMD`");
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
                return message.reply(`No METAR found for ${icao}.`);
            }

            const m = data[0];

            let reply = `*METAR Decode: ${m.icaoId}*\n`;
            reply += `📍 ${m.name || 'Unknown'}\n\n`;

            // Raw METAR
            reply += `📝 *Raw:*\n\`${m.rawOb}\`\n\n`;

            reply += `*Decoded:*\n`;

            // Station
            reply += `🏢 *Station:* ${m.icaoId}\n`;

            // Time
            if (m.obsTime) {
                const t = new Date(m.obsTime * 1000);
                reply += `🕐 *Time:* ${t.getUTCDate().toString().padStart(2, '0')}${t.getUTCHours().toString().padStart(2, '0')}${t.getUTCMinutes().toString().padStart(2, '0')}Z\n`;
            }

            // Wind
            if (m.wdir !== undefined) {
                let wind = '';
                if (m.wdir === 0 && m.wspd === 0) {
                    wind = '00000KT - Calm winds';
                } else if (m.wdir === 'VRB') {
                    wind = `VRB${String(m.wspd).padStart(2, '0')}KT - Variable direction at ${m.wspd} knots`;
                } else {
                    wind = `${String(m.wdir).padStart(3, '0')}${String(m.wspd).padStart(2, '0')}`;
                    if (m.wgst) wind += `G${m.wgst}`;
                    wind += `KT - From ${m.wdir}° at ${m.wspd} knots`;
                    if (m.wgst) wind += `, gusting to ${m.wgst} knots`;
                }
                reply += `💨 *Wind:* ${wind}\n`;
            }

            // Visibility
            if (m.visib !== undefined) {
                reply += `👁️ *Visibility:* ${m.visib}SM - ${m.visib >= 6 ? 'Good visibility' : m.visib >= 3 ? 'Moderate visibility' : 'Poor visibility'}\n`;
            }

            // Weather
            if (m.wxString) {
                const wx = {
                    '+': 'Heavy', '-': 'Light', 'VC': 'In vicinity',
                    'MI': 'Shallow', 'BC': 'Patches', 'PR': 'Partial',
                    'DR': 'Drifting', 'BL': 'Blowing', 'SH': 'Showers',
                    'TS': 'Thunderstorm', 'FZ': 'Freezing',
                    'RA': 'Rain', 'SN': 'Snow', 'DZ': 'Drizzle',
                    'GR': 'Hail', 'GS': 'Small hail', 'PE': 'Ice pellets',
                    'SG': 'Snow grains', 'IC': 'Ice crystals', 'UP': 'Unknown precip',
                    'BR': 'Mist', 'FG': 'Fog', 'HZ': 'Haze',
                    'DU': 'Dust', 'SA': 'Sand', 'FU': 'Smoke', 'VA': 'Volcanic ash',
                    'PO': 'Dust devils', 'SQ': 'Squall', 'FC': 'Funnel cloud',
                    'SS': 'Sandstorm', 'DS': 'Duststorm'
                };
                let wxDecoded = m.wxString;
                for (const [code, desc] of Object.entries(wx)) {
                    wxDecoded = wxDecoded.replace(new RegExp(`\\b${code}\\b`, 'g'), `${code}(${desc})`);
                }
                reply += `🌧️ *Weather:* ${m.wxString} - ${wxDecoded}\n`;
            }

            // Clouds
            if (m.clouds && m.clouds.length > 0) {
                const covers = {
                    'FEW': '1-2 oktas', 'SCT': '3-4 oktas',
                    'BKN': '5-7 oktas', 'OVC': '8 oktas',
                    'CLR': 'Clear below 12000ft', 'SKC': 'Sky clear',
                    'NSC': 'No significant cloud', 'NCD': 'No cloud detected'
                };
                m.clouds.forEach((c, i) => {
                    let cloudDesc = `${c.cover}`;
                    if (c.base) cloudDesc += `${String(c.base).padStart(3, '0')}`;
                    cloudDesc += ` - ${covers[c.cover] || c.cover}`;
                    if (c.base) cloudDesc += ` at ${c.base * 100}ft AGL`;
                    reply += `☁️ *Cloud ${i + 1}:* ${cloudDesc}\n`;
                });
            }

            // Temperature/Dewpoint
            if (m.temp !== undefined) {
                const tempSign = m.temp < 0 ? 'M' : '';
                const dewpSign = m.dewp < 0 ? 'M' : '';
                reply += `🌡️ *Temp/Dewpoint:* ${tempSign}${Math.abs(m.temp).toString().padStart(2, '0')}/${dewpSign}${Math.abs(m.dewp).toString().padStart(2, '0')} - Temperature ${m.temp}°C, Dewpoint ${m.dewp}°C\n`;

                // Spread
                const spread = m.temp - m.dewp;
                reply += `💧 *Spread:* ${spread.toFixed(1)}°C ${spread <= 3 ? '⚠️ (fog/low cloud likely)' : ''}\n`;
            }

            // Altimeter
            if (m.altim) {
                const inHg = (m.altim / 33.8639).toFixed(2);
                reply += `📊 *Altimeter:* Q${m.altim}/A${inHg.replace('.', '')} - ${m.altim} hPa / ${inHg} inHg\n`;
            }

            // Flight category
            if (m.fltcat) {
                const cats = {
                    'VFR': '🟢 Visual Flight Rules (ceiling >3000ft, vis >5SM)',
                    'MVFR': '🔵 Marginal VFR (ceiling 1000-3000ft, vis 3-5SM)',
                    'IFR': '🔴 Instrument Flight Rules (ceiling 500-1000ft, vis 1-3SM)',
                    'LIFR': '🟣 Low IFR (ceiling <500ft, vis <1SM)'
                };
                reply += `\n✈️ *Category:* ${cats[m.fltcat] || m.fltcat}\n`;
            }

            return message.reply(reply);

        } catch (e) {
            console.error('Decode error:', e);
            return message.reply(`❌ Error: ${e.message}`);
        }
    }
};
