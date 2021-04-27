module.exports = (client, message, queue, playlist) => {
    message.channel.send(`**${playlist.title} telah ditambahkan ${playlist.tracks.length} !**`);
};