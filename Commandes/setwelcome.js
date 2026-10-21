const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, MessageFlags } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Configurer le salon de bienvenue des nouveaux membres')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où envoyer les messages de bienvenue')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {
        const client = interaction.client;
        const channel = interaction.options.getChannel('salon');

        const botPermissions = channel.permissionsFor(interaction.guild.members.me);
        if (!botPermissions.has(PermissionFlagsBits.SendMessages) || !botPermissions.has(PermissionFlagsBits.ViewChannel)) {
            return interaction.reply({
                content: `❌ Je n'ai pas la permission de voir ou d'envoyer des messages dans le salon ${channel}.`,
                flags: MessageFlags.Ephemeral
            });
        }

        db.set(`welcome_channel_${interaction.guild.id}`, channel.id);

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuration Bienvenue')
            .setColor(client.color || 0x2B5329)
            .setDescription(`Les messages de bienvenue seront désormais envoyés dans le salon ${channel}.`)
            .setTimestamp();

        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};