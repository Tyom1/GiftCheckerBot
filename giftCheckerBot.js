require('dotenv').config();
const axios = require('axios');

const TOKEN = process.env.YOAI_TOKEN;
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL) || 10_000; // fallback

const setCommands = async () => {

  await axios.post(
    'https://yoai.yophone.com/api/pub/setCommands',
    {
      commands: [
        {
          command: "start",
          description: "Starts the bot"
        },
        {
          command: "channels",
          description: "View channels"
        },
        {
          command: "followsChecker",
          description: "Follows Checker"
        }
      ]
    },
    {
      headers: {
        'X-YoAI-API-Key': TOKEN,
        'Content-Type': 'application/json'
      }
    }
  );
}

setCommands()


// console.log('📤 Sent reply:', setCommands.data);

async function fetchAndReply() {
  try {
    console.log('⏳ Checking for updates...');

    const getUpdatesRes = await axios.post(
      'https://yoai.yophone.com/api/pub/getUpdates',
      {},
      {
        headers: {
          'X-YoAI-API-Key': TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    const updates = getUpdatesRes.data?.data || [];

    const decodedUpdates = updates.map(update => ({
      ...update,
      text: Buffer.from(update.text || '', 'base64').toString('utf-8')
    }));

    if (decodedUpdates.length === 0) {
      console.log('🕒 No new messages.');
      return;
    }

    const firstUpdate = decodedUpdates[0];
    const userMessage = firstUpdate.text.toLowerCase();
    const sender = firstUpdate?.sender;
    const to = sender?.id;
    const name = sender?.firstName || 'there';

    if (!to) {
      console.log('⚠️ No valid sender ID, skipping reply.');
      return;
    }

    // ✨ Message logic
    let replyText = `👋 Hi dear ${name}, thank you for your message!`;

    if (userMessage.includes('how are you')) {
      replyText = '😊 Thanks, all is good!';
    } else if(userMessage.includes('/start')) {
      replyText = '🚀 Please follow all 4 channels and try again!';
    } else if(userMessage.includes('/channels')) {
      replyText = `Follow these 4 YoPhone Channels to unlock your magical NFT!

      1. [Mr. First](https://join.yophone.com/channel/0193f284-3fa5-7a48-b325-a8a332ba964f) ⌛
      2. [Ortak](https://join.yophone.com/channel/0193f2a0-d9bc-7c49-a556-1334dac35680) ⌛
      3. [YoHealth](https://join.yophone.com/channel/0193f2d3-f69c-7626-88c2-da3e7440809e) ⌛
      4. [YoCerebrum](https://join.yophone.com/channel/0193f2f9-e4de-7129-a740-472ecb34c2d6) ⌛
      ✅ Type /followsChecker once you’re done.`;
    }

    // Reply payload
    const sendMessageRes = await axios.post(
      'https://yoai.yophone.com/api/pub/sendMessage',
      {
        to,
        text: replyText
        // options: [
        //   { label: "Option A", value: "value_a" },
        //   { label: "Option B", value: "value_b" }
        // ]
        // mediaURLs: [
        //   "https://media.4-paws.org/5/4/4/c/544c2b2fd37541596134734c42bf77186f0df0ae/VIER%20PFOTEN_2017-10-20_164-3854x2667-1920x1329.jpg"
        // ]
      },
      {
        headers: {
          'X-YoAI-API-Key': TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📤 Sent reply:', sendMessageRes.data);

  } catch (error) {
    console.error('❌ Error during poll:', error.response?.data || error.message);
  }
}

// 🔁 Safe polling loop using setTimeout
function startPolling() {
  fetchAndReply().finally(() => {
    setTimeout(startPolling, POLL_INTERVAL);
  });
}

console.log(`🤖 YoAI bot started. Polling every ${POLL_INTERVAL / 1000}s...`);
startPolling();
