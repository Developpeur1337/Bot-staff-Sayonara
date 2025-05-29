const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, RoleSelectMenuBuilder, PermissionsBitField } = require("discord.js");

const permissionsCheck = [
    PermissionsBitField.Flags.ModerateMembers,
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageWebhooks,
    PermissionsBitField.Flags.Administrator,
    PermissionsBitField.Flags.ManageRoles,
    PermissionsBitField.Flags.ManageGuild,
    PermissionsBitField.Flags.KickMembers,
    PermissionsBitField.Flags.BanMembers,
];

const dangerPermissions = role => 
    permissionsCheck.some(permission => role.permissions.has(permission));

module.exports = {
    name: "gestion",
    description: "Ouvre un panel de gestion pour ajouter un/des rôle(s)",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 9,
    async executeSlash(client, interaction) {
        const logChannel = interaction.guild.channels.cache.get(client.config.logs.gestion);
        const member = interaction.guild.members.cache.get(interaction.options.getUser("member")?.id);

        if (!member) return interaction.reply({ content: `\`❌\`・Aucun utilisateur trouvé pour \`${interaction.options.getUser("member")?.username || "rien"}\``, ephemeral: true });
        if ((client.perms.owners.includes(member.id) || client.config.owners.includes(member.id)) && interaction.user.id !== member.id) { return interaction.reply({content: "`❌`・Vous ne pouvez pas gérer les rôles d'un owner",ephemeral: true,});}

        const row = new ActionRowBuilder()
            .addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId("roles")
                    .setPlaceholder("Séléctionnez des rôles à ajouter...")
                    .setMaxValues(10)
            )

        const msg = await interaction.reply({ content: "\`✅\`・Veuillez séléctionner des rôles à ajouter :", components: [row]})
        const collector = msg.createMessageComponentCollector({ max: 1, time: 1000 * 60 * 5 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: "\`❌\`・Vous ne pouvez pas utiliser ce menu", ephemeral: true })
            await i.deferReply()
            const roles = []

            let beleck = false;

            for (const roleId of i.values) {
                try {
                    const r = interaction.guild.roles.cache.get(roleId)

                    if (dangerPermissions(r)) {
                        await i.followUp({ content: "\`❌\`・L'un des rôles contient des permissions dangereuses et donc rien n'a été donné"});
                        beleck = true;
                        continue;
                    }

                    await member.roles.add(r)
                    roles.push(r)
                } catch { false }
            }

            if (!beleck && roles.length > 0) {
                await i.editReply({ content: `\`✅\`・\`${roles.length}\` Rôles ajoutés à ${member}: \`${roles.map(r => r.name).join(', ') || "Aucun"}\`` });

                const embed = new EmbedBuilder()
                    .setTitle("**__Gestion__**")
                    .setColor(0xFF0000)
                    .addFields({ name: `⮕ **__Utilisateur : __**`, value: `${member}` })
                    .addFields({ name: `⮕ **__Rôle(s) ajouté(s) : __**`, value: `\`${roles.map(r => r.name).join(', ')}\`` })
                    .addFields({ name: `⮕ **__Exécuté par : __**`, value: `${interaction.user}` })
                    .setTimestamp()
                if (logChannel) logChannel.send({ embeds: [embed] })
            } else if (!beleck) {
                await i.editReply({ content: "\`❌\`・Aucun rôle ajouté", ephemeral: true });
            }
        });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName("member").setDescription("Veuillez mentionner un membre").setRequired(true))
    }
}
