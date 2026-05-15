const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (from, to, amount) => from + (to - from) * amount;
const formatMillions = (value) => `EUR ${value.toFixed(1)}M`;

const initStarfield = () => {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const points = [];
  const pointer = { x: 0.5, y: 0.5 };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrame = 0;
  let scrollProgress = 0;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    points.length = 0;
    const density = width < 700 ? 68 : 116;
    for (let index = 0; index < density; index += 1) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.25 + Math.random() * 1.6,
        r: 0.35 + Math.random() * 1.45,
        vx: -0.06 + Math.random() * 0.12,
        vy: -0.03 + Math.random() * 0.06,
        tint: Math.random() > 0.72 ? "203, 154, 72" : "223, 231, 255",
      });
    }
  };

  const draw = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

    ctx.clearRect(0, 0, width, height);
    const pulse = 0.42 + Math.sin(performance.now() / 1800) * 0.16;

    points.forEach((point, index) => {
      const driftX = (pointer.x - 0.5) * point.z * 34;
      const driftY = (pointer.y - 0.5) * point.z * 22;
      point.x += point.vx * point.z + scrollProgress * 0.12;
      point.y += point.vy * point.z;

      if (point.x < -40) point.x = width + 40;
      if (point.x > width + 40) point.x = -40;
      if (point.y < -40) point.y = height + 40;
      if (point.y > height + 40) point.y = -40;

      const x = point.x + driftX;
      const y = point.y + driftY;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${point.tint}, ${0.16 + pulse * 0.16})`;
      ctx.arc(x, y, point.r * point.z, 0, Math.PI * 2);
      ctx.fill();

      for (let next = index + 1; next < points.length; next += 1) {
        const other = points[next];
        const dx = x - (other.x + driftX * 0.45);
        const dy = y - (other.y + driftY * 0.45);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 106) {
          ctx.strokeStyle = `rgba(203, 154, 72, ${0.045 * (1 - distance / 106)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(other.x + driftX * 0.45, other.y + driftY * 0.45);
          ctx.stroke();
        }
      }
    });

    if (!prefersReducedMotion) animationFrame = requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
    },
    { passive: true },
  );

  resize();
  draw();

  return () => cancelAnimationFrame(animationFrame);
};

const initScrollChapters = () => {
  const scenes = [...document.querySelectorAll(".scene")];
  const progressDots = [...document.querySelectorAll(".progress-dot")];
  const progressLine = document.querySelector(".progress-line");
  const cinematicProgress = document.querySelector(".cinematic-progress");
  const reveals = [...document.querySelectorAll(".reveal")];

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
    document.documentElement.style.setProperty("--scroll", progress.toFixed(4));
    if (progressLine) progressLine.style.transform = `scaleY(${progress})`;
    if (cinematicProgress) cinematicProgress.style.transform = `scaleX(${progress})`;
  };

  const sceneObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = scenes.indexOf(entry.target);
        scenes.forEach((scene) => scene.classList.toggle("scene-active", scene === entry.target));
        progressDots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
      });
    },
    { rootMargin: "-38% 0px -42% 0px", threshold: 0.01 },
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("reveal-now");
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
  );

  scenes.forEach((scene) => sceneObserver.observe(scene));
  reveals.forEach((element) => revealObserver.observe(element));

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
};

const initCountUps = () => {
  const counters = [...document.querySelectorAll("[data-count]")];

  const animateCounter = (element) => {
    if (element.dataset.counted === "true") return;
    element.dataset.counted = "true";

    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;

    const suffix = element.dataset.suffix || "";
    const prefix = element.dataset.prefix || "";
    const decimals = Number(element.dataset.decimals || 0);
    const duration = prefersReducedMotion ? 1 : 1500 + Math.random() * 700;
    const start = performance.now();

    const step = (now) => {
      const elapsed = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const value = target * eased;
      element.textContent = `${prefix}${value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;
      if (elapsed < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) animateCounter(entry.target);
      });
    },
    { threshold: 0.35 },
  );

  counters.forEach((counter) => observer.observe(counter));
};

const initPeerUniverse = () => {
  const plot = document.getElementById("peerPlot");
  if (!plot) return;

  const peerSeed = [
    { revenue: 7.4, employees: 42, sector: "C25", score: 68 },
    { revenue: 8.1, employees: 46, sector: "C25", score: 71 },
    { revenue: 9.6, employees: 54, sector: "C25", score: 74 },
    { revenue: 5.9, employees: 38, sector: "C25", score: 63 },
    { revenue: 11.2, employees: 64, sector: "C25", score: 78 },
    { revenue: 6.8, employees: 40, sector: "C25", score: 65 },
    { revenue: 10.6, employees: 59, sector: "C25", score: 76 },
    { revenue: 12.8, employees: 72, sector: "C25", score: 81 },
    { revenue: 4.7, employees: 31, sector: "C25", score: 59 },
    { revenue: 14.2, employees: 80, sector: "C25", score: 83 },
  ];

  const cloud = [];
  for (let index = 0; index < 72; index += 1) {
    const angle = index * 1.71;
    const radius = 0.16 + (index % 19) / 30 + Math.random() * 0.08;
    const x = clamp(50 + Math.cos(angle) * radius * 48 + Math.random() * 8 - 4, 7, 93);
    const y = clamp(55 + Math.sin(angle * 0.88) * radius * 38 + Math.random() * 10 - 5, 10, 88);
    cloud.push({ x, y, strong: index % 17 === 0 });
  }

  cloud.forEach((dot, index) => {
    const element = document.createElement("span");
    element.className = `peer-dot${dot.strong ? " peer-dot-strong" : ""}`;
    element.style.left = `${dot.x}%`;
    element.style.top = `${dot.y}%`;
    element.style.animationDelay = `${index * 34}ms`;
    plot.appendChild(element);
  });

  peerSeed.forEach((peer, index) => {
    const element = document.createElement("span");
    element.className = "peer-dot peer-dot-calibration";
    const x = 15 + ((peer.revenue - 4) / 12) * 66 + Math.sin(index) * 3;
    const y = 78 - ((peer.score - 55) / 32) * 58 + Math.cos(index * 1.4) * 4;
    element.style.left = `${clamp(x, 8, 92)}%`;
    element.style.top = `${clamp(y, 9, 88)}%`;
    element.title = `${peer.sector} · EUR ${peer.revenue.toFixed(1)}M · ${peer.employees} employees`;
    plot.appendChild(element);
  });
};

const initSimulator = () => {
  const controls = [...document.querySelectorAll(".sim-control input")];
  const valueElement = document.getElementById("simValue");
  const sqfElement = document.getElementById("simSqf");
  const gfElement = document.getElementById("simGf");
  const gapElement = document.getElementById("simGap");
  const riskElement = document.getElementById("simRisk");
  const baseValue = 4.21;

  const updateSliderFill = (input) => {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const value = Number(input.value || 0);
    const percentage = ((value - min) / (max - min)) * 100;
    input.style.setProperty("--fill", `${percentage}%`);
  };

  const update = () => {
    const values = Object.fromEntries(controls.map((input) => [input.id, Number(input.value)]));
    const focus = values.focus || 0;
    const operations = values.operations || 0;
    const technology = values.technology || 0;
    const relationships = values.relationships || 0;
    const blended = focus * 0.32 + operations * 0.26 + technology * 0.22 + relationships * 0.2;
    const sqf = 1 + (blended - 50) / 260;
    const gf = 1 + (technology * 0.34 + operations * 0.3 + relationships * 0.22 + focus * 0.14 - 50) / 330;
    const value = baseValue * sqf * gf;
    const gap = Math.max(0, ((5.8 - value) / value) * 100);
    const risk = blended > 72 ? "LOW" : blended > 55 ? "MEDIUM" : "HIGH";

    if (valueElement) valueElement.textContent = formatMillions(value);
    if (sqfElement) sqfElement.textContent = sqf.toFixed(2);
    if (gfElement) gfElement.textContent = gf.toFixed(2);
    if (gapElement) gapElement.textContent = `+${Math.round(gap)}%`;
    if (riskElement) riskElement.textContent = risk;

    controls.forEach(updateSliderFill);
  };

  controls.forEach((control) => control.addEventListener("input", update));
  update();
};

const initMagneticCards = () => {
  if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

  const elements = [...document.querySelectorAll(".glass-panel, .capital-card, .dashboard-shell, .cockpit")];

  elements.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.transform = `perspective(1200px) rotateX(${y * -3.5}deg) rotateY(${x * 4.5}deg) translateY(-2px)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
};

const initValueReveal = () => {
  const meter = document.querySelector(".value-meter");
  const label = document.querySelector(".value-reveal .value");
  if (!meter || !label) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        meter.animate(
          [
            { transform: "scaleX(0)" },
            { transform: "scaleX(0.72)" },
            { transform: "scaleX(1)" },
          ],
          { duration: prefersReducedMotion ? 1 : 1800, fill: "forwards", easing: "cubic-bezier(.16,1,.3,1)" },
        );
      });
    },
    { threshold: 0.4 },
  );

  observer.observe(meter);
};

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("is-loaded");
  initStarfield();
  initScrollChapters();
  initCountUps();
  initPeerUniverse();
  initSimulator();
  initMagneticCards();
  initValueReveal();
});
