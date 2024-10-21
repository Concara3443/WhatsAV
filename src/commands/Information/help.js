const config = require("../../../config/config.json");
const settings = require("../../../config/settings.json");
module.exports = {
    name: "help",
    category: "Information",
    aliases: ["h", "commandinfo", "cmds", "cmd", "halp"],
    cooldown: 3,
    usage: "help [Commandname]",
    description: "Returns all Commands, or one specific command",
    memberpermissions: [],
    requiredroles: [],
    alloweduserids: [],
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            if (args[0]) {
                const cmd = client.commands.get(args[0].toLowerCase()) || client.commands.get(client.aliases.get(args[0].toLowerCase()));
                if (!cmd) {
                    return message.reply(`No Information found for command *${args[0].toLowerCase()}*`);
                }
                let reply = `*Command name*: \`${cmd.name}\`\n`;
                reply += `*Detailed Information about*: \`${cmd.name}\`\n`;
                if (cmd.description) reply += `*Description*: \`${cmd.description}\`\n`;
                if (cmd.aliases) reply += `*Aliases*: \`${cmd.aliases.map((a) => `${a}`).join("`, `")}\`\n`;
                if (cmd.cooldown) reply += `*Cooldown*: \`${cmd.cooldown} Seconds\`\n`;
                else reply += `*Cooldown*: \`${settings.default_cooldown_in_sec} Second\`\n`;
                if (cmd.usage) {
                    reply += `*Usage*: \`${prefix}${cmd.usage}\`\n`;
                    reply += `Syntax: <> = required, [] = optional`;
                }
                return message.reply(reply);
            } else {
                let reply = "HELP MENU 🔰 Commands\n";
                reply += `To see command Descriptions and Information, type: ${prefix}help [CMD NAME]\n`;
                const commands = (category) => {
                    return Array.from(client.commands.values()).filter((cmd) => cmd.category === category).map((cmd) => `\`${cmd.name}\``);
                };
                try {
                    for (let i = 0; i < client.categories.length; i += 1) {
                        const current = client.categories[i];
                        const items = commands(current);
                        reply += `*${current.toUpperCase()} [${items.length}]*: ${items.join(", ")}\n`;
                    }
                } catch (e) {
                    console.log(String(e.stack));
                }
                message.reply(reply);
            }
        } catch (e) {
            console.log(String(e.stack));
            return message.reply(`❌ ERROR | An error occurred\n\`\`\`${e.message ? String(e.message).slice(0, 2000) : String(e).slice(0, 2000)}\`\`\``);
        }
    }
}