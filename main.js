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

// --- CONNEXION DISCORD AVEC AUTO-RETRY ---
const token = process.env.TOKEN ? process.env.TOKEN.trim() : null;

if (!token) {
    console.error("❌ ERREUR CRITIQUE : Le TOKEN est introuvable !");
} else {
    const connectBot = async () => {
        console.log("🔄 Tentative de connexion à l'API Discord...");
        try {
            await client.login(token);
            console.log("✅ Connecté à Discord avec succès !");
        } catch (err) {
            console.error("❌ ERREUR LORS DU LOGIN DISCORD :", err);
            console.log("🔄 Nouvelle tentative dans 10 secondes...");
            setTimeout(connectBot, 10000);
        }
    };

    connectBot();
}