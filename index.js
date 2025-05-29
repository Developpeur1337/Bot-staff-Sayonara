const Discord = require("discord.js");
const colors = require("colors");
const fs = require("node:fs");

const { Client, GatewayIntentBits, Partials, ActivityType } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
    ],
    restTimeOffset: 0,
    failIfNotExists: false,
    presence: {
        activities: [{
            name: `Prefix: /`,
            type: ActivityType.Streaming,
            url: "https://www.twitch.tv/developpeur1337"
        }],
        status: "online"
    },
    allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false
    }
});


client.config = require("./config.json");
client.perms = require('./db/db.json');
client.mutes = new Map();
client.login(client.config.token);
client.commands = new Discord.Collection();
client.save = () => fs.writeFileSync('./db/db.json', JSON.stringify(client.perms, null, 4))

const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
    }
}

const commandFiles = fs.readdirSync("./commandes").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commandes/${file}`);
    client.commands.set(command.name, command);
}

async function errorHandler(error) {
    if (error.code == 10062) return; // Unknown interaction
    if (error.code == 50013) return; // Missing Permissions
    if (error.code == 40060) return; // Interaction has already been acknowledged

    console.log(`[ERROR] ${error}`.red);
};
process.on("unhandledRejection", errorHandler);
process.on("uncaughtException", errorHandler);
