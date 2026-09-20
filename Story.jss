/* ══════════════════════════════════════
   Story.js  —  Premium Romantic Animations
   ══════════════════════════════════════ */

'use strict';

// ── 1. Canvas — SVG Heart & Petal Particles ──────────────────────────
(function initCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    Object.assign(canvas.style, {
        position: 'fixed', top: '0', left: '0',
        width: '100%', height: '100%',
        zIndex: '1', pointerEvents: 'none'
    });
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Draw a smooth SVG-style heart path
    function drawHeart(ctx, x, y, size, color, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = color;
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.scale(size, size);
        ctx.moveTo(0, -0.5);
        ctx.bezierCurveTo( 0.5, -1,  1,  -0.3,  0,  0.6);
        ctx.bezierCurveTo(-1,  -0.3, -0.5, -1,   0, -0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Draw a soft petal
    function drawPetal(ctx, x, y, size, color, alpha, angle) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = color;
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.4, size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    const COLORS = [
        '#c9184a', '#e63e6d', '#ff6b9d',
        '#a4133c', '#ff85a1', '#c9a84c'
    ];

    class Particle {
        constructor(x, y, burst) {
            this.type    = burst ? 'heart' : (Math.random() > 0.45 ? 'heart' : 'petal');
            this.x       = x ?? Math.random() * W;
            this.y       = burst ? y : H + 30;
            this.size    = burst
                ? 6  + Math.random() * 10
                : 5  + Math.random() * 12;
            this.color   = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.alpha   = burst ? 0.9 : 0;
            this.fadeIn  = !burst;
            this.speedY  = burst ? -(1.5 + Math.random() * 3) : (0.35 + Math.random() * 0.9);
            this.speedX  = (Math.random() - 0.5) * (burst ? 4 : 0.7);
            this.angle   = Math.random() * Math.PI * 2;
            this.spin    = (Math.random() - 0.5) * 0.04;
            this.wobble  = Math.random() * Math.PI * 2;
            this.wobbleS = 0.015 + Math.random() * 0.01;
            this.gravity = burst ? 0.06 : 0;
        }

        update() {
            this.y       -= this.speedY;
            this.speedY  -= this.gravity;
            this.x       += this.speedX + Math.sin(this.wobble) * 0.35;
            this.wobble  += this.wobbleS;
            this.angle   += this.spin;
            if (this.fadeIn && this.alpha < 0.75) this.alpha += 0.012;
            if (!this.fadeIn && this.gravity > 0 && this.speedY < -2) this.alpha -= 0.02;
            if (this.y < H * 0.18) this.alpha -= 0.007;
        }

        draw() {
            if (this.alpha <= 0) return;
            if (this.type === 'heart') {
                drawHeart(ctx, this.x, this.y, this.size, this.color, Math.max(0, this.alpha));
            } else {
                drawPetal(ctx, this.x, this.y, this.size, this.color, Math.max(0, this.alpha), this.angle);
            }
        }

        isDead() { return this.alpha <= 0 && (this.y < H * 0.1 || this.y > H + 60); }
    }

    let particles = [];
    let frame = 0;

    // Pre-seed
    for (let i = 0; i < 22; i++) {
        const p = new Particle();
        p.y     = Math.random() * H;
        p.alpha = Math.random() * 0.55;
        p.fadeIn = false;
        particles.push(p);
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        frame++;
        if (frame % 32 === 0) particles.push(new Particle());
        particles = particles.filter(p => !p.isDead());
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    window._burst = (x, y, n = 12) => {
        for (let i = 0; i < n; i++) particles.push(new Particle(x, y, true));
    };
})();


// ── 2. Smooth Cursor Trail (desktop only) ────────────────────────────
(function initCursorTrail() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch

    let lastX = 0, lastY = 0, moved = false;
    const SYMBOLS = ['♥', '✦', '❧', '✿', '♡'];
    const COLORS  = ['#c9184a','#e63e6d','#c9a84c','#ff85a1','#a4133c'];

    document.addEventListener('mousemove', e => {
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        if (Math.hypot(dx, dy) < 12) return; // throttle by distance
        lastX = e.clientX; lastY = e.clientY;

        const el = document.createElement('span');
        const idx = Math.floor(Math.random() * SYMBOLS.length);
        el.textContent = SYMBOLS[idx];
        const size = 10 + Math.random() * 12;
        Object.assign(el.style, {
            position:      'fixed',
            left:          e.clientX + 'px',
            top:           e.clientY + 'px',
            fontSize:      size + 'px',
            color:         COLORS[idx],
            pointerEvents: 'none',
            zIndex:        '9999',
            transform:     'translate(-50%,-50%) scale(1)',
            transition:    'opacity 0.9s ease, transform 0.9s ease',
            opacity:       '0.85',
            userSelect:    'none',
            textShadow:    `0 0 8px ${COLORS[idx]}`,
            willChange:    'opacity, transform'
        });
        document.body.appendChild(el);

        requestAnimationFrame(() => {
            el.style.opacity   = '0';
            el.style.transform = `translate(-50%, calc(-50% - ${28 + Math.random() * 28}px)) scale(0.3) rotate(${(Math.random()-0.5)*40}deg)`;
        });
        setTimeout(() => el.remove(), 950);
    });
})();


// ── 3. Click Burst ────────────────────────────────────────────────────
document.addEventListener('click', e => {
    if (typeof window._burst === 'function') window._burst(e.clientX, e.clientY, 14);

    // Ripple ring
    const ring = document.createElement('span');
    Object.assign(ring.style, {
        position:      'fixed',
        left:          e.clientX + 'px',
        top:           e.clientY + 'px',
        width:         '6px',
        height:        '6px',
        borderRadius:  '50%',
        border:        '2px solid rgba(201,24,74,0.7)',
        transform:     'translate(-50%,-50%) scale(1)',
        transition:    'transform 0.6s ease-out, opacity 0.6s ease-out',
        opacity:       '1',
        pointerEvents: 'none',
        zIndex:        '9998'
    });
    document.body.appendChild(ring);
    requestAnimationFrame(() => {
        ring.style.transform = 'translate(-50%,-50%) scale(18)';
        ring.style.opacity   = '0';
    });
    setTimeout(() => ring.remove(), 650);
});


// ── 4. Scroll Reveal ─────────────────────────────────────────────────
(function initReveal() {
    const items = document.querySelectorAll('.stanza, .final-quote, .divider');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (!entry.isIntersecting) return;
            setTimeout(() => entry.target.classList.add('visible'), i * 90);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    items.forEach(el => obs.observe(el));
})();


// ── 5. Typewriter on Final Quote ─────────────────────────────────────
(function initTypewriter() {
    const box = document.getElementById('quoteText');
    if (!box) return;

    const rawHTML = box.innerHTML;
    const temp    = document.createElement('div');
    temp.innerHTML = rawHTML;
    const fullText = temp.innerText;

    box.textContent = '';

    // Blinking cursor
    const cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.style.cssText = `
        color: #c9184a;
        font-style: normal;
        animation: twBlink 0.75s step-end infinite;
        margin-left: 1px;
    `;
    const blinkStyle = document.createElement('style');
    blinkStyle.textContent = '@keyframes twBlink { 0%,100%{opacity:1} 50%{opacity:0} }';
    document.head.appendChild(blinkStyle);
    box.appendChild(cursor);

    let started = false;
    const obs = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        obs.disconnect();

        let i = 0;
        const iv = setInterval(() => {
            if (i < fullText.length) {
                const ch = fullText[i++];
                cursor.insertAdjacentText('beforebegin', ch);
            } else {
                clearInterval(iv);
                setTimeout(() => {
                    cursor.style.animation = 'none';
                    cursor.style.opacity   = '0';
                    setTimeout(() => cursor.remove(), 400);
                }, 1400);
            }
        }, 42);
    }, { threshold: 0.6 });

    obs.observe(box);
})();


// ── 6. Instagram Button Ripple ────────────────────────────────────────
(function initBtnRipple() {
    const btn = document.querySelector('.insta-btn');
    if (!btn) return;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('pointerdown', e => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const rpl  = document.createElement('span');
        Object.assign(rpl.style, {
            position:     'absolute',
            width:        size + 'px',
            height:       size + 'px',
            left:         (e.clientX - rect.left - size / 2) + 'px',
            top:          (e.clientY - rect.top  - size / 2) + 'px',
            background:   'rgba(255,255,255,0.28)',
            borderRadius: '50%',
            transform:    'scale(0)',
            transition:   'transform 0.6s ease, opacity 0.6s ease',
            opacity:      '1',
            pointerEvents:'none'
        });
        btn.appendChild(rpl);
        requestAnimationFrame(() => {
            rpl.style.transform = 'scale(1)';
            rpl.style.opacity   = '0';
        });
        setTimeout(() => rpl.remove(), 650);
    });
})();


// ── 7. Smooth Orb Drift (Lissajous paths) ────────────────────────────
(function initOrbDrift() {
    const orbs = document.querySelectorAll('.orb');
    const configs = [
        { ax: 55, ay: 40, fx: 0.00045, fy: 0.00062, phase: 0 },
        { ax: 40, ay: 55, fx: 0.00038, fy: 0.00050, phase: 1.2 },
        { ax: 30, ay: 30, fx: 0.00060, fy: 0.00042, phase: 2.4 },
        { ax: 25, ay: 35, fx: 0.00052, fy: 0.00035, phase: 0.8 },
    ];

    function drift(ts) {
        orbs.forEach((orb, i) => {
            const c  = configs[i] || configs[0];
            const x  = Math.sin(ts * c.fx + c.phase) * c.ax;
            const y  = Math.cos(ts * c.fy + c.phase) * c.ay;
            const sc = 1 + Math.sin(ts * 0.0008 + c.phase) * 0.08;
            orb.style.transform = `translate(${x}px, ${y}px) scale(${sc})`;
        });
        requestAnimationFrame(drift);
    }
    requestAnimationFrame(drift);
})();


// ── 8. Card Parallax Tilt (desktop) ──────────────────────────────────
(function initTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const card = document.getElementById('mainCard');
    if (!card) return;

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    document.addEventListener('mousemove', e => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        targetX  = ((e.clientY - cy) / cy) * 3.5;
        targetY  = ((e.clientX - cx) / cx) * -3.5;
    });

    document.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

    function tiltLoop() {
        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;
        card.style.transform = `perspective(1200px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
        requestAnimationFrame(tiltLoop);
    }
    requestAnimationFrame(tiltLoop);
})();


// ── 9. Page Load — staggered card glow pulse ─────────────────────────
(function initGlow() {
    const card = document.getElementById('mainCard');
    if (!card) return;

    let t = 0;
    function glowLoop() {
        t += 0.012;
        const intensity = 0.3 + Math.sin(t) * 0.15;
        const spread    = 40  + Math.sin(t * 0.7) * 20;
        card.style.boxShadow = `
            0 0 0 1px rgba(201,168,76,0.08),
            0 8px 32px rgba(0,0,0,0.45),
            0 ${spread}px 80px rgba(120,0,50,${intensity}),
            inset 0 1px 0 rgba(255,255,255,0.6)
        `;
        requestAnimationFrame(glowLoop);
    }
    requestAnimationFrame(glowLoop);
})();
