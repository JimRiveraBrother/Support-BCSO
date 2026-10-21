const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dataFilePath = path.join(__dirname, '../data/brigades.json');

function getBrigadesData() {
    if (!fs.existsSync(dataFilePath)) {
        return { stx: {}, henry: {}, mary: {}, detective: {} };
    }
    try {
        const fileData = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        console.error('Erreur de lecture brigades.json :', error);
        return { stx: {}, henry: {}, mary: {}, detective: {} };
    }
}

function saveBrigadesData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Erreur d\'écriture brigades.json :', error);
    }
}

const ROLES = {
    detective: {
        role: '1549133035335581696',
        superviseur: '1549133000015347743',
        responsable: '1549133014838022225',
    },
    mary: {
        role: '1549133051529793680',
        superviseur: '1549133002821345290',
        responsable: '1549133016872525825',
        formateur: '1549133058979008663',
    },
    stx: {
        role: '1549133045649379359',
        superviseur: '1549133003601612910',
        responsable: '1549133020110393447',
        formateur: '1549133057485832303',
    },
    henry: {
        role: '1549133048514351264',
        superviseur: '1549133000724455427',
        responsable: '1549133015941255218',
        formateur: '1549133058316304406',
    }
};

async function generateBrigadeEmbed(guild, brigadeKey) {
    if (guild.memberCount !== guild.members.cache.size) {
        await guild.members.fetch().catch(() => {});
    }

    const config = ROLES[brigadeKey];
    const db = getBrigadesData();
    const brigadeData = db[brigadeKey] || {};

    const brigadeRole = guild.roles.cache.get(config.role);
    
    // On rassemble tous les IDs à afficher : ceux qui ont le rôle Discord OU ceux enregistrés dans la bdd
    const memberIds = new Set();
    if (brigadeRole) {
        brigadeRole.members.forEach(m => memberIds.add(m.id));
    }
    Object.keys(brigadeData).forEach(id => memberIds.add(id));

    let superviseurs = [];
    let responsables = [];
    let formateurs = [];
    let tireurs = [];
    let pilotes = [];
    let copilotes = [];
    let membresNormaux = [];

    for (const id of memberIds) {
        const member = await guild.members.fetch(id).catch(() => null);
        if (!member) continue;

        const hasSup = config.superviseur && member.roles.cache.has(config.superviseur);
        const hasResp = config.responsable && member.roles.cache.has(config.responsable);
        const hasForm = config.formateur && member.roles.cache.has(config.formateur);
        const userPoste = brigadeData[id];

        // PRIORITÉ AUX POSTES SPÉCIFIQUES (Pilote, Copilote, Tireur)
        if (userPoste === 'pilote') {
            pilotes.push(`<@${id}>`);
        } else if (userPoste === 'copilote') {
            copilotes.push(`<@${id}>`);
        } else if (userPoste === 'tireur') {
            tireurs.push(`<@${id}>`);
        } else if (hasSup) {
            superviseurs.push(`<@${id}>`);
        } else if (hasResp) {
            responsables.push(`<@${id}>`);
        } else if (hasForm) {
            formateurs.push(`<@${id}>`);
        } else if (brigadeRole && member.roles.cache.has(config.role)) {
            membresNormaux.push(`<@${id}>`);
        }
    }

    const embed = new EmbedBuilder();
    
    if (brigadeKey === 'detective') {
        embed.setColor(0x9B59B6);
        embed.setTitle('🕵️ Effectif - Brigade Détective');
    } else if (brigadeKey === 'mary') {
        embed.setColor(0xE74C3C);
        embed.setTitle('🏍️ Effectif - Brigade Mary');
    } else if (brigadeKey === 'stx') {
        embed.setColor(0x2ECC71);
        embed.setTitle('🏎️ Effectif - Brigade STX');
    } else if (brigadeKey === 'henry') {
        embed.setColor(0xE67E22);
        embed.setTitle('🚁 Effectif - Brigade Henry');
    }

    let description = '';

    description += `### 👑 Superviseur\n`;
    description += superviseurs.length > 0 ? superviseurs.join('\n') + '\n\n' : `*Aucun*\n\n`;

    description += `### ⚜️ Responsable(s)\n`;
    description += responsables.length > 0 ? responsables.join('\n') + '\n\n' : `*Aucun*\n\n`;

    if (config.formateur) {
        description += `### 📚 Formateur(s)\n`;
        description += formateurs.length > 0 ? formateurs.join('\n') + '\n\n' : `*Aucun*\n\n`;
    }

    if (brigadeKey === 'henry') {
        description += `### 🎯 Tireurs\n`;
        description += tireurs.length > 0 ? tireurs.join('\n') + '\n\n' : `*Aucun*\n\n`;
    }

    if (brigadeKey === 'stx' || brigadeKey === 'henry' || brigadeKey === 'mary') {
        description += `### ✈️ Pilotes\n`;
        description += pilotes.length > 0 ? pilotes.join('\n') + '\n\n' : `*Aucun*\n\n`;
    }

    if (brigadeKey === 'stx' || brigadeKey === 'henry') {
        description += `### 🧭 Co-pilotes\n`;
        description += copilotes.length > 0 ? copilotes.join('\n') + '\n\n' : `*Aucun*\n\n`;
    }

    if (brigadeKey === 'detective') {
        description += `### 🔍 Détective(s)\n`;
        description += membresNormaux.length > 0 ? membresNormaux.join('\n') : `*Aucun*`;
    } else if (brigadeKey === 'stx' || brigadeKey === 'henry') {
        description += `### 🛡️ Agent(s)\n`;
        description += membresNormaux.length > 0 ? membresNormaux.join('\n') : `*Aucun*`;
    }

    embed.setDescription(description.trim());

    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'Europe/Paris' });
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).replace(':', 'h');
    embed.setFooter({ text: `Dernière mise à jour le ${dateStr} à ${timeStr}` });

    return embed;
}

module.exports = {
    getBrigadesData,
    saveBrigadesData,
    generateBrigadeEmbed
};