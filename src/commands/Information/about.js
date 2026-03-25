const pkg = require("../../../package.json");

module.exports = {
    name: "about",
    category: "Information",
    aliases: ["info", "bot"],
    cooldown: 5,
    usage: "about",
    description: "Shows information about the bot.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            const aboutMessage = `*WhatsAV - Aviation Bot*

*Version:* ${pkg.version}
*Author:* ${pkg.author}
*License:* ${pkg.license}

*Description:*
${pkg.description}

*Contact:*
WhatsApp: +44 73 0856 4711
GitHub: github.com/Concara3443/WhatsAV

*How to use:*
- Private chat: Write the command directly (e.g., \`metar LEMD\`)
- Groups: Mention the bot + command (e.g., \`@WhatsAV metar LEMD\`)

Type \`help\` to see all available commands.`;

            return message.reply(aboutMessage);
        } catch (e) {
            console.log(String(e.stack));
            return message.reply(`An error occurred: ${e.message}`);
        }
    }
};
