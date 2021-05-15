module.exports = (client, error, message) => {
    switch (error) {
        case 'NotPlaying':
            message.channel.send(`Tidak ada music yang berjalan !`);
            break;
        case 'NotConnected':
            message.channel.send(`Kamu tidak berada divoice channel !`);
            break;
        case 'UnableToJoin':
            message.channel.send(`**[1] - Bad Request**`);
            break;
        default:
            message.channel.send(`**[0] - Error !!**`);
    }
};