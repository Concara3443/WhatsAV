module.exports = {
    name: "tas",
    category: "Airports",
    aliases: ["truespeed", "airspeed"],
    cooldown: 2,
    usage: "tas <IAS> <altitude_ft> [temperature_C]",
    description: "Calculates True Airspeed (TAS) from Indicated Airspeed (IAS), altitude, and temperature.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length < 2) {
                return message.reply(`*TAS Calculator* ✈️

*Usage:* \`tas <IAS> <altitude> [temp]\`

*Examples:*
\`tas 250 35000\` → FL350, ISA temp
\`tas 250 35000 -55\` → with OAT -55°C
\`tas 120 5000 15\` → 5000ft, 15°C`);
            }

            const ias = parseFloat(args[0]);
            const altitude = parseFloat(args[1]);

            // ISA temperature at altitude
            const isaTemp = 15 - (altitude * 0.00198); // ~2°C per 1000ft
            const oat = args[2] !== undefined ? parseFloat(args[2]) : isaTemp;

            if (isNaN(ias) || isNaN(altitude)) {
                return message.reply("Invalid numbers. Example: `tas 250 35000`");
            }

            // Calculate pressure altitude effect
            // TAS = IAS × √(ρ₀/ρ) ≈ IAS × (1 + altitude/50000) for rough calculation
            // More accurate: TAS = IAS × √(288/(288-0.00198×alt)) × √((273+OAT)/288)

            const tempKelvin = 273.15 + oat;
            const isaTempKelvin = 273.15 + isaTemp;

            // Pressure ratio (simplified)
            const pressureRatio = Math.pow(1 - (altitude * 0.0000068756), 5.2559);

            // Density ratio
            const densityRatio = pressureRatio * (288.15 / tempKelvin);

            // TAS calculation
            const tas = ias / Math.sqrt(densityRatio);

            // Mach number (speed of sound varies with temp)
            const speedOfSound = 38.967854 * Math.sqrt(tempKelvin); // in knots
            const mach = tas / speedOfSound;

            // ISA deviation
            const isaDeviation = oat - isaTemp;

            let reply = `*TAS Calculator* ✈️\n\n`;
            reply += `*Input:*\n`;
            reply += `IAS: ${ias}kt\n`;
            reply += `Altitude: ${altitude.toLocaleString()}ft`;
            if (altitude >= 18000) reply += ` (FL${Math.round(altitude/100)})`;
            reply += `\n`;
            reply += `OAT: ${oat.toFixed(0)}°C\n`;
            reply += `ISA: ${isaTemp.toFixed(0)}°C (${isaDeviation >= 0 ? '+' : ''}${isaDeviation.toFixed(0)})\n\n`;

            reply += `📊 *Results:*\n`;
            reply += `TAS: *${Math.round(tas)}kt*\n`;
            reply += `Mach: *${mach.toFixed(2)}*\n`;
            reply += `\n_Density ratio: ${densityRatio.toFixed(3)}_`;

            return message.reply(reply);

        } catch (e) {
            console.error('TAS error:', e);
            return message.reply(`Error: ${e.message}`);
        }
    }
};
