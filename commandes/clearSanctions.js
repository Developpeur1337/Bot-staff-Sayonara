const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const sanctionsPath = path.join(__dirname, '../db/sanctions.json');

const loadSanctions = () => fs.existsSync(sanctionsPath) ? JSON.parse(fs.readFileSync(sanctionsPath, 'utf-8')) : { mute: [], warn: {} };
const saveSanctions = sanctions => fs.writeFileSync(sanctionsPath, JSON.stringify(sanctions, null, 4));

module.exports = {
    name: "clearsanctions",
    description: "Supprimer toutes les sanctions d'un utilisateur.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: true,
    botOwner: false,
    Permission: 7,
    async executeSlash(client, interaction) {
        const member = interaction.guild.members.cache.get(interaction.options.getUser("user")?.id);
        const sanctions = loadSanctions();

        if (!member) {
            return interaction.reply({ content: `\`❌\`・Aucun membre trouvé pour \`${interaction.options.getUser("user") || "rien"}\``, ephemeral: true });
        }

        if (!sanctions.mute.length && !(sanctions.warn[member.id]?.length)) {
            return interaction.reply({ content: `\`❌\`・${member} n'a pas de sanctions à supprimer.`, ephemeral: true });
        }

        if (sanctions.warn[member.id]) {
            delete sanctions.warn[member.id];
        }

        sanctions.mute = sanctions.mute.filter(sanction => sanction.userId !== member.id);
        saveSanctions(sanctions);

        const embedYes = new EmbedBuilder().setColor(0x00FF00).setDescription(`\`✅\`・Toutes les sanctions de ${member} ont été supprimées.`);
        await interaction.reply({ embeds: [embedYes], ephemeral: true });
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName("user").setDescription("Veuillez mentionner un utilisateur").setRequired(true));
    }
};
