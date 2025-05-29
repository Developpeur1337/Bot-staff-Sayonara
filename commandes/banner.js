const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "banner",
    description: "Affiche la bannière d'un utilisateur.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 2,
    async executeSlash(client, interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("user");

        if (!user) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription("`❌`・Veuillez mentionner un utilisateur valide.")
                ],
                ephemeral: true
            });
        }

        const banner = (await client.users.fetch(user.id, { force: true })).bannerURL({ dynamic: true, size: 4096 });

        if (!banner) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription("`❌`・Cet utilisateur n'a pas de bannière.")
                ],
                ephemeral: true
            });
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle(`Bannière de ${user.username}`)
                    .setImage(banner)
                    .setFooter({ text: `ID: ${user.id}` })
            ],
            ephemeral: true
        });
    },

    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription("Affiche la bannière d'un utilisateur en haute qualité")
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Veuillez mentionner un utilisateur')
                .setRequired(true)
        ),
};
