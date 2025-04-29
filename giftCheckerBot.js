require('dotenv').config();
const axios = require('axios');

const TOKEN = process.env.YOAI_TOKEN;
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL) || 10_000; // fallback

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
    }

    // Reply payload
    const sendMessageRes = await axios.post(
      'https://yoai.yophone.com/api/pub/sendMessage',
      {
        to,
        text: replyText,
        options: [
          { label: "Option A", value: "value_a" },
          { label: "Option B", value: "value_b" }
        ],
        mediaURLs: [
          "https://media.4-paws.org/5/4/4/c/544c2b2fd37541596134734c42bf77186f0df0ae/VIER%20PFOTEN_2017-10-20_164-3854x2667-1920x1329.jpg"
        ]
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
