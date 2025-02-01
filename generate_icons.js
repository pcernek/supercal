function generateIcons() {
  const sizes = [16, 48, 128];
  const googleBlue = '#1a73e8';

  sizes.forEach(size => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // White background circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.45, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Blue outline
    ctx.strokeStyle = googleBlue;
    ctx.lineWidth = Math.max(size * 0.06, 1);
    ctx.stroke();

    // Clock hands
    const centerX = size / 2;
    const centerY = size / 2;
    const handLength = size * 0.3;

    // Hour hand (pointing to 2)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + handLength * Math.cos(2 * Math.PI * (2 / 12) - Math.PI / 2) * 0.7,
      centerY + handLength * Math.sin(2 * Math.PI * (2 / 12) - Math.PI / 2) * 0.7
    );
    ctx.strokeStyle = googleBlue;
    ctx.lineWidth = Math.max(size * 0.06, 1);
    ctx.stroke();

    // Minute hand (pointing to 10)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + handLength * Math.cos(2 * Math.PI * (10 / 12) - Math.PI / 2),
      centerY + handLength * Math.sin(2 * Math.PI * (10 / 12) - Math.PI / 2)
    );
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.06, 0, 2 * Math.PI);
    ctx.fillStyle = googleBlue;
    ctx.fill();

    // Save as PNG
    const link = document.createElement('a');
    link.download = `icon${size}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

// Run in browser console to generate icons
generateIcons();