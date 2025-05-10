const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const timer = require('./timer.js');
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ]
});

// Role priorities (from highest to lowest)
const rolePriorities = [
  { name: '👑 | Server Owner', prefix: 'O' },
  { name: '💠 | Co-Owner', prefix: 'CO' },
  { name: '🔧 | Server Developer', prefix: 'DEV' },
  { name: '⚙️ | Admin', prefix: 'ADMIN' },
  { name: '🔥 | Moderator', prefix: 'M' },
  { name: '🎀 | Girl Moderator', prefix: 'GM' },
  { name: '🎙️ | VC Moderator', prefix: 'VM' },
  { name: '💬 | Chat Moderator', prefix: 'CM' },
  { name: '🛠️ | Event Manager', prefix: 'EM' },
  { name: '🛡️ | Trial Mod', prefix: 'TM' },
  { name: '🎥 | YouTuber', prefix: 'YT' },
  { name: '🌟 | Booster', prefix: 'B' },
  { name: '📢 | Announcer', prefix: 'AN' },
  { name: '💎 | VIP Member', prefix: 'VIP' },
  { name: '🧡 | Trusted', prefix: 'T' },
  { name: '🌸 | Angel Aura', prefix: 'Angel' },
  { name: '📺 | Subscriber', prefix: 'SUB' },
];

// Function to get the highest priority role
function getHighestRole(memberRoles) {
  for (const role of rolePriorities) {
    if (memberRoles.some(r => r.name === role.name)) {
      return role;
    }
  }
  return null;
}

function cleanDisplayName(nickname) {
  if (!nickname) return '';

  // Create a single regex pattern that matches all prefixes at once
  const prefixes = rolePriorities.map(r => r.prefix).join('|');
  const regex = new RegExp(`^(?:${prefixes})(?:\\s\\|\\s(?:${prefixes}))*\\s\\|\\s`, 'i');
  // This will remove ALL prefix occurrences at the start
   // Remove all prefix combinations at the start
  return nickname.replace(regex, '').trim();

}

// Updated forceNick command section
if (message.content.startsWith('!forcenick')) {
  if (!message.member.permissions.has('MANAGE_NICKNAMES')) {
    return message.reply("❌ You need **Manage Nicknames** permission!");
  }

  const args = message.content.split(/ +/);
  const member = message.mentions.members.first();
  
  if (!member) {
    return message.reply("⚠️ Please mention a member! (Example: `!forcenick @User NewNickname`)");
  }

  const newName = args.slice(2).join(' ').trim();
  const currentNick = member.nickname || member.user.username;
  const displayName = cleanDisplayName(currentNick);
  
  try {
    // If new name specified, update name portion only
    if (newName) {
      const highestRole = getHighestRole(member.roles.cache);
      if (highestRole) {
        const newNickname = `${highestRole.prefix} | ${newName}`.slice(0, 32);
        await member.setNickname(newNickname);
        return message.reply(`✅ Updated ${member}'s nickname to: \`${newNickname}\``);
      }
      await member.setNickname(newName.slice(0, 32));
      return message.reply(`✅ Updated ${member}'s nickname to: \`${newName}\``);
    }

    // If no new name, apply proper role prefix
    const highestRole = getHighestRole(member.roles.cache);
    if (!highestRole) {
      await resetNickname(member);
      return message.reply(`✅ Reset ${member}'s nickname!`);
    }

    const newNickname = `${highestRole.prefix} | ${displayName}`.slice(0, 32);
    await member.setNickname(newNickname);
    return message.reply(`✅ Updated ${member}'s nickname to: \`${newNickname}\``);
    
  } catch (error) {
    console.error('ForceNick error:', error);
    message.reply(`❌ Failed to update nickname: ${error.message}`);
  }
}

// Function to reset nickname when no priority role is found
async function resetNickname(member) {
  try {
    if (member.nickname !== null) {
      await member.setNickname(null);
      console.log(`✅ Reset ${member.user.username}'s nickname to default.`);
    }
  } catch (error) {
    console.error(`❌ Failed to reset nickname for ${member.user.username}:`, error);
  }
}

client.once('ready', () => {
  console.log(`🤖 Bot is online as ${client.user.tag}`);
});

// Timer Commands
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  
  // Timer Start Command
  if (message.content.startsWith('!timer')) {
    try {
      const args = message.content.split(/ +/);
      const minutes = parseInt(args[1]);

      // Validate input
      if (isNaN(minutes)) {
        await message.reply('⏱️ Please specify time in minutes (e.g. `!timer 60`)');
        return await message.react('❓');
      }
      
      if (minutes < 1 || minutes > 240) {
        await message.reply('⏳ Please choose between 1-240 minutes!');
        return await message.react('⚠️');
      }

      // Check if user already has a timer
      if (timer.hasTimer(message.author.id)) {
        await message.reply(`⏰ You already have an active timer! Use \`!stoptimer\` to cancel it first.`);
        return await message.react('⏳');
      }

      // Start timer with sound alert
      await timer.startTimer(message.member, minutes, message.channel);
      
      // Visual confirmation
      await message.reply({
        content: `🔔 **Timer Started**\n⏳ Duration: ${minutes} minutes\nYou'll be notified when time's up!`,
        allowedMentions: { repliedUser: false }
      });
      
      await message.react('✅');
      
      // Optional: Send initial DM confirmation
      try {
        await message.author.send(`⏰ Timer started for ${minutes} minutes in ${message.guild.name}!`);
      } catch (dmError) {
        console.log(`Couldn't send DM to ${message.author.tag}`);
      }
      
    } catch (error) {
      console.error('Timer command error:', error);
      await message.reply('❌ Failed to set timer. Please try again!');
      await message.react('❗');
    }
  }

  // Timer Cancel Command
  if (message.content === '!stoptimer') {
    try {
      if (timer.hasTimer(message.author.id)) {
        timer.clearTimer(message.author.id);
        await message.reply('✅ Timer cancelled successfully!');
        await message.react('🛑');
      } else {
        await message.reply("⏳ You don't have any active timers to cancel!");
        await message.react('❌');
      }
    } catch (error) {
      console.error('Timer cancellation error:', error);
      await message.reply('❌ Failed to cancel timer. Please try again!');
      await message.react('❗');
    }
  }

  // Timer Status Command
  if (message.content === '!timerstatus') {
    try {
      if (timer.hasTimer(message.author.id)) {
        await message.reply('⏰ You have an active timer running!');
        await message.react('🔔');
      } else {
        await message.reply("🛑 No active timers found. Use `!timer` to start one!");
        await message.react('⏳');
      }
    } catch (error) {
      console.error('Timer status error:', error);
      await message.react('❗');
    }
  }

});

// Improved Nickname Management
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    // Skip if the member is the bot itself
    if (newMember.user.bot) return;

    const memberRoles = newMember.roles.cache;
    let displayName = newMember.displayName || newMember.user.globalName || newMember.user.username;

    // Check if the nickname was changed manually
    const wasManuallyChanged = oldMember.nickname !== newMember.nickname && 
                              newMember.nickname !== `${getHighestRole(oldMember.roles.cache)?.prefix || ''} | ${cleanDisplayName(displayName)}`;

    // If nickname was manually changed by an admin/owner, respect that change
    if (wasManuallyChanged) {
      console.log(`🛑 Respecting manual nickname change for ${newMember.user.username}: "${newMember.nickname}"`);
      return;
    }

    // Handle server owner specially - don't modify their nickname
    if (newMember.id === newMember.guild.ownerId) return;

    const highestRole = getHighestRole(memberRoles);
    
    if (!highestRole) {
      await resetNickname(newMember);
      return;
    }

    // Clean the display name from any existing role prefixes
    displayName = cleanDisplayName(displayName);
    const newNickname = `${highestRole.prefix} | ${displayName}`;

    if (newMember.nickname !== newNickname) {
      await newMember.setNickname(newNickname);
      console.log(`🔁 Updated ${newMember.user.username}'s nickname to: "${newNickname}"`);
    }
  } catch (error) {
    console.error(`❌ Error in guildMemberUpdate:`, error);
  }
});
client.login(process.env.DISCORD_TOKEN);

// Express server to keep bot online
const app = express();
app.get('/', (req, res) => res.send('🤖 Bot is running.'));
app.listen(3000, () => console.log('🌐 Express server running on port 3000'));