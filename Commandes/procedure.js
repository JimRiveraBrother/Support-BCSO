const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('procedure')
        .setDescription('Affiche une procédure officielle du BCSO')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choisissez la procédure à envoyer')
                .setRequired(true)
                .addChoices(
                    { name: 'Arrestation', value: 'arrestation' },
                    { name: 'Contrôle routier', value: 'controle' }
                )
        ),

    async execute(interaction, client) {
        const type = interaction.options.getString('type');
        const guildIcon = interaction.guild?.iconURL({ dynamic: true }) || null;

        // 1. Procédure d'Arrestation
        if (type === 'arrestation') {
            const embedArrestation = new EmbedBuilder()
                .setTitle('⛓️ Procédure d\'arrestation')
                .setColor(0x2B5329)
                .setDescription(
                    `🔹 **Identité Confirmée** : Démenotter le suspect, prendre connaissance de l'ensemble de ses papiers (carte d'identité, PPA, permis de conduire).\n\n` +
                    `🔹 **Droits du Suspect** : Réciter obligatoirement les droits Miranda jusqu'à trois lectures tant que l'individu n'a pas avoué explicitement avoir compris, ce après quoi ils sont considérés comme compris. Ensuite, lui demander quels droits il souhaite exercer.\n\n` +
                    `🔹 **Fouille & Saisies** : Effectuer une fouille obligatoire de l'individu appréhendé, avec le consentement si personne du sexe opposé, et procéder aux saisies (moyens de communications, armes, produits/objets illégaux).\n\n` +
                    `🔹 **Mise en GAV** : Une fois les saisies effectuées. L'individu doit être emmené jusqu'aux bureaux, là où il signera sa décharge de mise en garde à vue, puis l'individu devra déposer tous ses effets restant pouvant nuire à sa santé (armes cachées, lacets, colliers ...) et le retirer physiquement puis faire son muscle B pour tout déposer dans la caisse. Si jamais un individu utilise une arme cachée malgré ce point effectué, faites un code 4. Déposer ensuite l'individu en cellule sous bracelet électronique respectant ce modèle \`[NOM, PRÉNOM - DATE DE POSTE]\`.\n\n` +
                    `🔹 **Rédaction du rapport** : Une fois toutes les étapes précédentes validées, mettez-vous dans une salle de rédaction pour rédiger le rapport. N'oubliez pas de contacter le gouvernement, avocat si demandé et EMS si demandé.`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL: guildIcon })
                .setTimestamp();

            await interaction.channel.send({ embeds: [embedArrestation] });
            return interaction.reply({ 
                content: '✅ La procédure d\'**arrestation** a été envoyée avec succès.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        // 2. Procédure de Contrôle routier
        if (type === 'controle') {
            const embedControle = new EmbedBuilder()
                .setTitle('📜 Procédure de contrôle routier')
                .setColor(0x2B5329)
                .setDescription(
                    `🔹 **Interpellation** : Activer ses codes 3, puis demander au citoyen de se garer sur le bas-côté de la route de manière à ne pas gêner la circulation.\n\n` +
                    `🔹 **Placement** : Se positionner à l'avant du véhicule du citoyen afin de l'empêcher de prendre la fuite.\n\n` +
                    `🔹 **Vérifications** : Demander courtoisement le permis de conduire du citoyen interpellé. Puis vérifier si le véhicule lui appartient bien grâce à sa plaque d'immatriculation, puis regarder sa fiche de recensement sur le MDT.\n\n` +
                    `🔹 **Amendement & Rappels à l'ordre** : Suivant les données inscrites sur le MDT, procéder à un rappel à l'ordre ou à un amendement.`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL: guildIcon })
                .setTimestamp();

            await interaction.channel.send({ embeds: [embedControle] });
            return interaction.reply({ 
                content: '✅ La procédure de **contrôle routier** a été envoyée avec succès.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};