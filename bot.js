import dotenv from 'dotenv';
import { getUpdates, sendMessage, setBotCommands } from './api.js';
import { setChannels, followsChecker, giftChecker } from './commands.js';
import { decodeText } from './utils.js';

dotenv.config();

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL) || 10000;

const handleUpdate = async (update) => {
  const userMessage = decodeText(update.text).toLowerCase();
  const to = update?.sender?.id;

  if (!to) return;

  if (userMessage.includes('/start')) {
    await sendMessage(to, `Welcome to BFTH Magic!`);
  } else if (userMessage.includes('followschecker')) {
    await followsChecker(to);
  } else if (userMessage.includes('/channels')) {
    await setChannels(to);
  } else if (userMessage.includes('/checkyourgift')) {
    await giftChecker(to);
  }
};

const poll = async () => {
  try {
    const { data } = await getUpdates();
    const updates = data?.data || [];

    if (updates.length === 0) {
      console.log('🕒 No new messages.');
    } else {
      await handleUpdate(updates[0]); // handle only first
    }
  } catch (err) {
    console.error('❌ Polling error:', err.response?.data || err.message);
  } finally {
    setTimeout(poll, POLL_INTERVAL);
  }
};

console.log(`🤖 YoAI bot started. Polling every ${POLL_INTERVAL / 1000}s...`);
await setBotCommands();
poll();
