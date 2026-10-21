const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

module.exports = async client => {
    let count = 0;
    const commandsArray = [];
    const commandsPath = path.join(__dirname, '../Commands');

    // Fonction récursive pour lire les fichiers dans les sous-dossiers
    const getCommandFiles = (dir) => {
        let files = [];
        if (!fs.existsSync(dir)) return files;
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                files = files.concat(getCommandFiles(fullPath));
            } else if (item.name.endsWith('.js')) {
                files.push(fullPath);
            }
        }
        return files;
    };

    const files = getCommandFiles(commandsPath);

    for (const filePath of files) {
        const command = require(filePath);

        if (command.data && command.data.name) {
            client.commands.set(command.data.name, command);
            commandsArray.push(command.data.toJSON());
            count++;
        } else if (command.name) {
            client.commands.set(command.name, command);
            commandsArray.push({
                name: command.name,
                description: command.description || 'Aucune description',
                options: command.options || []
            });
            count++;
        } else {
            console.warn(`[LOADER] Le fichier ${path.basename(filePath)} n'a ni 'data.name' ni 'name' valide.`);
        }
    }

    console.log(`[LOADER] ${count} commande(s) chargée(s) en mémoire.`);

    // Enregistrement des commandes sans purge bloquante
    const token = process.env.TOKEN || config.token;
    const clientId = process.env.CLIENT_ID || config.clientID || config.clientId;
    const guildId = process.env.GUILD_ID || config.guildID || config.guildId;

    if (!token || !clientId) {
        console.error('[LOADER ERREUR] TOKEN ou CLIENT_ID manquant. Impossible d\'enregistrer les commandes slash.');
        return;
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        if (guildId) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commandsArray }
            );
            console.log(`[LOADER] ${count} commande(s) Slash enregistrée(s) sur le serveur !`);
        } else {
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commandsArray }
            );
            console.log(`[LOADER] ${count} commande(s) Slash enregistrée(s) globalement !`);
        }
    } catch (error) {
        console.error('[LOADER] Erreur lors de l\'enregistrement des commandes Slash :', error);
    }
};