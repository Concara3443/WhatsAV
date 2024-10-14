module.exports = {
  name: "ping", // Asegúrate de que el nombre del comando esté definido aquí
  description: "Gives you information on how fast the Bot is",
  usage: "ping", //the command usage for helpcmd [OPTIONAL]
  description: "Gives you information on how fast the Bot is", //the command description for helpcmd [OPTIONAL]
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  minargs: 0, // minimum args for the message, 0 == none [OPTIONAL]
  maxargs: 0, // maximum args for the message, 0 == none [OPTIONAL]
  minplusargs: 0, // minimum args for the message, splitted with "++" , 0 == none [OPTIONAL]
  maxplusargs: 0, // maximum args for the message, splitted with "++" , 0 == none [OPTIONAL]
  argsmissing_message: "", //Message if the user has not enough args / not enough plus args, which will be sent, leave emtpy / dont add, if you wanna use command.usage or the default message! [OPTIONAL]
  argstoomany_message: "", //Message if the user has too many / not enough args / too many plus args, which will be sent, leave emtpy / dont add, if you wanna use command.usage or the default message! [OPTIONAL]
  run: async (client, message, args, plusArgs, cmdUser, text, prefix) => {
    try {
      var date = Date.now();
      const replyMessage = await message.reply(`🏓 Pinging....`);
      
      // Verificar si client.ws y client.ws.ping están definidos
      // const apiLatency = client.ws && client.ws.ping ? Math.round(client.ws.ping) : 'N/A';
      
      // Editar el mensaje con la latencia calculada
      // await replyMessage.edit({
      //   content: `🏓 Ping: \`${Math.round(Date.now() - date)}ms\`\n\n:robot: Api Latency: \`${apiLatency}ms\``
      // });
    } catch (e) {
      console.log(String(e.stack));
    }
  }
};