const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "pic",
    description: "Affiche la photo de profil d'un utilisateur.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission : 1,
    async executeSlash(client, interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("user");

        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription("`❌`・Veuillez mentionner un utilisateur valide.");

            return interaction.editReply({ embeds: [embed], ephemeral: true });
        } 

        const pic = user.displaypic({ dynamic: true, size: 4096 });

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(`Photo de profil de ${user.username}`)
            .setImage(pic)
            .setFooter({ text: `ID: ${user.id}` });

        await interaction.editReply({ embeds: [embed], ephemeral: true });
    },

    data: new SlashCommandBuilder()
        .setName('pic')
        .setDescription("Affiche la photo de profil d'un utilisateur en haute qualité")
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Veuillez mentionner un utilisateur')
                .setRequired(true)
        ),
};
