const os = require("os");

module.exports = {
    name: "status",
    category: "Information",
    aliases: ["stats", "uptime"],
    cooldown: 5,
    usage: "status",
    description: "Shows the current status and uptime of the bot.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            const memUsage = process.memoryUsage();
            const memUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
            const memTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);

            const statusMessage = `*WhatsAV Status*

*Uptime:* ${uptimeStr}
*Memory:* ${memUsedMB} MB / ${memTotalMB} MB
*Platform:* ${os.platform()} ${os.arch()}
*Node.js:* ${process.version}

*Status:* Online`;

            return message.reply(statusMessage);
        } catch (e) {
            console.log(String(e.stack));
            return message.reply(`An error occurred: ${e.message}`);
        }
    }
};
