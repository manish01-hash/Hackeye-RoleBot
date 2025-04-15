const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// Role priorities (from highest to lowest)
const rolePriorities = [
  { name: 'Owner', prefix: 'O' },
  { name: 'Creators', prefix: 'C' },
  { name: 'Admin', prefix: 'A' },
  { name: 'Developer', prefix: 'D' },
  { name: 'Head Mod', prefix: 'HM' },
  { name: 'Mod', prefix: 'M' },
  { name: 'Trial Mod', prefix: 'TM' },
  { name: 'Helper', prefix: 'H' },
  { name: 'Booster', prefix: 'B' },
  { name: 'VIP', prefix: 'Vip' },
  { name: 'Guild Member', prefix: 'GM' } ,
  { name: 'Subscriber', prefix: 'Sub' },
  
];

// Function to get the highest priority role
function getHighestRole(memberRoles) {
  return rolePriorities.find(role =>
    memberRoles.some(r => r.name === role.name)
  );
}

// Function to reset nickname when no priority role is found
async function resetNickname(member) {
  if (member.nickname !== null) {
    await member.setNickname(null); // Reset nickname
    console.log(`Reset ${member.user.tag}'s nickname.`);
  }
}

client.once('ready', () => {
  console.log(`🤖 Bot is online as ${client.user.tag}`);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    const memberRoles = newMember.roles.cache;

    // Find the highest priority role the member has
    const highestRole = getHighestRole(memberRoles);

    // If no priority role is found, reset nickname to original name
    if (!highestRole) {
      await resetNickname(newMember);
      return;
    }

    const newNickname = `${highestRole.prefix} | ${newMember.user.username}`;

    // Only update if nickname is different
    if (newMember.nickname !== newNickname) {
      await newMember.setNickname(newNickname);
      console.log(`Updated ${newMember.user.tag}'s nickname to: ${newNickname}`);
    }
  } catch (error) {
    console.error(`Error updating nickname: ${error}`);
  }
});

// Log when a user joins and set their nickname based on roles
client.on('guildMemberAdd', async (member) => {
  try {
    const memberRoles = member.roles.cache;

    // Find the highest priority role the member has
    const highestRole = getHighestRole(memberRoles);

    // If no priority role is found, reset nickname to original name
    if (!highestRole) {
      await resetNickname(member);
      return;
    }

    const newNickname = `${highestRole.prefix} | ${member.user.username}`;

    // Only update if nickname is different
    if (member.nickname !== newNickname) {
      await member.setNickname(newNickname);
      console.log(`Set ${member.user.tag}'s nickname to: ${newNickname}`);
    }
  } catch (error) {
    console.error(`Error setting nickname on member join: ${error}`);
  }
});

client.login(process.env.DISCORD_TOKEN);

// Express server to keep bot online
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is running.'));
app.listen(3000, () => console.log('✅ Express server running on port 3000'));
