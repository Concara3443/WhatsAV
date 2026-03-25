module.exports = {
    name: "ete",
    category: "Airports",
    aliases: ["eta", "tiempo", "enroute"],
    cooldown: 2,
    usage: "ete <distance_nm> <speed_kts>",
    description: "Calculates Estimated Time Enroute (ETE) from distance and speed.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length < 2) {
                return message.reply(`*ETE Calculator* ⏱️

*Usage:* \`ete <distance> <speed>\`

*Examples:*
\`ete 450 180\` → 450nm at 180kts
\`ete 120 100\` → 120nm at 100kts

*With departure time:*
\`ete 450 180 14:30\` → ETD 14:30Z`);
            }

            const distance = parseFloat(args[0]);
            const speed = parseFloat(args[1]);
            const departureTime = args[2] || null;

            if (isNaN(distance) || isNaN(speed)) {
                return message.reply("Invalid numbers. Example: `ete 450 180`");
            }

            if (speed <= 0) {
                return message.reply("Speed must be greater than 0.");
            }

            const eteHours = distance / speed;
            const eteMinutes = eteHours * 60;
            const hours = Math.floor(eteHours);
            const minutes = Math.round((eteHours - hours) * 60);

            let reply = `*ETE Calculator* ⏱️\n\n`;
            reply += `*Distance:* ${distance}nm\n`;
            reply += `*Speed:* ${speed}kts\n\n`;
            reply += `⏱️ *ETE:* ${hours}h ${minutes.toString().padStart(2, '0')}min\n`;
            reply += `_(${eteMinutes.toFixed(0)} minutes)_\n`;

            // If departure time provided, calculate ETA
            if (departureTime) {
                const timeParts = departureTime.replace('Z', '').replace('z', '').split(':');
                if (timeParts.length >= 2) {
                    let depHours = parseInt(timeParts[0]);
                    let depMinutes = parseInt(timeParts[1]);

                    // Add ETE
                    let etaMinutes = depMinutes + minutes;
                    let etaHours = depHours + hours + Math.floor(etaMinutes / 60);
                    etaMinutes = etaMinutes % 60;
                    etaHours = etaHours % 24;

                    reply += `\n*ETD:* ${departureTime}Z\n`;
                    reply += `*ETA:* ${etaHours.toString().padStart(2, '0')}:${etaMinutes.toString().padStart(2, '0')}Z`;
                }
            }

            // Add fuel planning hint
            reply += `\n\n📋 *Flight Planning:*\n`;
            reply += `Trip time: ${hours}:${minutes.toString().padStart(2, '0')}\n`;
            reply += `+ 45min reserve: ${Math.floor((eteMinutes + 45) / 60)}:${((eteMinutes + 45) % 60).toString().padStart(2, '0')}\n`;
            reply += `+ 10% contingency: ${Math.floor(eteMinutes * 1.1 / 60)}:${Math.round((eteMinutes * 1.1) % 60).toString().padStart(2, '0')}`;

            return message.reply(reply);

        } catch (e) {
            console.error('ETE error:', e);
            return message.reply(`Error: ${e.message}`);
        }
    }
};
