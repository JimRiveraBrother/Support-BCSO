const { EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {

        const channelId = db.get(`welcome_channel_${member.guild.id}`);
        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor(client.color || 0x2B5329)
            .setTitle('Hey, nouveau membre !')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setDescription(
                `🎉🚔 **Bienvenue au Blaine County Sheriff’s Office**\n\n` +
                `Bienvenue sur le serveur Discord officiel du BCSO sur AfterWay !\n\n` +
                `Ici, tu retrouveras toutes les informations concernant le département : recrutements, formations, annonces publiques et règlement.\n\n` +
                `📌 **Pense à lire le règlement avant toute chose.**\n` +
                `📝 **Si tu souhaites rejoindre le BCSO, consulte le salon des candidatures.**\n` +
                `🎖️ **Respecte les règles du serveur.**\n` +
                `🤝 **Respecte les autres membres et reste professionnel.**\n\n` +
                `Bon séjour parmi nous, Citoyen ! ⭐`
            )
            .setFooter({ text: `Membre #${member.guild.memberCount}`, iconURL: member.guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        channel.send({ content: `Bienvenue <@${member.id}> !`, embeds: [embed] }).catch(() => {});
    }
};