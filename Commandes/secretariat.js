const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('secretariat')
        .setDescription('Génère et publie des documents officiels du Secrétariat BCSO')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        // 1. Dérogation
        .addSubcommand(sub =>
            sub.setName('derogation')
               .setDescription('Publier une dérogation')
               .addUserOption(opt => opt.setName('agent1').setDescription('Premier agent concerné').setRequired(true))
               .addStringOption(opt => opt.setName('contenu').setDescription('Contenu de la dérogation').setRequired(true))
               .addStringOption(opt => opt.setName('raison').setDescription('Raison de la dérogation').setRequired(true))
               .addStringOption(opt => opt.setName('duree').setDescription('Durée de la dérogation').setRequired(true))
               .addUserOption(opt => opt.setName('agent2').setDescription('Second agent concerné').setRequired(false))
        )

        // 2. Convocation
        .addSubcommand(sub =>
            sub.setName('convocation')
               .setDescription('Publier une convocation')
               .addUserOption(opt => opt.setName('convoque1').setDescription('Agent convoqué').setRequired(true))
               .addStringOption(opt => opt.setName('lieu').setDescription('Lieu du rendez-vous').setRequired(true))
               .addStringOption(opt => opt.setName('raison').setDescription('Raison de la convocation').setRequired(true))
               .addStringOption(opt => opt.setName('date').setDescription('Date et heure (ex: 15/09/2026 à 18h00)').setRequired(true))
               .addRoleOption(opt => opt.setName('par_resp_sup').setDescription('Convoqué par (Rôle RESP/SUP)').setRequired(false))
               .addUserOption(opt => opt.setName('par_em_cdd').setDescription('Convoqué par (Membre EM/CDD)').setRequired(false))
               .addUserOption(opt => opt.setName('convoque2').setDescription('Deuxième agent convoqué').setRequired(false))
        )

        // 3. Sanction
        .addSubcommand(sub =>
            sub.setName('sanction')
               .setDescription('Publier une notification de sanction')
               .addUserOption(opt => opt.setName('agent').setDescription('Agent sanctionné').setRequired(true))
               .addStringOption(opt => opt.setName('raison').setDescription('Raison de la sanction').setRequired(true))
               .addStringOption(opt => opt.setName('sanction').setDescription('Détail de la sanction').setRequired(true))
               .addRoleOption(opt => opt.setName('par_resp_sup').setDescription('À la demande de (Rôle RESP/SUP)').setRequired(false))
               .addUserOption(opt => opt.setName('par_em_cdd').setDescription('À la demande de (Membre EM/CDD)').setRequired(false))
        )

        // 4. Promotion
        .addSubcommand(sub =>
            sub.setName('promotion')
               .setDescription('Publier une promotion')
               .addUserOption(opt => opt.setName('agent').setDescription('Agent promu').setRequired(true))
               .addRoleOption(opt => opt.setName('grade').setDescription('Nouveau grade').setRequired(true))
               .addStringOption(opt => opt.setName('raison').setDescription('Raison de la promotion').setRequired(true))
        )

        // 5. Licenciement
        .addSubcommand(sub =>
            sub.setName('licenciement')
               .setDescription('Publier une lettre de licenciement')
               .addStringOption(opt => opt.setName('matricule').setDescription('Matricule de l\'agent').setRequired(true))
               .addStringOption(opt => opt.setName('prenom').setDescription('Prénom de l\'agent').setRequired(true))
               .addStringOption(opt => opt.setName('nom').setDescription('Nom de l\'agent').setRequired(true))
               .addRoleOption(opt => opt.setName('grade').setDescription('Grade de l\'agent').setRequired(true))
               .addStringOption(opt => opt.setName('motif').setDescription('Motif du licenciement').setRequired(true))
               .addStringOption(opt => opt.setName('date_effet').setDescription('Date d\'effet (ex: DD/MM/YYYY)').setRequired(true))
               .addRoleOption(opt => opt.setName('par_resp_sup').setDescription('Demande de (Rôle RESP/SUP)').setRequired(false))
               .addUserOption(opt => opt.setName('par_em_cdd').setDescription('Demande de (Membre EM/CDD)').setRequired(false))
        )

        // 6. Démission
        .addSubcommand(sub =>
            sub.setName('demission')
               .setDescription('Publier une lettre de démission')
               .addStringOption(opt => opt.setName('matricule').setDescription('Matricule de l\'agent').setRequired(true))
               .addStringOption(opt => opt.setName('prenom').setDescription('Prénom de l\'agent').setRequired(true))
               .addStringOption(opt => opt.setName('nom').setDescription('Nom de l\'agent').setRequired(true))
               .addRoleOption(opt => opt.setName('grade').setDescription('Grade de l\'agent').setRequired(true))
               .addStringOption(opt => opt.setName('motif').setDescription('Motif de la démission').setRequired(true))
               .addStringOption(opt => opt.setName('date_effet').setDescription('Date et heure d\'effet (ex: DD/MM/YYYY à 18h00)').setRequired(true))
               .addUserOption(opt => opt.setName('par_em_cdd').setDescription('Discussion tenue avec (Membre EM/CDD)').setRequired(false))
        )

        // 7. Blacklist
        .addSubcommand(sub =>
            sub.setName('blacklist')
               .setDescription('Publier un avis de Blacklist')
               .addStringOption(opt => opt.setName('nom').setDescription('Nom de la personne').setRequired(true))
               .addStringOption(opt => opt.setName('prenom').setDescription('Prénom de la personne').setRequired(true))
               .addStringOption(opt => opt.setName('dob').setDescription('Date de naissance (DD/MM/YYYY)').setRequired(true))
               .addStringOption(opt => opt.setName('sexe').setDescription('Sexe').setRequired(true).addChoices({ name: 'Homme', value: 'Homme' }, { name: 'Femme', value: 'Femme' }))
               .addStringOption(opt => opt.setName('taille').setDescription('Taille en cm (ex: 180cm)').setRequired(true))
               .addUserOption(opt => opt.setName('demande_par').setDescription('Demandé par').setRequired(true))
               .addUserOption(opt => opt.setName('effectue_par').setDescription('Effectué par').setRequired(true))
               .addStringOption(opt => opt.setName('raison').setDescription('Raison du blacklist').setRequired(true))
               .addStringOption(opt => opt.setName('duree').setDescription('Durée du blacklist').setRequired(true))
        ),

    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            let messageText = "";

            // Helper pour construire la liste des demandeurs/convoqueurs
            const getDemandeursText = () => {
                const parRespSup = interaction.options.getRole('par_resp_sup');
                const parEmCdd = interaction.options.getUser('par_em_cdd');
                let text = "";
                if (parRespSup) text += `- <@&${parRespSup.id}>\n`;
                if (parEmCdd) text += `- <@${parEmCdd.id}>\n`;
                return text || "- Non spécifié\n";
            };

            if (subcommand === 'derogation') {
                const agent1 = interaction.options.getUser('agent1');
                const agent2 = interaction.options.getUser('agent2');
                const contenu = interaction.options.getString('contenu');
                const raison = interaction.options.getString('raison');
                const duree = interaction.options.getString('duree');

                messageText = `__Agents concernés :__\n\n` +
                              `- <@${agent1.id}>\n` +
                              `${agent2 ? `- <@${agent2.id}>\n` : ''}\n` +
                              `__Contenu de la dérogation :__\n\n` +
                              `- ${contenu}\n\n` +
                              `__Raison :__\n\n` +
                              `- ${raison}\n\n` +
                              `Durée : **${duree}**`;
            } else if (subcommand === 'convocation') {
                const convoque1 = interaction.options.getUser('convoque1');
                const convoque2 = interaction.options.getUser('convoque2');
                const lieu = interaction.options.getString('lieu');
                const raison = interaction.options.getString('raison');
                const date = interaction.options.getString('date');

                messageText = `__Agent(s) convoqué(s) :__\n\n` +
                              `- <@${convoque1.id}>\n` +
                              `${convoque2 ? `- <@${convoque2.id}>\n` : ''}\n` +
                              `__Convoqué par :__\n\n` +
                              `${getDemandeursText()}\n` +
                              `__Lieu :__\n\n` +
                              `- ${lieu}\n\n` +
                              `__Raison :__\n\n` +
                              `- ${raison}\n\n` +
                              `__Date :__\n\n` +
                              `- ${date}\n\n` +
                              `*Si vous n'êtes pas disponible à cette date, merci de transmettre vos disponibilités aux agents concernés. Tout envoi de message privé au commandement ou à la direction fera l'objet d'une sanction, vous êtes prié d'utiliser les moyens de communication adaptés.*`;
            } else if (subcommand === 'sanction') {
                const agent = interaction.options.getUser('agent');
                const raison = interaction.options.getString('raison');
                const sanction = interaction.options.getString('sanction');

                messageText = `## Mes respects <@${agent.id}> ,\n\n` +
                              `__Je dois malheureusement vous annoncer qu'une sanction a été émise à votre encontre à la suite d'une demande émanant de :__\n\n` +
                              `${getDemandeursText()}\n` +
                              `__Raison :__\n\n` +
                              `- ${raison}\n\n` +
                              `__Sanction :__\n\n` +
                              `- ${sanction}\n\n` +
                              `Cordialement, <@${interaction.user.id}>`;
            } else if (subcommand === 'promotion') {
                const agent = interaction.options.getUser('agent');
                const grade = interaction.options.getRole('grade');
                const raison = interaction.options.getString('raison');

                messageText = `## Mes respects <@${agent.id}> ,\n\n` +
                              `__Félicitations à vous, suite à une validation de la direction, j'ai l'honneur de vous annoncer que vous avez reçu une promotion !__\n\n` +
                              `__Promu :__\n\n` +
                              `- <@${agent.id}> [<@&${grade.id}>]\n\n` +
                              `__Raison :__\n\n` +
                              `- ${raison}\n\n` +
                              `Cordialement, <@${interaction.user.id}>`;
            } else if (subcommand === 'licenciement') {
                const matricule = interaction.options.getString('matricule');
                const prenom = interaction.options.getString('prenom');
                const nom = interaction.options.getString('nom');
                const grade = interaction.options.getRole('grade');
                const motif = interaction.options.getString('motif');
                const dateEffet = interaction.options.getString('date_effet');

                messageText = `# Lettre de licenciement\n\n` +
                              `Matricule : ${matricule}\n` +
                              `Prénom : ${prenom}\n` +
                              `Nom : ${nom}\n` +
                              `Grade : <@&${grade.id}>\n\n` +
                              `Nous vous informons qu'un licenciement a été prononcé à votre encontre à la suite d'une demande émanant de :\n\n` +
                              `${getDemandeursText()}\n` +
                              `Cette décision résulte d'une enquête approfondie et s'inscrit dans le respect des procédures disciplinaires en vigueur au sein de notre institution.\n\n` +
                              `__Motif :__\n\n` +
                              `- ${motif}\n\n` +
                              `Le licenciement prendra effet à partir du : ${dateEffet}\n\n` +
                              `Suite à cette décision, nous attendons de vous la restitution de l'ensemble de votre équipement de service. À défaut, des poursuites judiciaires pourront être engagées à votre encontre.`;
            } else if (subcommand === 'demission') {
                const matricule = interaction.options.getString('matricule');
                const prenom = interaction.options.getString('prenom');
                const nom = interaction.options.getString('nom');
                const grade = interaction.options.getRole('grade');
                const parEmCdd = interaction.options.getUser('par_em_cdd');
                const motif = interaction.options.getString('motif');
                const dateEffet = interaction.options.getString('date_effet');

                messageText = `# Lettre de démission\n\n` +
                              `Matricule : ${matricule}\n` +
                              `Prénom : ${prenom}\n` +
                              `Nom : ${nom}\n` +
                              `Grade : <@&${grade.id}>\n\n` +
                              `Nous devons vous informer qu'une démission a été décidée par vous-même à la suite de nombreuses réflexions${parEmCdd ? ` et d'une discussion avec :\n\n- <@${parEmCdd.id}>` : '.'}\n\n` +
                              `Cette décision, bien que difficile, marque votre volonté d'aller de l'avant et d'ouvrir un nouveau chapitre dans votre parcours.\n` +
                              `Après une réflexion approfondie, vous avez choisi de relever de nouveaux défis et de poursuivre votre évolution, tant sur le plan professionnel que personnel.\n\n` +
                              `Votre passage au sein du BCSO témoigne de votre engagement, de votre discipline et du sens du devoir qui vous ont accompagné tout au long de votre service. Aujourd'hui, vous faites le choix d'avancer, en restant fidèle à ces valeurs, vers des opportunités qui sauront correspondre à vos ambitions.\n\n` +
                              `__Motif :__\n\n` +
                              `- ${motif}\n\n` +
                              `La démission prendra effet le : ${dateEffet}`;
            } else if (subcommand === 'blacklist') {
                const nom = interaction.options.getString('nom');
                const prenom = interaction.options.getString('prenom');
                const dob = interaction.options.getString('dob');
                const sexe = interaction.options.getString('sexe');
                const taille = interaction.options.getString('taille');
                const demandePar = interaction.options.getUser('demande_par');
                const effectuePar = interaction.options.getUser('effectue_par');
                const raison = interaction.options.getString('raison');
                const duree = interaction.options.getString('duree');

                messageText = `__Information sur la personne :__\n\n` +
                              `Nom : **${nom}**\n` +
                              `Prénom : **${prenom}**\n` +
                              `Date de naissance : **${dob}**\n` +
                              `Sexe : **${sexe}**\n` +
                              `Taille : **${taille}**\n\n` +
                              `__Information sur le Blacklist :__\n\n` +
                              `Demandé par : <@${demandePar.id}>\n` +
                              `Effectué par : <@${effectuePar.id}>\n\n` +
                              `__Raison du blacklist :__\n\n` +
                              `- ${raison}\n\n` +
                              `Durée : **${duree}**`;
            }

            await interaction.channel.send({ content: messageText });
            return interaction.reply({ 
                content: `✅ Document **${subcommand}** publié avec succès.`, 
                flags: MessageFlags.Ephemeral 
            });

        } catch (error) {
            console.error('Secretariat Command Error:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ 
                    content: '❌ Une erreur est survenue lors de la publication du document.', 
                    flags: MessageFlags.Ephemeral 
                }).catch(() => null);
            } else {
                await interaction.reply({ 
                    content: '❌ Une erreur est survenue lors de la publication du document.', 
                    flags: MessageFlags.Ephemeral 
                }).catch(() => null);
            }
        }
    }
};