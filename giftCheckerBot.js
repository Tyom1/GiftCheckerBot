require('dotenv').config();
const axios = require('axios');

const TOKEN = process.env.YOAI_TOKEN;
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL) || 10_000; // fallback

const sendMessageRes = async (to, text) => {
  await axios.post(
    'https://yoai.yophone.com/api/pub/sendMessage',
    {
      to,
      text
    },
    {
      headers: {
        'X-YoAI-API-Key': TOKEN,
        'Content-Type': 'application/json'
      }
    }
  )
}


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
        },
        {
          command: "checkYourGift",
          description: "Check your gift"
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
const channels = [
  '0196a03b-8add-7b20-80d7-369f38a99678',
  '0196a03b-3f76-715d-9e17-0d4081fab776',
  '01969f82-20a1-7ef3-8b84-3086b474e1df'
]

const followsChecker = async (userId, forGift = false) => {
  let allChannelsFollowed = true;
  await sendMessageRes(userId, '🔍 Checking your subscriptions.')

  for (const channel of channels) {
    try {
      const response = await axios.post(
        'https://yoai.yophone.com/api/pub/getChannelMember',
        { channelId: channel, userId },
        {
          headers: {
            'X-YoAI-API-Key': TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      const status = response.data?.data?.status;
      // console.log(`Channel ${channel} status:`, status);

      if (status !== 'member') {
        allChannelsFollowed = false;
        break;
      }
    } catch (error) {
      console.error(`Error checking channel ${channel}:`, error);
      allChannelsFollowed = false;
      break;
    }
  }

  const replyText ='✅ Magic confirmed! You are subscribed to all channels. Please type /checkYourGift 🎉'

  if (forGift) {
    return allChannelsFollowed
  } else if (allChannelsFollowed) {
    await sendMessageRes(userId, replyText);
  } else {
    await setChannels(to)
  }
};

const giftChecker = async (userId) => {
  if (await followsChecker(userId, true)) {
    function getRandomBit () {
      return Math.random() < 0.5 ? 0 : 1;
    }

    let repText;

    if (getRandomBit() === 1) {
      repText = `🎁 Congratulations! You've unlocked an NFT from [Ortak.me](https://ortak.me/)`;
    } else {
      repText = `😔 This time you don't have a gift. But don't worry. Come back tomorrow and check again. ✨`;
    }

    await sendMessageRes(userId, repText);

  } else {
    await setChannels(userId);
  }

}

const setChannels = async (userId) => {
  const replyText ='Follow this YoPhone Channel to receive a surprise reward!\n\n' +
  '1. [BFTH channel](https://join.yophone.com/channel/0193f82e-d59b-7911-b7d3-597051f77268) ⌛\n' +
  '2. [Second](https://join.yophone.com/channel/0196a03b-3f76-715d-9e17-0d4081fab776) ⌛\n' +
  '3. [Third](https://join.yophone.com/channel/01969f82-20a1-7ef3-8b84-3086b474e1df) ⌛\n'

  await sendMessageRes(userId, replyText)
  await sendMessageRes(userId, '✅ Type /followsChecker once you’re done.')
}

setCommands()

async function fetchAndReply () {
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
    // console.log(to);
    if (!to) {
      console.log('⚠️ No valid sender ID, skipping reply.');
      return;
    }

    // ✨ Message logic
    let replyText;

    if (userMessage.includes('/start')) {
      replyText = `Welcome to BFTH Magic \...\n`;
      await sendMessageRes(to, replyText)
    } else if (userMessage.includes('followschecker')) {
      await followsChecker(to)
    } else if (userMessage.includes('/channels')) {
      await setChannels(to)
    } else if (userMessage.includes('/checkyourgift')) {
      await giftChecker(to)
    }

  } catch (error) {
    console.error('❌ Error during poll:', error.response?.data || error.message);
  }
}

// 🔁 Safe polling loop using setTimeout
function startPolling () {
  fetchAndReply().finally(() => {
    setTimeout(startPolling, POLL_INTERVAL);
  });
}

console.log(`🤖 YoAI bot started. Polling every ${POLL_INTERVAL / 1000}s...`);
startPolling();
