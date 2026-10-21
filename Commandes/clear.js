const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime un nombre spécifié de messages dans le salon')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de messages à supprimer (entre 1 et 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),

    async execute(interaction) {
        const amount = interaction.options.getInteger('nombre');

        // Réponse différée éphémère (visible uniquement par l'exécuteur)
        await interaction.deferReply({ flags: 64 });

        try {
            // true permet d'ignorer les messages de plus de 14 jours au lieu d'interrompre l'exécution
            const deleted = await interaction.channel.bulkDelete(amount, true);

            if (deleted.size === 0) {
                return await interaction.editReply({
                    content: '⚠️ Aucun message n\'a pu être supprimé. (Les messages datant de plus de 14 jours ne peuvent pas être supprimés en masse par Discord).'
                });
            }

            await interaction.editReply({ 
                content: `✅ **${deleted.size}** message(s) supprimé(s) avec succès !` 
            });

        } catch (error) {
            console.error('Erreur lors de la suppression des messages :', error);
            
            await interaction.editReply({ 
                content: '❌ Une erreur est survenue lors de la suppression. Vérifie que j\'ai bien la permission de gérer les messages dans ce salon.' 
            });
        }
    }
};