import { sendMessage, getChannelMember } from './api.js';

const channels = [
  '0196a03b-8add-7b20-80d7-369f38a99678',
  '0196a03b-3f76-715d-9e17-0d4081fab776',
  '01969f82-20a1-7ef3-8b84-3086b474e1df'
];

export const setChannels = async (userId) => {
  const reply = `Follow these YoPhone Channels:\n\n` +
    '1. [BFTH channel](https://join.yophone.com/channel/0193f82e-d59b-7911-b7d3-597051f77268)\n' +
    '2. [Second](https://join.yophone.com/channel/0196a03b-3f76-715d-9e17-0d4081fab776)\n' +
    '3. [Third](https://join.yophone.com/channel/01969f82-20a1-7ef3-8b84-3086b474e1df)\n';

  await sendMessage(userId, reply);
  await sendMessage(userId, '✅ Type /followsChecker once you’re done.');
};

export const followsChecker = async (userId, forGift = false) => {
  await sendMessage(userId, '🔍 Checking your subscriptions.');
  let allFollowed = true;

  for (const channel of channels) {
    try {
      const { data } = await getChannelMember(channel, userId);
      if (data?.data?.status !== 'member') {
        allFollowed = false;
        break;
      }
    } catch {
      allFollowed = false;
      break;
    }
  }

  if (forGift) return allFollowed;

  if (allFollowed) {
    await sendMessage(userId, '✅ Magic confirmed! Type /checkYourGift 🎉');
  } else {
    await setChannels(userId);
  }
};

export const giftChecker = async (userId) => {
  const passed = await followsChecker(userId, true);
  if (!passed) return await setChannels(userId);

  const msg = Math.random() < 0.5
    ? `🎁 Congrats! You've unlocked an NFT from [Ortak.me](https://ortak.me/)`
    : `😔 No gift this time. Come back tomorrow! ✨`;

  await sendMessage(userId, msg);
};
