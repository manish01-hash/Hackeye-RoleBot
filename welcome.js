const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { generateWelcomeCard } = require('./welcomeGenerator');
const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;

module.exports = async (member) => {
    try {
        const welcomeChannel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
        if (!welcomeChannel) return;

        // Generate ultra HD welcome card with animations
        const welcomeAttachment = await generateWelcomeCard(member);
        
        // Create 3D parallax effect embed
        const embed = new EmbedBuilder()
            .setColor('#4B0082')
            .setTitle(`✨ W E L C O M E ✨`)
            .setDescription(`
            **${member.user.username}** just entered **${member.guild.name}**!
            ━━━━━━━━━━━━━━━━━━━
            🎉 **Member #${member.guild.memberCount}**
            🌟 **Enjoy your stay!**
            `)
            .setImage('attachment://welcome.png')
            .setFooter({ 
                text: `${member.guild.name}`, 
                iconURL: member.guild.iconURL() 
            });

        // Send with fireworks reaction
        const msg = await welcomeChannel.send({
            content: `${member}`,
            embeds: [embed],
            files: [welcomeAttachment]
        });
        
        await msg.react('🎆');
        await msg.react('🎇');
        await msg.react('✨');

    } catch (error) {
        console.error('Advanced welcome error:', error);
    }
};