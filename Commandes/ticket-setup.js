const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Envoie le panneau de création de tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Vérification des permissions du bot dans le salon courant
        const botPermissions = interaction.channel.permissionsFor(interaction.guild.members.me);
        if (!botPermissions.has(PermissionFlagsBits.SendMessages) || !botPermissions.has(PermissionFlagsBits.EmbedLinks)) {
            return interaction.reply({
                content: "❌ Je n'ai pas les permissions nécessaires (Envoyer des messages / Intégrer des liens) dans ce salon.",
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎫 Support - BCSO')
            .setDescription('Besoin d\'aide ou envie de contacter le commandement ou la direction ? Clique sur le bouton ci-dessous pour ouvrir un ticket.')
            .setColor(0x3498DB)
            .setFooter({ text: 'Système de tickets sécurisé' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Ouvrir un ticket')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎫')
        );

        // Envoi du panel de tickets dans le salon
        await interaction.channel.send({ embeds: [embed], components: [row] });

        // Confirmation pour l'administrateur
        return interaction.reply({ 
            content: '✅ Panneau de tickets envoyé avec succès !', 
            flags: MessageFlags.Ephemeral 
        });
    }
};