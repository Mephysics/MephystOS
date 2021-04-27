module.exports = (client, message, track) => {
    message.channel.send(`Memutar lagu **${track.title}** di **${message.member.voice.channel.name}** ...`);
};