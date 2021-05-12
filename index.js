const Discord = require('discord.js');
const config = require('./config.json');
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const client = new Discord.Client();

client.once('ready', () => {
    console.log("Price name is up");
    getStats();
    getVolume();

});

const getStats = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://0x.org/zrx/staking");
    await new Promise(r => setTimeout(r, 2000));
    const staking = await page.$$eval(
        "#app > main:first-of-type > div:nth-of-type(2) > div:first-of-type > div",
        stats => stats.map(stat => stat.innerHTML.match(/<div class=".+?">(.+?)<\/div><div class=".+?">(.+?)<\/div>/))
    );
    console.log(staking);
    await browser.close();
    setTimeout(function () {
        staking.forEach(element => {
            console.log("numbers are: " + element[1]);
            console.log("name is: " + element[2]);
        });
    }, 1000);

};

const getVolume = async () => {
    const volume = {
        day: ((await (await fetch("https://api.0xtracker.com/stats/network?period=day")).json()).tradeVolume / 1000000).toFixed(1),
        all: ((await (await fetch("https://api.0xtracker.com/stats/network?period=all")).json()).tradeVolume / 1000000000).toFixed(2)
    };
    console.log(volume);
};


client.login(config["zrx-staked-token"]);
