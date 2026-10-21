const {

    ModalBuilder,

    TextInputBuilder,

    TextInputStyle,

    ActionRowBuilder,

    EmbedBuilder,

    MessageFlags

} = require('discord.js');

const db = require('croxydb');



const DEFAULT_CDD_CHANNEL_ID = '1549133279322701944';



module.exports = {

    name: 'interactionCreate',

    async execute(interaction, client) {

        try {

            // --- ÉTAPE 1 : CLIC SUR LE BOUTON -> OUVERTURE DU MODAL ---

            if (interaction.isButton() && interaction.customId === 'open_remontee_modal') {

                const modal = new ModalBuilder()

                    .setCustomId('remontee_modal')

                    .setTitle('Formulaire de Remontée Interne');



                const matriculeInput = new TextInputBuilder()

                    .setCustomId('matricule_input')

                    .setLabel("Matricule de l'agent accusé")

                    .setPlaceholder('Ex: A-42 ou 104')

                    .setStyle(TextInputStyle.Short)

                    .setRequired(true);



                const dateInput = new TextInputBuilder()

                    .setCustomId('date_input')

                    .setLabel("Date des faits")

                    .setPlaceholder('Ex: JJ/MM/AAAA ou hier soir')

                    .setStyle(TextInputStyle.Short)

                    .setRequired(true);



                const motifInput = new TextInputBuilder()

                    .setCustomId('motif_input')

                    .setLabel("Motif")

                    .setPlaceholder('Ex: Insultes, abus de pouvoir...')

                    .setStyle(TextInputStyle.Short)

                    .setRequired(true);



                const situationInput = new TextInputBuilder()

                    .setCustomId('situation_input')

                    .setLabel("Mise en situation")

                    .setPlaceholder('Explique en détail ce qu\'il s\'est passé...')

                    .setStyle(TextInputStyle.Paragraph)

                    .setRequired(true);



                const preuveInput = new TextInputBuilder()

                    .setCustomId('preuve_input')

                    .setLabel("Preuve (GoPro, Screen ...)")

                    .setPlaceholder('Lien de la vidéo, screen, etc.')

                    .setStyle(TextInputStyle.Short)

                    .setRequired(true);



                modal.addComponents(

                    new ActionRowBuilder().addComponents(matriculeInput),

                    new ActionRowBuilder().addComponents(dateInput),

                    new ActionRowBuilder().addComponents(motifInput),

                    new ActionRowBuilder().addComponents(situationInput),

                    new ActionRowBuilder().addComponents(preuveInput)

                );



                return await interaction.showModal(modal);

            }



            // --- ÉTAPE 2 : SOUMISSION DU MODAL -> ENVOI DANS LE SALON CDD ---

            if (interaction.isModalSubmit() && interaction.customId === 'remontee_modal') {

                await interaction.deferReply({ flags: MessageFlags.Ephemeral });



                const matricule = interaction.fields.getTextInputValue('matricule_input');

                const date = interaction.fields.getTextInputValue('date_input');

                const motif = interaction.fields.getTextInputValue('motif_input');

                const situation = interaction.fields.getTextInputValue('situation_input');

                const preuve = interaction.fields.getTextInputValue('preuve_input');



                // Récupération de l'ID du salon (base de données croxydb ou constante)

                const cddChannelId = db.get(`cdd_channel_${interaction.guild.id}`) || DEFAULT_CDD_CHANNEL_ID;

               

                const cddChannel = interaction.guild.channels.cache.get(cddChannelId)

                    || await interaction.guild.channels.fetch(cddChannelId).catch(() => null);



                if (!cddChannel) {

                    return await interaction.editReply({

                        content: '❌ Erreur : Le salon de la direction (CDD) est introuvable ou mal configuré.'

                    });

                }



                const embed = new EmbedBuilder()

                    .setTitle('🚨 Nouvelle Remontée Interne')

                    .setColor(0xE74C3C)

                    .addFields(

                        { name: 'De', value: `${interaction.user} (\`${interaction.user.tag}\`)`, inline: false },

                        { name: 'Agent accusé (Matricule)', value: matricule, inline: true },

                        { name: 'Date', value: date, inline: true },

                        { name: 'Motif', value: motif, inline: false },

                        { name: 'Mise en situation', value: `\`\`\`${situation}\`\`\``, inline: false },

                        { name: 'Preuve', value: preuve, inline: false }

                    )

                    .setTimestamp()

                    .setFooter({ text: 'Remontée sécurisée BCSO' });



                try {

                    await cddChannel.send({ embeds: [embed] });

                    return await interaction.editReply({

                        content: '✅ Ta remontée a été transmise avec succès à la direction (CDD).'

                    });

                } catch (error) {

                    console.error('Erreur lors de l\'envoi de la remontée dans le salon CDD :', error);

                    return await interaction.editReply({

                        content: '❌ Une erreur est survenue lors de l\'envoi du signalement.'

                    });

                }

            }

        } catch (err) {

            console.error('Erreur dans remonteeInteraction.js :', err);

        }

    }

}; 