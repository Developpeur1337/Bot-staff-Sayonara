const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const fs = require('fs');
const path = require('path');

const loadSanctions = () => {
    const sanctionsPath = path.resolve(__dirname, '../db/sanctions.json');
    return fs.existsSync(sanctionsPath) ? JSON.parse(fs.readFileSync(sanctionsPath, 'utf-8')) : { mute: [], warn: {} };
};

const WarnEmbed = (member, warns) => {
    const embed = new EmbedBuilder()
        .setTitle(`**__Sanctions de ${member.user.tag}__**`)
        .setColor(0xFFA500)
        .setTimestamp();

    if (warns.length > 0) {
        warns.forEach((warn, index) => {
            embed.addFields({
                name: `__Avertissement ${index + 1}__`,
                value: `**Raison :** \`${warn.raison}\`\n**Date :** ${new Date(warn.date).toLocaleString()}\n**Par :** <@${warn.by}>`
            });
        });
    } else {
        embed.addFields({ name: `__Avertissements__`, value: `Aucun avertissement trouvé pour ${member}.` });
    }

    return embed;
};

const MuteEmbed = (member, mutes) => {
    const embed = new EmbedBuilder()
        .setTitle(`**__Sanctions - Mutes pour ${member.user.tag}__**`)
        .setColor(0xFF0000)
        .setTimestamp();

    if (mutes.length > 0) {
        mutes.forEach((mute, index) => {
            embed.addFields({
                name: `__Mute #${index + 1}__`,
                value: `**Raison :** \`${mute.raison}\`\n**Durée :** \`${mute.duration}\`\n**Date :** ${new Date(mute.timestamp).toLocaleString()}\n**Par :** <@${mute.authorId}>`
            });
        });
    } else {
        embed.addFields({ name: `__Mutes__`, value: `Aucun mute trouvé pour ${member}.` });
    }

    return embed;
};

module.exports = {
    name: "sanctions",
    description: "Lister les avertissements et mutes d'un membre.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 7,

    async executeSlash(client, interaction) {
        const member = interaction.guild.members.cache.get(interaction.options.getUser("user")?.id);
        if (!member) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription(`\`❌\`・Aucun membre trouvé pour \`${interaction.options.getUser("user") || "rien"}\``)],
                ephemeral: true
            });
        }

        const sanctions = loadSanctions();
        const userId = member.id;
        const Warns = sanctions.warn[userId] || [];
        const Mutes = sanctions.mute.filter(m => m.userId === userId);

        const warnEmbed = WarnEmbed(member, Warns);
        const muteEmbed = MuteEmbed(member, Mutes);

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('warn').setLabel('Warns').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('mute').setLabel('Mutes').setStyle(ButtonStyle.Danger)
        );

        const message = await interaction.reply({ embeds: [warnEmbed], components: [buttons], fetchReply: true });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 5 * 60 * 1000,
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id)
                return i.reply({ content: `❌ Tu ne peux pas utiliser ces boutons.`, ephemeral: true });

            if (i.customId === 'warn') {
                await i.update({ embeds: [warnEmbed], components: [buttons] });
            } else if (i.customId === 'mute') {
                await i.update({ embeds: [muteEmbed], components: [buttons] });
            }
        });

        collector.on('end', async () => {
            const disabledButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('warn').setLabel('Warns').setStyle(ButtonStyle.Primary).setDisabled(true),
                new ButtonBuilder().setCustomId('mute').setLabel('Mutes').setStyle(ButtonStyle.Danger).setDisabled(true)
            );

            await message.edit({ components: [disabledButtons] });
        });
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName("user").setDescription("Veuillez mentionner un utilisateur").setRequired(true));
    }
};
