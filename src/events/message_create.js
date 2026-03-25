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

// Levenshtein distance para encontrar comandos similares
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Buscar comandos similares
function findSimilarCommands(input, commands, aliases, maxDistance = 3) {
  const suggestions = [];
  const allCommands = [...commands.keys()];

  for (const cmdName of allCommands) {
    const distance = levenshtein(input.toLowerCase(), cmdName.toLowerCase());
    if (distance <= maxDistance && distance > 0) {
      suggestions.push({ name: cmdName, distance });
    }
  }

  // También buscar en aliases
  for (const [alias, cmdName] of aliases.entries()) {
    const distance = levenshtein(input.toLowerCase(), alias.toLowerCase());
    if (distance <= maxDistance && distance > 0) {
      suggestions.push({ name: `${alias} (→ ${cmdName})`, distance });
    }
  }

  // Ordenar por distancia y devolver los mejores
  return suggestions
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(s => s.name);
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
    // En grupos: detectar si el bot fue mencionado usando getMentions()
    const botId = client.info.me.user; // número del bot: 447308564711

    // Obtener menciones reales (devuelve Contact objects)
    const mentions = await message.getMentions();

    // Verificar si el bot está en las menciones
    const botMentioned = mentions.some(contact =>
      contact.id?.user === botId ||
      contact.id?._serialized?.includes(botId) ||
      contact.number === botId
    );

    if (!botMentioned) return;

    // Extraer comando removiendo la mención (@número)
    const bodyWithoutMention = cleanBody
      .replace(new RegExp(`@${botId}`, 'g'), '')
      .replace(/@\d+/g, '')
      .trim();

    args = bodyWithoutMention.split(/ +/).filter(Boolean);
    if (args.length === 0) {
      // Si solo mencionaron al bot sin comando, mostrar ayuda
      return message.reply(`*WhatsAV* ✈️\n\nMencióneme + comando:\n\`@WhatsAV help\`\n\`@WhatsAV metar LEMD\``);
    }
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
    // Solo responder en privado, no en grupos
    if (!isGroupMessage && cmd.length >= 2) {
      const similar = findSimilarCommands(cmd, client.commands, client.aliases);

      let reply = `❓ Command not found: \`${cmd}\`\n`;

      if (similar.length > 0) {
        reply += `\n*Did you mean?*\n`;
        similar.forEach(s => {
          reply += `• \`${s}\`\n`;
        });
      }

      reply += `\n_Type \`help\` to see all commands_`;

      return message.reply(reply);
    }
  }
};