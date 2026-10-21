const { PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcaptcha')
        .setDescription('Configurer le rôle attribué lors de la vérification Captcha')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option.setName('role_verifie')
                .setDescription('Le rôle donné après avoir réussi le Captcha')
                .setRequired(true)
        ),
    async execute(interaction) {
        const client = interaction.client;
        const role = interaction.options.getRole('role_verifie');

        if (role.id === interaction.guild.id) {
            return interaction.reply({
                content: '❌ Vous ne pouvez pas définir le rôle `@everyone` comme rôle de vérification.',
                ephemeral: true
            });
        }

        const botMember = interaction.guild.members.me;
        if (role.position >= botMember.roles.highest.position) {
            return interaction.reply({
                content: `❌ Le rôle ${role} est plus élevé ou égal à mon rôle le plus haut dans la hiérarchie. Je ne pourrai pas l'attribuer aux membres.`,
                ephemeral: true
            });
        }

        db.set(`captcha_role_${interaction.guild.id}`, role.id);

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuration Captcha')
            .setColor(client.color || 0x2B5329)
            .setDescription(`Le rôle ${role} sera désormais attribué aux membres ayant réussi la vérification.`)
            .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};