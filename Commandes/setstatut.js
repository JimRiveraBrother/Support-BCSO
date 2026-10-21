const { SlashCommandBuilder, ActivityType, MessageFlags } = require('discord.js');

const BOT_OWNER_ID = process.env.BOT_OWNER_ID || '1202502660469817394';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setstatut')
        .setDescription('Modifie le statut de présence du bot (Owner uniquement)')
        .addStringOption(opt =>
            opt.setName('texte')
               .setDescription('Le texte du statut')
               .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName('type')
               .setDescription('Type d\'activité')
               .setRequired(true)
               .addChoices(
                   { name: 'Joue à (Playing)', value: ActivityType.Playing },
                   { name: 'Écoute (Listening)', value: ActivityType.Listening },
                   { name: 'Regarde (Watching)', value: ActivityType.Watching },
                   { name: 'Rivalise dans (Competing)', value: ActivityType.Competing }
               )
        )
        .addStringOption(opt =>
            opt.setName('etat')
               .setDescription('État de présence')
               .setRequired(false)
               .addChoices(
                   { name: 'En ligne (Online)', value: 'online' },
                   { name: 'Inactif (Idle)', value: 'idle' },
                   { name: 'Ne pas déranger (DND)', value: 'dnd' },
                   { name: 'Invisible', value: 'invisible' }
               )
        ),

    async execute(interaction) {
        // Restriction à l'owner du bot
        if (interaction.user.id !== BOT_OWNER_ID) {
            return interaction.reply({
                content: '❌ Seul le propriétaire du bot peut exécuter cette commande.',
                flags: MessageFlags.Ephemeral
            });
        }

        const texte = interaction.options.getString('texte');
        const activityType = interaction.options.getInteger('type');
        const statusChoice = interaction.options.getString('etat') || 'online';

        try {
            interaction.client.user.setPresence({
                activities: [{ name: texte, type: activityType }],
                status: statusChoice
            });

            await interaction.reply({
                content: `✅ Statut mis à jour avec succès !\n**Texte :** \`${texte}\`\n**État :** \`${statusChoice}\``,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut :', error);
            await interaction.reply({
                content: '❌ Impossible de mettre à jour le statut du bot.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};