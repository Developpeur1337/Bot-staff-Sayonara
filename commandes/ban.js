const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

const banLimit = 3;
const banCooldown = 60 * 60 * 1000;
const banTimestamps = {};

module.exports = {
    name: "ban",
    description: "Bannir un utilisateur avec une limite de 3 bans par heure",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission : 9,
    async executeSlash(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        const logChannel = interaction.guild.channels.cache.get(client.config.logs.ban);
        const user = interaction.options.getUser("user");
        const raison = interaction.options.getString("raison") || "Aucune raison fournie";

        if (!user) {
            const No = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription("`❌`・Veuillez mentionner un utilisateur à bannir");
            return interaction.editReply({ embeds: [No], ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(user.id);
        if (!member) {
            const No = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription("`❌`・Utilisateur introuvable dans ce serveur");
            return interaction.editReply({ embeds: [No], ephemeral: true });
        }

        if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const No = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription("`❌`・Vous ne pouvez pas bannir un utilisateur ayant les permissions administrateur");
            return interaction.editReply({ embeds: [No], ephemeral: true });
        }

        if (client.perms.owners.includes(member.id)) {
            const No = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription("`❌`・Vous ne pouvez pas bannir un owner");
            return interaction.editReply({ embeds: [No], ephemeral: true });
        }

        if (client.perms.permBan.includes(member.id)) {
            const No = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription("`❌`・Vous ne pouvez pas bannir un utilisateur qui a la permission de ban");
            return interaction.editReply({ embeds: [No], ephemeral: true });
        }

        const now = Date.now();
        const userBans = banTimestamps[interaction.user.id] || [];
        const bans = userBans.filter(timestamp => now - timestamp < banCooldown);
        banTimestamps[interaction.user.id] = bans;

        if (bans.length >= banLimit) {
            const temps = banCooldown - (now - bans[0]);
            const minute = Math.floor(temps / 60000);
            const seconde = Math.floor((temps % 60000) / 1000);

            const No = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`\`❌\`・Vous ne pouvez plus bannir de personne. Attendez encore ${minute} minutes et ${seconde} secondes.`);
            return interaction.editReply({ embeds: [No], ephemeral: true });
        }

        try {
            await interaction.guild.members.ban(user.id, { raison });
            bans.push(now);
            banTimestamps[interaction.user.id] = bans;
            const restant = banLimit - bans.length;

            const embedYes = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`\`✅\`・${user} a été banni pour : ${raison} (${restant} ban restant)`);

            interaction.editReply({ embeds: [embedYes], ephemeral: false });

            const logEmbed = new EmbedBuilder()
                .setTitle("**__Utilisateur banni : __**")
                .setColor(0xFF0000)
                .addFields(
                    { name: `⮕ **__Utilisateur : __**`, value: `${user}` },
                    { name: `⮕ **__Banni par : __**`, value: `${interaction.user}` },
                    { name: `⮕ **__Raison : __**`, value: raison },
                    { name: `⮕ **__Bans restants : __**`, value: `${restant} ban restant.` }
                )
                .setTimestamp();

            if (logChannel) logChannel.send({ embeds: [logEmbed] });

        } catch (error) {
            console.error(error);
            const No = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`\`❌\`・Une erreur est survenue en essayant de bannir ${user}`);
            interaction.editReply({ embeds: [No], ephemeral: true });
        }
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName("user").setDescription("Veuillez mentionner un utilisateur").setRequired(true))
            .addStringOption(o => o.setName("raison").setDescription("Raison du bannissement").setRequired(true));
    }
};
