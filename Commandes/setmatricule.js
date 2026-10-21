const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getEffectifsData, saveEffectifsData, generateGeneralEffectifChunks } = require('../Utils/effectifs.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setmatricule')
        .setDescription('Attribuer ou retirer un matricule à un agent')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('matricule')
                .setDescription('Numéro du matricule (ex: 01, 25)')
                .setRequired(true))
        .addUserOption(option => 
            option.setName('agent')
                .setDescription('Agent à attribuer (laisser vide pour libérer le matricule)')
                .setRequired(false)),

    async execute(interaction) {
        // 1. Différer la réponse de manière éphémère
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let matricule = interaction.options.getString('matricule').trim();
        const agent = interaction.options.getUser('agent');

        // Formater le numéro (ex: "1" devient "01")
        if (/^\d+$/.test(matricule)) {
            matricule = matricule.padStart(2, '0');
        }

        const data = getEffectifsData();
        if (!data.general) data.general = {};

        // Horodatage
        const now = new Date();
        const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'Europe/Paris' });
        const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).replace(':', 'h');
        data.lastChange = `${dateStr} à ${timeStr}`;

        let statusText = '';

        if (agent) {
            // Nettoyage : retirer l'agent de tout autre matricule existant
            for (const [key, value] of Object.entries(data.general)) {
                if (value === agent.id) {
                    delete data.general[key];
                }
            }

            data.general[matricule] = agent.id;
            statusText = `✅ Matricule **${matricule}** attribué à <@${agent.id}>.`;
        } else {
            delete data.general[matricule];
            statusText = `🗑️ Matricule **${matricule}** libéré.`;
        }

        // Sauvegarde des données
        saveEffectifsData(data);

        // 2. Mise à jour automatique des tableaux dans le salon
        try {
            const chunks = generateGeneralEffectifChunks();

            // Récupère les derniers messages du salon et filtre ceux du bot
            const messages = await interaction.channel.messages.fetch({ limit: 10 });
            const botMessages = messages.filter(m => m.author.id === interaction.client.user.id);
            
            // Prend les 3 messages les plus récents du bot et les remet dans l'ordre chronologique (du plus ancien au plus récent)
            const messagesArray = Array.from(botMessages.values()).slice(0, 3).reverse();

            if (messagesArray.length >= 3) {
                for (let i = 0; i < chunks.length; i++) {
                    await messagesArray[i].edit({
                        content: chunks[i],
                        components: messagesArray[i].components // Conserve le bouton sur le dernier message
                    });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour automatique de l\'effectif :', error);
        }

        // 3. Confirmation finale à l'utilisateur
        return interaction.editReply({ content: statusText });
    }
};