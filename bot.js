import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import schedule from 'node-schedule';
import moment from 'moment-timezone';  // Use moment to handle timezones

// Format and post the market data to Tweitter, Facebook and Instagram
export async function postMarketData() {

  // Fetch market data from CryptoCompare
  async function fetchMarketData() {
    console.log('Fetching data...\n');
    const CRYPTOCOMPARE_API_URL = 'https://min-api.cryptocompare.com/data/pricemultifull'; // CryptoCompare API URL

    try {
      const symbols = 'BTC,USD,EUR,GBP,NGN,CNY';
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
    const cnyNgn = data.CNY.NGN;

    // Get current time in UTC+1 (WAT)
    const currentTime = moment().tz('Africa/Lagos').format('YYYY-MM-DD HH:mm:ss');

    // Create feed content short 1
    const feedShort =
      `${currentTime} UTC+1:\n
Forex:
USD ${usdNgn.PRICE.toString().replace('NGN ', '₦')}
EUR ${eurNgn.PRICE.toString().replace('NGN ', '₦')}
GBP ${gbpNgn.PRICE.toString().replace('NGN ', '₦')}

Bitcoin:
NGN ${btcNgn.PRICE.toString().replace('NGN ', '₦')}
USD ${btcUsd.PRICE.toString().replace('$ ', '$')}
EUR ${btcEur.PRICE.toString().replace('€ ', '€')}
GBP ${btcGbp.PRICE.toString().replace('£ ', '£')}

https://naira-pulse.com
©Modalcraft Ltd
#Forex #Crypto #NGN #BTC #USD #EUR #GBP`;

    // Create feed content long
    const feedLong = `${currentTime} UTC+1\n
Forex:
USD: ${usdNgn.PRICE.toString().replace('NGN ', '₦')} | H: ${usdNgn.HIGH24HOUR.toString().replace('NGN ', '₦')} | L: ${usdNgn.LOW24HOUR.toString().replace('NGN ', '₦')}
EURO: ${eurNgn.PRICE.toString().replace('NGN ', '₦')} | H: ${eurNgn.HIGH24HOUR.toString().replace('NGN ', '₦')} | L: ${eurNgn.LOW24HOUR.toString().replace('NGN ', '₦')}
GBP: ${gbpNgn.PRICE.toString().replace('NGN ', '₦')} | H: ${gbpNgn.HIGH24HOUR.toString().replace('NGN ', '₦')} | L: ${gbpNgn.LOW24HOUR.toString().replace('NGN ', '₦')}
CNY: ${cnyNgn.PRICE.toString().replace('NGN ', '₦')} | H: ${cnyNgn.HIGH24HOUR.toString().replace('NGN ', '₦')} | L: ${cnyNgn.LOW24HOUR.toString().replace('NGN ', '₦')}

Bitcoin:
NGN: ${btcNgn.PRICE.toString().replace('NGN ', '₦')} | H: ${btcNgn.HIGH24HOUR.toString().replace('NGN ', '₦')} | L: ${btcNgn.LOW24HOUR.toString().replace('NGN ', '₦')} | V: ${btcNgn.VOLUME24HOUR})
USD: ${btcUsd.PRICE.toString().replace('$ ', '$')} | H: ${btcUsd.HIGH24HOUR.toString().replace('$ ', '$')} | L: ${btcUsd.LOW24HOUR.toString().replace('$ ', '$')} | V: ${btcUsd.VOLUME24HOUR})
EURO: ${btcEur.PRICE.toString().replace('€ ', '€')} | H: ${btcEur.HIGH24HOUR.toString().replace('€ ', '€')} | L: ${btcEur.LOW24HOUR.toString().replace('€ ', '€')} | V: ${btcEur.VOLUME24HOUR})
GBP: ${btcGbp.PRICE.toString().replace('£ ', '£')} | H: ${btcGbp.HIGH24HOUR.toString().replace('£ ', '£')} | L: ${btcGbp.LOW24HOUR.toString().replace('£ ', '£')} | V: ${btcGbp.VOLUME24HOUR})

#Forex #Crypto #NGN #BTC`;

    const feedLong1 = `${currentTime} UTC+1\n
Forex:
USD ⇛ ${usdNgn.PRICE.toString().replace('NGN ', '₦')}
EURO ⇛ ${eurNgn.PRICE.toString().replace('NGN ', '₦')}
GBP ⇛ ${gbpNgn.PRICE.toString().replace('NGN ', '₦')}
CNY ⇛ ${cnyNgn.PRICE.toString().replace('NGN ', '₦')}

Bitcoin:
NGN ⇛ ${btcNgn.PRICE.toString().replace('NGN ', '₦')}  (V24: ${btcNgn.VOLUME24HOUR})
USD ⇛ ${btcUsd.PRICE.toString().replace('$ ', '$')}  (V24: ${btcUsd.VOLUME24HOUR})
EURO ⇛ ${btcEur.PRICE.toString().replace('€ ', '€')}  (V24: ${btcEur.VOLUME24HOUR})
GBP ⇛ ${btcGbp.PRICE.toString().replace('£ ', '£')}  (V24: ${btcGbp.VOLUME24HOUR})

For more details visit www.naira-pulse.com
© Powered by Modalcraft Ltd
#Forex #Crypto #NGN #BTC
`;
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
      await BotClient.v2.tweet(feedShort);
      console.log('Tweet sent successfully!\n');
    } catch (error) {
      console.error('Error sending tweet:', error);
    }

    // Post feed to Facebook
    try {
      console.log('\nPublishing to Facebook...\n');
      await axios.post(`https://graph.facebook.com/${process.env.NAIRAPULSE_FACEBOOK_PAGE_ID}/feed`, {
        message: feedLong1,
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
