const { readdirSync } = require("fs");

module.exports = (client) => {
    try {
        let amount = 0;
        readdirSync("./src/commands/").forEach((dir) => {
            const commands = readdirSync(`./src/commands/${dir}/`).filter((file) => file.endsWith(".js"));
            for (let file of commands) {
                let pull = require(`../commands/${dir}/${file}`);
                if (pull.name) {
                    client.commands.set(pull.name, pull);
                    amount++;
                } else {
                    console.log(file, `error -> missing a help.name, or help.name is not a string.`);
                    continue;
                }
                if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach((alias) => client.aliases.set(alias, pull.name));
            }
        });
        console.log(`${amount} Commands Loaded`);
    } catch (e) {
        console.log(String(e.stack));
    }
};