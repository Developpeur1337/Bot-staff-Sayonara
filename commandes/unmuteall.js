const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "unmuteall",
    description: "Unmute tous les membres mutes du serveur",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 8,
    async executeSlash(client, interaction) {
        const logChannel = interaction.guild.channels.cache.get(client.config.logs.unmuteall);
        const mutes = interaction.guild.members.cache.filter(m => m.isCommunicationDisabled());

        if (mutes.size === 0) return interaction.reply({ content: "`❌`・Il n'y a aucun membre mute sur le serveur", ephemeral: true });
        
        await interaction.reply({ content: `Je vais unmute ${mutes.size} membres`, ephemeral: true });

        let unmute = 0;
        for (const member of mutes.values()) {
            try {
                await member.timeout(1);
                unmute++;
            } catch {
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("**__Unmute All exécuté__**")
            .setColor(0xFF0000)
            .addFields(
                { name: `⮕ **__Exécuté par :__**`, value: `${interaction.user}` },
                { name: `⮕ **__Nombre de membres démutes : __**`, value: `${unmute}` }
            )
            .setTimestamp();

        if (logChannel) logChannel.send({ embeds: [embed] });

        interaction.editReply({ content: `\`✅\`・J'ai unmute ${unmute}/${mutes.size} membre${mutes.size > 1 ? "s" : ""}` });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
};
