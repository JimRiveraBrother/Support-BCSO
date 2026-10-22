const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

// Création de l'instance du bot avec les intents requis
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();

// Chargement de tes loaders depuis le dossier Loaders
const loadCommands = require('./Loaders/loadCommands');
const loadSlashCommands = require('./Loaders/loadSlashCommands');
const loadEvents = require('./Loaders/loadEvents');

// Exécution des loaders
loadCommands(client);
loadSlashCommands(client);
loadEvents(client);

// Connexion du bot Discord
client.login(process.env.TOKEN);