const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ms = require('ms');

module.exports = {
    name: "mute",
    description: "Mute un membre avec une raison libre.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botOwner: false,
    mod: true,
    Permission: 5,
    async executeSlash(client, interaction) {
        const temps = interaction.options.getString("temps");
        const raison = interaction.options.getString("raison");
        const logChannel = interaction.guild.channels.cache.get(client.config.logs.mute);
        const member = interaction.guild.members.cache.get(interaction.options.getUser("user")?.id);

        const t = temps.replaceAll("j", "d");

        if (!member) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription(`\`❌\`・Aucun membre trouvé pour \`${interaction.options.getUser("user") || "rien"}\``);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (member.isCommunicationDisabled()) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription(`\`❌\`・${member} est déjà mute`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (isNaN(ms(t))) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription(`\`❌\`・\`${temps}\` n'est pas un temps valide.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const arg = ["s", "m", "h", "d"];
        const argg = arg.some(unit => t.includes(unit));

        if (!argg) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription(`\`❌\`・\`${temps}\` n'est pas un temps valide.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (ms(t) > 1000 * 60 * 60 * 24 * 28 || ms(t) < 0) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription(`\`❌\`・Le temps doit être supérieur à 0 secondes et inférieur à 28 jours`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (client.perms.owners.includes(member.id)) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription(`\`❌\`・Vous ne pouvez pas mute ${member}`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        member.timeout(ms(t), raison)
            .then(() => {
                const successEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription(`\`✅\`・${member} a été mute pour ${temps} avec comme raison : \`${raison}\``);
                interaction.reply({ embeds: [successEmbed] });

                const logEmbed = new EmbedBuilder()
                    .setTitle("**__Mute d'un membre__**")
                    .setColor(0xFF0000)
                    .addFields({ name: `⮕ **__Utilisateur mute : __**`, value: `${member}` })
                    .addFields({ name: `⮕ **__Raison : __**`, value: `\`${raison}\`` })
                    .addFields({ name: `⮕ **__Unmute dans :__**`, value: `<t:${parseInt((Date.now() + ms(t)) / 1000, 10)}:R>` })
                    .addFields({ name: `⮕ **__Mute par : __**`, value: `${interaction.user}` })
                    .setTimestamp();

                if (logChannel) logChannel.send({ embeds: [logEmbed] });

                member.send(`\`⛔\`・Vous avez été **mute** sur \`${interaction.guild.name}\` pour une durée de ${temps} avec comme raison : \`${raison}\`.`);
            })
            .catch(() => {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription(`\`❌\`・Je n'ai pas pu mute ${member}`);
                interaction.reply({ embeds: [embed] });
            });

        setTimeout(() => {
            member.send(`\`🔰\`・Vous avez de nouveaux la permissions de parler sur \`${interaction.guild.name}\`.`);
        }, ms(t));
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName("user").setDescription("Veuillez mentionner un utilisateur").setRequired(true))
            .addStringOption(o => o.setName("temps").setDescription("Veuillez entrer un temps").setRequired(true))
            .addStringOption(o => o.setName("raison").setDescription("Veuillez entrer une raison").setRequired(true));
    }
};
