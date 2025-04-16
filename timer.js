const { Collection } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const timers = new Collection();
const ytdl = require('ytdl-core');

module.exports = {
  /**
   * Starts a timer with sound alert and notifications
   * @param {GuildMember} member - Discord member
   * @param {number} minutes - Duration in minutes
   * @param {TextChannel} channel - Channel to send notifications
   */
  async startTimer(member, minutes, channel) {
    try {
      // Clear existing timer if any
      this.clearTimer(member.id);

      // Store timer start time and duration
      const timerData = {
        startTime: Date.now(),
        duration: minutes * 60 * 1000,
        channelId: channel.id,
        guildId: member.guild.id
      };

      const timeout = setTimeout(async () => {
        try {
          // Send DM notification
          await this.notifyUser(member, minutes);
          
          // Play sound if in voice channel
          if (member.voice.channel) {
            await this.playAlertSound(member);
          }

          // Send channel notification
          await channel.send(`${member}, your ${minutes}-minute timer has ended!`);
          
        } catch (error) {
          console.error(`Timer completion error for ${member.user.tag}:`, error);
        } finally {
          timers.delete(member.id);
        }
      }, timerData.duration);

      // Store timer data
      timers.set(member.id, {
        timeout,
        ...timerData
      });

      // Send initial confirmation
      await channel.send(`${member}, your ${minutes}-minute timer has started!`);
      
      return timeout;
    } catch (error) {
      console.error('Timer start error:', error);
      throw error;
    }
  },

  /**
   * Plays alert sound in user's voice channel
   * @param {GuildMember} member 
   */
  

  async playAlertSound(member) {
    if (!member.voice.channel) return;
  
    const connection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: member.guild.id,
      adapterCreator: member.guild.voiceAdapterCreator,
    });
  
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
      const player = createAudioPlayer();
  
      // Play the specific YouTube audio
      const stream = ytdl('https://www.youtube.com/watch?v=rUkzZTGE6jI', {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
      });
  
      const resource = createAudioResource(stream, {
        inlineVolume: true
      });
      resource.volume.setVolume(0.5); // Adjust volume as needed (0.0 to 1.0)
  
      connection.subscribe(player);
      player.play(resource);
  
      // Auto-disconnect after the audio finishes playing
      player.on('stateChange', (oldState, newState) => {
        if (newState.status === 'idle') {
          connection.destroy();
        }
      });
  
    } catch (error) {
      console.error('Audio error:', error);
      connection.destroy();
    }
  },
  /**
   * Sends timer completion notification
   * @param {GuildMember} member 
   * @param {number} minutes 
   */
  async notifyUser(member, minutes) {
    try {
      await member.send({
        content: `⏰ Your ${minutes}-minute timer has ended!`,
        allowedMentions: { users: [member.id] }
      });
    } catch (error) {
      console.error(`Could not DM ${member.user.tag}:`, error);
      throw error;
    }
  },

  /**
   * Clears an active timer
   * @param {string} userId 
   */
  clearTimer(userId) {
    const timer = timers.get(userId);
    if (timer) {
      clearTimeout(timer.timeout);
      timers.delete(userId);
    }
  },

  /**
   * Checks if user has active timer
   * @param {string} userId 
   * @returns {boolean}
   */
  hasTimer(userId) {
    return timers.has(userId);
  },

  /**
   * Gets remaining time for a timer
   * @param {string} userId 
   * @returns {number} Remaining time in minutes
   */
  getRemainingTime(userId) {
    const timer = timers.get(userId);
    if (!timer) return 0;
    
    const elapsed = Date.now() - timer.startTime;
    const remaining = timer.duration - elapsed;
    return Math.max(0, Math.ceil(remaining / 60000));
  }
};