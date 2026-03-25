module.exports = {
    name: 'btn',
    category: 'AIP',
    aliases: [],
    cooldown: 5,
    usage: 'btn',
    description: 'Este comando ha sido deshabilitado. Los botones de WhatsApp ya no están soportados en la API actual.',
    run: async (client, message, args) => {
        return message.reply('⚠️ Este comando ha sido deshabilitado.\n\nLos botones interactivos de WhatsApp ya no están soportados en la API actual. Por favor, usa los comandos de texto directamente.');
    }
};
