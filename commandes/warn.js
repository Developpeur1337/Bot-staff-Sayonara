const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');

const sanctionsPath = path.join(__dirname, '../db/sanctions.json');

const loadSanctions = () => fs.existsSync(sanctionsPath) ? JSON.parse(fs.readFileSync(sanctionsPath, 'utf-8')) : { mute: [], warn: {} };
const saveSanctions = (sanctions) => fs.writeFileSync(sanctionsPath, JSON.stringify(sanctions, null, 4));

module.exports = {
    name: "warn",
    description: "Avertir un membre",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    mod: true,
    Permission: 1,
    async executeSlash(client, interaction) {
        const raison = interaction.options.getString("raison");
        const logChannel = interaction.guild.channels.cache.get(client.config.logs.warn);
        const member = interaction.guild.members.cache.get(interaction.options.getUser("user")?.id);
        const sanctions = loadSanctions();

        if (!member) return interaction.reply({ content: `\`❌\`・Aucun membre trouvé pour \`${interaction.options.getUser("user") || "rien"}\``, ephemeral: true });
        if (client.perms.owners.includes(member.id)) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`\`❌\`・Vous ne pouvez pas warn ${member} car il est owner.`).setColor(0xFF0000)], ephemeral: true });

        sanctions.warn = sanctions.warn || {};
        sanctions.warn[member.id] = sanctions.warn[member.id] || [];
        sanctions.warn[member.id].push({ raison, date: new Date().toISOString(), by: interaction.user.id });
        saveSanctions(sanctions);

        const embedSuccess = new EmbedBuilder().setColor(0x00FF00).setDescription(`\`✅\`・${member} a été averti avec comme raison : \`${raison}\``);
        await interaction.reply({ embeds: [embedSuccess] });

        const logEmbed = new EmbedBuilder()
            .setTitle("**__Avertissement d'un membre__**")
            .setColor(0xFF0000)
            .addFields(
                { name: `⮕ **__Utilisateur averti : __**`, value: `${member}` },
                { name: `⮕ **__Raison : __**`, value: `${raison}` },
                { name: `⮕ **__Averti par : __**`, value: `${interaction.user}` }
            )
            .setTimestamp();

        if (logChannel) logChannel.send({ embeds: [logEmbed] });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName("user").setDescription("Veuillez mentionner un utilisateur").setRequired(true))
            .addStringOption(o => o.setName("raison").setDescription("Veuillez entrer une raison").setRequired(true));
    }
};
