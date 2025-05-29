const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "unlock",
    description: "Déverrouille un salon.",
    mod: true,
    Permission: 8,
    async executeSlash(client, interaction) {
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        const raison = interaction.options.getString("raison");
        const bl = ["annonce", "news", "important", "giveaway", "salle", "notifications", "règlement", "réglement", "verification", "vérification"]; 

        if (!channel) {return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription(`\`❌\` Le salon spécifié n'existe pas ou n'a pas pu être trouvé.`)], ephemeral: true });}
        if (bl.some(keyword => channel.name.toLowerCase().includes(keyword))) {return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription(`\`❌\` Le salon ${channel} ne peut pas être déverrouillé car il contient un mot-clé interdit.`)], ephemeral: true });}
        if (channel.permissionsFor(interaction.guild.roles.everyone).has(PermissionsBitField.Flags.SendMessages)) {return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription(`\`❌\` Le salon ${channel} est déjà déverrouillé.`)], ephemeral: true });}

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
            interaction.reply({ 
                embeds: [new EmbedBuilder().setColor(0x00FF00).setDescription(`\`✅\` Le salon ${channel} a été déverrouillé pour la raison : \`${raison}\``)] 
            });
        } catch (error) {
            interaction.reply({ 
                embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription(`\`❌\` Je n'ai pas pu déverrouiller le salon ${channel}.`)], 
                ephemeral: true 
            });
        }
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => 
                o.setName("raison")
                 .setDescription("Veuillez entrer une raison")
                 .setRequired(true)
            )
            .addChannelOption(o => 
                o.setName("channel")
                 .setDescription("Veuillez sélectionner un salon")
                 .setRequired(false)
            );
    }
};
