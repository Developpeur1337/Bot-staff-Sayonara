const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "user",
    description: "Affiche les informations d'un utilisateur",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 2,
    async executeSlash(client, interaction) {
        const user = interaction.options.getUser("utilisateur");
        if (!user) return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription(`\`❌\`・Aucun utilisateur spécifié.`)], ephemeral: true });

        const member = interaction.guild.members.cache.get(user.id);
        const join = member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : "Non disponible";
        const date = `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`;
        const Guilds = client.guilds.cache.filter(g => g.members.cache.has(user.id)).size;

        const embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle(`Informations sur ${user.tag}`)
            .setDescription(`Présent sur ce serveur depuis le ${join}\nCompte créé le ${date}\nServeurs en commun \`${Guilds}\``);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Voir le profil")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`discord://-/users/${user.id}`)
            );

        interaction.reply({ embeds: [embed], components: [row] });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option => option.setName("utilisateur").setDescription("Sélectionnez un utilisateur").setRequired(true));
    }
};
