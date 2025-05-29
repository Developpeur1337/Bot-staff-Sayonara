const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const dbPath = path.join(__dirname, "../db/db.json");

module.exports = {
    name: "help",
    description: "Affiche les commandes disponibles.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    Permission: 1,
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    },

    async executeSlash(client, interaction) {
        let db;
        try {
            db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        } catch (error) {
            console.error("Erreur lors du chargement de la base de données:", error);
            return interaction.reply({ content: `\`❌\` Erreur interne lors du chargement des permissions.`, ephemeral: true });
        }

        const userRoles = interaction.member.roles.cache;
        let PermissionsLevel = 0;

        if (client.config.owners?.includes(interaction.user.id) || client.perms.owners?.includes(interaction.user.id)) {
            PermissionsLevel = "Owner";
        } else {
            userRoles.forEach(role => {
                const rolePermissionLevel = db.rolePermissions?.[role.id];
                if (rolePermissionLevel && rolePermissionLevel > PermissionsLevel) {
                    PermissionsLevel = rolePermissionLevel;
                }
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("Page d'Accueil des Commandes")
            .setImage('https://cdn.discordapp.com/attachments/1346342352431874100/1377641758032396308/YwCQsww.gif')
            .setDescription(`Sélectionnez une permission pour voir les commandes disponibles.\n\nVotre niveau de permission actuel : \`${PermissionsLevel}\``)
            .setColor(0x2B2D31)
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`help_select_${interaction.user.id}`) 
            .setPlaceholder('Choisissez une permission')
            .addOptions([
                { label: 'Permissions 1', value: 'perm_1', description: 'Commandes disponibles pour la permission 1' },
                { label: 'Permissions 2', value: 'perm_2', description: 'Commandes disponibles pour la permission 2' },
                { label: 'Permissions 3', value: 'perm_3', description: 'Commandes disponibles pour la permission 3' },
                { label: 'Permissions 4', value: 'perm_4', description: 'Commandes disponibles pour la permission 4' },
                { label: 'Permissions 5', value: 'perm_5', description: 'Commandes disponibles pour la permission 5' },
                { label: 'Permissions 6', value: 'perm_6', description: 'Commandes disponibles pour la permission 6' },
                { label: 'Permissions 7', value: 'perm_7', description: 'Commandes disponibles pour la permission 7' },
                { label: 'Permissions 8', value: 'perm_8', description: 'Commandes disponibles pour la permission 8' },
                { label: 'Permissions 9', value: 'perm_9', description: 'Commandes disponibles pour la permission 9' },
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);
        
        await interaction.reply({ embeds: [embed], components: [row] });
    },

    async handleSelect(client, interaction) {
        if (!interaction.customId.startsWith('help_select_') || interaction.user.id !== interaction.customId.split('_')[2]) {
            return interaction.reply({ content: `\`❌\` Vous ne pouvez pas changer les pages d'aide des autres.`, ephemeral: true });
        }

        const selectedValue = interaction.values[0];
        let commandsList = '';

        const allCommands = await interaction.client.application.commands.fetch().catch(() => null);

        client.commands.forEach(command => {
            if (command.Permission && selectedValue === `perm_${command.Permission}`) {
                const slashCommand = allCommands?.find(cmd => cmd.name === command.name);
                if (slashCommand) {
                    commandsList += `</${command.name}:${slashCommand.id}> - ${command.description}\n`;
                } else {
                    commandsList += `\`/${command.name}\` - ${command.description}\n`;
                }
            }
        });


        const embed = new EmbedBuilder()
            .setTitle(`Commandes pour ${selectedValue.replace('perm_', 'Permission ')} :`)
            .setDescription(commandsList || 'Aucune commande disponible pour ce niveau de permission.')
            .setColor(0x00AE86)
            .setTimestamp();

        await interaction.update({ embeds: [embed], components: [interaction.message.components[0]] }).catch(err => {
            console.error("Erreur lors de la mise à jour de l'interaction:", err);
            return interaction.reply({ content: `\`❌\` Une erreur est survenue lors de la mise à jour.`, ephemeral: true });
        });
    }
};
