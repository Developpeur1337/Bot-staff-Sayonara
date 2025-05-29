const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../db/db.json");

module.exports = {
    name: "listperms",
    description: "Affiche la liste des rôles assignés à chaque niveau de permission.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 4,
    async executeSlash(client, interaction) {
        let db;
        try {
            db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        } catch (error) {
            return interaction.reply({ content: `\`❌\` Erreur lors du chargement de la base de données.`, ephemeral: true });
        }

        const rolePermissions = db.rolePermissions || {};
        const embed = new EmbedBuilder()
            .setTitle("Liste des permissions :")
            .setColor(0xFF0000)
            .setTimestamp();

        for (let Permission = 1; Permission <= 9; Permission++) {
            const rolesAtPermission = Object.keys(rolePermissions)
                .filter(roleId => rolePermissions[roleId] === Permission)
                .map(roleId => `<@&${roleId}>`);
                
            embed.addFields({
                name: `Permissions ${Permission} :`,
                value: rolesAtPermission.length > 0 ? rolesAtPermission.join("\n") : "Aucun rôle",
                inline: false
            });
        }

        interaction.reply({ embeds: [embed] });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}
