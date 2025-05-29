const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const dbPath = path.join(__dirname, "../db/db.json");

module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(client, interaction) {
        if (!interaction.guild) return;

        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            let db;
            try {
                db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
            } catch (error) {
                console.error("Erreur lors du chargement de la base de données:", error);
                return interaction.reply({ content: `\`❌\` Erreur interne lors de la vérification des permissions.`, ephemeral: true });
            }

            if (
                command.mod && interaction.channel.id !== client.config.ChannelCmds && !client.config.owners.includes(interaction.user.id) && !client.perms.owners.includes(interaction.user.id)
            ) {
                const embed = new EmbedBuilder()
                    .setDescription(`\`❌\` Pour ce type de commande, veuillez utiliser ce salon : <#${client.config.ChannelCmds}>.`)
                    .setColor(0xFF0000)
            
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            

            if (command.Permission) {
                const userRoles = interaction.member.roles.cache;
                let PermissionsLevel = 0;

                userRoles.forEach(role => {
                    const rolePermPermission = db.rolePermissions?.[role.id];
                    if (rolePermPermission && rolePermPermission > PermissionsLevel) {
                        PermissionsLevel = rolePermPermission;
                    }
                });

                if (PermissionsLevel < command.Permission && !client.config.owners.includes(interaction.user.id) && !client.perms.owners.includes(interaction.user.id)) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription(`\`❌\`・Permissions de niveau : \`${command.Permission}\` requise.`);
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }

            if (command.permissions) {
                if (command.botOwnerOnly && !client.config.owners.includes(interaction.user.id)) {
                    return interaction.reply({ content: `\`❌\`・Vous n'avez pas les permissions d'utiliser cette commande.`, ephemeral: true });
                }

                if (command.guildOwnerOnly && interaction.member.guild.ownerId != interaction.user.id && !client.config.owners.includes(interaction.user.id)) {
                    return interaction.reply({ content: `\`❌\`・Vous n'avez pas les permissions d'utiliser cette commande.`, ephemeral: true });
                }
                if (command.botOwner){
                    if (!client.config.owners.includes(interaction.user.id) && !client.perms.owners.includes(interaction.user.id)) return interaction.reply({
                        content: `\`❌\`・Vous n'avez pas les permissions d'utiliser cette commande`,
                        ephemeral: true
                    });
                }

                const authorPerms = interaction.channel.permissionsFor(interaction.user) || interaction.member.permissions;
                if (!authorPerms.has(command.permissions) && !client.config.owners.includes(interaction.user.id)) {
                    return interaction.reply({ content: `\`❌\`・Vous n'avez pas les permissions d'utiliser cette commande.`, ephemeral: true });
                }
            }

            await command.executeSlash(client, interaction);
            console.log("[CMD-S]", `${interaction.guild.name} | ${interaction.channel.name} | ${interaction.user.tag} | ${command.name}`);
        }

        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('help_select_')) {
            const helpCommand = client.commands.get('help');
            if (helpCommand) {
                helpCommand.handleSelect(client, interaction);
            } else {
                console.error("Commande 'help' non trouvée.");
            }
        }
    }
};
