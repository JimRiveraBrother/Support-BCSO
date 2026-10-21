const fs = require('fs');
const path = require('path');

const effectifsFilePath = path.join(__dirname, '../data/effectifs.json');

function getEffectifsData() {
    if (!fs.existsSync(effectifsFilePath)) {
        const initial = { lastChange: "Jamais", general: {} };
        const dir = path.dirname(effectifsFilePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(effectifsFilePath, JSON.stringify(initial, null, 2));
        return initial;
    }
    try {
        return JSON.parse(fs.readFileSync(effectifsFilePath, 'utf8'));
    } catch (error) {
        console.error('[EFFECTIFS] Erreur de lecture du JSON, réinitialisation de secours :', error);
        return { lastChange: "Jamais", general: {} };
    }
}

function saveEffectifsData(data) {
    const dir = path.dirname(effectifsFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(effectifsFilePath, JSON.stringify(data, null, 2), 'utf8');
}

function formatMatricule(num) {
    return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Génère l'effectif sous forme de tableau de plusieurs messages (blocs) 
 * pour ne jamais dépasser la limite des 2000 caractères de Discord.
 */
function generateGeneralEffectifChunks() {
    const data = getEffectifsData();
    const matricules = data.general || data.matricules || {};
    const libres = [];

// 1. Premier bloc : Titre + Matricules 01 à 75
    let block1 = `# Effectif <@&1549133034328952882>\n\n`;
    for (let i = 1; i <= 75; i++) {
        const formattedIndex = formatMatricule(i);
        const userId = matricules[formattedIndex] || matricules[i];

        if (userId && userId !== 'null' && userId !== null && userId !== 'undefined') {
            block1 += `**${formattedIndex} |** <@${userId}>\n`;
        } else {
            block1 += `**${formattedIndex} |** //\n`;
            libres.push(formattedIndex);
        }
    }

    // 2. Second bloc : Matricules 76 à 150
    let block2 = ``;
    for (let i = 76; i <= 150; i++) {
        const formattedIndex = formatMatricule(i);
        const userId = matricules[formattedIndex] || matricules[i];

        if (userId && userId !== 'null' && userId !== null) {
            block2 += `**${formattedIndex} |** <@${userId}>\n`;
        } else {
            block2 += `**${formattedIndex} |** //\n`;
            libres.push(formattedIndex);
        }
    }

    // 3. Troisième bloc : Section des matricules libres + Horodatage
    let block3 = `\n__**Matricules libres :**__ (${libres.length})\n\n`;

    if (libres.length === 150) {
        block3 += `- **01 à 150**\n`;
    } else if (libres.length > 0) {
        // Affichage propre des libres sous forme compacte ou en liste selon ton souhait
        const formattedLibres = libres.map(m => `**${m}**`).join(', ');
        block3 += `${formattedLibres}\n`;
    } else {
        block3 += `Aucun matricule libre\n`;
    }

    block3 += `\n*Dernière mise à jour le ${data.lastChange || 'Jamais'}*`;

    return [block1, block2, block3];
}

module.exports = {
    getEffectifsData,
    saveEffectifsData,
    generateGeneralEffectifChunks
};