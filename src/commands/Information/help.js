module.exports = {
    name: "help",
    category: "Information",
    aliases: ["h", "commands", "cmds", "cmd"],
    cooldown: 3,
    usage: "help [command]",
    description: "Shows all commands or info about a specific command.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args[0]) {
                const cmd = client.commands.get(args[0].toLowerCase()) ||
                           client.commands.get(client.aliases.get(args[0].toLowerCase()));

                if (!cmd) {
                    return message.reply(`No command found: *${args[0].toLowerCase()}*`);
                }

                let reply = `*Command: ${cmd.name}*\n\n`;
                if (cmd.description) reply += `📝 *Description:* ${cmd.description}\n`;
                if (cmd.aliases && cmd.aliases.length > 0) {
                    reply += `🔀 *Aliases:* ${cmd.aliases.join(', ')}\n`;
                }
                if (cmd.usage) reply += `💡 *Usage:* ${cmd.usage}\n`;
                if (cmd.cooldown) reply += `⏱️ *Cooldown:* ${cmd.cooldown}s\n`;

                reply += `\n_Syntax: <required> [optional]_`;
                return message.reply(reply);
            }

            // Show all commands grouped by category
            let reply = `*WhatsAV Commands* ✈️\n\n`;
            reply += `_Private chat: write command directly_\n`;
            reply += `_Groups: @mention bot + command_\n\n`;

            const categories = {};

            // Group commands by category
            client.commands.forEach(cmd => {
                const cat = cmd.category || 'Other';
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(cmd.name);
            });

            // Sort and display
            const sortedCats = Object.keys(categories).sort();
            for (const cat of sortedCats) {
                const cmds = categories[cat].sort();
                reply += `*${cat}* (${cmds.length})\n`;
                reply += `${cmds.map(c => `\`${c}\``).join(' ')}\n\n`;
            }

            reply += `_Type_ \`help <command>\` _for details_`;
            return message.reply(reply);

        } catch (e) {
            console.error('Help error:', e);
            return message.reply(`❌ Error: ${e.message}`);
        }
    }
};
