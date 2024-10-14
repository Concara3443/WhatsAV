const fs = require("fs");
const allevents = [];
module.exports = async (client) => {
    try {
        let amount = 0;
        const event_files = fs.readdirSync(`./src/events`).filter((file) => file.endsWith(".js"));
        for (const file of event_files) {
            try {
                const event = require(`../events/${file}`)
                let eventName = file.split(".")[0];
                allevents.push(eventName);
                client.on(eventName, event.bind(null, client));
                amount++;
            } catch (e) {
                console.log(e)
            }
        }
        console.log(`${amount} Events Loaded`);
        console.log(`Logging into the BOT...`);
    } catch (e) {
        console.log(String(e.stack));
    }
};
