const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const { AttachmentBuilder } = require('discord.js');

// Register available fonts
registerFont(path.join(__dirname, 'fonts', 'Pacifico.ttf'), { family: 'Pacifico' });
registerFont(path.join(__dirname, 'fonts', 'Montserrat-Bold.ttf'), { family: 'Montserrat', weight: 'bold' });

module.exports.generateWelcomeCard = async (member) => {
    const canvas = createCanvas(1200, 800); // Increased height for additional content
    const ctx = canvas.getContext('2d');
    
    // 1. Load animated GIF background (will use first frame)
    try {
        const background = await loadImage('https://cdn.discordapp.com/attachments/1361382474072195212/1362113513312616518/standard.gif');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        
        // Add dark overlay for better text visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } catch (err) {
        console.error('Background load error, using fallback:', err);
        // Fallback gradient background
        const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
        gradient.addColorStop(0, '#0f0c29');
        gradient.addColorStop(1, '#302b63');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // 2. Load and draw circular avatar with glow
    try {
        const avatar = await loadImage(
            member.user.displayAvatarURL({ extension: 'png', size: 512 })
        );
        
        // Glow effect
        ctx.shadowColor = '#9d00ff';
        ctx.shadowBlur = 50;
        ctx.beginPath();
        ctx.arc(300, 300, 180, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Circular mask
        ctx.beginPath();
        ctx.arc(300, 300, 150, 0, Math.PI * 2);
        ctx.closePath();
        ctx.save();
        ctx.clip();
        ctx.drawImage(avatar, 150, 150, 300, 300);
        ctx.restore();
        
        // Border
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    } catch (err) {
        console.error('Avatar load error:', err);
    }
    
    // 3. Floating particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 50; i++) {
        const size = Math.random() * 5 + 1;
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            size, 0, Math.PI * 2
        );
        ctx.fill();
    }
    
    // 4. Main welcome text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Username (using Montserrat Bold)
    ctx.font = '60px "Montserrat"';
    ctx.fillText(member.user.username, 750, 250);
    
    // Welcome message (using Pacifico)
    ctx.font = 'italic 40px "Pacifico"';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Welcome to the server!', 750, 320);
    
    // Member count (using Montserrat Bold)
    ctx.font = '30px "Montserrat"';
    ctx.fillStyle = '#9d00ff';
    ctx.fillText(`Member #${member.guild.memberCount}`, 750, 380);
    
   // 5. Additional information section with channel mentions
   ctx.fillStyle = '#ffffff';
   ctx.textAlign = 'center';
   
   // Divider line
   ctx.strokeStyle = '#9d00ff';
   ctx.lineWidth = 3;
   ctx.beginPath();
   ctx.moveTo(100, 450);
   ctx.lineTo(1100, 450);
   ctx.stroke();
   
   // Section title
   ctx.font = 'bold 36px "Montserrat"';
   ctx.fillText('━━━━━━━━━━━━━━━━━━━━━', 600, 500);
   ctx.fillText('MAKE SURE TO CHECK OUT', 600, 540);
   ctx.fillText('━━━━━━━━━━━━━━━━━━━━━', 600, 570);
   
   // Information points with channel mentions
   ctx.font = 'bold 28px "Montserrat"';
   ctx.textAlign = 'left';
   
   const infoPoints = [
       { emoji: '🔹', text: '<#1361356068344696892> For Server Rules' },
       { emoji: '🔹', text: '<#1361356113404235878> To Customize yourself' },
       { emoji: '🔹', text: '<#1361380747197288711> About Hackeye Live' },
       { emoji: '🔹', text: '<#1361748512806539284> Start chatting from here' }
   ];
   
   infoPoints.forEach((point, index) => {
       ctx.fillStyle = '#9d00ff';
       ctx.fillText(point.emoji, 300, 630 + index * 40);
       ctx.fillStyle = '#ffffff';
       // Split text to handle the channel mention separately if needed
       const channelPart = point.text.split(' ')[0];
       const restOfText = point.text.substring(channelPart.length);
       
       // Draw channel mention (in different color)
       ctx.fillStyle = '#9d00ff';
       ctx.fillText(channelPart, 340, 630 + index * 40);
       
       // Draw remaining text
       ctx.fillStyle = '#ffffff';
       const channelWidth = ctx.measureText(channelPart).width;
       ctx.fillText(restOfText, 340 + channelWidth, 630 + index * 40);
   });
   
   return new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });
};