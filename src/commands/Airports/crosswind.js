module.exports = {
    name: "crosswind",
    category: "Airports",
    aliases: ["xwind", "wind"],
    cooldown: 2,
    usage: "crosswind <wind_dir> <wind_speed> <runway_heading>",
    description: "Calculates crosswind and headwind/tailwind components for a runway.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length < 3) {
                return message.reply(`*Crosswind Calculator* 💨

*Usage:* \`crosswind <wind_dir> <wind_speed> <runway>\`

*Example:*
\`crosswind 270 15 24\` or \`crosswind 270 15 240\`
- Wind from 270° at 15kts
- Runway 24 (heading 240°)

*With gusts:*
\`crosswind 270 15G25 24\`
- Wind 270° at 15kts gusting 25kts`);
            }

            const windDir = parseInt(args[0]);
            let windSpeed, gustSpeed = null;

            // Parse wind speed (can be "15" or "15G25")
            const windStr = args[1].toUpperCase();
            if (windStr.includes('G')) {
                const parts = windStr.split('G');
                windSpeed = parseInt(parts[0]);
                gustSpeed = parseInt(parts[1]);
            } else {
                windSpeed = parseInt(windStr);
            }

            // Parse runway (can be "24" or "240")
            let runwayInput = args[2];
            let runwayHeading;
            if (runwayInput.length <= 2) {
                runwayHeading = parseInt(runwayInput) * 10;
            } else {
                runwayHeading = parseInt(runwayInput);
            }

            // Validations
            if (isNaN(windDir) || isNaN(windSpeed) || isNaN(runwayHeading)) {
                return message.reply("Invalid numbers. Example: `crosswind 270 15 24`");
            }

            // Calculate wind angle relative to runway
            let windAngle = windDir - runwayHeading;

            // Normalize to -180 to 180
            while (windAngle > 180) windAngle -= 360;
            while (windAngle < -180) windAngle += 360;

            const windAngleRad = Math.abs(windAngle) * (Math.PI / 180);

            // Calculate components
            const crosswind = Math.abs(Math.sin(windAngleRad) * windSpeed);
            const headwind = Math.cos(windAngleRad) * windSpeed;

            // Determine side and head/tail
            const crosswindSide = windAngle > 0 ? "RIGHT" : "LEFT";
            const isHeadwind = headwind > 0;

            let reply = `*Crosswind Calculator* 💨\n\n`;
            reply += `*Wind:* ${windDir}° at ${windSpeed}kt`;
            if (gustSpeed) reply += ` (G${gustSpeed})`;
            reply += `\n*Runway:* ${String(runwayHeading / 10).padStart(2, '0')} (${runwayHeading}°)\n`;
            reply += `*Wind angle:* ${Math.abs(windAngle)}° from ${crosswindSide.toLowerCase()}\n\n`;

            reply += `📊 *Components:*\n`;
            reply += `↔️ Crosswind: *${Math.round(crosswind)}kt* from ${crosswindSide}\n`;

            if (isHeadwind) {
                reply += `↑ Headwind: *${Math.round(Math.abs(headwind))}kt*\n`;
            } else {
                reply += `↓ Tailwind: *${Math.round(Math.abs(headwind))}kt* ⚠️\n`;
            }

            // With gusts
            if (gustSpeed) {
                const crosswindGust = Math.abs(Math.sin(windAngleRad) * gustSpeed);
                const headwindGust = Math.cos(windAngleRad) * gustSpeed;
                reply += `\n*With gusts (${gustSpeed}kt):*\n`;
                reply += `↔️ Crosswind: *${Math.round(crosswindGust)}kt*\n`;
                if (isHeadwind) {
                    reply += `↑ Headwind: *${Math.round(Math.abs(headwindGust))}kt*\n`;
                } else {
                    reply += `↓ Tailwind: *${Math.round(Math.abs(headwindGust))}kt*\n`;
                }
            }

            // Warnings
            if (crosswind > 15) {
                reply += `\n⚠️ _Strong crosswind - check aircraft limits_`;
            }
            if (!isHeadwind && Math.abs(headwind) > 10) {
                reply += `\n⚠️ _Significant tailwind - consider opposite runway_`;
            }

            return message.reply(reply);

        } catch (e) {
            console.error('Crosswind error:', e);
            return message.reply(`Error: ${e.message}`);
        }
    }
};
