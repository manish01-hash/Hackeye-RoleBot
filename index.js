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
    // Check if bot has permission to manage nicknames
    if (!newMember.guild.me.permissions.has('MANAGE_NICKNAMES')) {
      console.error('Bot lacks MANAGE_NICKNAMES permission');
      return;
    }

    const memberRoles = newMember.roles.cache;
    
    // Debug: Log all roles for verification
    console.log(`${newMember.user.tag}'s roles:`, [...memberRoles.values()].map(r => r.name));

    // Find all priority roles the member has
    const memberPriorityRoles = rolePriorities.filter(role => 
      memberRoles.some(r => r.name === role.name)
    ).sort((a, b) => 
      rolePriorities.findIndex(r => r.name === a.name) - 
      rolePriorities.findIndex(r => r.name === b.name)
    );
    
    if (memberPriorityRoles.length === 0) return;

    // Get the highest priority role
    const highestRole = memberPriorityRoles[0];
    
    const newNickname = `${highestRole.prefix} | ${newMember.user.username}`;
    
    // Only update if nickname is different
    if (newMember.nickname !== newNickname) {
      await newMember.setNickname(newNickname)
        .then(() => console.log(`Successfully updated ${newMember.user.tag}`))
        .catch(err => {
          if (err.code === 50013) {
            console.error(`Missing permissions to change ${newMember.user.tag}'s nickname`);
            // This usually means the bot's role needs to be higher
          } else {
            console.error(`Error updating ${newMember.user.tag}:`, err);
          }
        });
    }
  } catch (error) {
    console.error(`Unexpected error:`, error);
  }
});


client.login(process.env.DISCORD_TOKEN);

const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is running.'));
app.listen(3000, () => console.log('✅ Express server running on port 3000'));