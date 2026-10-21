const { ActivityType, Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`\x1b[31m[ CORE ]\x1b[0m \x1b[32mBot connecté : \x1b[0m${client.user.tag}`);
        console.log(`[Support - BCSO] Opérationnel et prêt !`);

        client.user.setPresence({
            activities: [{ name: 'le Blaine County Sheriff’s Office', type: ActivityType.Watching }],
            status: 'online',
        });
    }
};