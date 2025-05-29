const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "stats",
    description: "Affiche les statistiques vocales du serveur.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 5,
    async executeSlash(client, interaction) {
        const members = await interaction.guild.members.fetch();
        const total = members.size;
        const activeStatuses = ["online", "dnd", "idle", "streaming"];
        const online = members.filter(member => activeStatuses.includes(member.presence?.status)).size;
        const enVoc = members.filter(member => member.voice.channel).size;
        const stream = members.filter(member => member.presence?.activities.some(activity => activity.type === "STREAMING")).size;
        const muteMicro = members.filter(member => member.voice.selfMute).size;
        const muteCasque = members.filter(member => member.voice.serverMute).size;
        const muteServeur = members.filter(member => member.voice.serverMute).size

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name} Statistiques !`)
            .setColor(0x2B2D31)
            .setDescription(`
                \`👥\` ・ Membres: \`${total}\`
                \`🟢\` ・ En Ligne: \`${online}\`
                \`🔊\` ・ En Vocal: \`${enVoc}\`
                \`🎥\` ・ En Stream: \`${stream}\`
                \`🚫\` ・ Mute Serveur: \`${muteServeur}\`
                \`🔕\` ・ Micro Mute: \`${muteMicro}\`
                \`🔇\` ・ Casque Mute: \`${muteCasque}\`
            `)
            .setTimestamp();

        try {
            await interaction.reply({ embeds: [embed], ephemeral: false });
        } catch (error) {
            console.error("Une erreur s'est produite lors de l'envoi du message :", error);
        }
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
};
