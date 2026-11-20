// main.js — October 73
gsap.registerPlugin(ScrollTrigger);

// Add ?static to the URL to skip all animations (handy for screenshots / debugging)
const STATIC = /[?&]static/.test(location.search);
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const NO_MOTION = STATIC || REDUCED;

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothTouch: false,
    touchMultiplier: 2,
});
lenis.stop();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// ═══ Loader: a flag that waves gently while the page prepares ═══
const loaderIconTl = gsap.timeline({ repeat: -1, yoyo: true });
loaderIconTl.to('.loader-icon', { rotation: 4, transformOrigin: '25% 90%', duration: 1.1, ease: 'sine.inOut' });

const facts = [
    "Did you know? At 2:00 PM on 6 October 1973, more than 200 Egyptian aircraft opened the war with a single strike.",
    "Did you know? Egyptian engineers used water pumps to wash passages through the Bar Lev Line’s sand wall.",
    "Did you know? The Egyptian flag rose on the east bank at 14:35, thirty-five minutes after zero hour.",
    "Did you know? Nubian soldiers sent secret radio messages in a language with no written alphabet.",
    "Did you know? Operation Badr was named after the Battle of Badr, fought in Ramadan in 624."
];
const loaderText = document.querySelector('.loader-text');
let factInterval;
function rotateFacts() {
    if (!loaderText) return;
    factInterval = setInterval(() => {
        gsap.to(loaderText, {
            opacity: 0, y: -10, duration: 0.5, onComplete: () => {
                loaderText.innerText = facts[Math.floor(Math.random() * facts.length)];
                gsap.to(loaderText, { opacity: 1, y: 0, duration: 0.5 });
            }
        });
    }, 3000);
}
rotateFacts();
const progressTween = gsap.to('.loader-progress-bar', { width: '80%', duration: 3, ease: 'power1.inOut' });

// ═══ Remote photos: if one cannot load, show the themed backdrop instead of a broken icon ═══
function markFailed(img) {
    const holder = img.closest('.img-wrapper, .hero-bg, .gallery-item');
    if (holder) holder.classList.add('img-failed');
}
document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => markFailed(img));
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markFailed(img);
});

// ═══ Navbar ═══
const nav = document.querySelector('.navbar');
ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
        if (self.direction === 1) nav.classList.add('scrolled');
        else if (self.scroll() < 80) nav.classList.remove('scrolled');
    }
});

// ═══ Hero: one orchestrated entrance ═══
const heroTl = gsap.timeline({ paused: true });
heroTl.from('.hero-bg img', { scale: 1.35, duration: 2.4, ease: 'power3.out' })
    .from('.reveal-text', { y: 80, opacity: 0, duration: 1.1, ease: 'power4.out' }, '-=1.6')
    .from('.reveal-text-sub', { opacity: 0, y: 20, duration: 0.9, ease: 'power2.out' }, '-=0.6')
    .from('.hero-stamp', { opacity: 0, x: 40, duration: 1.2, ease: 'power2.out' }, '-=1')
    .from('.scroll-indicator', { opacity: 0, duration: 0.8 }, '-=0.4');

// ═══ Timeline: horizontal scroll pinned on desktop, native scroll on mobile ═══
const timelineContainer = document.querySelector('.timeline-container');
let timelineST = null;
function buildTimeline() {
    if (!timelineContainer) return;
    if (timelineST) { timelineST.kill(); timelineST = null; }
    gsap.set(timelineContainer, { clearProps: 'all' });
    if (window.innerWidth < 768 || NO_MOTION) return;

    const isRTL = document.documentElement.dir === 'rtl';
    const scrollWidth = timelineContainer.scrollWidth;
    const tween = gsap.to(timelineContainer, {
        x: () => (isRTL ? 1 : -1) * (scrollWidth - window.innerWidth),
        ease: 'none'
    });
    timelineST = ScrollTrigger.create({
        trigger: '.history-timeline',
        start: 'top top',
        end: () => '+=' + scrollWidth,
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        animation: tween
    });
}
window.rebuildTimeline = buildTimeline;

// ═══ Scroll reveals (kept light: one reveal per block) ═══
function reveal(targets, trigger, extra = {}) {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return;
    gsap.set(els, { clearProps: 'all' });
    gsap.fromTo(els, { y: 36, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power2.out', ...extra,
        scrollTrigger: { trigger, start: 'top 88%', toggleActions: 'play none none none' }
    });
}

function initGlobalAnimations() {
    ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger && !st.trigger.classList.contains('history-timeline') && !st.vars.pin) st.kill();
    });
    if (NO_MOTION) {
        // make sure nothing stays hidden and still animate the counters' final value
        ScrollTrigger.refresh();
        return;
    }

    document.querySelectorAll('.section-title').forEach((t) => reveal(t.children, t));
    reveal('#prelude .civ-card', '#prelude .civ-grid');
    reveal('#beyond .civ-card', '#beyond .civ-grid');
    reveal('.figure-card', '.figures-grid');
    reveal('.force-card', '.forces-grid');
    document.querySelectorAll('.achievements-list').forEach((l) => reveal(l.querySelectorAll('.achievement-row'), l, { stagger: 0.12 }));
    reveal('.crossing-fact', '.crossing-facts');

    gsap.set('.panorama-content > *, .panorama-visual', { clearProps: 'all' });
    gsap.from('.panorama-content > *', { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: '.panorama', start: 'top 80%' } });
    gsap.from('.panorama-visual', { autoAlpha: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: '.panorama', start: 'top 80%' } });

    gsap.set('.gallery-item, .legacy-content > *', { clearProps: 'all' });
    gsap.from('.gallery-item', { autoAlpha: 0, y: 40, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: '.legacy-gallery', start: 'top 88%' } });
    gsap.from('.legacy-content > *', { autoAlpha: 0, y: 30, duration: 0.9, stagger: 0.15, ease: 'power2.out', scrollTrigger: { trigger: '.legacy-gallery', start: 'top 88%' } });

    // Year counters (data-plain = no thousands separator, e.g. 1973)
    document.querySelectorAll('.stat .num').forEach((num) => {
        gsap.set(num, { clearProps: 'all' });
        const text = num.innerText;
        const value = parseInt(text.replace(/,/g, ''), 10);
        const suffix = text.replace(/[0-9,]/g, '');
        if (isNaN(value)) return;
        const plain = num.hasAttribute('data-plain');
        const obj = { val: 0 };
        gsap.to(obj, {
            val: value, duration: 2, ease: 'power2.out',
            scrollTrigger: { trigger: num, start: 'top 95%', toggleActions: 'play none none none' },
            onUpdate: () => {
                const v = Math.floor(obj.val);
                num.innerText = (plain ? String(v) : v.toLocaleString()) + suffix;
            }
        });
    });

    // Gentle parallax on the hero and the photos
    gsap.utils.toArray('.img-wrapper img, #hero-img').forEach((img) => {
        const isHero = img.id === 'hero-img';
        gsap.set(img, { scale: isHero ? 1.2 : 1.12 });
        gsap.fromTo(img,
            { yPercent: isHero ? 0 : -8 },
            { yPercent: isHero ? 18 : 8, ease: 'none', scrollTrigger: { trigger: isHero ? '.hero' : img.parentElement, start: isHero ? 'top top' : 'top bottom', end: 'bottom top', scrub: true } }
        );
    });
    ScrollTrigger.refresh();
}
window.initGlobalAnimations = initGlobalAnimations;

// ═══ Load ═══
window.addEventListener('load', () => {
    setTimeout(() => {
        buildTimeline();
        initGlobalAnimations();
        ScrollTrigger.refresh();
    }, 200);

    const loader = document.querySelector('.loader-wrapper');
    const finish = () => {
        if (factInterval) clearInterval(factInterval);
        loaderIconTl.kill();
        if (loader) loader.style.display = 'none';
        lenis.start();
        if (!NO_MOTION) heroTl.play();
        ScrollTrigger.refresh();
    };
    if (!loader) return finish();
    if (NO_MOTION) return finish();
    progressTween.kill();
    gsap.to('.loader-progress-bar', {
        width: '100%', duration: 0.5, ease: 'power2.out',
        onComplete: () => gsap.to(loader, { opacity: 0, duration: 0.7, onComplete: finish })
    });
});

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => { buildTimeline(); ScrollTrigger.refresh(); }, 250);
});

// ═══ Mobile menu ═══
const menuBtn = document.querySelector('.menu-toggle');
const navLinks2 = document.querySelector('.nav-links');
if (menuBtn && navLinks2) {
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navLinks2.classList.toggle('active');
        document.body.style.overflow = navLinks2.classList.contains('active') ? 'hidden' : '';
    });
    document.querySelectorAll('.nav-links a').forEach((link) => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navLinks2.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ═══ Active link in the navbar ═══
(function setActiveNavLink() {
    const links = document.querySelectorAll('.nav-links a');
    const ids = Array.from(links).map((a) => a.getAttribute('href').slice(1));
    function update() {
        const y = window.scrollY + 120;
        for (const id of ids) {
            const s = document.getElementById(id);
            if (!s) continue;
            const top = s.getBoundingClientRect().top + window.scrollY;
            if (y >= top && y < top + s.offsetHeight) {
                links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
                break;
            }
        }
    }
    window.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    update();
})();
