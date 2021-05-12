const Discord = require('discord.js');
const {token, prefix} = require('./config.json');
const client = new Discord.Client();
client.once('ready', () => {
    console.log("Price name is up")
});


client.login(token);
