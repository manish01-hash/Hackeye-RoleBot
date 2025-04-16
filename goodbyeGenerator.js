const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports.generateGoodbyeCard = async (member) => {
    const canvas = createCanvas(1200, 400);
    const ctx = canvas.getContext('2d');
    
    // 1. Dark cinematic background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 2. Load and draw faded avatar
    try {
        const avatar = await loadImage(
            member.user.displayAvatarURL({ extension: 'png', size: 256 })
        );
        
        ctx.globalAlpha = 0.3;
        ctx.drawImage(avatar, 50, 75, 300, 300);
        ctx.globalAlpha = 1.0;
    } catch (err) {
        console.error('Avatar load error:', err);
    }
    
    // 3. Shattered glass effect
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(
            400 + Math.random() * 700,
            Math.random() * canvas.height
        );
        ctx.lineTo(
            400 + Math.random() * 700,
            Math.random() * canvas.height
        );
        ctx.stroke();
    }
    
    // 4. Dramatic text
    ctx.fillStyle = '#ff0000';
    ctx.textAlign = 'center';
    
    // Username
    ctx.font = 'bold 50px Arial';
    ctx.fillText(`${member.user.username}`, 750, 150);
    
    // Goodbye message
    ctx.font = 'italic 30px Arial';
    ctx.fillText('has left the server', 750, 200);
    
    // Stats
    ctx.font = '20px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`Member since: ${member.joinedAt.toDateString()}`, 750, 250);
    ctx.fillText(`We're now ${member.guild.memberCount} members`, 750, 300);
    
    // 5. Convert to buffer and return
    return new AttachmentBuilder(canvas.toBuffer(), { name: 'goodbye.png' });
};