require('dotenv').config();
const {TwitterApi} = require('twitter-api-v2');
const axios = require('axios');
const schedule = require('node-schedule');
const moment = require('moment-timezone');  // Use moment to handle timezones

// Twitter API credentials from environment variables
const BotClient = new TwitterApi({
  appKey: process.env.NAIRAPULSE_API_KEY,
  appSecret: process.env.NAIRAPULSE_API_KEY_SECRET,
  accessToken: process.env.NAIRAPULSE_API_ACCESS_TOKEN,
  accessSecret: process.env.NAIRAPULSE_API_ACCESS_TOKEN_SECRET,
});

// Fetch BTC to USD price from Cryptocompare or CoinGecko
/*async function getBtcToUsd() {
  try {
    const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,JPY,EUR,NGN&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`);
    // const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {headers: {accept: 'application/json', 'x-cg-demo-api-key': 'CG-FySH2NtG7shrPGHqZX9NwDCC'}});
    return response.data.USD;
  } catch (error) {
    console.error('Error fetching BTC to USD:\n', error.message);
    return null;
  }
}

// Fetch NGN to USD price from ExchangeRate API
async function getNgnToUsd() {
  console.log('Fetching NGN to USD price from exchange rate');
  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_API_KEY}/latest/USD`);
    return response.data.conversion_rates.NGN;
  } catch (error) {
    console.error(`Error fetching NGN to USD:\n${error.message}`);
    return null;
  }
}

// Function to create and send a tweet
async function tweetExchangeRates() {
  const btcToUsd = await getBtcToUsd();
  const ngnToUsd = await getNgnToUsd();

  if (btcToUsd !== null && ngnToUsd !== null) {
    console.log('\nsending tweet...\n');
    const tweet = `BTC to USD: $${btcToUsd}\nNGN to USD: ₦${ngnToUsd}\n#Crypto #Forex`;

    try {
      const response = await BotClient.v2.tweet(tweet);
      console.log(response);
      console.log('Tweet sent successfully:', `\n${tweet}`);
    } catch (error) {
      console.error('Error sending tweet:', `\n${error}`);
    }
  }
}*/


// CryptoCompare API URL
const CRYPTOCOMPARE_API_URL = 'https://min-api.cryptocompare.com/data/pricemultifull';

// Fetch market data from CryptoCompare
async function fetchMarketData() {
  try {
    const symbols = 'BTC,USD,EUR,GBP,NGN';
    const currencies = 'USD,NGN,EUR,GBP';
    const url = `${CRYPTOCOMPARE_API_URL}?fsyms=${symbols}&tsyms=${currencies}`;

    const response = await axios.get(url, {
      headers: {
        authorization: `Apikey ${process.env.CRYPTOCOMPARE_API_KEY}`
      }
    });

    return response.data.DISPLAY;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

// Format and post the market data to Tweitter, Facebook and Instagram
async function postMarketData() {
  const data = await fetchMarketData();

  if (data) {
    // Extracting required data for each pair
    const btcUsd = data.BTC.USD;
    const btcEur = data.BTC.EUR;
    const btcGbp = data.BTC.GBP;
    const btcNgn = data.BTC.NGN;

    const eurNgn = data.EUR.NGN;
    const gbpNgn = data.GBP.NGN;
    const usdNgn = data.USD.NGN;

    // Get current time in UTC+1 (WAT)
    const currentTime = moment().tz('Africa/Lagos').format('YYYY-MM-DD HH:mm:ss');

    // Create feed content short 1
    const feedShort1 = `
    ${currentTime} UTC+1:\n
    Forex:
    USD ${usdNgn.PRICE.toString().replace('NGN ', '₦')}
    EUR ${eurNgn.PRICE.toString().replace('NGN ', '₦')}
    GBP ${gbpNgn.PRICE.toString().replace('NGN ', '₦')}

    Bitcoin:
    NGN ${btcNgn.PRICE.toString().replace('NGN ', '₦')}
    USD ${btcUsd.PRICE.toString().replace('$ ', '$')}
    EUR ${btcEur.PRICE.toString().replace('€ ', '€')}
    GBP ${btcGbp.PRICE.toString().replace('£ ', '£')}

    #Forex #Crypto #NGN #BTC #EUR #USD #GBP
    `;

    // Create feed content long
    const feedLong = `
    ${currentTime}\n` +
    `Forex\nUSD: ${usdNgn.PRICE.toString().replace('NGN ', '₦')} | 24h High: ${usdNgn.HIGH24HOUR.toString().replace('NGN ', '₦')} | 24h Low: ${usdNgn.LOW24HOUR.toString().replace('NGN ', '₦')}\n` +
    `EURO: ${eurNgn.PRICE.toString().replace('NGN ', '₦')} | 24h High: ${eurNgn.HIGH24HOUR.toString().replace('NGN ', '₦')} | 24h Low: ${eurNgn.LOW24HOUR.toString().replace('NGN ', '₦')}\n` +
    `GBP: ${gbpNgn.PRICE.toString().replace('NGN ', '₦')} | 24h High: ${gbpNgn.HIGH24HOUR.toString().replace('NGN ', '₦')} | 24h Low: ${gbpNgn.LOW24HOUR.toString().replace('NGN ', '₦')}\n` +

    `\nBitcoin\n` +
    `NGN: ${btcNgn.PRICE.toString().replace('NGN ', '₦')} | 24h High: ${btcNgn.HIGH24HOUR.toString().replace('NGN ', '₦')} | 24h Low: ${btcNgn.LOW24HOUR.toString().replace('NGN ', '₦')}\n` +
    `USD: ${btcUsd.PRICE.toString().replace('$ ', '$')} | 24h High: ${btcUsd.HIGH24HOUR.toString().replace('$ ', '$')} | 24h Low: ${btcUsd.LOW24HOUR.toString().replace('$ ', '$')}\n` +
    `EURO: ${btcEur.PRICE.toString().replace('€ ', '€')} | 24h High: ${btcEur.HIGH24HOUR.toString().replace('€ ', '€')} | 24h Low: ${btcEur.LOW24HOUR.toString().replace('€ ', '€')}\n` +
    `GBP: ${btcGbp.PRICE.toString().replace('£ ', '£')} | 24h High: ${btcGbp.HIGH24HOUR.toString().replace('£ ', '£')} | 24h Low: ${btcGbp.LOW24HOUR.toString().replace('£ ', '£')}\n` +

    '\n#Forex #Crypto #NGN #BTC'
    ;
    
    // Tweet feed to Twitter
    try {
      await BotClient.v2.tweet(feedShort2);
      console.log('Tweet sent successfully:\n', feedShort2,);
    } catch (error) {
      console.error('Error sending tweet:', error);
    }

    // Post feed to Facebook
    try {
      await axios.post(`https://graph.facebook.com/${process.env.NAIRAPULSE_FACEBOOK_PAGE_ID}/feed`, {
        message: feedLong,
        access_token: process.env.NAIRAPULSE_FACEBOOK_API_ACCESS_TOKEN,
      });
      console.log('Posted to Facebook successfully');
    } catch (error) {
      console.error('Error posting to Facebook:', error);
    }
  }
}


// Schedule the tweet every 24 hours
//schedule.scheduleJob('0 0 * * *', postMarketData);
// Schedule the tweet every 12 hours
//schedule.scheduleJob('0 0 */12 * *', postMarketData);
// Schedule the tweet every 60 minutes
//schedule.scheduleJob('0 * * * *', postMarketData);
// Schedule the tweet every 30 minutes
//schedule.scheduleJob('*/30 * * * *', postMarketData);
// Schedule the tweet every 10 minutes
//schedule.scheduleJob('*/10 * * * *', postMarketData);
// Schedule the tweet every 5 minutes
schedule.scheduleJob('*/5 * * * *', postMarketData);
// Schedule the tweet every 1 minute
//schedule.scheduleJob('* * * * *', postMarketData);

// Initial tweet
postMarketData();
