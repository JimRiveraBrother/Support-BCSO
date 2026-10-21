const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb');

const SCAM_KEYWORDS = [
    'free nitro', 'discord nitro free', 'gift nitro', 'nitro for free',
    'free crypto', 'crypto giveaway', 'eth giveaway', 'btc giveaway', 'solana giveaway',
    'airdrop', 'claim free', 'claim your crypto', 'double your crypto',
    'whatsapp.com', 't.me/', 'telegram.me/', 'bit.ly/', 'tinyurl.com/',
    'passphrase', 'seed phrase', 'secret recovery phrase', 'trust wallet', 'metamask free'
];

const SCAM_DOMAINS = [
    'discorcl', 'dlscord', 'disc0rd', 'discord-nitro', 'discord-app',
    'steamcommimity', 'steancomunity', 'gift-nitro', 'free-nitro'
];

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        // Récupération du membre complet si absent du cache
        const member = message.member || await message.guild.members.fetch(message.author.id).catch(() => null);
        if (!member || member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

        // Nettoyage et normalisation du contenu (accents, casse)
        const content = message.content
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const hasScamKeyword = SCAM_KEYWORDS.some(keyword => content.includes(keyword));
        const hasScamDomain = SCAM_DOMAINS.some(domain => content.includes(domain));

        if (hasScamKeyword || hasScamDomain) {
            // Suppression immédiate du message
            await message.delete().catch(() => {});

            // Notification MP au membre
            const mpEmbed = new EmbedBuilder()
                .setTitle('🛑 Expulsion du serveur — BCSO')
                .setColor(0xFF0000)
                .setDescription(`Vous avez été expulsé de **${message.guild.name}** car votre compte a envoyé un message identifié comme une arnaque ou du spam crypto.\n\n*Si votre compte a été piraté, sécurisez-le immédiatement en modifiant votre mot de passe.*`)
                .setTimestamp();

            await message.author.send({ embeds: [mpEmbed] }).catch(() => {});

            // Expulsion si le bot a la hiérarchie nécessaire
            if (member.kickable) {
                await member.kick('Détection automatique : Arnaque / Spam Crypto').catch(() => {});
            }

            // Envoi des logs
            const logChannelId = db.get(`logs_${message.guild.id}`)?.messages || db.get(`logs_${message.guild.id}.messages`);
            if (logChannelId) {
                const logChannel = message.guild.channels.cache.get(logChannelId) || await message.guild.channels.fetch(logChannelId).catch(() => null);

                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('🛡️ Anti-Scam Crypto : Membre expulsé')
                        .setColor(0xFF0000)
                        .addFields(
                            { name: 'Membre', value: `${message.author.tag} (\`${message.author.id}\`)`, inline: true },
                            { name: 'Salon', value: `<#${message.channel.id}>`, inline: true },
                            { name: 'Raison', value: 'Détection d\'arnaque / spam crypto', inline: false },
                            { name: 'Contenu supprimé', value: message.content ? `\`\`\`${message.content.slice(0, 1000)}\`\`\`` : '*Aucun contenu texte*' }
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
                }
            }
        }
    }
};