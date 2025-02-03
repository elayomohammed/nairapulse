import { postMarketData } from './bot.js';
import express from 'express';
import { scheduleJob } from 'node-schedule';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Schedule the publish every 24 hours
//schedule.scheduleJob('0 0 * * *', postMarketData);
// Schedule the publish every 12 hours
//schedule.scheduleJob('0 0 */12 * *', postMarketData);
// Schedule the publish every 60 minutes
//schedule.scheduleJob('0 * * * *', postMarketData);
// Schedule the publish every 30 minutes
//schedule.scheduleJob('*/30 * * * *', postMarketData);
// Schedule the publish every 10 minutes
//schedule.scheduleJob('*/10 * * * *', postMarketData);
// Schedule the publish every 5 minutes
//schedule.scheduleJob('*/5 * * * *', postMarketData);
// Schedule the publish every 1 minute
//schedule.scheduleJob('* * * * *', postMarketData);
// Schedule the publish 6:00AM every day
//schedule.scheduleJob('0 6 * * *', postMarketData);

// Initial publishing after server startup
// await postMarketData();
scheduleJob('0 6 * * *', async () => { // Schedule the publish every 6:00 AM
    console.log('Running scheduled job: Fetching and posting market data');
    try {
        await postMarketData();
    } catch (error) {
        console.error('Error posting data:', error);
    }
});
scheduleJob('0 14 * * *', async () => { // Schedule the publish every 2:00 PM
    console.log('Running scheduled job: Fetching and posting market data');
    try {
        await postMarketData();
    } catch (error) {
        console.error('Error posting data:', error);
    }
});
scheduleJob('0 20 * * *', async () => { // Schedule the publish every 8:00 PM
    console.log('Running scheduled job: Fetching and posting market data');
    try {
        await postMarketData();
    } catch (error) {
        console.error('Error posting data:', error);
    }
});

app.get('/', (req, res) => {
    const pingResponse = `<p style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">Bot is running fine</p>`
    res.setHeader('Content-Type', 'text/html');
    res.send(pingResponse);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
