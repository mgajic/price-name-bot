const Discord = require('discord.js');
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const clientVolume = new Discord.Client();
const clientZRXStaked = new Discord.Client();
const clientEpochReward = new Discord.Client();
const clientEpochEnd = new Discord.Client();
clientVolume.login(process.env.BOT_TOKEN_VOLUME);
clientZRXStaked.login(process.env.BOT_TOKEN_ZRX_STAKED);
clientEpochReward.login(process.env.BOT_TOKEN_EPOCH);
clientEpochEnd.login(process.env.BOT_TOKEN_EPOCH_END);

const getStats = async () => {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    const page = await browser.newPage();
    await page.goto("https://0x.org/zrx/staking");
    await new Promise(r => setTimeout(r, 2500));
    const staking = await page.$$eval(
        "#app > main:first-of-type > div:first-of-type > div:first-of-type > div:first-of-type > div:nth-of-type(2) > div:first-of-type > ol > li > span",
        stats => stats.map(stat => stat.innerHTML)
    );
    const epoch = await page.$$eval(
        "#app > main:first-of-type > div:first-of-type > div:first-of-type > div:first-of-type > div:nth-of-type(2) > div:first-of-type > ol > span:first-of-type",
        stats => stats.map(stat => stat.innerHTML)
    );
    await browser.close();
    let epochRewards = staking[0];
    let zrxStaked = staking[1] + " ZRX";
    let epochEnds = epoch[0].replace('Next rewards in ', 'Ends in ');

    if (zrxStaked) {
        clientZRXStaked.guilds.cache.forEach(function (value, key) {
            try {
                console.log("Updating zrx staked");
                value.members.cache.get(clientZRXStaked.user.id).setNickname(zrxStaked);
            } catch (e) {
                console.log(e);
            }
        });
    }
    if (clientEpochReward) {
        clientEpochReward.guilds.cache.forEach(function (value, key) {
            try {
                console.log("Updating epoch reward");
                value.members.cache.get(clientEpochReward.user.id).setNickname(epochRewards);
            } catch (e) {
                console.log(e);
            }
        });
    }

    if (clientEpochEnd) {
        clientEpochEnd.guilds.cache.forEach(function (value, key) {
            try {
                console.log("Updating epoch end");
                value.members.cache.get(clientEpochEnd.user.id).setNickname(epochEnds);
            } catch (e) {
                console.log(e);
            }
        });
    }

    clientZRXStaked.user.setActivity("Total ZRX staked", {type: 'WATCHING'});
    clientEpochReward.user.setActivity("Current epoch rewards", {type: 'WATCHING'});
    clientEpochEnd.user.setActivity("Current epoch end", {type: 'WATCHING'});

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
            value.members.cache.get(clientVolume.user.id).setNickname(volumeData.toUpperCase());
        } catch (e) {
            console.log(e);
        }
    });
    clientVolume.user.setActivity("0x volume: 24H | All-time", {type: 'WATCHING'});

};


setInterval(function () {
    console.log("geting stats and volumes")
    getStats();
    getVolume();
}, 360 * 1000);



