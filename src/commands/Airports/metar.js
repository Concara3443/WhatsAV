const config = require("../../../config/config.json");
const settings = require("../../../config/settings.json");
var axios = require("axios");
module.exports = {
    name: "metar",
    category: "Airports",
    aliases: ["mt"],
    cooldown: 3,
    usage: "metar <Airport ICAO> [Airport ICAO] [Airport ICAO] ...",
    description: "Returns the METAR data for the provided ICAO code.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            const icaoCodes = args.join(',');

            if (icaoCodes.length == 0) {
                return message.reply("Please provide at least one ICAO code.");
            }

            for (const code of args) {
                if (code.length !== 4) {
                    return message.reply(`The code "${code}" is invalid. You must provide an icao code.`);
                }
            }

            const options = {
                method: 'GET',
                url: 'https://aviationweather.gov/api/data/metar',
                params: { ids: icaoCodes, format: 'json', taf: 'false' },
            };

            axios.request(options).then(function (response) {

                const metarData = response.data;

                if (metarData.length === 0) {
                    return message.reply("No METAR data found for the provided ICAO codes.");
                }

                let replyMessage = "METAR Data:\n";
                const weatherCodes = {
                    "+": "heavy",
                    "-": "light",
                    "RE": "recent",
                    "VC": "in the vicinity",
                    "BC": "patches of",
                    "DR": "low drifting",
                    "MI": "shallow",
                    "PR": "partial",
                    "BL": "blowing",
                    "FZ": "freezing",
                    "SH": "showers",
                    "TS": "thunderstorms",
                    "BR": "mist",
                    "DS": "dust storm",
                    "DU": "widespread dust",
                    "DZ": "drizzle",
                    "FC": "funnel cloud",
                    "FG": "fog",
                    "FU": "smoke",
                    "GR": "hail",
                    "GS": "small hail",
                    "HZ": "haze",
                    "IC": "ice crystals",
                    "PE": "ice pellets",
                    "PO": "sand whirls",
                    "PY": "spray",
                    "RA": "rain",
                    "SA": "sand",
                    "SG": "snow grains",
                    "SN": "snow",
                    "SQ": "squalls",
                    "SS": "sand storm",
                    "UP": "unknown precipitation",
                    "VA": "volcanic ash"
                };

                metarData.forEach(metar => {
                    replyMessage += `\n*${metar.name} (${metar.icaoId})*\n`;
                    replyMessage += `Temperature: ${metar.temp}°C\n`;
                    replyMessage += `Dew Point: ${metar.dewp}°C\n`;
                    replyMessage += `Wind: ${metar.wdir}° at ${metar.wspd} knots\n`;
                    replyMessage += `Visibility: ${metar.visib}\n`;
                    replyMessage += `Altimeter: ${metar.altim} hPa\n`;
                    
                    if (metar.wxString) {
                        const wxCodes = metar.wxString.split(' ');
                        replyMessage += `Weather Phenomena:\n`;
                        wxCodes.forEach(code => {
                            let description = weatherCodes[code];
                            if (!description) {
                                // Handle intensity, characteristic, and type combinations
                                const intensityIndicators = ['-', '+', 'VC'];
                                const characteristicIndicators = ['BC', 'DR', 'MI', 'PR', 'BL', 'FZ', 'SH', 'TS'];
                                
                                let intensityDescription = '';
                                let characteristicDescription = '';
                                let type = code;
                    
                                // Check for intensity indicators
                                if (intensityIndicators.includes(code.charAt(0))) {
                                    const intensity = code.charAt(0);
                                    type = code.slice(1);
                                    switch (intensity) {
                                        case '-':
                                            intensityDescription = 'light';
                                            break;
                                        case '+':
                                            intensityDescription = 'heavy';
                                            break;
                                        case 'VC':
                                            intensityDescription = 'in the vicinity';
                                            break;
                                        default:
                                            intensityDescription = '';
                                    }
                                }
                    
                                // Check for characteristic indicators
                                characteristicIndicators.forEach(indicator => {
                                    if (type.startsWith(indicator)) {
                                        switch (indicator) {
                                            case 'BC':
                                                characteristicDescription = 'patches of';
                                                break;
                                            case 'DR':
                                                characteristicDescription = 'low drifting';
                                                break;
                                            case 'MI':
                                                characteristicDescription = 'shallow';
                                                break;
                                            case 'PR':
                                                characteristicDescription = 'partial';
                                                break;
                                            case 'BL':
                                                characteristicDescription = 'blowing';
                                                break;
                                            case 'FZ':
                                                characteristicDescription = 'freezing';
                                                break;
                                            case 'SH':
                                                characteristicDescription = 'showers';
                                                break;
                                            case 'TS':
                                                characteristicDescription = 'thunderstorms';
                                                break;
                                            default:
                                                characteristicDescription = '';
                                        }
                                        type = type.slice(indicator.length);
                                    }
                                });
                    
                                description = `${intensityDescription} ${characteristicDescription} ${weatherCodes[type] || 'unknown'}`.trim();
                            }
                    
                            // Capitalize the first letter of each word in the description
                            description = description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    
                            replyMessage += `${code}: ${description}\n`;
                        });
                    }
                    
                    replyMessage += `Raw Observation:\n${metar.rawOb}\n`;
                });

                message.reply(replyMessage);

            }).catch(function (error) {
                if (error.code === 'ENOTFOUND') {
                    return message.reply("❌ ERROR | Unable to reach the aviation weather service. Please check your internet connection or try again later.");
                }
                console.error(error);
            });

        } catch (e) {
            console.log(String(e.stack));
            return message.reply(`❌ ERROR | An error occurred\n\`\`\`${e.message ? String(e.message).slice(0, 2000) : String(e).slice(0, 2000)}\`\`\``);
        }
    }
}