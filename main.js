const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
require('dotenv').config();

// --- 1. SERVEUR HTTP POUR RENDER (Port 10000 obligatoire) ---
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot BCSO actif 24/7');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`[HTTP] Serveur d'écoute actif sur le port ${PORT}`);
});

// --- 2. INITIALISATION DU CLIENT DISCORD & OPTIONS RÉSEAU ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
    restWsBridgeTimeout: 30000,
    ws: {
        compress: true
    }
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

client.on('debug', info => console.log('[DEBUG]', info));
client.on('warn', info => console.warn('[WARN]', info));
client.on('error', err => console.error('[CLIENT ERROR]', err));
process.on('unhandledRejection', err => console.error('[UNHANDLED]', err));

if (!token) {
    console.error("❌ ERREUR CRITIQUE : Le TOKEN est introuvable !");
} else {
    const connectBot = async () => {
        console.log("🔄 Tentative de connexion à l'API Discord...");
        try {
            await Promise.race([
                client.login(token),
                new Promise((_, rej) => setTimeout(() => rej(new Error('Login timeout (60s)')), 60000))
            ]);
            console.log("✅ Connecté à Discord avec succès !");
        } catch (err) {
            console.error("❌ ERREUR LORS DU LOGIN DISCORD :", err);
            console.log("🔄 Nouvelle tentative dans 15 secondes...");
            setTimeout(connectBot, 15000);
        }
    };

    connectBot();
}