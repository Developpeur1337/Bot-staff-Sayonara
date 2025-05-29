const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../db/db.json");

module.exports = {
    name: "delperm",
    description: "Retire un rôle d'une permission spécifique.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: true,
    botOwner: false,
    async executeSlash(client, interaction) {
        const role = interaction.options.getRole("role");
        const Permissionn = interaction.options.getInteger("permission");

        let db;
        try {
            db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        } catch {
            return interaction.reply({ content: `\`❌\` Erreur lors du chargement de la base de données.`, ephemeral: true });
        }

        db.rolePermissions = db.rolePermissions || {};

        if (db.rolePermissions[role.id] === Permissionn) {
            delete db.rolePermissions[role.id];
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            return interaction.reply({ content: `\`✅\` Le rôle <@&${role.id}> a été retiré de la permission ${Permissionn}.`, ephemeral: true });
        }
        return interaction.reply({ content: `\`❌\` Le rôle <@&${role.id}> n'est pas associé à la permission ${Permissionn}.`, ephemeral: true });
    },
    
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addRoleOption(option => option.setName("role").setDescription("Le rôle à retirer").setRequired(true))
            .addIntegerOption(option => option.setName("permission").setDescription("Le niveau de permission (1 à 9)").setRequired(true));
    }
};
