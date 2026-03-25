module.exports = {
    name: "phonetic",
    category: "Information",
    aliases: ["icao", "alphabet", "spell", "nato"],
    cooldown: 2,
    usage: "phonetic <text>",
    description: "Converts text to ICAO/NATO phonetic alphabet.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args.length === 0) {
                return message.reply(`*Phonetic Alphabet* 🔤

*Usage:* \`phonetic <text>\`

*Examples:*
\`phonetic N12345\` → November One Two...
\`phonetic LEMD\` → Lima Echo Mike Delta
\`phonetic SOS\` → Sierra Oscar Sierra`);
            }

            const alphabet = {
                'A': 'Alfa', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta',
                'E': 'Echo', 'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel',
                'I': 'India', 'J': 'Juliet', 'K': 'Kilo', 'L': 'Lima',
                'M': 'Mike', 'N': 'November', 'O': 'Oscar', 'P': 'Papa',
                'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
                'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray',
                'Y': 'Yankee', 'Z': 'Zulu',
                '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three',
                '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven',
                '8': 'Eight', '9': 'Niner',
                '.': 'Decimal', '-': 'Dash', '/': 'Slash', ' ': '(space)'
            };

            const input = args.join(' ').toUpperCase();
            const result = [];

            for (const char of input) {
                if (alphabet[char]) {
                    result.push(alphabet[char]);
                } else if (char === ' ') {
                    result.push('—');
                } else {
                    result.push(char);
                }
            }

            let reply = `*Phonetic Alphabet* 🔤\n\n`;
            reply += `*Input:* ${input}\n\n`;
            reply += `*Phonetic:*\n`;
            reply += result.join(' · ');

            // Also show letter by letter for clarity
            reply += `\n\n*Detailed:*\n`;
            for (const char of input) {
                if (char !== ' ' && alphabet[char]) {
                    reply += `${char} → ${alphabet[char]}\n`;
                }
            }

            return message.reply(reply);

        } catch (e) {
            console.error('Phonetic error:', e);
            return message.reply(`Error: ${e.message}`);
        }
    }
};
