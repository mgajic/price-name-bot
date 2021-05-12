const Discord = require('discord.js');
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const clientVolume = new Discord.Client();
const clientZRXStaked = new Discord.Client();
const clientEpochEnd = new Discord.Client();
const clientEpoch = new Discord.Client();
clientVolume.login(process.env.BOT_TOKEN_VOLUME);
clientZRXStaked.login(process.env.BOT_TOKEN_ZRX_STAKED);
clientEpoch.login(process.env.BOT_TOKEN_EPOCH);

clientZRXStaked.once('ready', () => {
    console.log("Price name is up");
    getVolume();
    getStats()
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
    let epochEnds;
    let epochRewards;
    let zrxStaked;
    staking.forEach(element => {
        console.log("numbers are: " + element[1]);
        console.log("name is: " + element[2]);
        if (element[1]) {
            if (element[2].toLowerCase().includes("zrx")) {
                zrxStaked = element[1];
            } else if (element[2].toLowerCase().includes("epoch ends")) {
                epochEnds = element[1];
            } else if (element[2].toLowerCase().includes("epoch rewards")) {
                epochRewards = element[1].replace("ETH", "Ξ");
            }
        }
    });

    clientZRXStaked.guilds.cache.forEach(function (value, key) {
        try {
            console.log("Updating zrx staked");
            value.members.cache.get(clientZRXStaked.user.id).setNickname(zrxStaked);
        } catch (e) {
            console.log(e);
        }
    });

    clientEpoch.guilds.cache.forEach(function (value, key) {
        try {
            console.log("Updating epoch");
            value.members.cache.get(clientEpoch.user.id).setNickname(epochRewards + " | " + epochEnds);
        } catch (e) {
            console.log(e);
        }
    });

    clientZRXStaked.user.setActivity("ZRX staked", {type: 'WATCHING'});
    clientEpoch.user.setActivity("Epoch rewards | Epoch ends in", {type: 'WATCHING'});

};

const getVolume = async () => {
    const volume = {
        day: ((await (await fetch("https://api.0xtracker.com/stats/network?period=day")).json()).tradeVolume / 1000000).toFixed(1),
        all: ((await (await fetch("https://api.0xtracker.com/stats/network?period=all")).json()).tradeVolume / 1000000000).toFixed(2)
    };
    console.log(volume);
    const volumeData = `$${volume.day}m | $${volume.all}b`;
    clientVolume.guilds.cache.forEach(function (value, key) {
        try {
            console.log("Updating total volume");
            value.members.cache.get(clientVolume.user.id).setNickname(volumeData);
        } catch (e) {
            console.log(e);
        }
    });
    clientVolume.user.setActivity("0X VOLUME [24H | ALL-TIME]", {type: 'WATCHING'});

};


setInterval(function () {
    getStats();
    getVolume();
}, 360 * 1000);



