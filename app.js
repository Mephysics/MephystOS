const fs = require('fs');
const Discord = require('discord.js');
require('dotenv').config(); 
const prefix = process.env.PREFIX;
const moment = require('moment-timezone');

const SnakeGame = require('snakecord');
const weather = require('weather-js');

const packagejson = require('./package.json');
const botversion = packagejson.version;

const { NovelCovid } = require('novelcovid');
const track = new NovelCovid();

const client = new Discord.Client();
client.commands = new Discord.Collection();
const reportcooldown = new Set();

const { Player } = require("discord-player");
const player = new Player(client);
client.player = player;

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
const events = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
}

for (const file of events) {
    const event = require(`./src/events/${file}`);
    client.player.on(file.split(".")[0], event.bind(null, client));
}

client.on('ready', () => {

    const presencelist = [
        `Version ${botversion} | ${prefix}help`, 
        `${process.env.DISCORDLINK}| ${prefix}help`,
        `Memakai masker`,
        `Mencuci tangan`,
        `Menjaga jarak`,
    ];
    
    let i = 0;
    setInterval(() => {
        const index = Math.floor(i);
        client.user.setActivity(presencelist[index], { type: 'LISTENING', url: 'https://www.twitch.tv/discord' });
        i = i + 1;
        console.log(presencelist[index]);
        if (i === presencelist.length) i = i - presencelist.length;
    }, 5000);
});

client.on('message', async message => {

    let indonesiaTime = moment().tz('Asia/Jakarta').format();
    setInterval(() => { 
        indonesiaTime -= 2000;
    });

    const jammenitdetikindonesia = indonesiaTime.slice(11, -6)
    const tanggalindonesia = indonesiaTime.slice(0, -15)

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'report') {
        if (message.guild) return message.react('❎') || message.channel.send('Declined')
        if (!args[0]) return message.channel.send(`**[2] - ERR_TIDAK_ADA_ARGS**`);
        if (reportcooldown.has(message.author.id)) {
            return message.channel.send('**Kamu telah mengirimkan laporan hari ini, silahkan kirim laporan lain besok.**') && message.react('❎')
        } else {
            reportcooldown.add(message.author.id);
            setTimeout(() => {
                reportcooldown.delete(message.author.id);
            }, 86400000);
        }

        const reportargs = args.join(" ");
        const channeltarget = client.channels.cache.get('547076285872996353');
        channeltarget.send(reportargs)
        message.react('✅');

        let channellog = client.channels.cache.get(process.env.CHANNELLOGID);
        let emoji = client.emojis.cache.get('835987657892298802');
        let channellogembed = new Discord.MessageEmbed()

        .setColor('#ff0000')
        .setAuthor(`Bug Report`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096}))
        .setDescription(`**${emoji} - Laporan Bug**\n\nNama : **${message.author.username}**\nReport ID : **${message.id}**\nBug : **${reportargs}**`)
        .setTimestamp()

        channellog.send(channellogembed)
    }

    if (!message.content.startsWith(prefix) || message.author.bot) return;
    if (!message.guild) return;

    if (command === 'time') {
        message.channel.send(`**${jammenitdetikindonesia} ${tanggalindonesia}**`);
    }

    if (command === 'uptime') {

        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        const uptimeembed = new Discord.MessageEmbed()

        .setColor('#89e0dc')
        .setTitle('Uptime')
        .setThumbnail(`${message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setDescription(`bot ini telah aktif selama **${days} hari, ${hours} jam, ${minutes} menit, dan ${seconds} detik**.`)
        .setFooter(`Direquest oleh ${message.author.username}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setTimestamp()

        message.channel.send(uptimeembed);
    }
    
    if (command === 'ping') {
        message.channel.send(`Pong !! \`${Math.round(client.ws.ping)}ms.\` Latensi \`${Date.now() - message.createdTimestamp}ms.\``);
    }
    
    if (command === 'userinfo') {
        const userinfoembed = new Discord.MessageEmbed()
        
        .setColor('#89e0dc')
        .setTitle(`${message.author.username} Info`)
        .setThumbnail(`${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setDescription(`Username : **${message.author.username}**\n\nNickname : **${message.member.nickname}**\n\nID : **${message.author.id}**\n\nTanggal dibuatnya akun : **${message.author.createdAt}**\n\nTanggal join server : **${message.guild.joinedAt}**\n\nRole : **<@&${message.member.roles.highest.id}>**\n\nStatus : **${message.author.presence.status}**\n\nCustom status : **${message.member.presence.activities[0]}**`)
        .setFooter(`Direquest oleh ${message.author.username}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setTimestamp()
        
        message.channel.send(userinfoembed);
    }

    if (command === 'serverinfo') {
        const serverinfoembed = new Discord.MessageEmbed()
        
        .setColor('#89e0dc')
        .setTitle('Info server')
        .setThumbnail(`${message.guild.iconURL({format : 'png', dynamic : true, size : 4096})}`)
        .setDescription(`Nama server : **${message.guild.name}**\n\nID server : **${message.guild.id}**\n\nRegion server : **${message.guild.region}**\n\nJumlah member : **${message.guild.memberCount}**\n\nServer dibuat pada tanggal : **${message.guild.createdAt}**`)
        .setFooter(`Info server ${message.guild.name}`, `${message.guild.iconURL({format : 'png', dynamic : true, size : 4096})}`)
        .setTimestamp()
        
        message.channel.send(serverinfoembed);
    }

    if (command === 'link') {
        const serverid = client.guilds.cache.get('332472484572037124');
        const embedmessage = new Discord.MessageEmbed()

        .setColor('#89e0dc')
        .setTitle(`${serverid.name} Server`)
        .setThumbnail(message.guild.iconURL({format : 'png', dynamic : true, size : 4096}))
        .setDescription(`**${process.env.DISCORDLINK}**`)
        .setFooter(`Direquest oleh ${message.author.username}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setTimestamp()

        embedmessage.addField('Nama', serverid.name, true)
        .addField('Owner', serverid.owner, true)
        .addField('Member', serverid.memberCount, true)

        message.channel.send(embedmessage)
    }

    if (command === 'avatar') {
        const user = message.mentions.users.first() || message.author;
        const avatarembed = new Discord.MessageEmbed()

        .setColor('#89e0dc')
        .setTitle('Avatar')
        .setDescription(`Avatarnya ${user.username}`)
        .setImage(`${user.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setFooter(`foto profilmu bagus juga yaa ${user.username}`, `${user.avatarURL({format : 'png', dynamic : true, size : 4096})}`)

        message.channel.send(avatarembed);
    }

    if (command === 'color') {
        const Mod = message.member.guild.roles.cache.get('815283420044197888');
        if (!message.member.roles.cache.get('817813111339352064')) return message.channel.send('Kamu tidak memiliki izin untuk menggunakan command ini');
        if (!args[0]) return message.channel.send(`**[2] - ERR_TIDAK_ADA_ARGS**`);
        Mod.edit({
            color: args[0]
        })
        message.channel.send('**Success !!**');
    }

    if (command === 'name') {
        const Mod = message.member.guild.roles.cache.get('815283420044197888');
        if (!message.member.roles.cache.get('817813111339352064')) return message.channel.send('Kamu tidak memiliki izin untuk menggunakan command ini');
        if (!args[0]) return message.channel.send(`**[2] - ERR_TIDAK_ADA_ARGS**`);
        Mod.edit({
            name: args.join(" ")
        })
        message.channel.send('**Success !!**');
    }
    
    if (command === 'aboutbot') { 
        const aboutbotembed = new Discord.MessageEmbed()
        
        .setColor('#89e0dc')
        .setTitle('BOT Version')
        .setThumbnail(`${message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setDescription(`Nama : **${message.client.user.username}**\n\nVersi : **${botversion}**\n\nKeyword : **/**\n\nDev : **Mephysics, Zensanz**\n\nBahasa : **JavaScript**\n\nPackage : **Discord.js**\n\nInvite to server : **https://mephysics.live**`)
        .setFooter(`Direquest oleh ${message.author.username}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setTimestamp()
        message.channel.send(aboutbotembed);
    }

    if (command === 'say') {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('Kamu tidak memiliki izin untuk menggunakan command ini');
        const channel = client.channels.cache.get(args[0])
        if (!client.channels.cache.get(args[0])) return message.channel.send('Error');
        if (!args[1]) return message.channel.send('**Berikan args**');

        channel.send(args.slice(1).join(" "));
        message.react('✅');
    }

    if (command === 'owner') {
        if (message.author.id !== process.env.OWNERID) return message.channel.send('**Kamu tidak memiliki izin untuk menggunakan command ini**');
        const channel = client.channels.cache.get(args[0])
        if (!client.channels.cache.get(args[0])) return message.channel.send('**Berikan channel**');
        if (!args[1]) return message.channel.send('**Berikan args**')

        channel.send(args.slice(1).join(" "));
        message.react('✅')
    }

    if (command === 'mute') {
        if (!message.member.hasPermission('MANAGE_ROLES')) return message.channel.send('Kamu tidak memiliki izin untuk menggunakan command ini');
        const muterole = message.guild.roles.cache.get('577108844610715665');
        const mentionsmember = message.mentions.members.first();
        if (mentionsmember.roles.cache.get('577108844610715665')) return message.channel.send('**User masih dimute**');
        mentionsmember.roles.add(muterole);
        message.channel.send(`**<@${mentionsmember.id}>** telah dimute oleh **<@${message.author.id}>**`);
        
        let channellog = client.channels.cache.get(process.env.CHANNELLOGID);
        let channellogembed = new Discord.MessageEmbed()

        .setColor('#ff0000')
        .setAuthor(`Member Muted`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096}))
        .setDescription(`**⚠️ - ${mentionsmember.nickname} dimuted oleh ${message.member.nickname}**`)
        .setTimestamp()

        channellog.send(channellogembed)
    }

    if (command === 'unmute') {
        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send('Kamu tidak memiliki izin untuk menggunakan command ini');
        const muterole = message.guild.roles.cache.get('577108844610715665');
        const mentionsmember = message.mentions.members.first();
        if (!mentionsmember.roles.cache.get('577108844610715665')) return message.channel.send('**User tidak dimute**');
        mentionsmember.roles.remove(muterole);
        message.channel.send(`**<@${mentionsmember.id}>** telah diunmute oleh **<@${message.author.id}>**`);

        let channellog = client.channels.cache.get(process.env.CHANNELLOGID);
        let channellogembed = new Discord.MessageEmbed()

        .setColor('#00ff00')
        .setAuthor(`Member Unmuted`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096}))
        .setDescription(`**⚠️ - ${mentionsmember.nickname} diunmuted oleh ${message.member.nickname}**`)
        .setTimestamp()

        channellog.send(channellogembed)
    }

    if (command === 'warn') {
        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send('Kamu tidak memiliki izin untuk menggunakan command ini');
        const mentionsuser = message.mentions.members.first();
        const mentionsavatar = message.mentions.users.first();
        if (!message.mentions.users.first()) return message.channel.send('**Mention user sebelum memberikan alasan\n\n```/warn @Mephysto SPAM```**')
        const warnembed = new Discord.MessageEmbed()

        .setColor('#f82c2c')
        .setTitle(`**${mentionsuser.username} Warning**`)
        .setThumbnail(`${mentionsavatar.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setDescription(`${mentionsuser} **berhasil diwarn dengan alasan:**\`\`\`diff\n- ${args.slice(1).join(" ")}\`\`\``)
        .setFooter(`Diwarn oleh ${message.author.username}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setTimestamp()

        message.channel.send(warnembed);

        let channellog = client.channels.cache.get(process.env.CHANNELLOGID);
        let channellogembed = new Discord.MessageEmbed()

        .setColor('#ff0000')
        .setAuthor(`${mentionsuser.nickname} Warning`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096}))
        .setDescription(`**⚠️ - ${mentionsuser.nickname} telah diwarn oleh ${message.member.nickname}**`)
        .setTimestamp()

        channellog.send(channellogembed)
    }

    if (command === 'kick') {
        if (!message.member.roles.cache.get('390481400576475136')) return message.channel.send('Kamu tidak memiliki izin untuk menggunakan command ini');
        const user = message.mentions.users.first();
        if (user) {
          const member = message.guild.members.resolve(user);
          if (member) {
            member.kick(`Telah dikick dari server oleh ${message.author.username}`)
              .then(() => {
                  if (args[1]) return message.channel.send(`**${user.tag} Telah dikick dikarenakan ${args.slice(1).join(" ")}**`)
                  if (!args[1]) return message.channel.send(`**${user.tag} Telah dikick**`);
              })
          } else {
            message.channel.send('**User tidak ditemukan**');
          }
        } else {
          message.channel.send('**Mention user untuk melakukan kick**');
        }
    }

    if (command === 'ban') {
        if (!message.member.roles.cache.get('390481400576475136')) return message.channel.send('Kamu tidak memiliki izin untuk menggunakan command ini');
        const user = message.mentions.users.first();
        if (user) {
          const member = message.guild.members.resolve(user);
          if (member) {
            member.ban({
                days: 0
              })
              .then(() => {
                if (args[1]) return message.channel.send(`**${user.tag} Telah diban permanen dikarenakan ${args.slice(1).join(" ")}**`)
                if (!args[1]) return message.channel.send(`**${user.tag} Telah diban permanen**`);
              });
          } else {
            message.channel.send('**User tidak ditemukan**');
          }
        } else {
          message.channel.send('**Mention user untuk melakukan ban**');
        }
    }

    if (command === 'register') {
        message.delete({timeout: 5000});
        if (!message.member.roles.cache.get('544095817531654164')) return message.channel.send('**Kamu sudah teregistrasi**')
        if (message.member.roles.cache.get('390482000877977600')) return message.channel.send('**Kamu sudah teregistrasi**')
        const register = message.guild.roles.cache.get('390482000877977600');
        const unregister = message.guild.roles.cache.get('544095817531654164');
        const channel = client.channels.cache.get('544569999294201866');
        const user = message.author.id
        const emoji = client.emojis.cache.get('835987657892298802');
        const embednickname = new Discord.MessageEmbed() .setColor('#00ff00') .setAuthor(`${message.member.nickname} Joined`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096})) .setDescription(`**${emoji} - ${message.member.nickname} telah join ke server**`) .setTimestamp()
        
        message.member.roles.add(register);
        let channellog = client.channels.cache.get(process.env.CHANNELLOGID)
        if (message.member.nickname) return channellog.send(embednickname)
        let channellogembed = new Discord.MessageEmbed()

        .setColor('#00ff00')
        .setAuthor(`${message.author.username} Joined`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096}))
        .setDescription(`**${emoji} - ${message.author.username} telah join ke server**`)
        .setTimestamp()

        channellog.send(channellogembed)
        message.channel.send(`**Selesai, anda sudah teregistrasi...\nSelamat datang <@${user}> kamu sudah bisa chat di ${channel} setelah membaca pesan ini**`)
        .then(message => {
            message.delete({timeout: 5000})
        })
        message.member.roles.remove(unregister);
    }

    if(command === 'play') {
        if (!message.member.voice.channel) return message.channel.send(`Kamu tidak divoice channel !`);
        if (!args[0]) return message.channel.send(`Berikan args untuk memulai lagu !`);
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`Kamu tidak divoice channel yang sama !`);
        client.player.play(message, args.join(" "), true)
    }

    if (command === 'skip') {
        if (!message.member.voice.channel) return message.channel.send(`Kamu tidak divoice channel !`);
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`Kamu tidak divoice channel yang sama !`);
        if (!client.player.getQueue(message)) return message.channel.send('Tidak ada music yang berjalan !');
        client.player.skip(message);
        message.channel.send('Lagu telah diskip !')
    }

    if (command === 'stop') {
        if (!message.member.voice.channel) return message.channel.send(`Kamu tidak divoice channel !`);
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`Kamu tidak divoice channel yang sama !`);
        if (!client.player.getQueue(message)) return message.channel.send('Tidak ada music yang berjalan !');
        client.player.stop(message);
        message.channel.send('Lagu telah distop !')
    }

    if (command === 'pause') {
        if (!message.member.voice.channel) return message.channel.send(`Kamu tidak divoice channel !`);
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`Kamu tidak divoice channel yang sama !`);
        if (client.player.getQueue(message).paused) return message.channel.send(`Music sedang dipause !`);
        client.player.pause(message);
        message.channel.send(`Lagu ${client.player.getQueue(message).playing.title} dihentikan !`);
    }

    if (command === 'resume') {
        if (!message.member.voice.channel) return message.channel.send(`Kamu tidak divoice channel !`);
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`Kamu tidak divoice channel yang sama !`);
        if (!client.player.getQueue(message)) return message.channel.send('Tidak ada music yang berjalan !');
        if (!client.player.getQueue(message).paused) return message.channel.send(`Lagu sedang berlangsung !`);
        client.player.resume(message);
        message.channel.send(`Lagu ${client.player.getQueue(message).playing.title} dilanjutkan !`);
    }

    if (command === 'volume') {
        if (!message.member.voice.channel) return message.channel.send(`Kamu tidak divoice channel !`);
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`Kamu tidak divoice channel yang sama !`);
        if (!client.player.getQueue(message)) return message.channel.send('Tidak ada music yang berjalan !');
        if (!args[0] || isNaN(args[0]) || args[0] === 'string') return message.channel.send(`Berikan nomor untuk merubah volume !`);
        if (Math.round(parseInt(args[0])) < 1 || Math.round(parseInt(args[0])) > 100) return message.channel.send(`berikan nomor 1 - 100 !`);
        client.player.setVolume(message, parseInt(args[0]));
        message.channel.send(`Volume telah diubah ke **${parseInt(args[0])}%** !`);
    }

    if (command === 'queue') {
        if (!message.member.voice.channel) return message.channel.send(`Kamu tidak divoice channel !`);
        client.player.getQueue(message)
        const queue = client.player.getQueue(message);
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`Kamu tidak divoice channel yang sama !`);
        if (!client.player.getQueue(message)) return message.channel.send('Tidak ada music yang berjalan !');
        message.channel.send(`**Music Queue**\nSedang berlangsung : **${queue.playing.title}** | **${queue.playing.author}**\n\n` + (queue.tracks.map((track, i) => {
            return `**#${i + 1}** - **${track.title}** | **${track.author}** (direquest oleh : **${track.requestedBy.username}**)`
        }).slice(0, 5).join('\n') + `\n\n${queue.tracks.length > 5 ? `dan **${queue.tracks.length - 5}** lagu lain...` : `Playlist **${queue.tracks.length}**...`}`));
    }

    if (command === 'repeat') {
        if (!message.member.voice.channel) return message.channel.send(`Kamu tidak divoice channel !`);
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`Kamu tidak divoice channel yang sama !`);
        if (!client.player.getQueue(message)) return message.channel.send('Tidak ada music yang berjalan !');
        if (args.join(" ").toLowerCase() === 'queue') {
            if (client.player.getQueue(message).loopMode) {
                client.player.setLoopMode(message, false);
                return message.channel.send(`Loop dimatikan !`);
            } else {
                client.player.setLoopMode(message, true);
                return message.channel.send(`Loop dinyalakan !`);
            }
        } else {
            if (client.player.getQueue(message).repeatMode) {
                client.player.setRepeatMode(message, false);
                return message.channel.send(`Loop dimatikan !`);
            } else {
                client.player.setRepeatMode(message, true);
                return message.channel.send(`Loop dinyalakan !`);
            }
        }
    }

    if (command === 'nowplaying') {
        if (!message.member.voice.channel) return message.channel.send(`Kamu tidak divoice channel !`);
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`Kamu tidak divoice channel yang sama !`);
        if (!client.player.getQueue(message)) return message.channel.send('Tidak ada music yang berjalan !');
        const track = client.player.nowPlaying(message);
        message.channel.send({
            embed: {
                color: 'RED',
                author: { name: track.title },
                footer: { text: `${prefix}nowplaying` },
                fields: [
                    { name: 'Channel', value: track.author, inline: true },
                    { name: 'Requested by', value: track.requestedBy.username, inline: true },
                    { name: 'Volume', value: client.player.getQueue(message).volume, inline: true },

                    { name: 'Progress bar', value: client.player.createProgressBar(message, { timecodes: true }), inline: true }
                ],
                thumbnail: { url: track.thumbnail },
                timestamp: new Date(),
            },
        });
    }

    if (command === 'tictactoe') {
        if (!message.mentions.members.first()) return message.channel.send('**[MultiplayerRequire]** Tag user lain untuk bermain tictactoe')
        const { tictactoe } = require("reconlx");
        new tictactoe({
         message: message,
            player_two: message.mentions.members.first(),
        });
    }

    if (command === 'hangman') {
        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send('Kamu tidak memiliki izin untuk menggunakan command ini');
        const { hangman } = require("reconlx");
        const hang = new hangman({
            message: message,
            word: args.slice(1).join(" "),
            client: client,
            channelID: args[0],
        });
        hang.start();
    }

    if (command === 'snake') {
        const snakeGame = new SnakeGame({
            title: 'Maen uler',
            color: "GREEN",
            timestamp: true,
            gameOverTitle: "Kalah"
        });
        snakeGame.newGame(message)
    }

    if (command === 'weather') {
        let kota = args.join(" ");
        let degreeType = 'C';

        await weather.find({search: kota, degreeType: degreeType}, function(err, result) {
            if(err) console.log(err);
            console.log(JSON.stringify(result, null, 2));
            if (!kota) return message.channel.send('**[2] - ERR_TIDAK_ADA_ARGS**')
            if (err || result === undefined || result.length === 0) return message.channel.send('**Kota tidak ditemukan**')
            
            let current = result[0].current;
            let location = result[0].location;

            const cuaca = new Discord.MessageEmbed()

            .setColor('#89e0dc')
            .setTitle('Cuaca')
            .setThumbnail(current.imageUrl)
            .setDescription('Powered by weather-js')
            .setFooter(`Direquest oleh ${message.author.username}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
            .setTimestamp()

            cuaca.addField('Nama', location.name, true)
            .addField('Cuaca', current.skytext, true)
            .addField('Suhu', current.temperature, true)
            .addField('Kelembapan', current.humidity, true)
            .addField('Tanggal', current.date, true)
            .addField('Kecepatan angin', current.windspeed, true)

            message.channel.send(cuaca);
        });
    }

    if (command === 'lock') {
        let everyone = message.member.guild.roles.cache.get('332472484572037124')
        message.member.voice.channel.updateOverwrite(everyone, {
            CONNECT: false
        })
        message.channel.send('**Locked !!**');
        let channellog = client.channels.cache.get(process.env.CHANNELLOGID);
        const embednickname = new Discord.MessageEmbed() .setColor('#ff0000') .setAuthor(`Channel Lock`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096})) .setDescription(`**🔓 - Channel ${message.member.voice.channel.name} Locked**`) .setFooter(`Locked by ${message.member.nickname}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`) .setFooter(`Locked by ${message.member.nickname}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`) .setTimestamp()
        if (message.member.nickname) return channellog.send(embednickname)
        let channellogembed = new Discord.MessageEmbed()

        .setColor('#ff0000')
        .setAuthor(`Channel Lock`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096}))
        .setDescription(`**🔒 - Channel ${message.member.voice.channel.name} Locked**`)
        .setFooter(`Locked by ${message.author.username}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setTimestamp()

        channellog.send(channellogembed)
    }

    if (command === 'unlock') {
        let everyone = message.member.guild.roles.cache.get('332472484572037124')
        message.member.voice.channel.updateOverwrite(everyone, {
            CONNECT: true
        })
        message.channel.send('**Unlocked !!**');
        let channellog = client.channels.cache.get(process.env.CHANNELLOGID);
        const embednickname = new Discord.MessageEmbed() .setColor('#00ff00') .setAuthor(`Channel Unlock`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096})) .setDescription(`**🔓 - Channel ${message.member.voice.channel.name} Unlocked**`) .setFooter(`Unlocked by ${message.member.nickname}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`) .setTimestamp()
        if (message.member.nickname) return channellog.send(embednickname)
        let channellogembed = new Discord.MessageEmbed()

        .setColor('#00ff00')
        .setAuthor(`Channel Unlock`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096}))
        .setDescription(`**🔓 - Channel ${message.member.voice.channel.name} Unlocked**`)
        .setFooter(`Unlocked by ${message.author.username}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setTimestamp()

        channellog.send(channellogembed)
    }

    if (command === 'bitrate') {
        const bitrateargs = args[0]
        if (!args[0] || isNaN(args[0]) || args[0] === 'string') return message.channel.send(`**[2] - ERR_TIDAK_ADA_ARGS**`);
        if (Math.round(parseInt(args[0])) < 8000 || Math.round(parseInt(args[0])) > 96000) return message.channel.send(`berikan nomor 8000 - 96000 !`);
        message.member.voice.channel.setBitrate(bitrateargs)
        message.channel.send(`Bitrate telah diubah ke **${bitrateargs}** !`);

        let channellog = client.channels.cache.get(process.env.CHANNELLOGID);
        let emoji = client.emojis.cache.find(emoji => emoji.name === "gear");
        const embednickname = new Discord.MessageEmbed() .setColor('#00ff00') .setAuthor(`Bitrate Changed`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096})) .setDescription(`**${emoji} - Bitrate room (${message.member.voice.channel.name} ) telah diubah ke ${bitrateargs}**`) .setFooter(`Diubah oleh ${message.member.nickname}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        if (message.member.nickname) return channellog.send(embednickname)
        let channellogembed = new Discord.MessageEmbed()

        .setColor('#00ff00')
        .setAuthor(`Bitrate Changed`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096}))
        .setDescription(`**${emoji} - Bitrate room (${message.member.voice.channel.name} ) telah diubah ke ${bitrateargs}**`)
        .setFooter(`Diubah oleh ${message.author.username}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setTimestamp()

        channellog.send(channellogembed)
    }

    if (command === 'purge') {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('Kamu tidak memiliki izin untuk menggunakan command ini')
        const jumlahmsg = args[0];
        if (!jumlahmsg || isNaN(jumlahmsg) || jumlahmsg === 'array') return message.channel.send('Berikan angka');
        message.channel.bulkDelete(jumlahmsg)
        message.channel.send(`**Menghapus ${jumlahmsg} Pesan !!**`)
        .then(message => {
            message.delete({timeout: 5000})
        })

        let channellog = client.channels.cache.get(process.env.CHANNELLOGID);
        let channelname = message.channel.name;
        let channellogembed = new Discord.MessageEmbed()

        .setColor('#eed202')
        .setAuthor(`Bulk Delete`, message.client.user.avatarURL({format : 'png', dynamic : true, size : 4096}))
        .setDescription(`**⚠️ - ${jumlahmsg} pesan telah dihapus di ${channelname}**`)
        .setTimestamp()

        channellog.send(channellogembed)
    }

    if (command === 'totalcorona') {
        const data = await track.all()
        const coronaembed = new Discord.MessageEmbed()

        .setColor('#ff0000')
        .setTitle('Corona Stats')
        .setThumbnail()
        .setDescription(`**Total kasus corona\n\n Kasus** : **${data.cases}**\n Meninggal : **${data.deaths}**\n Sembuh : **${data.recovered}**\n\n**Total penambahan kasus hari ini**\n\n Kasus : **${data.todayCases}**\n Meninggal : **${data.todayDeaths}**`)
        .setFooter(`Direquest oleh ${message.author.username}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setTimestamp()

        message.channel.send(coronaembed);
    }

    if (command === 'corona') { 
        if (!args.length) return message.channel.send(`**[2] - ERR_TIDAK_ADA_ARGS**`);
        const coronacountries = await track.countries(args.join(' '))
        const countriesembed = new Discord.MessageEmbed()

        .setColor('#ff0000')
        .setTitle(`Corona Stats ${coronacountries.country}`)
        .setThumbnail()
        .setDescription(`**Total kasus corona di ${coronacountries.country}**\n\n Kasus : **${coronacountries.cases}**\n Meninggal : **${coronacountries.deaths}**\n Sembuh : **${coronacountries.recovered}**\n\n**Total penambahan kasus hari ini**\n\n Kasus : **${coronacountries.todayCases}**\n Meninggal : **${coronacountries.todayDeaths}**`)
        .setFooter(`Direquest oleh ${message.author.username}`, `${message.author.avatarURL({format : 'png', dynamic : true, size : 4096})}`)
        .setTimestamp()

        message.channel.send(countriesembed);
    }

    if (command === 'debug') {
        if (message.author.id !== process.env.OWNERID) return message.channel.send('**Debug hanya bisa dilakukan oleh Dev**');
        console.log(`${Math.round(client.ws.ping)}ms. Latensi ${Date.now() - message.createdTimestamp}ms.`);
        message.react('✅');
    }

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('**[0] - Error !!**');
    }

});

client.login(process.env.CLIENT_TOKEN);