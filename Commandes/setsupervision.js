const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getData, saveData } = require('../Utils/organigramme.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setsupervision')
        .setDescription('Gère les membres assignés aux supervisions')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt =>
            opt.setName('action')
               .setDescription('Action à effectuer')
               .setRequired(true)
               .addChoices(
                   { name: 'Ajouter', value: 'add' },
                   { name: 'Retirer', value: 'remove' }
               )
        )
        .addUserOption(opt =>
            opt.setName('membre')
               .setDescription('Le membre concerné')
               .setRequired(true)
        )
        .addRoleOption(opt =>
            opt.setName('role')
               .setDescription('Le rôle de supervision (Optionnel si vous retirez le membre de partout)')
               .setRequired(false)
        ),

    async execute(interaction) {
        const action = interaction.options.getString('action');
        const user = interaction.options.getUser('membre');
        const role = interaction.options.getRole('role');
        const data = getData();

        if (!data.supervisions) data.supervisions = {};

        if (action === 'add') {
            if (!role) {
                return interaction.reply({ 
                    content: '❌ Vous devez spécifier un rôle pour ajouter une supervision.', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            // Vérification si le rôle appartient aux responsabilités par erreur
            if (data.responsabilites && data.responsabilites[role.id]) {
                return interaction.reply({ 
                    content: `❌ Le rôle <@&${role.id}> est enregistré en tant que **Responsabilité** et non Supervision.`, 
                    flags: MessageFlags.Ephemeral 
                });
            }

            if (!data.supervisions[role.id]) {
                return interaction.reply({ 
                    content: `❌ Le rôle <@&${role.id}> (\`${role.id}\`) ne fait pas partie des supervisions enregistrées.`, 
                    flags: MessageFlags.Ephemeral 
                });
            }

            if (data.supervisions[role.id].includes(user.id)) {
                return interaction.reply({ 
                    content: '❌ Ce membre est déjà assigné à cette supervision.', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            data.supervisions[role.id].push(user.id);
            saveData(data);

            return interaction.reply({ 
                content: `✅ <@${user.id}> a été ajouté à la supervision <@&${role.id}>. N'oubliez pas de rafraîchir le panel !`, 
                flags: MessageFlags.Ephemeral 
            });

        } else if (action === 'remove') {
            let countRemoved = 0;

            if (role) {
                if (!data.supervisions[role.id]) {
                    return interaction.reply({ 
                        content: `❌ Le rôle <@&${role.id}> ne fait pas partie de la liste des supervisions.`, 
                        flags: MessageFlags.Ephemeral 
                    });
                }
                const index = data.supervisions[role.id].indexOf(user.id);
                if (index === -1) {
                    return interaction.reply({ 
                        content: '❌ Ce membre n\'est pas présent dans cette supervision.', 
                        flags: MessageFlags.Ephemeral 
                    });
                }
                data.supervisions[role.id].splice(index, 1);
                countRemoved++;
            } else {
                for (const rId in data.supervisions) {
                    const index = data.supervisions[rId].indexOf(user.id);
                    if (index !== -1) {
                        data.supervisions[rId].splice(index, 1);
                        countRemoved++;
                    }
                }
                if (countRemoved === 0) {
                    return interaction.reply({ 
                        content: '❌ Ce membre n\'est assigné à aucune supervision.', 
                        flags: MessageFlags.Ephemeral 
                    });
                }
            }

            saveData(data);
            return interaction.reply({ 
                content: `✅ <@${user.id}> a été retiré de ${countRemoved} supervision(s). N'oubliez pas de rafraîchir le panel !`, 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};