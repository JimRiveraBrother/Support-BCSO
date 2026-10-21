const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, MessageFlags } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Configurer le salon des logs du bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où envoyer les logs du bot')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {
        const client = interaction.client;
        const channel = interaction.options.getChannel('salon');

        const botPermissions = channel.permissionsFor(interaction.guild.members.me);
        if (!botPermissions.has(PermissionFlagsBits.SendMessages) || !botPermissions.has(PermissionFlagsBits.ViewChannel)) {
            return interaction.reply({
                content: `❌ Je n'ai pas les permissions nécessaires pour voir ou envoyer des messages dans le salon ${channel}.`,
                flags: MessageFlags.Ephemeral
            });
        }

        db.set(`logs_${interaction.guild.id}.messages`, channel.id);

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuration des Logs')
            .setColor(client.color || 0x2B5329)
            .setDescription(`Les logs seront désormais envoyés dans le salon ${channel}.`)
            .setTimestamp();

        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};