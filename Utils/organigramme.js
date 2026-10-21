const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../supervision_data.json');

function getData() {
    if (!fs.existsSync(DATA_PATH)) {
        return { supervisions: {}, responsabilites: {}, lastChange: 'Jamais', reason: '//' };
    }
    try {
        return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    } catch (error) {
        console.error('[ORGANIGRAMME] Erreur de lecture du JSON, réinitialisation de secours :', error);
        return { supervisions: {}, responsabilites: {}, lastChange: 'Jamais', reason: '//' };
    }
}

function saveData(data) {
    try {
        const dir = path.dirname(DATA_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('[ORGANIGRAMME] Erreur lors de la sauvegarde :', error);
    }
}

// Fonction utilitaire pour ajouter un utilisateur à un rôle (Supervision ou Responsabilité)
function addUserToRole(category, roleId, userId) {
    const data = getData();
    if (!data[category]) data[category] = {};
    if (!data[category][roleId]) data[category][roleId] = [];

    // Évite les doublons si l'utilisateur y est déjà
    if (!data[category][roleId].includes(userId)) {
        data[category][roleId].push(userId);
        saveData(data);
        return true;
    }
    return false;
}

// Fonction utilitaire pour retirer un utilisateur d'un rôle
function removeUserFromRole(category, roleId, userId) {
    const data = getData();
    if (data[category] && data[category][roleId]) {
        data[category][roleId] = data[category][roleId].filter(id => id !== userId);
        saveData(data);
        return true;
    }
    return false;
}

function generateOrganigrammeText() {
    const data = getData();
    let text = "**__Supervisions :__**\n\n";

    const supervisions = data.supervisions || {};
    for (const [roleId, users] of Object.entries(supervisions)) {
        text += `- <@&${roleId}>\n`;
        if (!users || users.length === 0) {
            text += "   - Libre\n";
        } else {
            users.forEach(uId => {
                text += `   - <@${uId}>\n`;
            });
        }
        text += "\n";
    }

    text += "**__Responsabilités :__**\n\n";

    const responsabilites = data.responsabilites || {};
    for (const [roleId, users] of Object.entries(responsabilites)) {
        text += `- <@&${roleId}>\n`;
        if (!users || users.length === 0) {
            text += "   - Libre\n";
        } else {
            users.forEach(uId => {
                text += `   - <@${uId}>\n`;
            });
        }
        text += "\n";
    }

    text += `**Dernier changement :** ${data.lastChange || 'Jamais'}\n`;
    text += `**Changement suite à une réunion :** ${data.reason || '//'}`;

    return text;
}

module.exports = { 
    getData, 
    saveData, 
    addUserToRole, 
    removeUserFromRole, 
    generateOrganigrammeText 
};