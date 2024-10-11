import {TwitterApi} from 'twitter-api-v2';
import axios from 'axios';
import schedule from'node-schedule';
import moment from 'moment-timezone';  // Use moment to handle timezones

// Format and post the market data to Tweitter, Facebook and Instagram
export async function postMarketData() {

  // Fetch market data from CryptoCompare
  async function fetchMarketData() {
    console.log('Fetching data...\n');
    const CRYPTOCOMPARE_API_URL = 'https://min-api.cryptocompare.com/data/pricemultifull'; // CryptoCompare API URL

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
      console.error('Error fetching data:', error);
      return null;
    }
  }

  const data = await fetchMarketData();
  if (data) {
    console.log('Data fetched successfully!');
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
    
    // Twitter API credentials from environment variables
    const BotClient = new TwitterApi({
      appKey: process.env.NAIRAPULSE_API_KEY,
      appSecret: process.env.NAIRAPULSE_API_KEY_SECRET,
      accessToken: process.env.NAIRAPULSE_API_ACCESS_TOKEN,
      accessSecret: process.env.NAIRAPULSE_API_ACCESS_TOKEN_SECRET,
    });

    // Tweet feed to Twitter
    try {
      console.log('\nPublishing tweet...\n');
      await BotClient.v2.tweet(feedShort1);
      console.log('Tweet sent successfully!\n');
    } catch (error) {
      console.error('Error sending tweet:', error);
    }

    // Post feed to Facebook
    try {
      console.log('\nPublishing to Facebook...\n');
      await axios.post(`https://graph.facebook.com/${process.env.NAIRAPULSE_FACEBOOK_PAGE_ID}/feed`, {
        message: feedLong,
        access_token: process.env.NAIRAPULSE_FACEBOOK_API_ACCESS_TOKEN,
      });
      console.log('Published to Facebook successfully!');
    } catch (error) {
      console.error('Error Publishing to Facebook:', error);
    }

    // Post to Instagram
    // try {
    //   const mediaCreationResponse = await axios.post(`https://graph.facebook.com/nairapulse/media`, {
    //     caption: feedLong,
    //     access_token: process.env.NAIRAPULSE_FACEBOOK_API_ACCESS_TOKEN
    //   });

    //   const mediaId = mediaCreationResponse.data.id;
    //   if (mediaId) {
    //     console.log('ig media created succesfully...');
    //   }

    //   await axios.post(`https://graph.facebook.com/nairapulse/media_publish`, {
    //     creation_id: mediaId,
    //     access_token: process.env.NAIRAPULSE_FACEBOOK_API_ACCESS_TOKEN
    //   });

    //   console.log('Posted to Instagram successfully');
    // } catch (error) {
    //   console.error('Error posting to Instagram:', error);
    // }
  }
}
