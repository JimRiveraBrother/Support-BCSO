const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

// --- SERVEUR HTTP POUR RENDER ---
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot BCSO actif 24/7');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur d'écoute actif sur le port ${PORT}`));

// --- CLIENT DISCORD ---
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

// --- LOADERS ---
const loadCommands = require('./Loaders/loadCommands');
const loadSlashCommands = require('./Loaders/loadSlashCommands');
const loadEvents = require('./Loaders/loadEvents');

loadCommands(client);
loadSlashCommands(client);
loadEvents(client);

// --- CONNEXION DISCORD ---
if (!process.env.TOKEN) {
    console.error("❌ ERREUR: La variable d'environnement TOKEN n'est pas définie dans Render !");
} else {
    client.login(process.env.TOKEN).catch(err => {
        console.error("❌ ERREUR DE CONNEXION DISCORD :", err);
    });
}