// INCLUDES
const Discord = require('discord.js');
const sqlite3 = require('sqlite3');
const {prefix, token} = require('./config.json');


// CONFIGURATION AND CONNECTIONS
const db = new sqlite3.Database('./main.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to database');
});

const client = new Discord.Client();


// CLASSES

const messageEmbed = new Discord.RichEmbed()
    .setColor('#F895E4')
    .setTitle('');

// FUNCTIONS


client.once('ready', () => {
    console.log('¡Bot is Ready!');
});


client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === "favoritos" || command === "favs"){
            const usuario = "<@"+message.author.id+">";
            messageEmbed.setTitle("Favoritos:");
            messageEmbed.setDescription("Favoritos de " + usuario);
            message.channel.send(messageEmbed);
            db.each('SELECT * FROM favoritos WHERE user = ?', [message.author.id], (err, row) => {
                if(err)
                    throw(err);
                    messageEmbed.setTitle(row.nome);
                    messageEmbed.setDescription(row.link);
                    message.channel.send(messageEmbed);
        })
    }
}
);

client.login(token);