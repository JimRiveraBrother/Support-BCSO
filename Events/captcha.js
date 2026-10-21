const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, MessageFlags } = require('discord.js');
const { createCanvas } = require('@napi-rs/canvas');
const db = require('croxydb');

// Store pour les codes avec timestamp d'expiration (10 minutes)
const captchaCodes = new Map();
const CAPTCHA_EXPIRATION_MS = 10 * 60 * 1000;

function generateCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function createCaptchaImage(code) {
    const canvas = createCanvas(320, 110);
    const ctx = canvas.getContext('2d');

    // Arrière-plan sombre
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Lignes de bruit
    for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    // Dessin du texte caractère par caractère avec légère rotation
    ctx.font = 'bold 38px Sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';

    const startX = 35;
    const spacing = 42;

    for (let i = 0; i < code.length; i++) {
        ctx.save();
        const x = startX + i * spacing;
        const y = canvas.height / 2 + (Math.random() * 10 - 5);
        const angle = (Math.random() - 0.5) * 0.4; // Rotation aléatoire légère

        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(code[i], 0, 0);
        ctx.restore();
    }

    return canvas.toBuffer('image/png');
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        // 1. Bouton "Passer la vérification" / Générer le Captcha
        if (interaction.isButton() && interaction.customId === 'btn_captcha_start') {
            const code = generateCode();

            // Stockage avec expiration
            captchaCodes.set(interaction.user.id, {
                code,
                expiresAt: Date.now() + CAPTCHA_EXPIRATION_MS
            });

            const buffer = createCaptchaImage(code);
            const attachment = new AttachmentBuilder(buffer, { name: 'captcha.png' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_captcha_enter')
                    .setLabel('Saisir le code')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⌨️')
            );

            return interaction.reply({
                content: 'Veuillez lire le code ci-dessous puis cliquer sur **Saisir le code** :',
                files: [attachment],
                components: [row],
                flags: MessageFlags.Ephemeral
            });
        }

        // 2. Bouton "Saisir le code" -> Ouvre le Modal
        if (interaction.isButton() && interaction.customId === 'btn_captcha_enter') {
            const stored = captchaCodes.get(interaction.user.id);

            if (!stored || Date.now() > stored.expiresAt) {
                captchaCodes.delete(interaction.user.id);
                return interaction.reply({
                    content: '⏰ Votre code captcha a expiré. Veuillez relancer la vérification.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const modal = new ModalBuilder()
                .setCustomId('modal_captcha')
                .setTitle('Vérification Captcha');

            const input = new TextInputBuilder()
                .setCustomId('input_captcha_code')
                .setLabel('Entrez le code affiché sur l\'image')
                .setStyle(TextInputStyle.Short)
                .setMinLength(6)
                .setMaxLength(6)
                .setPlaceholder('Exemple: A8K9X2')
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(input);
            modal.addComponents(row);

            return interaction.showModal(modal);
        }

        // 3. Soumission du Modal
        if (interaction.isModalSubmit() && interaction.customId === 'modal_captcha') {
            const userCode = interaction.fields.getTextInputValue('input_captcha_code').trim().toUpperCase();
            const stored = captchaCodes.get(interaction.user.id);

            if (!stored || Date.now() > stored.expiresAt) {
                captchaCodes.delete(interaction.user.id);
                return interaction.reply({
                    content: '⏰ Le captcha a expiré. Veuillez recommencer en re-cliquant sur le bouton.',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (userCode !== stored.code) {
                captchaCodes.delete(interaction.user.id);
                return interaction.reply({
                    content: '❌ Code incorrect ! Veuillez réessayer en re-cliquant sur le bouton de vérification.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Code correct -> suppression de la mémoire
            captchaCodes.delete(interaction.user.id);

            // Récupération du rôle
            const roleId = db.get(`captcha_role_${interaction.guild.id}`) || db.get(`guilds.${interaction.guild.id}.captcha_role`);

            if (!roleId) {
                return interaction.reply({
                    content: '⚠️ Le rôle de vérification n\'a pas encore été configuré par un administrateur.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const role = interaction.guild.roles.cache.get(roleId) || await interaction.guild.roles.fetch(roleId).catch(() => null);

            if (role) {
                await interaction.member.roles.add(role).catch(() => {});
            }

            const embedSuccess = new EmbedBuilder()
                .setTitle('✅ Vérification réussie !')
                .setColor(client.color || 0x2ECC71)
                .setDescription(`Vous avez été vérifié avec succès. Le rôle **${role ? role.name : 'Vérifié'}** vous a été attribué.`)
                .setTimestamp();

            return interaction.reply({ embeds: [embedSuccess], flags: MessageFlags.Ephemeral });
        }
    }
};