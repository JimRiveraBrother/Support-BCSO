const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getData, saveData } = require('../Utils/organigramme.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setresponsabilite')
        .setDescription('Gère les membres assignés aux responsabilités')
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
               .setDescription('Le rôle de responsabilité (Optionnel si vous retirez le membre de partout)')
               .setRequired(false)
        ),

    async execute(interaction) {
        const action = interaction.options.getString('action');
        const user = interaction.options.getUser('membre');
        const role = interaction.options.getRole('role');
        const data = getData();

        if (!data.responsabilites) data.responsabilites = {};

        if (action === 'add') {
            if (!role) {
                return interaction.reply({ 
                    content: '❌ Vous devez spécifier un rôle pour ajouter une responsabilité.', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            // Vérification si le rôle appartient à la catégorie Supervision
            if (data.supervisions && data.supervisions[role.id]) {
                return interaction.reply({ 
                    content: `❌ Le rôle <@&${role.id}> est enregistré en tant que **Supervision** et non Responsabilité.`, 
                    flags: MessageFlags.Ephemeral 
                });
            }

            if (!data.responsabilites[role.id]) {
                return interaction.reply({ 
                    content: `❌ Le rôle <@&${role.id}> (\`${role.id}\`) ne fait pas partie des responsabilités enregistrées.`, 
                    flags: MessageFlags.Ephemeral 
                });
            }

            if (data.responsabilites[role.id].includes(user.id)) {
                return interaction.reply({ 
                    content: '❌ Ce membre est déjà assigné à cette responsabilité.', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            data.responsabilites[role.id].push(user.id);
            saveData(data);

            return interaction.reply({ 
                content: `✅ <@${user.id}> a été ajouté à la responsabilité <@&${role.id}>. N'oubliez pas de rafraîchir le panel !`, 
                flags: MessageFlags.Ephemeral 
            });

        } else if (action === 'remove') {
            let countRemoved = 0;

            if (role) {
                if (!data.responsabilites[role.id]) {
                    return interaction.reply({ 
                        content: `❌ Le rôle <@&${role.id}> ne fait pas partie de la liste des responsabilités.`, 
                        flags: MessageFlags.Ephemeral 
                    });
                }
                const index = data.responsabilites[role.id].indexOf(user.id);
                if (index === -1) {
                    return interaction.reply({ 
                        content: '❌ Ce membre n\'est pas présent dans cette responsabilité.', 
                        flags: MessageFlags.Ephemeral 
                    });
                }
                data.responsabilites[role.id].splice(index, 1);
                countRemoved++;
            } else {
                for (const rId in data.responsabilites) {
                    const index = data.responsabilites[rId].indexOf(user.id);
                    if (index !== -1) {
                        data.responsabilites[rId].splice(index, 1);
                        countRemoved++;
                    }
                }
                if (countRemoved === 0) {
                    return interaction.reply({ 
                        content: '❌ Ce membre n\'est assigné à aucune responsabilité.', 
                        flags: MessageFlags.Ephemeral 
                    });
                }
            }

            saveData(data);
            return interaction.reply({ 
                content: `✅ <@${user.id}> a été retiré de ${countRemoved} responsabilité(s). N'oubliez pas de rafraîchir le panel !`, 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};