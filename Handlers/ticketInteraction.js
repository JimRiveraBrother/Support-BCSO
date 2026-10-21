const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');



const STAFF_ROLE_IDS = [

    '1549133028742139935', 

    '1549133029622947933'

];



module.exports = {

    async handleTicket(interaction, client) {

        if (!interaction.isButton()) return;



        const hasStaffRole = interaction.member.roles.cache.some(role => STAFF_ROLE_IDS.includes(role.id));



        // --- 1. OUVERTURE D'UN TICKET ---

        if (interaction.customId === 'create_ticket') {

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });



            const guild = interaction.guild;

            const user = interaction.user;



            const existingChannel = guild.channels.cache.find(c => c.name === `ticket-${user.username.toLowerCase()}`);

            if (existingChannel) {

                return interaction.editReply({ content: `❌ Tu as déjà un ticket ouvert : ${existingChannel}` });

            }



            try {

                const parentCategory = interaction.channel.parent;



                const ticketChannel = await guild.channels.create({

                    name: `ticket-${user.username.toLowerCase()}`,

                    type: ChannelType.GuildText,

                    parent: parentCategory ? parentCategory.id : null,

                    permissionOverwrites: [

                        {

                            id: guild.roles.everyone.id,

                            deny: [PermissionFlagsBits.ViewChannel],

                        },

                        {

                            id: user.id,

                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],

                        },

                        {

                            id: client.user.id,

                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],

                        },

                    ],

                });



                const embed = new EmbedBuilder()

                    .setTitle(`Ticket de ${user.username}`)

                    .setDescription('Un membre du staff va bientôt te prendre en charge.\nExplique ton problème ci-dessous en détail.')

                    .setColor(0x2ECC71);



                const ticketButtons = new ActionRowBuilder().addComponents(

                    new ButtonBuilder()

                        .setCustomId('claim_ticket')

                        .setLabel('Prendre en charge')

                        .setStyle(ButtonStyle.Success)

                        .setEmoji('🙋‍♂️'),

                    new ButtonBuilder()

                        .setCustomId('close_ticket')

                        .setLabel('Fermer')

                        .setStyle(ButtonStyle.Secondary)

                        .setEmoji('🔒'),

                    new ButtonBuilder()

                        .setCustomId('delete_ticket')

                        .setLabel('Supprimer')

                        .setStyle(ButtonStyle.Danger)

                        .setEmoji('🗑️')

                );



                await ticketChannel.send({ content: `<@${user.id}> Bienvenue !`, embeds: [embed], components: [ticketButtons] });

                return await interaction.editReply({ content: `✅ Ton ticket a été créé avec succès : ${ticketChannel}` });



            } catch (error) {

                console.error('Erreur lors de la création du ticket :', error);

                return await interaction.editReply({ content: '❌ Une erreur est survenue lors de la création du ticket.' });

            }

        }



        // --- 2. PRENDRE EN CHARGE LE TICKET ---

        if (interaction.customId === 'claim_ticket') {

            if (!hasStaffRole) {

                return interaction.reply({ content: "❌ Seul le staff autorisé peut prendre en charge ce ticket !", flags: MessageFlags.Ephemeral });

            }



            await interaction.reply({ content: `🙋‍♂️ Ticket pris en charge par <@${interaction.user.id}> !` });

            

            try {

                const cleanName = interaction.channel.name.replace(/^[✅🔒]-/, '');

                await interaction.channel.setName(`✅-${cleanName}`);

            } catch (err) {

                console.error('Impossible de renommer le salon :', err);

            }

        }



        // --- 3. FERMER LE TICKET ---

        if (interaction.customId === 'close_ticket') {

            if (!hasStaffRole) {

                return interaction.reply({ content: "❌ Seul le staff peut fermer ce ticket !", flags: MessageFlags.Ephemeral });

            }



            await interaction.reply({ content: '🔒 Le ticket a été fermé. Retrait des permissions d\'écriture pour l\'utilisateur.' });



            try {

                for (const [id, overwrite] of interaction.channel.permissionOverwrites.cache) {

                    if (!STAFF_ROLE_IDS.includes(id) && id !== interaction.guild.id && id !== client.user.id) {

                        await interaction.channel.permissionOverwrites.edit(id, { SendMessages: false }).catch(() => {});

                    }

                }

                const cleanName = interaction.channel.name.replace(/^[✅🔒]-/, '');

                await interaction.channel.setName(`🔒-${cleanName}`);

            } catch (err) {

                console.error('Erreur lors de la fermeture du ticket :', err);

            }

        }



        // --- 4. SUPPRIMER LE SALON ---

        if (interaction.customId === 'delete_ticket') {

            if (!hasStaffRole) {

                return interaction.reply({ content: "❌ Seul le staff peut supprimer ce ticket !", flags: MessageFlags.Ephemeral });

            }



            await interaction.reply({ content: '🗑️ Suppression du salon du ticket en cours...' });

            setTimeout(async () => {

                try {

                    await interaction.channel.delete();

                } catch (err) {

                    console.error('Erreur lors de la suppression du salon :', err);

                }

            }, 2000);

        }

    }

}; 

