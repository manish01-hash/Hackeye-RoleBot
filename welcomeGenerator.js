const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');


// Register fancy fonts
registerFont(path.join(__dirname, 'fonts', 'Pacifico.ttf'), { family: 'Pacifico' });
registerFont(path.join(__dirname, 'fonts', 'Montserrat-Bold.ttf'), { family: 'Montserrat' });
module.exports.generateWelcomeCard = async (member) => {
    const canvas = createCanvas(1200, 600);
    const ctx = canvas.getContext('2d');
    
    // 1. Gradient Background with Noise
    const gradient = ctx.createLinearGradient(0, 0, 1200, 600);
    gradient.addColorStop(0, '#0f0c29');
    gradient.addColorStop(1, '#302b63');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise texture
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 10000; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
        ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            2, 2
        );
    }
    ctx.globalAlpha = 1.0;
    
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
    
    // 4. Modern text with effects
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Username
    ctx.font = 'bold 60px "Montserrat"';
    ctx.fillText(member.user.username, 750, 250);
    
    // Welcome message
    ctx.font = 'italic 40px "Pacifico"';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Welcome to the server!', 750, 320);
    
    // Member count
    ctx.font = '30px "Montserrat"';
    ctx.fillStyle = '#9d00ff';
    ctx.fillText(`Member #${member.guild.memberCount}`, 750, 380);
    
    // 5. Convert to buffer and return
    return new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });
};