const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('documents')
        .setDescription('Affiche un document officiel du BCSO')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choisissez le document à envoyer')
                .setRequired(true)
                .addChoices(
                    { name: 'Hiérarchie', value: 'hierarchie' },
                    { name: 'Règlement Officiel', value: 'reglement' },
                    { name: 'Codes Radio (Codes & 10-Codes)', value: 'codes' },
                    { name: 'Droits Miranda', value: 'miranda' },
                    { name: 'Fréquences radio', value: 'frequence' },
                    { name: 'Documents CE', value: 'ce' },
                    { name: 'Documents EM', value: 'em' },
                    { name: 'Documents CDD', value: 'cdd' }
                )
        ),

    async execute(interaction) {
        const type = interaction.options.getString('type');
        const iconURL = interaction.guild?.iconURL() || undefined;

        // 1. Document Hiérarchie
        if (type === 'hierarchie') {
            const embedHierarchie = new EmbedBuilder()
                .setTitle('📋 HIÉRARCHIE - BCSO')
                .setColor(0x2B5329)
                .setDescription(
                    `> --- <@&1549132952108277810> ---\n` +
                    `> - <@&1549132954180259860>\n` +
                    `> - <@&1549132956096921630>\n` +
                    `> - <@&1549132956617023518>\n` +
                    `> - <@&1549132957149696010>\n\n` +
                    `> --- <@&1549132958009524224> ---\n` +
                    `> - <@&1549132958760444015>\n` +
                    `> - <@&1549132959481724938>\n` +
                    `> - <@&1549132960286904320>\n` +
                    `> - <@&1549132961113440336>\n\n` +
                    `> --- <@&1549132961637597285> ---\n` +
                    `> - <@&1549132963466182656>\n` +
                    `> - <@&1549132964791848993>\n` +
                    `> - <@&1549132966201008161>\n` +
                    `> - <@&1549132969707573268>\n` +
                    `> - <@&1549132970202370112>\n\n` +
                    `> --- <@&1549132971427106876> ---\n` +
                    `> - <@&1549132972047859815>\n` +
                    `> - <@&1549132972865749082>\n` +
                    `> - <@&1549132973578911825>\n` +
                    `> - <@&1549132974543470792>\n` +
                    `> - <@&1549132975181144271>`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            await interaction.channel.send({ embeds: [embedHierarchie] });
            return interaction.reply({ content: '✅ Le document de la **hiérarchie** a été envoyé avec succès.', flags: 64 });
        }

        // 2. Document Règlement
        if (type === 'reglement') {
            const embedReglement = new EmbedBuilder()
                .setTitle('📜 Règlement BCSO')
                .setColor(0x2B5329)
                .setDescription(
                    `Voici le règlement **officiel** de notre département. Il est à maîtriser et appliquer dans toutes circonstances. Un __État-Major__ ou un membre de la __Direction__ se chargera de vous **__sanctionner__** s'il constate que vous ne **__connaissez ou ne respectez pas__** ce règlement.\n\nhttps://docs.google.com/document/d/1DoiEfD7sjD-I-n7hZKLEUeMRFHMvi3U1v0rkR1nUSg8/edit?usp=sharing`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            await interaction.channel.send({ embeds: [embedReglement] });
            return interaction.reply({ content: '✅ Le panneau du **règlement** a été envoyé avec succès.', flags: 64 });
        }

        // 3. Document Codes Radio
        if (type === 'codes') {
            const embedCodes = new EmbedBuilder()
                .setTitle('📻 Codes Radio & 10-Codes - BCSO')
                .setColor(0x2B5329)
                .addFields(
                    {
                        name: '🟢 Codes Numériques',
                        value: 
                            `**Code 0** : Individu endormi (serveur quitté)\n` +
                            `**Code 1** : Retour sur zone\n` +
                            `**Code 2** : Situation sous contrôle\n` +
                            `**Code 3** : Intervention à haut risque (gyrophares + sirènes)\n` +
                            `**Code 4** : En attente d'US Marshall (Staff)\n` +
                            `**Code 5** : En interaction avec US Marshall (Staff)\n` +
                            `**Code 6** : Investigation / électron libre`,
                        inline: false
                    },
                    {
                        name: '🔵 10-Codes (Partie 1)',
                        value: 
                            `**10-0** : Suspect perdu\n` +
                            `**10-1** : Prise de patrouille\n` +
                            `**10-2** : Fin de patrouille\n` +
                            `**10-3** : Off radio\n` +
                            `**10-4** : Affirmatif\n` +
                            `**10-5** : Négatif\n` +
                            `**10-6** : Pause de service\n` +
                            `**10-7** : Fin de service\n` +
                            `**10-8** : Prise de service\n` +
                            `**10-9** : Répétez (demande de réitération)\n` +
                            `**10-11** : Contrôle routier\n` +
                            `**10-13** : Coup de feu\n` +
                            `**10-14** : Convoi\n` +
                            `**10-16** : Vol de véhicule\n` +
                            `**10-18** : Retour au poste avec suspect appréhendé / transport d'un individu\n` +
                            `**10-19** : Retour au poste / Demande de rassemblement\n` +
                            `**10-20** : Demande de position\n` +
                            `**10-23** : Arrivé sur zone\n` +
                            `**10-24** : Backup / Centre d'appel (demande de renfort)\n` +
                            `**10-26** : Distance d'arrivée`,
                        inline: false
                    },
                    {
                        name: '🔵 10-Codes (Partie 2)',
                        value: 
                            `**10-31** : Course poursuite\n` +
                            `**10-43** : Demande d'information\n` +
                            `**10-44** : Fusillade\n` +
                            `**10-50** : Accident\n` +
                            `**10-51** : Accident sans douleur\n` +
                            `**10-52** : Demande d'EMS\n` +
                            `**10-60** : Individu armé et dangereux\n` +
                            `**10-70** : Course poursuite à pied\n` +
                            `**10-71** : Demande d'État-Major\n` +
                            `**10-72** : Demande de CDD (membre de la direction)\n` +
                            `**10-86** : En attente de patrouille\n` +
                            `**10-89** : Demande de renfort Henry\n` +
                            `**10-90** : Demande de tireur Henry\n` +
                            `**10-92** : Demande de descente en rappel du tireur Henry\n` +
                            `**10-93** : Demande de scan Henry\n` +
                            `**10-94** : Demande d'éloignement Henry\n` +
                            `**10-96** : Barrage\n` +
                            `**10-98** : Agent en détresse\n` +
                            `**10-99** : Agent à terre`,
                        inline: false
                    }
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            await interaction.channel.send({ embeds: [embedCodes] });
            return interaction.reply({ content: '✅ Le document des **codes radio** a été envoyé avec succès.', flags: 64 });
        }

        // 4. Document Droits Miranda
        if (type === 'miranda') {
            const embedMiranda = new EmbedBuilder()
                .setTitle('⚖️ Droits Miranda - BCSO')
                .setColor(0x2B5329)
                .setDescription(
                    `“Madame, Monsieur,\n` +
                    `Nous sommes le **00/00/0000**, il est actuellement **00H00**. Vous êtes en état d'arrestation pour **(............)**.\n\n` +
                    `• Vous avez le droit de **garder le silence** : si vous renoncez à ce droit, tout ce que vous direz pourra et sera utilisé contre vous devant une cour de justice.\n` +
                    `• Vous avez le droit à un **avocat** et qu'il soit présent lors de l'interrogatoire. Si vous n'avez pas les moyens un avocat sera commis d'office.\n` +
                    `• Si aucun avocat ne peut être présent lors de votre demande, vous devrez vous défendre seul.\n\n` +
                    `En cellule, vous aurez le droit à **boire et à manger** ainsi qu'à des **soins médicaux**.\n` +
                    `Avez-vous bien compris vos droits ?”`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            await interaction.channel.send({ embeds: [embedMiranda] });
            return interaction.reply({ content: '✅ Le document des **droits Miranda** a été envoyé avec succès.', flags: 64 });
        }

        // 5. Document Fréquences Radio
        if (type === 'frequence') {
            const embedFrequence = new EmbedBuilder()
                .setTitle('📡 Fréquences Radio - BCSO')
                .setColor(0x2B5329)
                .setDescription(
                    `Les fréquences radio officielles du BCSO sont les suivantes :\n\n` +
                    `🔹 **18.78** : Patrouille classique\n` +
                    `🔹 **18.79** : Opération\n` +
                    `🔹 **18.80** : Rédaction de rapport et jugement\n` +
                    `🔹 **18.81** : Fréquence radio sans restriction de calls, radio libre (uniquement en cas de nécessité)\n` +
                    `🔹 **18.82** : Formation / Recrutement`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            await interaction.channel.send({ embeds: [embedFrequence] });
            return interaction.reply({ content: '✅ Le document des **fréquences radio** a été envoyé avec succès.', flags: 64 });
        }

        // 6. Documents CE
        if (type === 'ce') {
            const embedCe = new EmbedBuilder()
                .setTitle('📚 Liste des documents - CE BCSO')
                .setColor(0x2B5329)
                .setDescription(
                    `Documents CE :\n\n` +
                    `🔹 [Notations CE](https://docs.google.com/spreadsheets/d/1Xv4T3kMWdE_7qrReXeTNLqzfcmwaRnQosmdmYbXqKtY/edit?gid=0#gid=0)\n` +
                    `🔹 [Field Qualification Progress (FQP)](https://docs.google.com/spreadsheets/d/1-fMb4gP4P8t1bZ9ki8Q6whRYV-oP5HPhBDZc4VFpSjk/edit?gid=1135549642#gid=1135549642)\n` +
                    `🔹 [Recrutements BCSO](https://docs.google.com/spreadsheets/d/1oiYZVWW-B9VE6Huj3gYVNvlliEGzyjuQkEeKqzZtfSg/edit?gid=1659968181#gid=1659968181)\n` +
                    `🔹 [Détectives](https://docs.google.com/spreadsheets/d/1L3o5NChr8wQMaXTLsaSfBd8PgKb9ZDHgwmkncgyj4Pg/edit?pli=1&gid=900444438#gid=900444438)`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            await interaction.channel.send({ embeds: [embedCe] });
            return interaction.reply({ content: '✅ La **liste des documents** pour les **CE** a été envoyée avec succès.', flags: 64 });
        }

        // 7. Documents EM
        if (type === 'em') {
            const embedEm = new EmbedBuilder()
                .setTitle('📚 Liste des documents - EM BCSO')
                .setColor(0x2B5329)
                .setDescription(
                    `Documents EM :\n\n` +
                    `🔹 [Planning](https://docs.google.com/spreadsheets/d/1hJyYjtrx5YtJ2NlYaVudgrR_v2pY1z5nMospfE8vqpU/edit?gid=609157922#gid=609157922)\n` +
                    `🔹 [Registre Agents (Réponses)](https://docs.google.com/forms/d/1WCO-WyO2bBPPxE5mWW2m0OutFnAkTK6ncqBG4fPvlZw/edit#responses)\n` +
                    `🔹 [Effectif](https://docs.google.com/spreadsheets/d/1F-MR9FX_5uGFDGC2R0iVZrND7LA4nV_0Toxk-K87DmY/edit?gid=256733530#gid=256733530)\n`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            await interaction.channel.send({ embeds: [embedEm] });
            return interaction.reply({ content: '✅ La **liste des documents** pour les **EM** a été envoyée avec succès.', flags: 64 });
        }

        // 8. Documents CDD
        if (type === 'cdd') {
            const embedCdd = new EmbedBuilder()
                .setTitle('📚 Liste des documents - CDD BCSO')
                .setColor(0x2B5329)
                .setDescription(
                    `Documents CDD :\n\n` +
                    `🔹 [Planning](https://docs.google.com/spreadsheets/d/1hJyYjtrx5YtJ2NlYaVudgrR_v2pY1z5nMospfE8vqpU/edit?gid=609157922#gid=609157922)\n` +
                    `🔹 [Registre Agents (Réponses)](https://docs.google.com/forms/d/1WCO-WyO2bBPPxE5mWW2m0OutFnAkTK6ncqBG4fPvlZw/edit#responses)\n` +
                    `🔹 [Effectif](https://docs.google.com/spreadsheets/d/1F-MR9FX_5uGFDGC2R0iVZrND7LA4nV_0Toxk-K87DmY/edit?gid=256733530#gid=256733530)\n` +
                    `🔹 [Notations CE](https://docs.google.com/spreadsheets/d/1Xv4T3kMWdE_7qrReXeTNLqzfcmwaRnQosmdmYbXqKtY/edit?gid=0#gid=0)\n` +
                    `🔹 [Field Qualification Progress (FQP)](https://docs.google.com/spreadsheets/d/1-fMb4gP4P8t1bZ9ki8Q6whRYV-oP5HPhBDZc4VFpSjk/edit?gid=1135549642#gid=1135549642)\n` +
                    `🔹 [Recrutements BCSO](https://docs.google.com/spreadsheets/d/1oiYZVWW-B9VE6Huj3gYVNvlliEGzyjuQkEeKqzZtfSg/edit?gid=1659968181#gid=1659968181)\n` +
                    `🔹 [Détectives](https://docs.google.com/spreadsheets/d/1L3o5NChr8wQMaXTLsaSfBd8PgKb9ZDHgwmkncgyj4Pg/edit?pli=1&gid=900444438#gid=900444438)\n` +
                    `🔹 [Responsable Terrain](https://docs.google.com/spreadsheets/d/1jhH8zYX2BjRxT7Ba5uGCg2JrnmvfOey8Rz-oiNP3Res/edit?gid=904313006#gid=904313006)\n` +
                    `🔹 [Formateur STX](https://docs.google.com/spreadsheets/d/1WatO4XzM6Aky8Oc2RmYXWBe33OIbI-tQ4McynawCbM4/edit?gid=1935935650#gid=1935935650)\n` +
                    `🔹 [Formateur Mary](https://docs.google.com/spreadsheets/d/1JN8ky-4z2lydeKnEI37wnenAOYdUd_N6qFokS6fJZFQ/edit?copiedFromTrash=&gid=1935935650#gid=1935935650)\n` +
                    `🔹 [Formateur Henry](https://docs.google.com/spreadsheets/d/17YjKaLnJMxjc7iKjyTC5h6-WIdWiXYHgyHqtrENw7do/edit?gid=1935935650#gid=1935935650)\n` +
                    `🔹 [Formateur FAC](https://docs.google.com/spreadsheets/d/1t-vhocR3FFAxi4NQVRXdFr2W-KyF07BOE_CnWRR1qRk/edit?gid=0#gid=0)`
                )
                .setFooter({ text: "Blaine County Sheriff's Office", iconURL })
                .setTimestamp();

            await interaction.channel.send({ embeds: [embedCdd] });
            return interaction.reply({ content: '✅ La **liste des documents** pour la **CDD** a été envoyée avec succès.', flags: 64 });
        }
    }
};