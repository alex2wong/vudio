function Particle(opt) {
    this.x = opt.x || 0;
    this.y = opt.y || 0;
    this.vx = opt.vx || Math.random() - .5;
    this.vy = opt.vy || Math.random() - .5;
    this.size = opt.size || Math.random() * 3;
    this.life = opt.life || Math.random() * 5;
    
    this.dead = false;

    this.alpha = 1;
    this.rotate = 0;
    this.color = opt.color || 'rgba(244,244,244,.9)';
    this.type = opt.type || 'circle';

    this.update = update;
    this.render = render;
    // return this;
}

function update(ctx) {
    this.x += this.vx;
    this.y += this.vy;

    this.life -= .01;
    this.alpha -= .003;
    this.rotate += Math.random() * .01;
    if (this.life < 0) {
        this.dead = true;
        this.alpha = 0;
        return;
    }
    this.render(ctx);
}

function render(ctx) {
    var dot = this, gA = ctx.globalAlpha;
    // ctx.shadowBlur = dot.size / 2;
    // ctx.shadowColor = 'rgba(244,244,244,.2)';
    ctx.fillStyle = dot.color;
    if (dot.type === 'circle') {
        ctx.beginPath();
        ctx.globalAlpha = dot.alpha;
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.save();
        ctx.translate(dot.x, dot.y);
        ctx.rotate(dot.rotate);
        ctx.rect(0, 0, dot.size, dot.size);
        ctx.restore();
        ctx.fill();
    }
    ctx.globalAlpha = gA;
}
