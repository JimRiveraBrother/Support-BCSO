const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    MessageFlags 
} = require('discord.js');
const { generateOrganigrammeText } = require('../Utils/organigramme.js');
const { generateGeneralEffectifChunks } = require('../Utils/effectifs.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panels')
        .setDescription('Envoyer un panneau de configuration (Captcha, Règlement, Patrouille...)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choisissez le panneau à envoyer')
                .setRequired(true)
                .addChoices(
                    { name: 'Captcha (Vérification)', value: 'captcha' },
                    { name: 'Règlement Officiel', value: 'reglement' },
                    { name: 'Remontée Interne (Signalement)', value: 'remontee' },
                    { name: 'Suggestions', value: 'suggestion' },
                    { name: 'Organigramme (Supervisions & Responsabilités)', value: 'organigramme' },
                    { name: 'Patrouilles (Prise / Fin de service)', value: 'patrouille' },
                    { name: 'Effectif Général (Matricules)', value: 'effectif_general' },
                    { name: 'Prise d\'Accueil', value: 'accueil' },
                    { name: 'Prise d\'Absence', value: 'absence' }
                )
        ),

    async execute(interaction, client) {
        const type = interaction.options.getString('type');
        const iconURL = interaction.guild?.iconURL() || undefined;

        // 1. Panneau Captcha
        if (type === 'captcha') {
            const embedCaptcha = new EmbedBuilder()
                .setTitle('🔒 Vérification requise')
                .setColor(0x2B5329)
                .setDescription(
                    `Bienvenue sur le serveur Discord du **Blaine County Sheriff's Office** !\n\n` +
                    `Afin d'accéder à l'ensemble des salons, veuillez cliquer sur le bouton ci-dessous pour passer la vérification Captcha.`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            const rowCaptcha = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_captcha_start')
                    .setLabel('Passer la vérification')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );

            await interaction.channel.send({ embeds: [embedCaptcha], components: [rowCaptcha] });
            return interaction.reply({ content: '✅ Panneau du **Captcha** envoyé dans ce salon.', flags: MessageFlags.Ephemeral });
        }

        // 2. Panneau Remontée / Signalement
        if (type === 'remontee') {
            const embedRemontee = new EmbedBuilder()
                .setTitle('📋 Signalement & Remontée - BCSO')
                .setColor(0xE67E22)
                .setDescription(
                    `Un problème avec un agent ou une situation à rapporter à la direction ?\n` +
                    `Clique sur le bouton ci-dessous pour remplir le formulaire de signalement en toute discrétion.`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            const rowRemontee = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('open_remontee_modal')
                    .setLabel('Faire une remontée')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝')
            );

            await interaction.channel.send({ embeds: [embedRemontee], components: [rowRemontee] });
            return interaction.reply({ content: '✅ Panneau de **Remontée** envoyé dans ce salon.', flags: MessageFlags.Ephemeral });
        }

        // 3. Panneau Suggestions
        if (type === 'suggestion') {
            const embedSuggestion = new EmbedBuilder()
                .setTitle('💡 Suggestions - BCSO')
                .setColor(0x3498DB)
                .setDescription(
                    `Une idée d'amélioration pour le département ou une proposition d'événement ?\n` +
                    `Clique sur le bouton ci-dessous pour soumettre ta suggestion à la direction.`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            const rowSuggestion = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('open_suggestion_modal')
                    .setLabel('Faire une suggestion')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💡')
            );

            await interaction.channel.send({ embeds: [embedSuggestion], components: [rowSuggestion] });
            return interaction.reply({ content: '✅ Panneau des **Suggestions** envoyé dans ce salon.', flags: MessageFlags.Ephemeral });
        }

        // 4. Panneau Organigramme
        if (type === 'organigramme') {
            const content = generateOrganigrammeText();

            const rowOrganigramme = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('refresh_organigramme')
                    .setLabel('Rafraîchir')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔄')
            );

            await interaction.channel.send({ content, components: [rowOrganigramme] });
            return interaction.reply({ content: '✅ Panneau de l\'**Organigramme** envoyé dans ce salon.', flags: MessageFlags.Ephemeral });
        }

        // 5. Panneau Prises de Patrouille
        if (type === 'patrouille') {
            const embedPatrouille = new EmbedBuilder()
                .setTitle('🚔 Lancement d\'une Patrouille - BCSO')
                .setColor('#2B2D31')
                .setDescription(
                    `Veuillez sélectionner le type d'unité que vous souhaitez ouvrir.\n\n` +
                    `⚠️ **Attention :** Vous devez obligatoirement cliquer sur le bouton correspondant **dans le salon dédié** à l'unité.`
                )
                .setFooter({ text: 'Support - BCSO System', iconURL })
                .setTimestamp();

            const rowPatrouille = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('start_patrouille_Classique')
                    .setLabel('Classique')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🚘'),
                new ButtonBuilder()
                    .setCustomId('start_patrouille_Henry')
                    .setLabel('Henry')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🚁'),
                new ButtonBuilder()
                    .setCustomId('start_patrouille_Mary')
                    .setLabel('Mary')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🏍️'),
                new ButtonBuilder()
                    .setCustomId('start_patrouille_STX')
                    .setLabel('STX')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🏎️'),
                new ButtonBuilder()
                    .setCustomId('start_patrouille_Detective')
                    .setLabel('Détective')
                    .setStyle(ButtonStyle.Primary) 
                    .setEmoji('🕵️')
            );

            await interaction.channel.send({ embeds: [embedPatrouille], components: [rowPatrouille] });
            return interaction.reply({ content: '✅ Panneau des **Patrouilles** envoyé dans ce salon.', flags: MessageFlags.Ephemeral });
        }

        // 6. Panneau Effectif Général (Matricules)
        if (type === 'effectif_general') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const chunks = generateGeneralEffectifChunks();

            for (let i = 0; i < chunks.length - 1; i++) {
                await interaction.channel.send({ content: chunks[i] });
            }

            const rowEffectif = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('refresh_effectif_general')
                    .setLabel('Rafraîchir')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔄')
            );

            await interaction.channel.send({ 
                content: chunks[chunks.length - 1], 
                components: [rowEffectif] 
            });

            return interaction.editReply({ content: '✅ Panneau de l\'**Effectif Général** envoyé dans ce salon.' });
        }

        // 7. Panneau Prise d'Accueil
        if (type === 'accueil') {
            const embedAccueil = new EmbedBuilder()
                .setTitle('🏛️ Prise d\'Accueil - BCSO')
                .setColor(0x2B5329)
                .setDescription(
                    `Cliquez sur le bouton ci-dessous pour démarrer votre service d'accueil au poste.\n\n` +
                    `⚠️ **Rappel :** Cette action doit être effectuée dans le salon dédié.`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            const rowAccueil = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('start_accueil')
                    .setLabel('Prise d\'Accueil')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🏛️')
            );

            await interaction.channel.send({ embeds: [embedAccueil], components: [rowAccueil] });
            return interaction.reply({ content: '✅ Panneau de **Prise d\'Accueil** envoyé dans ce salon.', flags: MessageFlags.Ephemeral });
        }

        // 8. Panneau Prise d'Absence
        if (type === 'absence') {
            const embedAbsence = new EmbedBuilder()
                .setTitle('📅 Gestion des Absences - BCSO')
                .setColor(0xE74C3C)
                .setDescription(
                    `Vous prévoyez une absence prochainement ?\n` +
                    `Cliquez sur le bouton ci-dessous pour remplir le formulaire officiel de demande d'absence.`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            const rowAbsence = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('open_absence_modal')
                    .setLabel('Prendre une absence')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('📅')
            );

            await interaction.channel.send({ embeds: [embedAbsence], components: [rowAbsence] });
            return interaction.reply({ content: '✅ Panneau de **Prise d\'Absence** envoyé dans ce salon.', flags: MessageFlags.Ephemeral });
        }
    }
};