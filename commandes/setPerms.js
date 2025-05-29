const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../db/db.json");

module.exports = {
    name: "setperm",
    description: "Assigne un niveau de permission (1 à 9) à un rôle.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false, 
    botOwnerOnly: true,
    botOwner: false,
    async executeSlash(client, interaction) {
        const role = interaction.options.getRole("role");
        const permissionLevel = interaction.options.getInteger("level");

        if (!role) {
            return interaction.reply({ content: `\`❌\`・Aucun rôle trouvé pour cette commande.`, ephemeral: true });
        }
        if (permissionLevel < 1 || permissionLevel > 9) {
            return interaction.reply({ content: `\`❌\`・Le niveau de permission doit être compris entre 1 et 9.`, ephemeral: true });
        }

        let db;
        try {
            db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        } catch (error) {
            return interaction.reply({ content: `\`❌\`・Impossible de charger la base de données.`, ephemeral: true });
        }

        if (!db.rolePermissions) db.rolePermissions = {};

        db.rolePermissions[role.id] = permissionLevel;

        try {
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
        } catch (error) {
            return interaction.reply({ content: `\`❌\`・Échec de la sauvegarde des permissions dans la base de données.`, ephemeral: true });
        }

        interaction.reply({ content: `\`✅\`・Le rôle ${role} a été assigné au niveau de permission ${permissionLevel}.`, ephemeral: true });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addRoleOption(option => 
                option.setName("role")
                .setDescription("Le rôle auquel assigner un niveau de permission")
                .setRequired(true))
            .addIntegerOption(option => 
                option.setName("level")
                .setDescription("Niveau de permission (1 à 9)")
                .setRequired(true));
    }
}
