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
  { name: 'Head Mod', prefix: 'HM' },
  { name: 'Mod', prefix: 'M' },
  { name: 'Trial Mod', prefix: 'TM' },
  { name: 'Developer', prefix: 'D' },
  { name: 'Helper', prefix: 'H' },
  { name: 'VIP', prefix: 'Vip' },
  { name: 'Booster', prefix: 'B' },
  { name: 'Subscriber', prefix: 'Sub' },
  { name: 'Guild Member', prefix: 'GM' }
];

client.once('ready', () => {
  console.log(`🤖 Bot is online as ${client.user.tag}`);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    const memberRoles = newMember.roles.cache;
    
    // Find the highest priority role the member has
      const highestRole = rolePriorities.find(role =>
          memberRoles.some(r => r.name === role.name)
      );
    if (!highestRole) return; // No priority roles found
    
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

client.login(process.env.DISCORD_TOKEN);