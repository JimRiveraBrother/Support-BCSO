const { 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder, 
    EmbedBuilder, 
    MessageFlags 
} = require('discord.js');

const SALON_ABSENCE_ID = '1549133366299852901';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzzU6UZzdrkjxJLjmJ8hC3BP-21831PW46Ms3KVulcGP8_2FeAir0JK-megeThXUC5zXg/exec';

async function sendToGoogleSheet(matricule, dates) {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricule, dates }),
            redirect: 'follow'
        });
        const result = await response.json();
        return result.status === 'success';
    } catch (error) {
        console.error('[SHEETS] Erreur d\'envoi vers Apps Script :', error);
        return false;
    }
}

module.exports = {
    async handleAbsence(interaction, client) {
        // --- A. CLIC SUR LE BOUTON D'ABSENCE ---
        if (interaction.isButton() && interaction.customId === 'open_absence_modal') {
            const modal = new ModalBuilder()
                .setCustomId('absence_modal_submit')
                .setTitle('Demande d\'Absence - BCSO');

            const nomInput = new TextInputBuilder()
                .setCustomId('absence_nom')
                .setLabel('Nom')
                .setPlaceholder('Ex: Rivera')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const prenomInput = new TextInputBuilder()
                .setCustomId('absence_prenom')
                .setLabel('Prénom')
                .setPlaceholder('Ex: Jim')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const matriculeInput = new TextInputBuilder()
                .setCustomId('absence_matricule')
                .setLabel('Matricule')
                .setPlaceholder('Ex: 39')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const datesInput = new TextInputBuilder()
                .setCustomId('absence_dates')
                .setLabel('Dates (Début et Fin)')
                .setPlaceholder('Ex: 22/10/2026 au 28/10/2026')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const raisonInput = new TextInputBuilder()
                .setCustomId('absence_raison')
                .setLabel('Raison de l\'absence')
                .setPlaceholder('Ex: Raisons personnelles / Congés')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nomInput),
                new ActionRowBuilder().addComponents(prenomInput),
                new ActionRowBuilder().addComponents(matriculeInput),
                new ActionRowBuilder().addComponents(datesInput),
                new ActionRowBuilder().addComponents(raisonInput)
            );

            return await interaction.showModal(modal);
        }

        // --- B. SOUMISSION DU MODAL D'ABSENCE ---
        if (interaction.isModalSubmit() && interaction.customId === 'absence_modal_submit') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const nom = interaction.fields.getTextInputValue('absence_nom');
            const prenom = interaction.fields.getTextInputValue('absence_prenom');
            const matricule = interaction.fields.getTextInputValue('absence_matricule');
            const dates = interaction.fields.getTextInputValue('absence_dates');
            const raison = interaction.fields.getTextInputValue('absence_raison');

            // Envoi automatique au Google Sheet via Apps Script
            const sheetUpdated = await sendToGoogleSheet(matricule, dates);

            const channel = interaction.guild.channels.cache.get(SALON_ABSENCE_ID) || 
                            await interaction.guild.channels.fetch(SALON_ABSENCE_ID).catch(() => null);

            if (channel) {
                const embedAbsence = new EmbedBuilder()
                    .setTitle('📅 Signalement d\'Absence - BCSO')
                    .setColor(0xE74C3C)
                    .addFields(
                        
                        { name: 'Agent', value: `${interaction.user} (${prenom} ${nom})`, inline: true },
                        { name: 'Matricule', value: `\`${matricule}\``, inline: true },
                        { name: 'Période d\'absence', value: `📆 **${dates}**`, inline: false },
                        { name: 'Raison', value: raison, inline: false },
                        { name: 'Google Sheet CE', value: sheetUpdated ? '✅ Mise à jour automatique effectuée' : '⚠️ Non trouvé dans le tableau', inline: false }
                    )
                    .setFooter({ text: 'Blaine County Sheriff\'s Office' })
                    .setTimestamp();

                await channel.send({ embeds: [embedAbsence] });
            }

            return interaction.editReply({ 
                content: sheetUpdated 
                    ? '✅ Absence inscrite directement dans le Google Sheet CE !' 
                    : '⚠️ Absence publiée sur Discord, mais le matricule n\'a pas été trouvé dans le Google Sheet.' 
            });
        }
    }
};