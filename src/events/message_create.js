// Función para limpiar caracteres invisibles de WhatsApp
function cleanWhatsAppText(text) {
  if (!text) return '';
  return text
    // Eliminar caracteres invisibles y de control Unicode
    .replace(/[\u200B-\u200D\uFEFF\u00A0\u2060\u180E]/g, '')
    // Eliminar caracteres de formato LTR/RTL
    .replace(/[\u200E\u200F\u202A-\u202E]/g, '')
    // Eliminar otros caracteres de control
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim();
}

module.exports = async (client, message) => {
  if (!message) return;

  // Si el mensaje es del bot, no hacer nada
  if (message.fromMe) return;
  if (`${client.info.me.user}@${client.info.me.server}` == message.from) return;

  // Detectar si es grupo sin llamar getChat() - mucho más rápido
  const isGroupMessage = message.from.endsWith('@g.us');
  let args = [];
  let cmd = "";

  // Limpiar el texto del mensaje
  const cleanBody = cleanWhatsAppText(message.body);
  if (!cleanBody) return;

  // Mensaje especial de bienvenida (desde el link de WhatsApp)
  const welcomeMessages = [
    "hi! how does whatsav work?",
    "hi how does whatsav work",
    "how does whatsav work",
    "how does whatsav work?"
  ];

  if (!isGroupMessage && welcomeMessages.includes(cleanBody.toLowerCase())) {
    const welcomeReply = `*Welcome to WhatsAV!* ✈️

I'm an aviation bot that provides real-time flight data.

*Quick Start:*
Just type a command directly! No prefix needed.

*Popular Commands:*
• \`metar LEMD\` - Weather at Madrid airport
• \`taf KJFK\` - Forecast for JFK
• \`wx EGLL\` - Simple weather summary
• \`notam LEBL\` - NOTAMs for Barcelona
• \`airac\` - Current AIRAC cycle
• \`help\` - All commands

*Example:*
Try typing: \`metar LEMD\`

*In Groups:*
Mention me + command: @WhatsAV metar LEMD

_Created by Guillermo Cortés_
_guillermocort.es_`;

    return message.reply(welcomeReply);
  }

  if (isGroupMessage) {
    // En grupos: detectar si el bot fue mencionado
    const botId = client.info.me.user;
    const botMentioned = message.mentionedIds?.some(id => id.includes(botId));
    if (!botMentioned) return;

    // Extraer comando removiendo la mención
    const bodyWithoutMention = cleanBody.replace(/@\d+/g, '').trim();
    args = bodyWithoutMention.split(/ +/).filter(Boolean);
    if (args.length === 0) return;
    cmd = args.shift().toLowerCase();
  } else {
    // Privado: sin prefijo, escribir comando directamente
    args = cleanBody.split(/ +/).filter(Boolean);
    if (args.length === 0) return;
    cmd = args.shift().toLowerCase();
  }

  let command = client.commands.get(cmd);
  if (!command) command = client.commands.get(client.aliases.get(cmd));
  if (command) {
    try {
      // if command has minimum args, and user don't enter enough, return error
      if (
        command.minargs &&
        command.minargs > 0 &&
        args.length < command.minargs
      ) {
        return message.reply(
          command.argsmissing_message &&
            command.argsmissing_message.trim().length > 0
            ? command.argsmissing_message
            : command.usage
            ? "Usage: " + command.usage
            : "Wrong Command Usage"
        );
      }
      // if command has maximum args, and user enters too many, return error
      if (
        command.maxargs &&
        command.maxargs > 0 &&
        args.length > command.maxargs
      ) {
        return message.reply(
          command.argsmissing_message &&
            command.argsmissing_message.trim().length > 0
            ? command.argsmissing_message
            : command.usage
            ? "Usage: " + command.usage
            : "Wrong Command Usage"
        );
      }

      // Ejecutar el comando
      await command.run(
        client,
        message,
        args,
        message.from,
        message.body,
        ""
      );
    } catch (error) {
      console.error(error);
      message.reply("There was an error executing that command.");
    }
  } else {
    console.log(`Command not found: ${cmd}`);
  }
};