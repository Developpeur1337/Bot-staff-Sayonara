const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../db/db.json");

module.exports = {
    name: "resetperms",
    description: "Réinitialise complètement les permissions.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: true,
    botOwner: false,
    async executeSlash(client, interaction) {
        let db;
        try {
            db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        } catch (error) {
            return interaction.reply({ content: `\`❌\` Erreur lors du chargement de la base de données.`, ephemeral: true });
        }

        db.rolePermissions = {};
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        
        return interaction.reply({ content: `\`✅\` Toutes les permissions ont été réinitialisées.`, ephemeral: true });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}
