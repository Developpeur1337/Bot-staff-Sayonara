const { Events } = require("discord.js");

async function execute(client, message) {
    if (!client || !message || !message.guild || message.author?.bot) return;
    if (!message.author) return;
    client.deletedMessages = client.deletedMessages || new Map();

    const ID = message.author.id;

    client.deletedMessages.set(message.channel.id, {
        content: message.content || "Message vide ou non textuel",
        ID: ID,
        timestamp: message.createdTimestamp,
    });
}

function MessageDelete(client, channelId) {
    return client.deletedMessages?.get(channelId) || null;
}

module.exports = {
    name: Events.MessageDelete,
    execute,
    MessageDelete,
};
