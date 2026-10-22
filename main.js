const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot BCSO actif 24/7');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur d'écoute actif sur le port ${PORT}`));

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