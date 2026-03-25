module.exports = {
    name: "squawk",
    category: "Information",
    aliases: ["transponder", "code"],
    cooldown: 2,
    usage: "squawk [code]",
    description: "Explains squawk/transponder codes and their meanings.",
    run: async (client, message, args, chatId, text, prefix) => {
        try {
            const emergencyCodes = {
                '7500': {
                    name: 'HIJACK',
                    emoji: '🚨',
                    description: 'Aircraft hijacking in progress',
                    action: 'ATC will alert authorities. Do NOT use unless actual hijack.',
                    memory: 'Hi-Jack = 75 (sounds like "Hi Five")'
                },
                '7600': {
                    name: 'RADIO FAILURE (IFR)',
                    emoji: '📻',
                    description: 'Lost communication - CONTINUING on IFR route',
                    action: 'Continue on last assigned route/altitude. Follow published lost comms procedures. Stay IFR.',
                    memory: '76 = "Seven Six, Radio Fix"',
                    diff: '→ Use when continuing your IFR flight plan'
                },
                '7601': {
                    name: 'RADIO FAILURE (VMC DIVERT)',
                    emoji: '📻✈️',
                    description: 'Lost communication - LEAVING IFR, diverting VMC to nearest airport',
                    action: 'You have radio failure BUT you\'re in VMC and choosing to divert visually to nearest suitable aerodrome instead of continuing IFR.',
                    memory: '7601 = 7600 + 1 = "Radio failure, going visual"',
                    diff: '→ Use when ABANDONING IFR to land visually',
                    note: '⚠️ Europe only (May 2025). Not valid in UK/Switzerland - use 7600.'
                },
                '7700': {
                    name: 'EMERGENCY',
                    emoji: '🆘',
                    description: 'General emergency (mayday)',
                    action: 'Priority handling by ATC. Use for any emergency situation.',
                    memory: '77 = "Going to Heaven" (emergency)'
                }
            };

            const commonCodes = {
                '0000': 'Military intercepted / Special ops',
                '1200': 'VFR (USA/Canada)',
                '1400': 'VFR above 12,500ft (USA)',
                '2000': 'Default/Conspicuity (Europe)',
                '7000': 'VFR (Europe/ICAO)',
                '7001': 'VFR with FIS (UK)',
                '7004': 'Aerobatic flights (Europe)',
                '7010': 'VFR circuit traffic (UK)',
                '4000': 'Military operations',
            };

            if (args.length === 0) {
                let reply = `*Squawk Codes* 📡\n\n`;

                reply += `*🚨 Emergency Codes:*\n`;
                for (const [code, info] of Object.entries(emergencyCodes)) {
                    reply += `*${code}* - ${info.name} ${info.emoji}\n`;
                }

                reply += `\n*✈️ Common Codes:*\n`;
                for (const [code, desc] of Object.entries(commonCodes)) {
                    reply += `*${code}* - ${desc}\n`;
                }

                reply += `\n_Type \`squawk <code>\` for details_`;
                return message.reply(reply);
            }

            const code = args[0].padStart(4, '0');

            // Validate code (0000-7777, octal digits only)
            if (!/^[0-7]{4}$/.test(code)) {
                return message.reply(`Invalid squawk code: ${code}\nSquawk codes use digits 0-7 only (octal).`);
            }

            let reply = `*Squawk ${code}* 📡\n\n`;

            if (emergencyCodes[code]) {
                const info = emergencyCodes[code];
                reply += `${info.emoji} *${info.name}*\n\n`;
                reply += `*Meaning:* ${info.description}\n\n`;
                reply += `*Action:* ${info.action}\n\n`;
                if (info.diff) {
                    reply += `${info.diff}\n\n`;
                }
                reply += `*Memory aid:* ${info.memory}`;
                if (info.note) {
                    reply += `\n\n${info.note}`;
                }
            } else if (commonCodes[code]) {
                reply += `*Meaning:* ${commonCodes[code]}`;
            } else {
                reply += `*Discrete code*\n\n`;
                reply += `This is a discrete (assigned) transponder code.\n`;
                reply += `ATC assigns these individually to aircraft for identification.\n\n`;

                // Analyze code structure
                const modeA = parseInt(code, 8);
                reply += `_Decimal value: ${modeA}_`;
            }

            return message.reply(reply);

        } catch (e) {
            console.error('Squawk error:', e);
            return message.reply(`Error: ${e.message}`);
        }
    }
};
