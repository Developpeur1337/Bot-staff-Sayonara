const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const messageDeleteEvent = require("../events/messageDelete");

module.exports = {
    name: "snipe",
    description: "Affiche le dernier message supprimé dans le salon.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 5,
    async executeSlash(client, interaction) {
        const channelId = interaction.channel.id;
        const snipe = messageDeleteEvent.MessageDelete(client, channelId);

        if (!snipe) {
            return interaction.reply({ content: "Aucun message supprimé n'a été trouvé dans ce salon.", ephemeral: true });
        }

        const { content, ID, timestamp } = snipe; 

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("💬 Dernier message supprimé")
            .addFields(
                { name: "\`👁‍🗨\`・Auteur", value: `<@${ID}> | \`${ID}\``, inline: true }, 
                { name: "\`💬\`・Message", value: `\`${content || "Message vide ou non textuel"}\``, inline: false },
                { name: "\`⏱\`・Heure", value: `<t:${Math.floor(timestamp / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: "Assura" })
            .setTimestamp();

        interaction.reply({ embeds: [embed], ephemeral: true });
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
};
