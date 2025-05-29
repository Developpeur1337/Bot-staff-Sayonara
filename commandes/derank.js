const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require("discord.js");
module.exports = {
    name: "derank",
    description: "Ouvre un panel de gestion pour enlever un/des rôle(s)",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission : 9,
    async executeSlash(client, interaction) {
        const logChannel = interaction.guild.channels.cache.get(client.config.logs.derank);
        const member = interaction.guild.members.cache.get(interaction.options.getUser("member")?.id);

        if (!member) {return interaction.reply({ content: `\`❌\`・Aucun utilisateur trouvé pour \`${interaction.options.getUser("member")?.username || "rien"}\``, ephemeral: true });}
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {return interaction.reply({ content: `\`❌\`・Vous ne pouvez pas derank un utilisateur ayant les permissions administrateur`, ephemeral: true });}
        if (client.perms.owners.includes(member.id) && interaction.user.id !== member.id && config.owners.includes(member.id)) {return interaction.reply({ content: "\`❌\`・Vous ne pouvez pas derank un owner", ephemeral: true });}

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setOptions(member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => ({ label: r.name, value: r.id })))
                    .setCustomId("roles")
                    .setPlaceholder("Sélectionnez des rôles à enlever...")
                    .setMaxValues(member.roles.cache.filter(r => r.id !== interaction.guild.id).size)
            );

        const msg = await interaction.reply({ content: "\`✅\`・Veuillez sélectionner des rôles à enlever :", components: [row]});
        const collector = msg.createMessageComponentCollector({ max: 1, time: 1000 * 60 * 5 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: "\`❌\`・Vous ne pouvez pas utiliser ce menu", ephemeral: true });
            }

            await i.deferReply();
            const roles = [];

            for (const roleId of i.values) {
                try {
                    const r = interaction.guild.roles.cache.get(roleId);
                    await member.roles.remove(r);
                    roles.push(r);
                } catch {
                }
            }

            await i.editReply({ content: `\`✅\`・\`${roles.length}\` Rôles retirés à ${member}: \`${roles.map(r => r.name).join(', ') || "Aucun"}\`` });

            if (roles.length > 0) {
                const embed = new EmbedBuilder()
                    .setTitle("**__Dérank__**")
                    .setColor(0xFF0000)
                    .addFields({ name: `⮕ **__Utilisateur : __**`, value: `${member}` })
                    .addFields({ name: `⮕ **__Rôle(s) retiré(s) : __**`, value: `${roles.map(r => r.name).join(', ')}` })
                    .addFields({ name: `⮕ **__Exécuté par : __**`, value: `${interaction.user}` })
                    .setTimestamp();
                if (logChannel) logChannel.send({ embeds: [embed] });
            }
        });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName("member").setDescription("Veuillez mentionner un membre").setRequired(true));
    }
};
