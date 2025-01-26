const { Buttons } = require('whatsapp-web.js');

module.exports = {
    name: 'btn',
    category: 'AIP',
    aliases: [],
    cooldown: 5,
    usage: '.',
    description: '.',
    run: async (client, message, args) => {
        try {
            const buttons = new Buttons(
                'Haz clic en un botón abajo:',
                [
                    { id: 'btn1', body: 'Botón 1' },
                    { body: 'Botón 2' },
                    { body: 'Botón 3' }
                ],
                'Título del Botón',
                'Pie de página del botón'
            );

            await message.reply(buttons);
        } catch (error) {
            console.error(error);
            message.reply('Hubo un error al enviar el botón.');
        }
    }
};