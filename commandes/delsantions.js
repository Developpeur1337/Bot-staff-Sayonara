const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const sanctionsPath = path.join(__dirname, "../db/sanctions.json");

function loadSanctions() {
    if (!fs.existsSync(sanctionsPath)) return { mute: [], warn: {} };
    try {
        const data = JSON.parse(fs.readFileSync(sanctionsPath, "utf-8"));
        return {
            mute: Array.isArray(data.mute) ? data.mute : [],
            warn: typeof data.warn === "object" && data.warn !== null ? data.warn : {}
        };
    } catch {
        return { mute: [], warn: {} };
    }
}

function saveSanctions(sanctions) {
    fs.writeFileSync(sanctionsPath, JSON.stringify(sanctions, null, 4));
}

module.exports = {
    name: "delsanction",
    description: "Supprimer une sanction d'un membre.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 6,
    async executeSlash(client, interaction) {
        const user = interaction.options.getUser("user");
        const type = interaction.options.getString("type");
        const sanctions = loadSanctions();

        let userSanctions;
        if (type === "mute") {
            userSanctions = sanctions.mute.filter(s => s.userId === user.id);
        } else if (type === "warn") {
            userSanctions = sanctions.warn[user.id] || [];
        } else {
            return interaction.reply({ content: "`❌` Type de sanction invalide.", ephemeral: true });
        }

        if (!userSanctions || !userSanctions.length) {
            return interaction.reply({ content: `\`❌\` Aucun ${type} trouvé pour ${user}.`, ephemeral: true });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_sanction_${interaction.id}`)
            .setPlaceholder("Choisissez une sanction à supprimer")
            .addOptions(
                userSanctions.map((s, i) => ({
                    label: `Raison: ${s.raison}`,
                    value: i.toString(),
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);
        const embed = new EmbedBuilder()
            .setTitle("**__Sélection d'une sanction à supprimer__**")
            .setDescription(`Veuillez sélectionner une sanction à supprimer pour ${user}.`)
            .setColor(0xFFA500)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: 3,
            time: 60000
        });

        collector.on("collect", async i => {
            if (i.customId !== `select_sanction_${interaction.id}`) return;

            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: "`❌` Vous ne pouvez pas interagir avec ce menu.", ephemeral: true });
            }

            const index = parseInt(i.values[0]);
            const del = userSanctions.splice(index, 1)[0];

            if (type === "mute") {
                sanctions.mute = sanctions.mute.filter(s => !(s.userId === del.userId && s.timestamp === del.timestamp));
            } else if (type === "warn") {
                sanctions.warn[user.id] = userSanctions;
                if (!sanctions.warn[user.id].length) delete sanctions.warn[user.id];
            }

            saveSanctions(sanctions);

            const confirmé = new EmbedBuilder()
                .setTitle("\`✔️\`・Sanction supprimée")
                .setColor(0x00FF00)
                .addFields(
                    { name: "Sanction retirée :", value: `\`${del.raison}\`` },
                    { name: "Sanctionné le :", value: `<t:${Math.floor(new Date(del.timestamp || del.date).getTime() / 1000)}:F>` },
                    { name: "Sanctionné par :", value: `<@${del.by || del.authorId}>` }
                )
                .setFooter({ text: `Utilisateur : ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            await i.reply({ embeds: [confirmé], ephemeral: true });

            const logEmbed = new EmbedBuilder()
                .setTitle("**__Suppression d'une sanction__**")
                .setColor(0xff0000)
                .addFields(
                    { name: "Utilisateur :", value: `${user}` },
                    { name: "Sanction retirée :", value: `Raison: ${del.raison}` },
                    { name: "Retirée par :", value: `${interaction.user}` }
                )
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.get(client.config.logs.warn);
            if (logChannel) logChannel.send({ embeds: [logEmbed] });

            collector.stop();
        });

        collector.on("end", collected => {
            if (!collected.size) {
                interaction.followUp({ content: "`❌` Temps écoulé pour sélectionner une sanction.", ephemeral: true });
            }
        });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName("user").setDescription("Mentionnez un utilisateur").setRequired(true))
            .addStringOption(o =>
                o.setName("type")
                    .setDescription("Type de sanction")
                    .setRequired(true)
                    .addChoices(
                        { name: "Mute", value: "mute" },
                        { name: "Warn", value: "warn" }
                    )
            );
    },
};
