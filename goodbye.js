const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { generateGoodbyeCard } = require('./goodbyeGenerator');
const config = require('../../config.json');

module.exports = async (member) => {
    try {
        const goodbyeChannel = member.guild.channels.cache.get(config.goodbyeChannelId);
        if (!goodbyeChannel) return;

        // Generate cinematic goodbye card
        const goodbyeAttachment = await generateGoodbyeCard(member);
        
        // Create dramatic embed
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(`💔 G O O D B Y E 💔`)
            .setDescription(`
            **${member.user.username}** has left **${member.guild.name}**
            ━━━━━━━━━━━━━━━━━━━
            🕒 **Joined:** ${member.joinedAt.toDateString()}
            📅 **Account Age:** ${Math.floor((new Date() - member.user.createdAt) / (1000 * 60 * 60 * 24))} days
            `)
            .setImage('attachment://goodbye.png')
            .setFooter({ 
                text: `We're now ${member.guild.memberCount} members`, 
                iconURL: member.guild.iconURL() 
            });

        await goodbyeChannel.send({
            embeds: [embed],
            files: [goodbyeAttachment]
        });

    } catch (error) {
        console.error('Premium goodbye error:', error);
    }
};