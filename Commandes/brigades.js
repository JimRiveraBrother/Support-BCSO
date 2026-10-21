const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { generateBrigadeEmbed } = require('../Utils/brigadesData.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('brigades')
        .setDescription('Affiche le panel d\'effectif d\'une brigade spécifique')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('brigade')
                .setDescription('Choisissez la brigade à afficher')
                .setRequired(true)
                .addChoices(
                    { name: '🕵️ Détective', value: 'detective' },
                    { name: '🏍️ Mary', value: 'mary' },
                    { name: '🏎️ STX', value: 'stx' },
                    { name: '🚁 Henry', value: 'henry' },
                    { name: '✨ Toutes les brigades', value: 'all' }
                )),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const choice = interaction.options.getString('brigade');
        const brigadesList = choice === 'all' ? ['detective', 'mary', 'stx', 'henry'] : [choice];

        for (const key of brigadesList) {
            const embed = await generateBrigadeEmbed(interaction.guild, key);
            if (!embed) continue;

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`refresh_brigade_${key}`)
                    .setLabel('Rafraîchir')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔄')
            );

            await interaction.channel.send({
                embeds: [embed],
                components: [row]
            });

            // Petite pause de sécurité de 1 seconde si on envoie tout d'un coup pour éviter le rate-limit
            if (brigadesList.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return interaction.editReply({ content: '✅ Le ou les panels de brigades ont été envoyés avec succès !' });
    }
};