const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "lock",
    description: "Verrouille un salon.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 7,
    async executeSlash(client, interaction) {
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        const raison = interaction.options.getString("raison");

        if (!channel.permissionsFor(interaction.guild.roles.everyone).has(PermissionsBitField.Flags.SendMessages)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`\`❌\`・Le salon ${channel} est déjà verrouillé.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false })
            .then(() => {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`\`✅\`・Le salon ${channel} a été verrouillé pour la raison : \`${raison}\``);
                interaction.reply({ embeds: [embed], ephemeral: false });
            })
            .catch(() => {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`\`❌\`・Je n'ai pas pu verrouiller le salon ${channel}.`);
                interaction.reply({ embeds: [embed], ephemeral: true });
            });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName("raison").setDescription("Veuillez entrer une raison").setRequired(true))
            .addChannelOption(o => o.setName("channel").setDescription("Veuillez sélectionner un salon").setRequired(false));
    }
};
