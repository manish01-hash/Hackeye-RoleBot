const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const timer = require('./timer.js'); // Make sure timer.js exists

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent // Required for message commands
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
  { name: 'Guild Member', prefix: 'GM' },
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
  if (message.content === '!stoptimer') {  // Removed extra parenthesis
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

  // Timer Status Command (New)
  if (message.content === '!timerstatus') {  // Removed extra parenthesis
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
// Nickname Management
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    const memberRoles = newMember.roles.cache;

    // Skip server owner
    if (newMember.id === newMember.guild.ownerId) {
      console.log(`⏩ Skipping owner: ${newMember.user.username}`);
      return;
    }

    const highestRole = getHighestRole(memberRoles);
    
    if (!highestRole) {
      await resetNickname(newMember);
      return;
    }

    const newNickname = `${highestRole.prefix} | ${newMember.user.username}`;

    if (newMember.nickname !== newNickname) {
      await newMember.setNickname(newNickname);
      console.log(`🔁 Updated ${newMember.user.username}'s nickname to: "${newNickname}"`);
    }
  } catch (error) {
    console.error(`❌ Error in guildMemberUpdate:`, error);
  }
});

client.on('guildMemberAdd', async (member) => {
  try {
    const memberRoles = member.roles.cache;
    const highestRole = getHighestRole(memberRoles);

    if (!highestRole) {
      await resetNickname(member);
      return;
    }

    const newNickname = `${highestRole.prefix} | ${member.user.username}`;

    if (member.nickname !== newNickname) {
      await member.setNickname(newNickname);
      console.log(`👋 Set new nickname for ${member.user.username}: "${newNickname}"`);
    }
  } catch (error) {
    console.error(`❌ Error in guildMemberAdd:`, error);
  }
});

client.login(process.env.DISCORD_TOKEN);

// Express server to keep bot online
const app = express();
app.get('/', (req, res) => res.send('🤖 Bot is running.'));
app.listen(3000, () => console.log('🌐 Express server running on port 3000'));