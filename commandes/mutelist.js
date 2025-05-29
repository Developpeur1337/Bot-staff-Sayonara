const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "mutelist",
    description: "Affiche la liste des membres mute du serveur",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 4,
    async executeSlash(client, interaction) {
        const mutes = interaction.guild.members.cache.filter(m => m.isCommunicationDisabled());
        const muteArray = Array.from(mutes.values());

        const pageSize = 10;
        const pages = [];

        for (let i = 0; i < muteArray.length; i += pageSize) {
            const fdp = muteArray.slice(i, i + pageSize)
                .map(member => `${member} | \`${member.id}\` | <t:${parseInt(member.communicationDisabledUntilTimestamp / 1000, 10)}:R>`)
                .join('\n');
            pages.push(fdp);
        }

        if (pages.length === 0) {
            pages.push("Aucun membre mute");
        }

        let page = 0;

        const embed = new EmbedBuilder()
            .setTitle(`Liste des membres mute (${mutes.size}) : `)
            .setColor(0xFF0000)
            .setDescription(pages[page])
            .setTimestamp()
            .setFooter({ text: `Page ${page + 1} sur ${pages.length}` });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Précédent')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Suivant')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pages.length === 1 || page === pages.length - 1)
            );

        try {
            const message = await interaction.reply({ embeds: [embed], components: [row], ephemeral: false, fetchReply: true });

            const collector = message.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: "Vous ne pouvez pas utiliser ces boutons.", ephemeral: true });
                }

                if (i.customId === 'previous') page--;
                else if (i.customId === 'next') page++;

                embed.setDescription(pages[page])
                    .setFooter({ text: `Page ${page + 1} sur ${pages.length}` });

                row.components[0].setDisabled(page === 0);
                row.components[1].setDisabled(page === pages.length - 1);

                try {
                    await i.update({ embeds: [embed], components: [row] });
                } catch (error) {
                    console.error("Une erreur s'est produite lors de la mise à jour du message :", error);
                }
            });

            collector.on('end', async () => {
                row.components.forEach(button => button.setDisabled(true));
                try {
                    await message.edit({ components: [row] });
                } catch (error) {
                    console.error("Une erreur s'est produite lors de la modification du message :", error);
                }
            });
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
