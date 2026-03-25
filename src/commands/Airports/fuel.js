module.exports = {
    name: "fuel",
    category: "Airports",
    aliases: ["combustible"],
    cooldown: 2,
    usage: "fuel <fuel_amount> <consumption_per_hour>",
    description: "Calculates flight endurance and range based on fuel and consumption.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length < 2) {
                return message.reply(`*Fuel Calculator* ⛽

*Endurance:*
\`fuel <fuel> <consumption>\`
\`fuel 200 45\` → 200L at 45L/h

*With speed (for range):*
\`fuel <fuel> <consumption> <speed>\`
\`fuel 200 45 120\` → at 120kts

*Units:* L, kg, gal, lbs - just be consistent`);
            }

            const fuel = parseFloat(args[0]);
            const consumption = parseFloat(args[1]);
            const speed = args[2] ? parseFloat(args[2]) : null;

            if (isNaN(fuel) || isNaN(consumption)) {
                return message.reply("Invalid numbers. Example: `fuel 200 45`");
            }

            if (fuel <= 0 || consumption <= 0) {
                return message.reply("Values must be greater than 0.");
            }

            const enduranceHours = fuel / consumption;
            const enduranceMin = enduranceHours * 60;
            const hours = Math.floor(enduranceHours);
            const minutes = Math.round((enduranceHours - hours) * 60);

            let reply = `*Fuel Calculator* ⛽\n\n`;
            reply += `*Fuel:* ${fuel}\n`;
            reply += `*Consumption:* ${consumption}/h\n\n`;

            reply += `⏱️ *Endurance:* ${hours}h ${minutes}min\n`;
            reply += `_(${enduranceMin.toFixed(0)} minutes total)_\n`;

            if (speed && speed > 0) {
                const range = enduranceHours * speed;
                reply += `\n✈️ *At ${speed}kts:*\n`;
                reply += `Range: *${range.toFixed(0)}nm*\n`;

                // Reserve calculations (45min for VFR, 30min for IFR day)
                const reserve45 = 45 / 60 * consumption;
                const usableFuel = fuel - reserve45;
                const usableEndurance = usableFuel / consumption;
                const usableRange = usableEndurance * speed;

                reply += `\n📋 *With 45min reserve:*\n`;
                reply += `Usable: ${usableFuel.toFixed(1)}\n`;
                reply += `Range: ${usableRange.toFixed(0)}nm\n`;
                reply += `Time: ${Math.floor(usableEndurance)}h ${Math.round((usableEndurance % 1) * 60)}min`;
            } else {
                reply += `\n_Add speed for range calculation:_\n`;
                reply += `_\`fuel ${fuel} ${consumption} 120\`_`;
            }

            return message.reply(reply);

        } catch (e) {
            console.error('Fuel error:', e);
            return message.reply(`Error: ${e.message}`);
        }
    }
};
