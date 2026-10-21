const { EmbedBuilder } = require('discord.js');
const db = require('croxydb');

// Helper pour récupérer le salon de logs de manière sécurisée (cache ou fetch)
async function getLogChannel(guild, category) {
    if (!guild) return null;
    const channelId = db.get(`logs_${guild.id}.${category}`) || db.get(`logs_${guild.id}`);
    if (!channelId) return null;

    try {
        return guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
    } catch {
        return null;
    }
}

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {

        // 1. Message supprimé
        client.on('messageDelete', async message => {
            if (!message.guild || message.author?.bot) return;
            const logChannel = await getLogChannel(message.guild, 'messages');
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('🗑️ Message supprimé')
                .setColor(0xFF0000)
                .addFields(
                    { name: 'Auteur', value: `${message.author?.tag || 'Inconnu'} (\`${message.author?.id || 'ID Inconnu'}\`)`, inline: true },
                    { name: 'Salon', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'Contenu', value: message.content ? `\`\`\`${message.content.slice(0, 1000)}\`\`\`` : '*Contenu non accessible ou média*' }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] }).catch(() => {});
        });

        // 2. Message édité
        client.on('messageUpdate', async (oldMessage, newMessage) => {
            if (!oldMessage.guild || oldMessage.author?.bot) return;
            if (oldMessage.content === newMessage.content) return;

            const logChannel = await getLogChannel(oldMessage.guild, 'messages');
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('✏️ Message édité')
                .setColor(0xFFA500)
                .addFields(
                    { name: 'Auteur', value: `${oldMessage.author?.tag || 'Inconnu'} (\`${oldMessage.author?.id || 'ID Inconnu'}\`)`, inline: true },
                    { name: 'Salon', value: `<#${oldMessage.channel.id}>`, inline: true },
                    { name: 'Ancien', value: oldMessage.content ? `\`\`\`${oldMessage.content.slice(0, 1000)}\`\`\`` : '*Inconnu*' },
                    { name: 'Nouveau', value: newMessage.content ? `\`\`\`${newMessage.content.slice(0, 1000)}\`\`\`` : '*Inconnu*' }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] }).catch(() => {});
        });

        // 3. Arrivée d'un membre
        client.on('guildMemberAdd', async member => {
            const logChannel = await getLogChannel(member.guild, 'members');
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('📥 Arrivée d\'un membre')
                .setColor(0x00FF00)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: 'Membre', value: `${member.user.tag} (<@${member.id}>)`, inline: true },
                    { name: 'Création du compte', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] }).catch(() => {});
        });

        // 4. Départ d'un membre
        client.on('guildMemberRemove', async member => {
            const logChannel = await getLogChannel(member.guild, 'members');
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('📤 Départ d\'un membre')
                .setColor(0x808080)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields({ name: 'Membre', value: `${member.user.tag} (\`${member.id}\`)` })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] }).catch(() => {});
        });

        // 5. Mouvements Vocaux
        client.on('voiceStateUpdate', async (oldState, newState) => {
            const logChannel = await getLogChannel(newState.guild, 'voice');
            if (!logChannel) return;

            const member = newState.member;
            if (!member) return;

            if (!oldState.channelId && newState.channelId) {
                const embed = new EmbedBuilder()
                    .setTitle('🔊 Connexion Vocal')
                    .setColor(0x00FF00)
                    .setDescription(`**${member.user.tag}** a rejoint <#${newState.channelId}>.`)
                    .setTimestamp();
                await logChannel.send({ embeds: [embed] }).catch(() => {});
            } else if (oldState.channelId && !newState.channelId) {
                const embed = new EmbedBuilder()
                    .setTitle('🔇 Déconnexion Vocal')
                    .setColor(0xFF0000)
                    .setDescription(`**${member.user.tag}** a quitté <#${oldState.channelId}>.`)
                    .setTimestamp();
                await logChannel.send({ embeds: [embed] }).catch(() => {});
            } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                const embed = new EmbedBuilder()
                    .setTitle('🔀 Déplacement Vocal')
                    .setColor(0xFFA500)
                    .setDescription(`**${member.user.tag}** est passé de <#${oldState.channelId}> à <#${newState.channelId}>.`)
                    .setTimestamp();
                await logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        });

        // 6. Création d'un rôle
        client.on('roleCreate', async role => {
            const logChannel = await getLogChannel(role.guild, 'roles');
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('🛠️ Rôle créé')
                .setColor(0x00FF00)
                .addFields(
                    { name: 'Nom', value: role.name, inline: true },
                    { name: 'ID', value: `\`${role.id}\``, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] }).catch(() => {});
        });

        // 7. Suppression d'un rôle
        client.on('roleDelete', async role => {
            const logChannel = await getLogChannel(role.guild, 'roles');
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('🗑️ Rôle supprimé')
                .setColor(0xFF0000)
                .addFields(
                    { name: 'Nom', value: role.name, inline: true },
                    { name: 'ID', value: `\`${role.id}\``, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] }).catch(() => {});
        });

        // 8. Modification d'un rôle
        client.on('roleUpdate', async (oldRole, newRole) => {
            const logChannel = await getLogChannel(newRole.guild, 'roles');
            if (!logChannel) return;

            const changes = [];
            if (oldRole.name !== newRole.name) {
                changes.push(`**Nom :** \`${oldRole.name}\` ➔ \`${newRole.name}\``);
            }
            if (oldRole.hexColor !== newRole.hexColor) {
                changes.push(`**Couleur :** \`${oldRole.hexColor}\` ➔ \`${newRole.hexColor}\``);
            }

            if (changes.length === 0) return;

            const embed = new EmbedBuilder()
                .setTitle('✏️ Rôle modifié')
                .setColor(0xFFA500)
                .setDescription(`Le rôle ${newRole} (\`${newRole.id}\`) a été mis à jour :\n` + changes.join('\n'))
                .setTimestamp();

            await logChannel.send({ embeds: [embed] }).catch(() => {});
        });

        // 9. Attribution ou Retrait de rôle sur un membre
        client.on('guildMemberUpdate', async (oldMember, newMember) => {
            const logChannel = await getLogChannel(newMember.guild, 'roles');
            if (!logChannel) return;

            // Rôles ajoutés
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            if (addedRoles.size > 0) {
                for (const [, role] of addedRoles) {
                    const embed = new EmbedBuilder()
                        .setTitle('➕ Rôle attribué')
                        .setColor(0x00FF00)
                        .setDescription(`Le rôle ${role} a été attribué à **${newMember.user.tag}** (<@${newMember.id}>).`)
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] }).catch(() => {});
                }
            }

            // Rôles retirés
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
            if (removedRoles.size > 0) {
                for (const [, role] of removedRoles) {
                    const embed = new EmbedBuilder()
                        .setTitle('➖ Rôle retiré')
                        .setColor(0xFF0000)
                        .setDescription(`Le rôle **${role.name}** a été retiré à **${newMember.user.tag}** (<@${newMember.id}>).`)
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] }).catch(() => {});
                }
            }
        });
    }
};