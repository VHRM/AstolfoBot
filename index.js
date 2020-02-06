// INCLUDES
const Discord = require('discord.js');
const sqlite3 = require('sqlite3');
const nhentai = require('nhentai-js');
const {prefix, token} = require('./config.json');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// CONFIGURATION AND CONNECTIONS
const db = new sqlite3.Database('./main.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to database');
});

const client = new Discord.Client();


// CLASSES

const messageEmbed = new Discord.RichEmbed().setColor('#F895E4').setTitle('');

// FUNCTIONS
async function getDoujin(index){
    try{
        const doujin = await nhentai.getDoujin(index);
        return doujin.link;
    }
    catch(err){
        console.error(err);
    }
}

async function searchDoujin(query){
    try{
        const queue = await nhentai.search(query);
        if(queue !== undefined){
            const pagina = Math.trunc((Math.random() * queue.lastPage)+1);
            const paginaContent = await nhentai.search(query, pagina);
            const tamanhoPagina = Object.keys(paginaContent.results).length;
            const posDoujin = Math.trunc((Math.random() * tamanhoPagina));
            const index = paginaContent.results[posDoujin].bookId;
            const doujin = await getDoujin(index);
            return doujin;
        }
    }catch(err){
        console.error(err);
    }
}

async function getRandom(){
    return await searchDoujin('english');
}


client.once('ready', () => {
    console.log('¡Bot is Ready!');
});

rl.on('line', (input) => {
    eval(input);
})

client.on('message', async message => {
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
        });
    }

    if(command === "adicionar" || command === "add"){
        const usuario = "<@"+message.author.id+">";
        const mangaURL = args.pop();
        const mangaNome = args.join(' ');
        db.run('INSERT INTO favoritos (nome, user, link) VALUES( ?, ?, ?)', [mangaNome,message.author.id,mangaURL], err => {
            if (err)
                throw(err);
            else{
                messageEmbed.setTitle("Adicionado");
                messageEmbed.setDescription("O manga: " + mangaNome + " foi adicionado à lista de favoritos de " + usuario);
                message.channel.send(messageEmbed);
            }
        });
    }

    if(command === "remover"|| command === "rmv"){
        const usuario = "<@"+message.author.id+">";
        const mangaNome = args.join(' ');
        db.run('DELETE FROM favoritos WHERE nome = ?', [mangaNome], err =>{
            if (err)
            throw(err);
            else{
                messageEmbed.setTitle("Removido");
                messageEmbed.setDescription("O manga: " + mangaNome + " foi removido da lista de favoritos de " + usuario);
                message.channel.send(messageEmbed);
            }
        });
    }

    if(command === "random"){
        const usuario = "<@"+message.author.id+">";
        (async () => {
            const doujin = await getRandom();
            message.channel.send(usuario+"\n"+doujin);
        })();
    }

    if(command === "get"){
        if(args[0] === '177013')    message.reply("https://nhentai.net/g/265918/");
        else{
            const index = args[0];
            const doujin = await getDoujin(index);
            message.reply(doujin);
        }
    }

    if(command === "rsearch"){
        const query = args.join(' ');
        if(query){
            const doujin = await searchDoujin(query);
            message.reply(doujin);
        }
        else{
            message.reply("A requisição precisa conter um parametro de busca");
        }
        
    }
});



client.login(token);