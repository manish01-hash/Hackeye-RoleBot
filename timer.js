const { Collection } = require('discord.js');
const timers = new Collection();

module.exports = {
  /**
   * Starts a timer with notifications
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