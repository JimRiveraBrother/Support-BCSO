const fs = require('fs');
const path = require('path');

module.exports = async client => {
    let count = 0;
    const eventsPath = path.join(__dirname, '../Events');

    // Fonction récursive pour lire les fichiers même dans des sous-dossiers
    const getEventFiles = (dir) => {
        let files = [];
        if (!fs.existsSync(dir)) return files;
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                files = files.concat(getEventFiles(fullPath));
            } else if (item.name.endsWith('.js')) {
                files.push(fullPath);
            }
        }
        return files;
    };

    const files = getEventFiles(eventsPath);

    for (const filePath of files) {
        const event = require(filePath);
        
        if (!event.name) {
            console.warn(`[LOADER] L'événement dans le fichier ${path.basename(filePath)} n'a pas de nom.`);
            continue;
        }

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
        count++;
    }
    
    console.log(`[LOADER] ${count} événement(s) chargé(s).`);
};