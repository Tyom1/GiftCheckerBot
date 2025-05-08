import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.YOAI_TOKEN;

const headers = {
  'X-YoAI-API-Key': TOKEN,
  'Content-Type': 'application/json'
};

export const sendMessage = (to, text) =>
  axios.post('https://yoai.yophone.com/api/pub/sendMessage', { to, text }, { headers });

export const setBotCommands = () =>
  axios.post('https://yoai.yophone.com/api/pub/setCommands', {
    commands: [
      { command: "start", description: "Starts the bot" },
      { command: "channels", description: "View channels" },
      { command: "followsChecker", description: "Follows Checker" },
      { command: "checkYourGift", description: "Check your gift" }
    ]
  }, { headers });

export const getChannelMember = (channelId, userId) =>
  axios.post('https://yoai.yophone.com/api/pub/getChannelMember', { channelId, userId }, { headers });

export const getUpdates = () =>
  axios.post('https://yoai.yophone.com/api/pub/getUpdates', {}, { headers });
