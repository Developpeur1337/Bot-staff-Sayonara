const fs = require("fs");
const path = require("path");
const ms = require("ms");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const sanctionsPath = path.join(__dirname, "../db/sanctions.json");
const raisonDurations = { "propos_deplaces": "10m", "troll": "5m", "insultes": "10m", "insultes_intensif": "15m", 
    "soundboard": "20m", "spam": "15m", "racisme_islamophobie_homophobie": "40m", "publicite": "15m", "dc_double_compte": "45m" };
const raisonLabels = { "propos_deplaces": "Propos déplacés", "troll": "Troll", "insultes": "Insultes", "insultes_intensif": "Insultes (intensif)",
    "soundboard": "Soundboard", "spam": "Spam", "racisme_islamophobie_homophobie": "Racisme, islamophobie, homophobie", 
    "publicite": "Publicité", "dc_double_compte": "Dc (Double Compte)" };

module.exports = {
    name: "tempmute", 
    description: "Mute un membre avec une raison pré-définie.",
    mod: true,
    Permission: 3,
    async executeSlash(client, interaction) {
        const user = interaction.options.getUser("user"), member = interaction.guild.members.cache.get(user.id), raison = interaction.options.getString("raison");
        if (!member) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`Aucun membre trouvé pour \`${user.username}\``).setColor(0xFF0000)], ephemeral: true });
        if (member.isCommunicationDisabled()) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`\`❌\`・${member} est déjà mute`).setColor(0xFF0000)], ephemeral: true });
        if (!raisonDurations[raison]) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`\`❌\`・La raison spécifiée n'est pas valide.`).setColor(0xFF0000)], ephemeral: true });
        if (client.perms.owners.includes(member.id)) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`\`❌\`・Vous ne pouvez pas mute ${member} car il est owner.`).setColor(0xFF0000)], ephemeral: true });
        if (member.permissions.has("Administrator")) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`\`❌\`・Vous ne pouvez pas mute ${member} car il est administrateur.`).setColor(0xFF0000)], ephemeral: true });

        const executor = interaction.guild.members.cache.get(interaction.user.id);
        if (member.roles.highest.position >= executor.roles.highest.position) {
            return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`\`❌\`・Vous ne pouvez pas mute ${member} car il a un rôle égal ou supérieur au vôtre.`).setColor(0xFF0000)], ephemeral: true });
        }

        const temps = raisonDurations[raison];
        try {
            await member.timeout(ms(temps), raison);
            await member.send(`\`⛔\`・Vous avez été **mute** pour une durée de ${temps} sur \`${interaction.guild.name}\` pour la raison suivante : \`${raisonLabels[raison]}\`.`);
            await interaction.reply({ embeds: [new EmbedBuilder().setDescription(`\`✅\`・${member} a été mute pour ${temps} avec comme raison : \`${raisonLabels[raison]}\``).setColor(0x00FF00)] });

            const logChannel = interaction.guild.channels.cache.get(client.config.logs.mute);
            if (logChannel) await logChannel.send({ embeds: [new EmbedBuilder().setTitle("**__Mute d'un membre__**").setColor(0xFF0000)
                .addFields(
                    { name: `⮕ **__Utilisateur mute : __**`, value: `${member}` },
                    { name: `⮕ **__Raison : __**`, value: `${raisonLabels[raison]}` },
                    { name: `⮕ **__Unmute dans :__**`, value: `<t:${Math.floor((Date.now() + ms(temps)) / 1000)}:R>` },
                    { name: `⮕ **__Mute par : __**`, value: `${interaction.user}` }
                ).setTimestamp()] });

            let sanctionsData = fs.existsSync(sanctionsPath) ? JSON.parse(fs.readFileSync(sanctionsPath, "utf8")) : { mute: [] };
            sanctionsData.mute.push({ userId: member.id, authorId: interaction.user.id, raison: raisonLabels[raison], timestamp: new Date().toISOString(), duration: temps });
            fs.writeFileSync(sanctionsPath, JSON.stringify(sanctionsData, null, 2), "utf8");

            setTimeout(() => member.send(`\`🔰\`・Vous avez de nouveau la permission de parler sur \`${interaction.guild.name}\`.`), ms(temps));
        } catch (error) {
            console.error("Erreur lors du mute ou de l'enregistrement de la sanction :", error);
            return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`\`❌\`・Je n'ai pas pu mute ${member}`).setColor(0xFF0000)], ephemeral: true });
        }
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName("user").setDescription("Veuillez mentionner un utilisateur").setRequired(true))
            .addStringOption(o => o.setName("raison").setDescription("Veuillez choisir une raison").setRequired(true)
                .addChoices(...Object.entries(raisonLabels).map(([value, name]) => ({ name: `${name} - ${raisonDurations[value]}`, value })) ));
    }
};
