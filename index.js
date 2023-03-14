const puppeteer = require("puppeteer-extra");
const Cheerio = require("cheerio");
const express = require("express");
var cors = require('cors')
const {executablePath} = require('puppeteer');
const { load } = require("cheerio");
const app = express();
const port = 3000;
app.use(cors())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
const minimal_args = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

let browser;
let forexPage;
let cryptoPage;
let cryptoData = [];
let forexData = [];
let isCryptoScrapperRunning = false;
let isForexScrapperRunning = false;

// create a post endpoint
app.get("/cryptodata", async (req, res) => {
  res.status(200).send(cryptoData);
});

app.get("/forexdata", async (req, res) => {
  res.status(200).send(forexData);
});

//add a get route for testing
app.get("/", (req, res) => {
  res.status(200).send("Running...");
});


async function main() {
  try{
      browser = await puppeteer.launch({
      userDataDir: './cache',
      headless: true,
      executablePath: executablePath(),
      args: minimal_args,
      ignoreHTTPSErrors: true,
      dumpio: false,
    });
    console.log("Browser is launched")
    forexPage = await browser.newPage();
    console.log("Forex page is created")
    cryptoPage = await browser.newPage();
    console.log("Crypto page is created")

    setInterval(()=>{
      console.log("Starting scrappers...")
      if(!isCryptoScrapperRunning){
        getCryptoData();
      }
      if(!isForexScrapperRunning){
        getForexData();
      }
    }, 10000)
  } catch (error) {
    console.log(error)
  }
}

main();

async function getCryptoData(){
    isCryptoScrapperRunning = true;
    const LINK = 'https://www.tradingview-widget.com/embed-widget/crypto-mkt-screener/';
    try{
      await cryptoPage.goto(LINK, {waitUntil: 'load', timeout: 0});
      await cryptoPage.waitForSelector('.tv-screener-table__result-row');
      const html = await cryptoPage.content();
      const $ = Cheerio.load(html);
      const listItems = $('.tv-screener-table__result-row');
      const data = [];
      listItems.each((i, el) => {
        let symbol = "";
        let rate = "";
        const cols = $(el).children();
        cols.each((i, col) => {
          if(i === 0){ symbol = $(col).text().trim(); }
          if(i === 3){ rate = $(col).text().trim(); }
        })
        data.push({symbol, rate});
      })
      cryptoData = data;
    } catch (error) {
      console.log(error)
      cryptoData = []
    } finally {
      isCryptoScrapperRunning = false;
    }
}

async function getForexData(){
    isForexScrapperRunning = true;
    const LINK = `https://s.tradingview.com/embed-widget/market-overview/?locale=en#%7B%22colorTheme%22%3A%22light%22%2C%22dateRange%22%3A%2212M%22%2C%22showChart%22%3Afalse%2C%22largeChartUrl%22%3A%22%22%2C%22isTransparent%22%3Afalse%2C%22showSymbolLogo%22%3Atrue%2C%22showFloatingTooltip%22%3Afalse%2C%22width%22%3A400%2C%22height%22%3A465%2C%22tabs%22%3A%5B%7B%22title%22%3A%22Forex%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22OANDA%3AEURUSD%22%7D%2C%7B%22s%22%3A%22OANDA%3AGBPUSD%22%7D%2C%7B%22s%22%3A%22OANDA%3AGBPJPY%22%7D%2C%7B%22s%22%3A%22OANDA%3AAUDUSD%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDJPY%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDCAD%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURJPY%22%7D%2C%7B%22s%22%3A%22OANDA%3ANZDUSD%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDCHF%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURGBP%22%7D%2C%7B%22s%22%3A%22OANDA%3AAUDJPY%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURAUD%22%7D%2C%7B%22s%22%3A%22OANDA%3AGBPAUD%22%7D%2C%7B%22s%22%3A%22OANDA%3AAUDCAD%22%7D%2C%7B%22s%22%3A%22OANDA%3ANZDJPY%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURCAD%22%7D%2C%7B%22s%22%3A%22OANDA%3ACADJPY%22%7D%2C%7B%22s%22%3A%22OANDA%3AGBPCAD%22%7D%2C%7B%22s%22%3A%22OANDA%3AGBPCHF%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURNZD%22%7D%2C%7B%22s%22%3A%22OANDA%3ACHFJPY%22%7D%2C%7B%22s%22%3A%22OANDA%3AAUDNZD%22%7D%2C%7B%22s%22%3A%22OANDA%3AGBPNZD%22%7D%2C%7B%22s%22%3A%22OANDA%3AAUDCHF%22%7D%2C%7B%22s%22%3A%22OANDA%3ANZDCAD%22%7D%2C%7B%22s%22%3A%22OANDA%3ACADCHF%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURCHF%22%7D%2C%7B%22s%22%3A%22OANDA%3ANZDCHF%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDTHB%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDZAR%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDSGD%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDMXN%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDHUF%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDCNH%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURHUF%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURZAR%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDNOK%22%7D%2C%7B%22s%22%3A%22OANDA%3AAUDSGD%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDPLN%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDTRY%22%7D%2C%7B%22s%22%3A%22OANDA%3ASGDJPY%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDCZK%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURNOK%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURCZK%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDSAR%22%7D%2C%7B%22s%22%3A%22OANDA%3ATRYJPY%22%7D%2C%7B%22s%22%3A%22OANDA%3ACHFHKD%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURDKK%22%7D%2C%7B%22s%22%3A%22OANDA%3ASGDCHF%22%7D%2C%7B%22s%22%3A%22OANDA%3ACHFZAR%22%7D%2C%7B%22s%22%3A%22OANDA%3ANZDHKD%22%7D%2C%7B%22s%22%3A%22OANDA%3AHKDJPY%22%7D%2C%7B%22s%22%3A%22OANDA%3AZARJPY%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDHKD%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURTRY%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURHKD%22%7D%2C%7B%22s%22%3A%22OANDA%3ACADSGD%22%7D%2C%7B%22s%22%3A%22OANDA%3ACADHKD%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURSEK%22%7D%2C%7B%22s%22%3A%22OANDA%3ANZDSGD%22%7D%2C%7B%22s%22%3A%22OANDA%3AGBPPLN%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDDKK%22%7D%2C%7B%22s%22%3A%22OANDA%3AAUDHKD%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURPLN%22%7D%2C%7B%22s%22%3A%22OANDA%3AGBPHKD%22%7D%2C%7B%22s%22%3A%22OANDA%3AGBPZAR%22%7D%2C%7B%22s%22%3A%22OANDA%3AUSDSEK%22%7D%2C%7B%22s%22%3A%22OANDA%3AGBPSGD%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURSGD%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURCZK%22%7D%2C%7B%22s%22%3A%22OANDA%3AEURNOK%22%7D%5D%2C%22originalTitle%22%3A%22Forex%22%7D%5D%2C%22utm_source%22%3A%22www.tradingview.com%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22market-overview%22%2C%22page-uri%22%3A%22www.tradingview.com%2Fwidget%2Fmarket-overview%2F%22%7D`;
    try {
      await forexPage.goto(LINK, {waitUntil: 'networkidle0', timeout: 0});
      let html = await forexPage.$eval('.tv-widget-watch-list__symbols-wrapper', (element) => {
        return element.innerHTML;
      }) 

      var $ = Cheerio.load(html);
      const listItems = $('.tv-widget-watch-list__row');
      let data = [];
      listItems.each((i, el) => {
        const symbol = $(el).find('.tv-widget-watch-list__short-name').text().trim();
        const price = $(el).find('.tv-widget-watch-list__last').text().trim();
        data.push({symbol, price});
      })
      forexData = data;

    } catch (error) {
      forexData = [];
    } finally {
      isForexScrapperRunning = false;
    }
  } 

app.get("/", async (req, res) => {
  res.status(200).send("running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`server running at ${port}/`);
});