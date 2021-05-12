const Discord = require('discord.js');
const {token, token1, token2, token3, prefix} = require('./config.json');
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const clientVolume = new Discord.Client();
const clientZRXStaked = new Discord.Client();
const clientEpochEnd = new Discord.Client();
const clientEpochReward = new Discord.Client();
clientVolume.login(token);
clientZRXStaked.login(token1);
clientEpochEnd.login(token2);
clientEpochReward.login(token3);

clientVolume.once('ready', () => {
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
    await browser.close();
    setTimeout(function () {
        staking.forEach(element => {
            console.log("numbers are: " + element[1]);
            console.log("name is: " + element[2]);
            if (element[1]) {
                if (element[2].toLowerCase().includes("zrx")) {
                    clientZRXStaked.user.setActivity(
                        element[1], {type: 'PLAYING'});
                } else if (element[2].toLowerCase().includes("epoch ends")) {
                    clientEpochEnd.user.setActivity(
                        element[1], {type: 'PLAYING'});
                } else if (element[2].toLowerCase().includes("epoch rewards")) {
                    clientEpochReward.user.setActivity(
                        element[1], {type: 'PLAYING'});
                }
            }
        });
    }, 1000);

};

const getVolume = async () => {
    const volume = {
        day: ((await (await fetch("https://api.0xtracker.com/stats/network?period=day")).json()).tradeVolume / 1000000).toFixed(1),
        all: ((await (await fetch("https://api.0xtracker.com/stats/network?period=all")).json()).tradeVolume / 1000000000).toFixed(2)
    };
    console.log(volume);
    const volumeData = `$${volume.day}m | $${volume.all}b`;
    clientVolume.user.setActivity(
        volumeData, {type: 'PLAYING'});
};


setInterval(function () {
    getStats();
    getVolume();
}, 360 * 1000);



