const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "clear",
    description: "Supprime un nombre de messages dans le salon, optionnellement pour un utilisateur spécifique",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 6,
    async executeSlash(client, interaction) {
        const nombre = interaction.options.getInteger("nombre");
        const user = interaction.options.getUser("user");

        if (!nombre || nombre < 1 || nombre > 100) {
            return interaction.reply({ 
                embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription("`❌`・Veuillez spécifier un nombre de messages à supprimer entre 1 et 100.")],
                ephemeral: true 
            });
        }

        const messages = await interaction.channel.messages.fetch({ limit: nombre });
        const userMessages = user ? messages.filter(msg => msg.author.id === user.id) : messages;

        try {
            const deleted = await interaction.channel.bulkDelete(userMessages, true);
            interaction.reply({ 
                embeds: [new EmbedBuilder().setColor(0x00FF00).setDescription(`\`✅\`・${deleted.size} message${deleted.size > 1 ? 's' : ''} ${user ? `de <@${user.id}>` : ''} ont été supprimés.`)], 
                ephemeral: true 
            });
        } catch (err) {
            console.error('Erreur lors de la suppression des messages :', err);
            interaction.reply({ 
                embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription("`❌`・Une erreur s'est produite lors de la suppression des messages.")],
                ephemeral: true 
            });
        }
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addIntegerOption(option => option.setName("nombre").setDescription("Nombre de messages à supprimer").setRequired(true))
            .addUserOption(option => option.setName("user").setDescription("Utilisateur dont les messages doivent être supprimés").setRequired(false));
    }
};