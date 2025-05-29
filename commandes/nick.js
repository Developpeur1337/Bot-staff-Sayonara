const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "nick",
    description: "Renomme un membre avec un nom spécifié.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    mod: true,
    Permission: 5,
    async executeSlash(client, interaction) {
        const member = interaction.guild.members.cache.get(interaction.options.getUser("user")?.id);
        const newName = interaction.options.getString("nom");
        const logChannel = interaction.guild.channels.cache.get(client.config.logs.nickname); 

        if (!member) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription(`\`❌\`・Aucun membre trouvé pour \`${interaction.options.getUser("user") || "rien"}\``);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const bl = ["discord.", ".gg/", ".gg", "discord . ", ". gg"];
        const detecte = bl.some(keyword => newName.includes(keyword));

        if (detecte) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription(`\`❌\`・Vous ne pouvez pas renommer un membre avec un nom contenant un lien d'invitation.`);
            interaction.reply({ embeds: [embed], ephemeral: true });

            const logEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("Tentative de changement de pseudo bloquée")
                .addFields(
                    { name: "\`👥\`・Utilisateur", value: `${interaction.user}`},
                    { name: "\`🎯\`・Membre ciblé", value: `${member}`},
                    { name: "\`⛔\`・Nouveau nom tenté", value: `\`${newName}\`` }
                )
                .setTimestamp();

            if (logChannel) logChannel.send({ embeds: [logEmbed] });

            return;
        }

        member.setNickname(newName)
            .then(() => {
                const cbon = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setDescription(`\`✅\`・${member} a été renommé en \`${newName}\``);
                interaction.reply({ embeds: [cbon] });
            })
            .catch(() => {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription(`\`❌\`・Je n'ai pas pu renommer ${member}`);
                interaction.reply({ embeds: [embed] });
            });
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName("user").setDescription("Veuillez mentionner un utilisateur").setRequired(true))
            .addStringOption(o => o.setName("nom").setDescription("Veuillez entrer un nouveau nom").setRequired(true));
    }
};
