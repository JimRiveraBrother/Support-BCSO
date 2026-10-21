const { REST, Routes } = require('discord.js');
const config = require('../config.js');

module.exports = async client => {
    const commands = [];

    client.commands.forEach(command => {
        // Priorité à l'objet SlashCommandBuilder
        if (command.data && typeof command.data.toJSON === 'function') {
            commands.push(command.data.toJSON());
        } else if (command.data) {
            commands.push(command.data);
        } else if (command.name) {
            commands.push({
                name: command.name,
                description: command.description || 'Aucune description',
                options: command.options || [],
                default_member_permissions: command.permission ? command.permission.toString() : null
            });
        }
    });

    const token = process.env.TOKEN || config.token;
    const clientId = process.env.CLIENT_ID || config.clientID || config.clientId;
    const guildId = process.env.GUILD_ID || config.guildID || config.guildId;

    if (!token || !clientId) {
        console.error('[LOADER ERREUR] Token ou Client ID introuvable ! Enregistrement Slash annulé.');
        return;
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log(`[LOADER] Enregistrement de ${commands.length} commandes Slash...`);

        if (guildId) {
            // Enregistrement rapide sur le serveur spécifique (instantané)
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );
            console.log(`[LOADER] ${commands.length} commandes Slash enregistrées avec succès sur le serveur !`);
        } else {
            // Enregistrement global
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );
            console.log('[LOADER] Commandes Slash enregistrées avec succès globalement !');
        }
    } catch (error) {
        console.error('[LOADER] Erreur lors de l\'enregistrement des commandes Slash :', error);
    }
};