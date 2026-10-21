const { 
    EmbedBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags 
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getData, saveData, generateOrganigrammeText } = require('../Utils/organigramme.js');
const { getEffectifsData, saveEffectifsData, generateGeneralEffectifText } = require('../Utils/effectifs.js');
const { generateBrigadeEmbed } = require('../Utils/brigadesData.js');

const { handleSuggestion } = require('../Handlers/suggestionInteraction.js');
const { handleTicket } = require('../Handlers/ticketInteraction.js');
const { handleAccueil } = require('../Handlers/accueilInteraction.js');
const { handleAbsence } = require('../Handlers/absenceInteraction.js');
const { handleRemontee } = require('../Handlers/remonteeInteraction.js');

const SALONS_PATROUILLE = {
    Classique: '1549133309466906745',
    Henry: '1549133349199810680',
    Mary: '154913372108832899',
    STX: '1549133401200664587',
    Detective: '1549133450357772498'
};

const SALON_REMONTEES = '1549133309466906745';

const patrouillesFilePath = path.join(__dirname, '../data/patrouilles.json');

function getPatrouillesData() {
    if (!fs.existsSync(patrouillesFilePath)) {
        const initial = { counters: { Classique: 0, Henry: 0, Mary: 0, STX: 0, Detective: 0 }, active: {} };
        const dir = path.dirname(patrouillesFilePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(patrouillesFilePath, JSON.stringify(initial, null, 2));
        return initial;
    }
    try {
        return JSON.parse(fs.readFileSync(patrouillesFilePath));
    } catch {
        return { counters: { Classique: 0, Henry: 0, Mary: 0, STX: 0, Detective: 0 }, active: {} };
    }
}

function savePatrouillesData(data) {
    const dir = path.dirname(patrouillesFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(patrouillesFilePath, JSON.stringify(data, null, 2));
}

// Fonction pour construire l'embed de patrouille
function buildPatrouilleEmbed(patrouille, isTerminee = false) {
    const startCutoff = patrouille.startTime + 120;
    const endCutoff = (patrouille.endTime || Math.floor(Date.now() / 1000)) - 120;

    const agentsDuDebutALaFin = [];
    const agentsDePassage = [];

    const historyEntries = Object.entries(patrouille.history || {});

    historyEntries.forEach(([userId, data]) => {
        const aEteLaAuDebut = data.joinTime <= startCutoff;
        const aEteLaALaFin = data.leftTime === null || data.leftTime >= endCutoff;

        if (aEteLaAuDebut && aEteLaALaFin) {
            agentsDuDebutALaFin.push(`<@${userId}>`);
        } else {
            agentsDePassage.push(`<@${userId}>`);
        }
    });

    const strDebutFin = agentsDuDebutALaFin.length > 0 ? agentsDuDebutALaFin.join('\n') : 'Aucun agent';
    const strPassage = agentsDePassage.length > 0 ? agentsDePassage.join('\n') : 'Aucun agent';

    return new EmbedBuilder()
        .setTitle(isTerminee 
            ? `🚔 Patrouille ${patrouille.vehicule} N°${patrouille.numVehicule} (Terminée)` 
            : `🚔 Prise de Patrouille ${patrouille.vehicule} N°${patrouille.numVehicule}`)
        .setColor(isTerminee ? '#ED4245' : '#2B2D31')
        .addFields(
            { name: 'Véhicule', value: patrouille.vehicule, inline: true },
            { name: 'Heure de début :', value: `<t:${patrouille.startTime}:F>`, inline: true },
            { name: 'Heure de fin :', value: isTerminee ? `<t:${patrouille.endTime}:F>` : 'En cours...', inline: true },
            { name: 'Agents présents (du début à la fin)', value: strDebutFin, inline: false },
            { name: 'Agents de passage', value: strPassage, inline: false }
        )
        .setFooter({ text: 'Support - BCSO System' })
        .setTimestamp();
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            // --- 1. COMMANDES SLASH ---
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) {
                    console.error(`[ERREUR] Commande introuvable: ${interaction.commandName}`);
                    return;
                }

                try {
                    await command.execute(interaction, client);
                } catch (error) {
                    console.error(`[ERREUR execution commande ${interaction.commandName}]:`, error);
                    const errorPayload = { 
                        content: "❌ Une erreur est survenue lors de l'exécution de cette commande.", 
                        flags: MessageFlags.Ephemeral 
                    };
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(errorPayload).catch(() => {});
                    } else {
                        await interaction.reply(errorPayload).catch(() => {});
                    }
                }
                return;
            }

            // --- 2. TRANSMISSION AUX HANDLERS DÉDIÉS ---
            if (handleSuggestion) await handleSuggestion(interaction, client);
            if (interaction.replied || interaction.deferred) return;

            if (handleTicket) await handleTicket(interaction, client);
            if (interaction.replied || interaction.deferred) return;

            if (handleAccueil) await handleAccueil(interaction, client);
            if (interaction.replied || interaction.deferred) return;

            if (handleAbsence) await handleAbsence(interaction, client);
            if (interaction.replied || interaction.deferred) return;

            if (handleRemontee) await handleRemontee(interaction, client);
            if (interaction.replied || interaction.deferred) return;

            // --- 3. GESTION DES BOUTONS SPÉCIFIQUES ---
            if (interaction.isButton()) {
                
                // Formulaire Modal Remontée
                if (interaction.customId === 'open_remontee_modal') {
                    const modal = new ModalBuilder()
                        .setCustomId('modal_remontee_submit')
                        .setTitle('Formulaire de Signalement / Remontée');

                    const inputRaison = new TextInputBuilder()
                        .setCustomId('input_remontee_texte')
                        .setLabel('Détails du signalement / problème')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Expliquez la situation en détail...')
                        .setRequired(true);

                    modal.addComponents(new ActionRowBuilder().addComponents(inputRaison));
                    return await interaction.showModal(modal);
                }

                // Démarrage de patrouille
                if (interaction.customId.startsWith('start_patrouille_')) {
                    const vehicule = interaction.customId.replace('start_patrouille_', '');
                    const expectedChannelId = SALONS_PATROUILLE[vehicule];

                    if (interaction.channelId !== expectedChannelId) {
                        return interaction.reply({
                            content: `❌ La patrouille **${vehicule}** doit obligatoirement être lancée dans le salon <#${expectedChannelId}>.`,
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    const db = getPatrouillesData();
                    db.counters[vehicule] = (db.counters[vehicule] || 0) + 1;
                    const numVehicule = db.counters[vehicule];
                    const patrouilleId = `${vehicule}-${numVehicule}`;
                    const startTime = Math.floor(Date.now() / 1000);

                    const patrouilleData = {
                        id: patrouilleId,
                        vehicule: vehicule,
                        numVehicule: numVehicule,
                        startTime: startTime,
                        endTime: null,
                        active: true,
                        channelId: interaction.channelId,
                        history: {
                            [interaction.user.id]: { joinTime: startTime, leftTime: null }
                        }
                    };

                    const embed = buildPatrouilleEmbed(patrouilleData);

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`patrouille_join_${patrouilleId}`)
                            .setLabel('Rejoindre')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`patrouille_leave_${patrouilleId}`)
                            .setLabel('Quitter')
                            .setStyle(ButtonStyle.Danger)
                    );

                    await interaction.channel.send({ embeds: [embed], components: [row] });

                    db.active[patrouilleId] = patrouilleData;
                    savePatrouillesData(db);

                    return interaction.reply({ content: `✅ Patrouille **${patrouilleId}** lancée avec succès.`, flags: MessageFlags.Ephemeral });
                }

                // Rejoindre une patrouille
                if (interaction.customId.startsWith('patrouille_join_')) {
                    await interaction.deferUpdate().catch(() => {});

                    const patrouilleId = interaction.customId.replace('patrouille_join_', '');
                    const db = getPatrouillesData();
                    const patrouille = db.active[patrouilleId];

                    if (!patrouille || !patrouille.active) {
                        return interaction.followUp({ content: '❌ Cette patrouille est terminée ou n\'existe plus.', flags: MessageFlags.Ephemeral });
                    }

                    const userId = interaction.user.id;
                    const now = Math.floor(Date.now() / 1000);

                    if (!patrouille.history) patrouille.history = {};
                    const userHistory = patrouille.history[userId];

                    if (userHistory && userHistory.leftTime === null) {
                        return interaction.followUp({ content: '⚠️ Vous participez déjà à cette patrouille.', flags: MessageFlags.Ephemeral });
                    }

                    if (userHistory) {
                        userHistory.leftTime = null;
                    } else {
                        patrouille.history[userId] = { joinTime: now, leftTime: null };
                    }

                    savePatrouillesData(db);

                    const embed = buildPatrouilleEmbed(patrouille);
                    return await interaction.message.edit({ embeds: [embed] });
                }

                // Quitter une patrouille
                if (interaction.customId.startsWith('patrouille_leave_')) {
                    await interaction.deferUpdate().catch(() => {});

                    const patrouilleId = interaction.customId.replace('patrouille_leave_', '');
                    const db = getPatrouillesData();
                    const patrouille = db.active[patrouilleId];

                    if (!patrouille || !patrouille.active) {
                        return interaction.followUp({ content: '❌ Cette patrouille est terminée ou n\'existe plus.', flags: MessageFlags.Ephemeral });
                    }

                    const userId = interaction.user.id;
                    const now = Math.floor(Date.now() / 1000);

                    if (!patrouille.history || !patrouille.history[userId] || patrouille.history[userId].leftTime !== null) {
                        return interaction.followUp({ content: '⚠️ Vous ne faites pas partie de cette patrouille.', flags: MessageFlags.Ephemeral });
                    }

                    patrouille.history[userId].leftTime = now;

                    let remaining = 0;
                    Object.values(patrouille.history).forEach(data => {
                        if (data.leftTime === null) remaining++;
                    });

                    if (remaining === 0) {
                        patrouille.active = false;
                        patrouille.endTime = now;

                        const finalEmbed = buildPatrouilleEmbed(patrouille, true);
                        delete db.active[patrouilleId];
                        savePatrouillesData(db);

                        return await interaction.message.edit({ embeds: [finalEmbed], components: [] });
                    }

                    savePatrouillesData(db);
                    const embed = buildPatrouilleEmbed(patrouille);
                    return await interaction.message.edit({ embeds: [embed] });
                }

                // Rafraîchissement Organigramme
                if (interaction.customId === 'refresh_organigramme') {
                    await interaction.deferUpdate().catch(() => {});

                    const now = new Date();
                    const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'Europe/Paris' });
                    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).replace(':', 'h');

                    const data = getData();
                    data.lastChange = `${dateStr} à ${timeStr}`;
                    saveData(data);

                    const updatedContent = generateOrganigrammeText();
                    return await interaction.message.edit({ content: updatedContent });
                }

                // Rafraîchissement Effectif Général
                if (interaction.customId === 'refresh_effectif_general') {
                    await interaction.deferUpdate().catch(() => {});

                    try {
                        const fullContent = generateGeneralEffectifText();

                        const chunks = [];
                        let currentChunk = '';

                        for (const line of fullContent.split('\n')) {
                            if ((currentChunk + '\n' + line).length > 1900) {
                                chunks.push(currentChunk);
                                currentChunk = line;
                            } else {
                                currentChunk += (currentChunk ? '\n' : '') + line;
                            }
                        }
                        if (currentChunk) chunks.push(currentChunk);

                        await interaction.message.edit({
                            content: chunks[0],
                            components: interaction.message.components
                        });

                        if (chunks.length > 1) {
                            for (let i = 1; i < chunks.length; i++) {
                                await interaction.channel.send({ content: chunks[i] });
                            }
                        }
                    } catch (error) {
                        console.error('Erreur lors du rafraîchissement de l\'effectif :', error);
                    }
                    return;
                }

                // Rafraîchissement Brigades
                if (interaction.customId.startsWith('refresh_brigade_')) {
                    await interaction.deferUpdate().catch(() => {});

                    const brigadeKey = interaction.customId.replace('refresh_brigade_', '');
                    const embed = await generateBrigadeEmbed(interaction.guild, brigadeKey);

                    if (embed) {
                        await interaction.message.edit({ embeds: [embed], components: interaction.message.components });
                    } else {
                        await interaction.followUp({ content: '❌ Erreur lors de la mise à jour de la brigade.', flags: MessageFlags.Ephemeral });
                    }
                    return;
                }
            }

            // --- 4. GESTION DES SOUMISSIONS DE MODALS ---
            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'modal_remontee_submit') {
                    const texte = interaction.fields.getTextInputValue('input_remontee_texte');
                    const channel = await interaction.guild.channels.fetch(SALON_REMONTEES).catch(() => null);

                    if (!channel) {
                        return interaction.reply({ content: '❌ Erreur : Le salon de la direction (CDD) est introuvable ou mal configuré.', flags: MessageFlags.Ephemeral });
                    }

                    const embed = new EmbedBuilder()
                        .setTitle('📋 Signalement / Remontée Interne')
                        .setColor(0xE667E22)
                        .setDescription(texte)
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp();

                    await channel.send({ embeds: [embed] });
                    return interaction.reply({ content: '✅ Votre signalement a été transmis à la direction.', flags: MessageFlags.Ephemeral });
                }
            }

        } catch (globalErr) {
            console.error('Erreur globale interactionCreate:', globalErr);
        }
    }
};