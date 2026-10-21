const {

    ModalBuilder,

    TextInputBuilder,

    TextInputStyle,

    ActionRowBuilder,

    EmbedBuilder,

    MessageFlags

} = require('discord.js');

const db = require('croxydb');



const DEFAULT_SUGGESTIONS_CHANNEL_ID = '1549133340206964837';



module.exports = {

    async handleSuggestion(interaction, client) {

        if (interaction.isButton() && interaction.customId === 'open_suggestion_modal') {

            const modal = new ModalBuilder()

                .setCustomId('suggestion_modal')

                .setTitle('Boîte à Suggestions');



            const titreInput = new TextInputBuilder()

                .setCustomId('titre_suggestion_input')

                .setLabel("Titre / Résumé de l'idée")

                .setPlaceholder('Ex: Ajout d\'un nouveau véhicule de patrouille')

                .setStyle(TextInputStyle.Short)

                .setRequired(true);



            const descriptionInput = new TextInputBuilder()

                .setCustomId('description_suggestion_input')

                .setLabel("Description détaillée")

                .setPlaceholder('Explique ton idée et son utilité pour le département...')

                .setStyle(TextInputStyle.Paragraph)

                .setRequired(true);



            modal.addComponents(

                new ActionRowBuilder().addComponents(titreInput),

                new ActionRowBuilder().addComponents(descriptionInput)

            );



            return await interaction.showModal(modal);

        }



        if (interaction.isModalSubmit() && interaction.customId === 'suggestion_modal') {

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });



            const titre = interaction.fields.getTextInputValue('titre_suggestion_input');

            const description = interaction.fields.getTextInputValue('description_suggestion_input');



            // Récupération de l'ID du salon (depuis la base de données ou la constante par défaut)

            const suggestionsChannelId = db.get(`suggestion_channel_${interaction.guild.id}`) || DEFAULT_SUGGESTIONS_CHANNEL_ID;

           

            const suggestionChannel = interaction.guild.channels.cache.get(suggestionsChannelId) || await interaction.guild.channels.fetch(suggestionsChannelId).catch(() => null);

           

            if (!suggestionChannel) {

                return interaction.editReply({ content: '❌ Erreur : Le salon des suggestions est introuvable ou mal configuré.' });

            }



            const embedSuggestion = new EmbedBuilder()

                .setTitle(`💡 Nouvelle Suggestion : ${titre}`)

                .setColor(0x3498DB)

                .setDescription(description)

                .addFields(

                    { name: 'Proposé par', value: `${interaction.user}`, inline: false }

                )

                .setTimestamp()

                .setFooter({

                    text: 'Blaine County Sheriff\'s Office',

                    iconURL: interaction.guild.iconURL({ dynamic: true }) || undefined

                });



            try {

                const message = await suggestionChannel.send({ embeds: [embedSuggestion] });

               

                // Ajout des réactions de vote avec gestion d'erreur au cas où les permissions manquent

                await message.react('👍').catch(() => {});

                await message.react('👎').catch(() => {});



                await interaction.editReply({ content: '✅ Ta suggestion a bien été publiée dans le salon dédié !' });

            } catch (error) {

                console.error('Erreur lors de l\'envoi de la suggestion :', error);

                await interaction.editReply({ content: '❌ Une erreur est survenue lors de l\'envoi de la suggestion.' });

            }

        }

    }

}; 