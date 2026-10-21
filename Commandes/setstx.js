const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getBrigadesData, saveBrigadesData, generateBrigadeEmbed } = require('../Utils/brigadesData.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setstx')
        .setDescription('Attribuer ou retirer un poste dans la brigade STX')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('agent')
                .setDescription('Agent concerné')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('poste')
                .setDescription('Choisissez le poste')
                .setRequired(true)
                .addChoices(
                    { name: 'Pilote', value: 'pilote' },
                    { name: 'Copilote', value: 'copilote' },
                    { name: 'Aucun (Retirer du poste)', value: 'aucun' }
                )),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const agent = interaction.options.getUser('agent');
        const poste = interaction.options.getString('poste');

        const db = getBrigadesData();
        if (!db.stx) db.stx = {};

        let statusText = '';

        if (poste === 'aucun') {
            delete db.stx[agent.id];
            statusText = `🗑️ L'agent <@${agent.id}> a été retiré de son poste STX.`;
        } else {
            db.stx[agent.id] = poste;
            statusText = `✅ L'agent <@${agent.id}> a été assigné au poste de **${poste} STX**.`;
        }

        saveBrigadesData(db);

        // Mise à jour automatique de l'embed dans le salon si possible
        try {
            const messages = await interaction.channel.messages.fetch({ limit: 10 });
            const botMessage = messages.find(m => m.author.id === interaction.client.user.id && m.embeds[0]?.title?.includes('STX'));
            
            if (botMessage) {
                const newEmbed = await generateBrigadeEmbed(interaction.guild, 'stx');
                await botMessage.edit({ embeds: [newEmbed], components: botMessage.components });
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'embed STX :', error);
        }

        return interaction.editReply({ content: statusText });
    }
};