/**
 * Star Field Background Animation
 * Reusable component for Star Trek-style animated backgrounds
 */

class StarField {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`Canvas with id '${canvasId}' not found`);
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.options = {
      starCount: options.starCount || 800,
      speed: options.speed || 2,
      colors: options.colors || ['#FF9C00', '#99CCFF', '#CC99CC', '#FFFFFF'],
      trailOpacity: options.trailOpacity || 0.1
    };

    this.stars = [];
    this.animationFrame = null;

    this.init();
  }

  init() {
    this.resize();
    this.createStars();
    this.animate();

    // Handle window resize
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
  }

  createStars() {
    this.stars = Array.from({ length: this.options.starCount }, () => ({
      x: Math.random() * this.canvas.width - this.centerX,
      y: Math.random() * this.canvas.height - this.centerY,
      z: Math.random() * 1000,
      color: this.options.colors[Math.floor(Math.random() * this.options.colors.length)]
    }));
  }

  animate() {
    // Create trail effect
    this.ctx.fillStyle = `rgba(0, 0, 0, ${this.options.trailOpacity})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.stars.forEach(star => this.updateAndDrawStar(star));

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  updateAndDrawStar(star) {
    // Move star forward
    star.z -= this.options.speed;

    // Reset star if it goes past camera
    if (star.z <= 0) {
      star.z = 1000;
      star.x = Math.random() * this.canvas.width - this.centerX;
      star.y = Math.random() * this.canvas.height - this.centerY;
    }

    // Calculate star position
    const scale = 1000 / star.z;
    const x = this.centerX + star.x * scale;
    const y = this.centerY + star.y * scale;
    const size = Math.max(0, (1 - star.z / 1000) * 3);

    // Draw star
    this.ctx.fillStyle = star.color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw star trail
    this.ctx.strokeStyle = star.color;
    this.ctx.lineWidth = size;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    const prevScale = 1000 / (star.z + this.options.speed);
    this.ctx.lineTo(
      this.centerX + star.x * prevScale,
      this.centerY + star.y * prevScale
    );
    this.ctx.stroke();
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    window.removeEventListener('resize', this.resize);
  }
}

// Auto-initialize if canvas exists
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bgCanvas');
  if (canvas) {
    window.starField = new StarField('bgCanvas');
  }
});
