const fs = require("fs"), path = require("path"), { SlashCommandBuilder, EmbedBuilder } = require("discord.js"), dbPath = path.join(__dirname, "../db/db.json");

module.exports = {
  name: "unowner",
  description: "Retirer le status d'owner d'un utilisateur.",
  aliases: [],
  permissions: [],
  guildOwnerOnly: false,
  botOwnerOnly: true,
  botOwner: false,
  async executeSlash(client, interaction) {
    const logChannel = interaction.guild.channels.cache.get(client.config.logs.unowner);
    const user = interaction.options.getUser("user");

    let db;
    try {
      db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    } catch {
      return interaction.reply({ content: "❌ Erreur de lecture de la base de données.", ephemeral: true });
    }

    db.owners = db.owners || [];
    if (!db.owners.includes(user.id)) return interaction.reply({ content: `\`❌\`・${user} n'est pas owner`, ephemeral: true });

    db.owners = db.owners.filter(id => id !== user.id);
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    } catch {
      return interaction.reply({ content: "❌ Erreur lors de l'écriture dans la base de données.", ephemeral: true });
    }

    const rep = new EmbedBuilder().setDescription(`${user} n'est plus owner !`).setColor(0xFF0000);
    const log = new EmbedBuilder().setTitle("**__Révocation d'un owner bot__**").setColor(0xFF0000).addFields(
      { name: "⮕ **__Utilisateur démuni**", value: `${user}` },
      { name: "⮕ **__Déminu par__**", value: `${interaction.user}` }
    ).setTimestamp();

    await interaction.reply({ embeds: [rep], ephemeral: true });
    if (logChannel) logChannel.send({ embeds: [log] });
  },

  get data() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName("user").setDescription("Veuillez mentionner un utilisateur").setRequired(true));
  }
};
