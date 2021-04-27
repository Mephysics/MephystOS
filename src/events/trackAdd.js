module.exports = (client, message, queue, track) => {
    message.channel.send(`**${track.title}** telah ditambahkan !`);
};