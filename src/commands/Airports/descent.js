module.exports = {
    name: "descent",
    category: "Airports",
    aliases: ["tod", "descenso", "vnav"],
    cooldown: 2,
    usage: "descent <current_alt> <target_alt> <distance_nm> [ground_speed]",
    description: "Calculates Top of Descent (TOD) and required descent rate. Altitudes in feet, distance in NM, speed in knots.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length < 3) {
                return message.reply(`*Descent Calculator* ✈️

*Usage:* \`descent <current_alt> <target_alt> <distance> [speed]\`

*Example:*
\`descent 35000 3000 120 450\`
- Current: FL350
- Target: 3000ft
- Distance to point: 120nm
- Ground speed: 450kts

*Quick example:*
\`descent 10000 2000 25\`
- Descend from 10000 to 2000ft
- 25nm to destination`);
            }

            const currentAlt = parseInt(args[0]);
            const targetAlt = parseInt(args[1]);
            const distance = parseFloat(args[2]);
            const groundSpeed = args[3] ? parseInt(args[3]) : null;

            // Validations
            if (isNaN(currentAlt) || isNaN(targetAlt) || isNaN(distance)) {
                return message.reply("Invalid numbers. Use: `descent 35000 3000 120 450`");
            }

            if (currentAlt <= targetAlt) {
                return message.reply("Current altitude must be higher than target altitude.");
            }

            if (distance <= 0) {
                return message.reply("Distance must be greater than 0.");
            }

            const altitudeDiff = currentAlt - targetAlt;

            // Standard 3° descent path = 3nm per 1000ft
            const todDistance = (altitudeDiff / 1000) * 3;

            // Distance from current position to start descent
            const distanceToTOD = distance - todDistance;

            // Calculate descent angle
            const descentAngle = Math.atan(altitudeDiff / (distance * 6076.12)) * (180 / Math.PI);

            // Calculate gradient (ft per nm)
            const gradient = altitudeDiff / distance;

            let reply = `*Descent Calculator* ✈️\n\n`;
            reply += `*Current:* ${currentAlt.toLocaleString()}ft\n`;
            reply += `*Target:* ${targetAlt.toLocaleString()}ft\n`;
            reply += `*Distance:* ${distance}nm\n`;
            reply += `*Altitude to lose:* ${altitudeDiff.toLocaleString()}ft\n\n`;

            reply += `📍 *Top of Descent (3° path)*\n`;
            if (distanceToTOD > 0) {
                reply += `Start descent in *${distanceToTOD.toFixed(1)}nm*\n`;
                reply += `(${todDistance.toFixed(1)}nm before destination)\n\n`;
            } else {
                reply += `⚠️ *You should already be descending!*\n`;
                reply += `Ideal TOD was ${Math.abs(distanceToTOD).toFixed(1)}nm ago\n\n`;
            }

            reply += `📐 *Current path angle:* ${descentAngle.toFixed(1)}°\n`;
            reply += `📉 *Gradient:* ${gradient.toFixed(0)}ft/nm\n`;

            if (groundSpeed && groundSpeed > 0) {
                // VS = (Gradient * GS) / 60
                const vsRequired = (gradient * groundSpeed) / 60;
                const timeToDescend = (distance / groundSpeed) * 60;

                reply += `\n⏱️ *At ${groundSpeed}kts GS:*\n`;
                reply += `Descent rate: *${Math.round(vsRequired)}fpm*\n`;
                reply += `Time to destination: *${timeToDescend.toFixed(1)}min*\n`;

                // Also show for 3° path
                const vs3deg = (groundSpeed * 1000 * 3) / 60 / 60; // ~5.2 * GS
                reply += `\n_Standard 3° = ~${Math.round(groundSpeed * 5.2)}fpm_`;
            } else {
                reply += `\n_Add ground speed for descent rate_\n`;
                reply += `_Example: \`descent ${currentAlt} ${targetAlt} ${distance} 450\`_`;
            }

            return message.reply(reply);

        } catch (e) {
            console.error('Descent error:', e);
            return message.reply(`Error: ${e.message}`);
        }
    }
};
