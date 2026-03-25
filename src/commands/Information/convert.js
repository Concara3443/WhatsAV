module.exports = {
    name: "convert",
    category: "Information",
    aliases: ["conv", "unit", "units"],
    cooldown: 2,
    usage: "convert <value> <from_unit>",
    description: "Converts between aviation units (ft/m, nm/km, °C/°F, kg/lbs, hPa/inHg, L/gal).",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length < 2) {
                return message.reply(`*Unit Converter* 🔄

*Usage:* \`convert <value> <unit>\`

*Examples:*
\`convert 35000 ft\` → meters
\`convert 10000 m\` → feet
\`convert 100 nm\` → km
\`convert 150 km\` → nm
\`convert 25 c\` → Fahrenheit
\`convert 77 f\` → Celsius
\`convert 100 kg\` → lbs
\`convert 220 lbs\` → kg
\`convert 1013 hpa\` → inHg
\`convert 29.92 inhg\` → hPa
\`convert 100 l\` → gal
\`convert 50 gal\` → liters
\`convert 250 kt\` → km/h
\`convert 450 kmh\` → knots`);
            }

            const value = parseFloat(args[0]);
            const unit = args[1].toLowerCase().replace(/[^a-z]/g, '');

            if (isNaN(value)) {
                return message.reply("Invalid number.");
            }

            let result, fromUnit, toUnit, resultValue;

            const conversions = {
                // Length
                'ft': { factor: 0.3048, to: 'm', toName: 'meters', reverse: 'feet' },
                'feet': { factor: 0.3048, to: 'm', toName: 'meters', reverse: 'feet' },
                'm': { factor: 3.28084, to: 'ft', toName: 'feet', reverse: 'meters' },
                'meters': { factor: 3.28084, to: 'ft', toName: 'feet', reverse: 'meters' },

                // Distance
                'nm': { factor: 1.852, to: 'km', toName: 'kilometers', reverse: 'nautical miles' },
                'km': { factor: 0.539957, to: 'nm', toName: 'nautical miles', reverse: 'kilometers' },
                'mi': { factor: 1.60934, to: 'km', toName: 'kilometers', reverse: 'miles' },
                'miles': { factor: 1.60934, to: 'km', toName: 'kilometers', reverse: 'miles' },

                // Weight
                'kg': { factor: 2.20462, to: 'lbs', toName: 'pounds', reverse: 'kilograms' },
                'lbs': { factor: 0.453592, to: 'kg', toName: 'kilograms', reverse: 'pounds' },
                'lb': { factor: 0.453592, to: 'kg', toName: 'kilograms', reverse: 'pounds' },

                // Volume
                'l': { factor: 0.264172, to: 'gal', toName: 'US gallons', reverse: 'liters' },
                'liter': { factor: 0.264172, to: 'gal', toName: 'US gallons', reverse: 'liters' },
                'liters': { factor: 0.264172, to: 'gal', toName: 'US gallons', reverse: 'liters' },
                'gal': { factor: 3.78541, to: 'L', toName: 'liters', reverse: 'US gallons' },
                'gallon': { factor: 3.78541, to: 'L', toName: 'liters', reverse: 'US gallons' },

                // Speed
                'kt': { factor: 1.852, to: 'km/h', toName: 'km/h', reverse: 'knots' },
                'kts': { factor: 1.852, to: 'km/h', toName: 'km/h', reverse: 'knots' },
                'knots': { factor: 1.852, to: 'km/h', toName: 'km/h', reverse: 'knots' },
                'kmh': { factor: 0.539957, to: 'kt', toName: 'knots', reverse: 'km/h' },
                'kph': { factor: 0.539957, to: 'kt', toName: 'knots', reverse: 'km/h' },
                'mph': { factor: 0.868976, to: 'kt', toName: 'knots', reverse: 'mph' },

                // Pressure
                'hpa': { factor: 0.02953, to: 'inHg', toName: 'inHg', reverse: 'hPa' },
                'mb': { factor: 0.02953, to: 'inHg', toName: 'inHg', reverse: 'hPa' },
                'inhg': { factor: 33.8639, to: 'hPa', toName: 'hPa', reverse: 'inHg' },
            };

            // Temperature handling (special case)
            if (unit === 'c' || unit === 'celsius') {
                resultValue = (value * 9/5) + 32;
                fromUnit = '°C';
                toUnit = '°F';
            } else if (unit === 'f' || unit === 'fahrenheit') {
                resultValue = (value - 32) * 5/9;
                fromUnit = '°F';
                toUnit = '°C';
            } else if (conversions[unit]) {
                const conv = conversions[unit];
                resultValue = value * conv.factor;
                fromUnit = conv.reverse;
                toUnit = conv.toName;
            } else {
                return message.reply(`Unknown unit: ${unit}\n\nSupported: ft, m, nm, km, kg, lbs, L, gal, kt, kmh, hPa, inHg, C, F`);
            }

            let reply = `*Unit Converter* 🔄\n\n`;
            reply += `${value.toLocaleString()} ${fromUnit}\n`;
            reply += `= *${resultValue.toFixed(2).toLocaleString()} ${toUnit}*`;

            // Add useful context
            if (unit === 'ft' || unit === 'feet') {
                if (value >= 18000) {
                    reply += `\n\n_FL${Math.round(value/100)}_`;
                }
            }

            return message.reply(reply);

        } catch (e) {
            console.error('Convert error:', e);
            return message.reply(`Error: ${e.message}`);
        }
    }
};
