module.exports = {
    name: "airac",
    category: "AIP",
    aliases: ["cycle"],
    cooldown: 5,
    usage: "airac",
    description: "Shows current and upcoming AIRAC cycle information.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            // AIRAC cycles are 28 days each, starting from a known date
            // Reference: AIRAC 2401 started on 2024-01-25
            const referenceDate = new Date('2024-01-25T00:00:00Z');
            const referenceYear = 2024;
            const referenceCycle = 1;
            const cycleDays = 28;

            const now = new Date();
            const daysSinceReference = Math.floor((now - referenceDate) / (1000 * 60 * 60 * 24));
            const cyclesSinceReference = Math.floor(daysSinceReference / cycleDays);

            // Calculate current cycle
            const currentCycleStart = new Date(referenceDate.getTime() + (cyclesSinceReference * cycleDays * 24 * 60 * 60 * 1000));
            const currentCycleEnd = new Date(currentCycleStart.getTime() + (cycleDays * 24 * 60 * 60 * 1000) - 1);
            const nextCycleStart = new Date(currentCycleEnd.getTime() + 1);

            // Calculate cycle number (YY + NN format)
            let cycleYear = referenceYear;
            let cycleNumber = referenceCycle + cyclesSinceReference;

            // Each year has 13 cycles (28 * 13 = 364 days)
            while (cycleNumber > 13) {
                cycleNumber -= 13;
                cycleYear++;
            }

            const nextCycleNumber = cycleNumber === 13 ? 1 : cycleNumber + 1;
            const nextCycleYear = cycleNumber === 13 ? cycleYear + 1 : cycleYear;

            // Days remaining in current cycle
            const daysRemaining = Math.ceil((currentCycleEnd - now) / (1000 * 60 * 60 * 24));

            // Format dates
            const formatDate = (date) => {
                return date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
            };

            const cycleId = `${String(cycleYear).slice(-2)}${String(cycleNumber).padStart(2, '0')}`;
            const nextCycleId = `${String(nextCycleYear).slice(-2)}${String(nextCycleNumber).padStart(2, '0')}`;

            let reply = `*AIRAC Cycle Information* ✈️\n\n`;
            reply += `*Current Cycle:* AIRAC ${cycleId}\n`;
            reply += `📅 ${formatDate(currentCycleStart)} → ${formatDate(currentCycleEnd)}\n`;
            reply += `⏳ *${daysRemaining} days remaining*\n\n`;
            reply += `*Next Cycle:* AIRAC ${nextCycleId}\n`;
            reply += `📅 Effective: ${formatDate(nextCycleStart)}\n\n`;
            reply += `_AIRAC cycles are 28 days each_`;

            return message.reply(reply);

        } catch (e) {
            console.error('AIRAC error:', e);
            return message.reply(`❌ Error: ${e.message}`);
        }
    }
};
