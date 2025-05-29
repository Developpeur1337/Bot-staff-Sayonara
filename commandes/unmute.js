const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "unmute",
    description: "Unmute un membre.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    mod: true,
    Permission: 5,
    async executeSlash(client, interaction) {
        const reason = interaction.options.getString("raison");
        const logChannel = interaction.guild.channels.cache.get(client.config.logs.unmute);
        const member = interaction.guild.members.cache.get(interaction.options.getUser("user")?.id);

        if (!member) return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription(`\`❌\`・Aucun membre trouvé pour \`${interaction.options.getUser("user") || "rien"}\``)], ephemeral: true });
        if (!member.isCommunicationDisabled()) return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription(`\`❌\`・${member} n'est pas mute`)] });

        member.timeout(null, reason).then(() => {
            interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00FF00).setDescription(`\`✅\`・${member} a été unmute`)] });
            const logEmbed = new EmbedBuilder()
                .setTitle("**__Unmute d'un membre__**")
                .setColor(0xFF0000)
                .addFields(
                    { name: `⮕ **__Utilisateur unmute__**`, value: `${member}` },
                    { name: `⮕ **__Raison__**`, value: `${reason}` },
                    { name: `⮕ **__Unmute par__**`, value: `${interaction.user}` }
                )
                .setTimestamp();
            if (logChannel) logChannel.send({ embeds: [logEmbed] });
        }).catch(() => {
            interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription(`\`❌\`・Je n'ai pas pu unmute ${member}`)], ephemeral: true });
        });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName("user").setDescription("Veuillez mentionner un utilisateur").setRequired(true))
            .addStringOption(o => o.setName("raison").setDescription("Veuillez entrer une raison").setRequired(true));
    }
};
