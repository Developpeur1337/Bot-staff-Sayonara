const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: "renew",
    description: "Supprime et recrée le salon où la commande a été exécutée.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 9,
    async executeSlash(client, interaction) {
        const channel = interaction.channel;

        try {
            const channelName = channel.name;
            const channelType = channel.type;
            const channelPosition = channel.position;
            const channelTopic = channel.topic;
            const channelNSFW = channel.nsfw;
            const channelRateLimitPerUser = channel.rateLimitPerUser;
            const channelParentId = channel.parentId; 
            const channelPermissions = channel.permissionOverwrites.cache.map(overwrite => ({
                id: overwrite.id,
                type: overwrite.type,
                allow: overwrite.allow.bitfield,
                deny: overwrite.deny.bitfield
            }));

            await channel.delete();

            const newChannel = await interaction.guild.channels.create({
                name: channelName,
                type: channelType,
                topic: channelTopic,
                nsfw: channelNSFW,
                rateLimitPerUser: channelRateLimitPerUser,
                permissionOverwrites: channelPermissions,
                parent: channelParentId, 
                reason: 'Salon recréé par la commande /renew',
            });

            await newChannel.setPosition(channelPosition);

            await newChannel.send(`Ce salon a été recréé avec succès par ${interaction.user}`);

        } catch (error) {
            await interaction.reply({
                content: "`❌`・Une erreur s'est produite lors de la recréation du salon.",
                ephemeral: true
            });
        }
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
    }
};
