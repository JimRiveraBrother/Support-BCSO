const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

// --- 1. SERVEUR HTTP POUR RENDER (Garde le service Live 24/7) ---
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot BCSO actif 24/7');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[HTTP] Serveur d'écoute actif sur le port ${PORT}`);
});

// --- 2. INITIALISATION DU CLIENT DISCORD & INTENTS ---
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

// --- 3. CHARGEMENT DES LOADERS ---
const loadCommands = require('./Loaders/loadCommands');
const loadSlashCommands = require('./Loaders/loadSlashCommands');
const loadEvents = require('./Loaders/loadEvents');

try {
    loadCommands(client);
    loadSlashCommands(client);
    loadEvents(client);
} catch (error) {
    console.error("[LOADER ERROR] Une erreur est survenue lors du chargement :", error);
}

// --- 4. CONNEXION DU BOT DISCORD ---
const token = process.env.TOKEN ? process.env.TOKEN.trim() : null;

if (!token) {
    console.error("❌ ERREUR CRITIQUE : Le TOKEN est introuvable ou vide dans les variables d'environnement !");
} else {
    console.log("🔄 Tentative de connexion à l'API Discord en cours...");
    client.login(token)
        .then(() => {
            console.log("✅ Connexion à Discord initialisée avec succès !");
        })
        .catch(err => {
            console.error("❌ ERREUR CRITIQUE LORS DU LOGIN DISCORD :", err);
        });
}