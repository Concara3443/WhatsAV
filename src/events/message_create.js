const config = require("../../config/config.json");

module.exports = async (client, message) => {

  const prefixRegex = new RegExp(`^${config.prefix}`);

  const match = message.body.match(prefixRegex);
  if (!match) return;

  const [mPrefix] = match;
  if (!mPrefix) return;
  

  const args = message.body.slice(mPrefix.length).trim().split(/ +/).filter(Boolean);
  const cmd = args.shift().toLowerCase();

  let command = client.commands.get(cmd);
  if (!command) command = client.commands.get(client.aliases.get(cmd));
  if (command) {
    try {
      // if command has minimum args, and user don't enter enough, return error
      if (command.minargs && command.minargs > 0 && args.length < command.minargs) {
        return message.reply(command.argsmissing_message && command.argsmissing_message.trim().length > 0 ? command.argsmissing_message : command.usage ? "Usage: " + command.usage : "Wrong Command Usage")
      }
      // if command has maximum args, and user enters too many, return error
      if (command.maxargs && command.maxargs > 0 && args.length > command.maxargs) {
        return message.reply(command.argsmissing_message && command.argsmissing_message.trim().length > 0 ? command.argsmissing_message : command.usage ? "Usage: " + command.usage : "Wrong Command Usage")
      }
      // Ejecutar el comando
      await command.run(client, message, args);
    } catch (error) {
      console.error(error);
      message.reply('There was an error executing that command.');
    }
  } else {
    console.log(`Command not found: ${cmd}`);
  }
};
