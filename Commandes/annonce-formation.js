const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('annonce-formation')
        .setDescription('Publie un avis d\'annonce de formation BCSO')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        // 1. Formation Globale
        .addSubcommand(sub =>
            sub.setName('globale')
                .setDescription('Annonce de formation globale')
                .addStringOption(opt => opt.setName('date').setDescription('Date et heure (ex: 15/09/2026 à 20h00)').setRequired(true))
                .addStringOption(opt => opt.setName('lieu').setDescription('Lieu de la formation').setRequired(true))
        )

        // 2. Formation Radio
        .addSubcommand(sub =>
            sub.setName('radio')
                .setDescription('Annonce de formation radio')
                .addStringOption(opt => opt.setName('date').setDescription('Date et heure (ex: 15/09/2026 à 20h00)').setRequired(true))
                .addStringOption(opt => opt.setName('lieu').setDescription('Lieu de la formation').setRequired(true))
        )

        // 3. Formation Henry
        .addSubcommand(sub =>
            sub.setName('henry')
                .setDescription('Annonce de formation Henry')
                .addStringOption(opt => opt.setName('date').setDescription('Date et heure (ex: 15/09/2026 à 20h00)').setRequired(true))
                .addStringOption(opt => opt.setName('lieu').setDescription('Lieu de la formation').setRequired(true))
        )

        // 4. Formation Mary
        .addSubcommand(sub =>
            sub.setName('mary')
                .setDescription('Annonce de formation Mary')
                .addStringOption(opt => opt.setName('date').setDescription('Date et heure (ex: 15/09/2026 à 20h00)').setRequired(true))
                .addStringOption(opt => opt.setName('lieu').setDescription('Lieu de la formation').setRequired(true))
        )

        // 5. Formation STX
        .addSubcommand(sub =>
            sub.setName('stx')
                .setDescription('Annonce de formation STX')
                .addStringOption(opt => opt.setName('date').setDescription('Date et heure (ex: 15/09/2026 à 20h00)').setRequired(true))
                .addStringOption(opt => opt.setName('lieu').setDescription('Lieu de la formation').setRequired(true))
        )

        // 6. Formation Lincoln
        .addSubcommand(sub =>
            sub.setName('lincoln')
                .setDescription('Annonce de formation Lincoln')
                .addStringOption(opt => opt.setName('date').setDescription('Date et heure (ex: 15/09/2026 à 20h00)').setRequired(true))
                .addStringOption(opt => opt.setName('lieu').setDescription('Lieu de la formation').setRequired(true))
        )

        // 7. Entraînement
        .addSubcommand(sub =>
            sub.setName('entrainement')
                .setDescription('Annonce d\'entraînement')
                .addStringOption(opt => opt.setName('date').setDescription('Date et heure (ex: 15/09/2026 à 20h00)').setRequired(true))
                .addStringOption(opt => opt.setName('lieu').setDescription('Lieu de l\'entraînement').setRequired(true))
                .addStringOption(opt => opt.setName('contenu').setDescription('Contenu / Programme de l\'entraînement').setRequired(true))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const date = interaction.options.getString('date');
        const lieu = interaction.options.getString('lieu');
        
        // Mappage des IDs de rôles requis pour lancer chaque formation
        const requiredRoles = {
            globale: '1539893810551586816',
            radio: '1539893810551586816',
            henry: '1540460708502708274',
            mary: '1542140860311932958',
            stx: '1549133057485832303',
            lincoln: '1540460666328977558',
            entrainement: '1548655367041581128'
        };

        const requiredRoleId = requiredRoles[subcommand];

        // Vérification si le membre possède le rôle requis
        if (requiredRoleId && !interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({
                content: `❌ Vous ne possédez pas le rôle requis (<@&${requiredRoleId}>) pour publier cette annonce de formation.`,
                flags: 64
            });
        }

        let messageText = "";

        if (subcommand === 'globale') {
            messageText = `**Mes respects,**\n` +
                          `<@&1549132975181144271>\n` +
                          `<@&1549133073076064317>\n\n` +
                          `Une ***formation globale*** se tiendra aux informations suivantes :\n\n` +
                          `🗓️ Date : **${date}**\n` +
                          `📍 Lieu : **${lieu}**\n\n` +
                          `Adressez-vous à l'accueil avec 5 minutes d'avance. La présence est strictly obligatoire pour l’ensemble des agents qui n'ont pas la formation, quel que soit le grade occupé.\n\n` +
                          `__Merci d’indiquer votre présence en réagissant :__\n` +
                          `- ✅ Présent\n` +
                          `- ❌ Absent\n\n` +
                          `Je compte sur votre réactivité afin d’avoir un maximum de réponses.\n\n` +
                          `Sachez qu'il doit y avoir un maximum d'agent en attente de formation parce que celle-ci est obligatoire ! ⚠️\n\n` +
                          `Bien à vous,\n` +
                          `Cordialement.\n` +
                          `<@${interaction.user.id}> - <@&1549133055174901913>`;
        } else if (subcommand === 'radio') {
            messageText = `**Mes respects,**\n` +
                          `<@&1549132975181144271>\n` +
                          `<@&1549133072148992133>\n\n` +
                          `Une ***formation radio*** se tiendra aux informations suivantes :\n\n` +
                          `🗓️ Date : **${date}**\n` +
                          `📍 Lieu : **${lieu}**\n\n` +
                          `Adressez-vous à l'accueil avec 5 minutes d'avance. La présence est strictement obligatoire pour l’ensemble des agents qui n'ont pas la formation, quel que soit le grade occupé.\n\n` +
                          `__Merci d’indiquer votre présence en réagissant :__\n` +
                          `- ✅ Présent\n` +
                          `- ❌ Absent\n\n` +
                          `Je compte sur votre réactivité afin d’avoir un maximum de réponses.\n\n` +
                          `Sachez qu'il doit y avoir un maximum d'agent en attente de formation parce que celle-ci est obligatoire ! ⚠️\n` +
                          `L'essentiel n'est pas de connaître tous les calls par cœur suite à celle-ci, mais de comprendre comment la centrale fonctionne et quels sont les calls corrects ou non.\n\n` +
                          `Bien à vous,\n` +
                          `Cordialement.\n` +
                          `<@${interaction.user.id}> - <@&1549133055174901913>`;
        } else if (subcommand === 'henry') {
            messageText = `**Mes respects,**\n` +
                          `<@&1549133078234927235>\n\n` +
                          `Une ***formation Henry*** se tiendra aux informations suivantes :\n\n` +
                          `🗓️ Date : **${date}**\n` +
                          `📍 Lieu : **${lieu}**\n\n` +
                          `Adressez-vous à l'accueil avec 5 minutes d'avance. La présence est strictement obligatoire pour l’ensemble des agents qui n'ont pas la formation, quel que soit le grade occupé.\n\n` +
                          `__Merci d’indiquer votre présence en réagissant :__\n` +
                          `- ✅ Présent\n` +
                          `- ❌ Absent\n\n` +
                          `Je compte sur votre réactivité afin d’avoir un maximum de réponses.\n\n` +
                          `Bien à vous,\n` +
                          `Cordialement.\n` +
                          `<@${interaction.user.id}> - <@&1549133058316304406>`;
        } else if (subcommand === 'mary') {
            messageText = `**Mes respects,**\n` +
                          `<@&1549133078671392780>\n\n` +
                          `Une ***formation Mary*** se tiendra aux informations suivantes :\n\n` +
                          `🗓️ Date : **${date}**\n` +
                          `📍 Lieu : **${lieu}**\n\n` +
                          `Adressez-vous à l'accueil avec 5 minutes d'avance. La présence est strictement obligatoire pour l’ensemble des agents qui n'ont pas la formation, quel que soit le grade occupied.\n\n` +
                          `__Merci d’indiquer votre présence en réagissant :__\n` +
                          `- ✅ Présent\n` +
                          `- ❌ Absent\n\n` +
                          `Je compte sur votre réactivité afin d’avoir un maximum de réponses.\n\n` +
                          `Bien à vous,\n` +
                          `Cordialement.\n` +
                          `<@${interaction.user.id}> - <@&1549133058979008663>`;
        } else if (subcommand === 'stx') {
            messageText = `**Mes respects,**\n` +
                          `<@&1549133083662614598>\n\n` +
                          `Une ***formation STX*** se tiendra aux informations suivantes :\n\n` +
                          `🗓️ Date : **${date}**\n` +
                          `📍 Lieu : **${lieu}**\n\n` +
                          `Adressez-vous à l'accueil avec 5 minutes d'avance. La présence est strictement obligatoire pour l’ensemble des agents qui n'ont pas la formation, quel que soit le grade occupé.\n\n` +
                          `__Merci d’indiquer votre présence en réagissant :__\n` +
                          `- ✅ Présent\n` +
                          `- ❌ Absent\n\n` +
                          `Je compte sur votre réactivité afin d’avoir un maximum de réponses.\n\n` +
                          `Bien à vous,\n` +
                          `Cordialement.\n` +
                          `<@${interaction.user.id}> - <@&1549133057485832303>`;
        } else if (subcommand === 'entrainement') {
            const contenu = interaction.options.getString('contenu');

            messageText = `**Mes respects,**\n` +
                          `<@&1539892049845948416>\n` +
                          `<@&1539892228233764975>\n` +
                          `<@&1539816105839960064>\n\n` +
                          `Un ***entraînement*** se tiendra aux informations suivantes :\n\n` +
                          `🗓️ Date : **${date}**\n` +
                          `📍 Lieu : **${lieu}**\n\n` +
                          `__Contenu de l'entraînement :__\n\n` +
                          `- ${contenu}\n\n` +
                          `__Merci d’indiquer votre présence en réagissant :__\n` +
                          `- ✅ Présent\n` +
                          `- ❌ Absent\n\n` +
                          `Je compte sur votre réactivité afin d’avoir un maximum de réponses.\n\n` +
                          `Bien à vous,\n` +
                          `Cordialement.\n` +
                          `<@${interaction.user.id}> - <@&1548655367041581128>`;
        }

        // Envoi de l'annonce dans le salon
        const sentMessage = await interaction.channel.send({ content: messageText });

        // Ajout des réactions automatiques
        await sentMessage.react('✅');
        await sentMessage.react('❌');

        return interaction.reply({ content: `✅ Annonce de formation **${subcommand}** publiée avec succès !`, flags: 64 });
    }
};