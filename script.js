// ================================
// SPLASH SCREEN
// ================================
function initSplashScreen() {
  const splashScreen = document.getElementById("splash-screen");
  const splashVideoContainer = document.getElementById(
    "splash-video-container",
  );
  const splashVideo = document.getElementById("splash-video");
  const splashAudio = document.getElementById("splash-audio");
  const splashClickText = document.getElementById("splash-click-text");

  // Add splash-active class to body initially
  document.body.classList.add("splash-active");

  // Keep video paused initially - it will be still
  splashVideo.pause();
  splashVideo.currentTime = 0;

  // Keep audio paused initially
  splashAudio.pause();
  splashAudio.currentTime = 0;

  console.log("🎬 Splash screen initialized - video and audio paused");

  let videoPlaying = false;

  // Function to handle click
  function handleSplashClick() {
    if (videoPlaying) return; // Prevent multiple clicks

    videoPlaying = true;
    console.log("💕 Splash screen clicked! Playing video and audio...");

    // Start playing both video and audio simultaneously
    const videoPromise = splashVideo.play().catch((error) => {
      console.log("Video play error:", error);
    });

    const audioPromise = splashAudio.play().catch((error) => {
      console.log("Audio play error:", error);
      // Audio might be blocked by browser autoplay policy
      // User interaction (click) should allow it to play
    });

    // Synchronize both
    Promise.all([videoPromise, audioPromise]).then(() => {
      console.log("✅ Video and audio playing in sync");
    });

    // After 5 seconds, start fading out
    setTimeout(() => {
      console.log("⏱️ 5 seconds elapsed, fading out...");
      splashScreen.classList.add("fade-out");

      // Start fading out audio
      fadeOutAudio(splashAudio, 1500);

      // After fade completes, remove splash and show main content
      setTimeout(() => {
        document.body.classList.remove("splash-active");
        splashScreen.style.display = "none";

        // Stop the video and audio to save resources
        splashVideo.pause();
        splashAudio.pause();
        splashAudio.currentTime = 0;

        console.log("✨ Entering main site...");
      }, 1500); // Match the CSS transition duration
    }, 5000); // Wait 5 seconds before fading
  }

  // Function to fade out audio smoothly
  function fadeOutAudio(audio, duration) {
    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = audio.volume / steps;

    const fadeInterval = setInterval(() => {
      if (audio.volume > volumeStep) {
        audio.volume -= volumeStep;
      } else {
        audio.volume = 0;
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }

  // Add click listeners
  splashVideoContainer.addEventListener("click", handleSplashClick);
  splashClickText.addEventListener("click", handleSplashClick);
}

// ================================
// 3D PULSING HEART IN HERO (WITH FALLBACK)
// ================================
function init3DPulsingHeart() {
  const canvas = document.getElementById("heart-3d-canvas");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(280, 280);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.position.z = 8; // Better distance to see full heart

  let heart;
  let useOBJ = false;

  // ========== CHECK FOR OBJ FILE (OPTIONAL) ==========
  if (typeof THREE.OBJLoader !== "undefined") {
    console.log("✅ OBJLoader is available! Trying to load heart.obj...");
    const loader = new THREE.OBJLoader();
    useOBJ = true;

    loader.load(
      "heart.obj",
      (object) => {
        heart = object;
        console.log("✅ OBJ loaded successfully!");

        heart.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshPhongMaterial({
              color: 0xff0844,
              emissive: 0xff0844,
              emissiveIntensity: 0.5,
              shininess: 100,
              specular: 0xff758c,
            });
          }
        });

        // Center the heart
        heart.position.set(0, 0, 0);
        heart.scale.set(3.5, 3.5, 3.5);
        heart.rotation.x = 0;
        scene.add(heart);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.warn("⚠️ Could not load heart.obj");
        console.log("Creating procedural heart instead...");
        createProceduralHeart();
      },
    );
  } else {
    console.log("ℹ️ OBJLoader not found, using procedural heart");
    createProceduralHeart();
  }

  // ========== PROCEDURAL HEART ==========
  function createProceduralHeart() {
    const shape = new THREE.Shape();
    const x = 0,
      y = 0;

    shape.moveTo(x + 0.5, y + 0.5);
    shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
    shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.15,
      bevelSegments: 5,
    });

    const material = new THREE.MeshPhongMaterial({
      color: 0xff0844,
      emissive: 0xff0844,
      emissiveIntensity: 0.5,
      shininess: 100,
      specular: 0xff758c,
    });

    heart = new THREE.Mesh(geometry, material);
    heart.position.set(-0.5, -0.8, 0);
    heart.rotation.z = Math.PI;
    heart.scale.set(1.5, 1.5, 1.5);
    scene.add(heart);
    console.log("✅ Procedural heart created!");
  }

  // ========== LIGHTING ==========
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xff0844, 2, 10);
  pointLight1.position.set(2, 2, 2);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xff758c, 1.5, 10);
  pointLight2.position.set(-2, -2, 2);
  scene.add(pointLight2);

  // ========== ANIMATION ==========
  let pulseDirection = 1;
  let scale = 1;

  function animate() {
    requestAnimationFrame(animate);

    if (heart) {
      scale += pulseDirection * 0.006;
      if (scale > 1.15) pulseDirection = -1;
      else if (scale < 1) pulseDirection = 1;

      heart.scale.set(scale, scale, scale);
      heart.rotation.y += 0.005;

      heart.traverse((child) => {
        if (
          child.isMesh &&
          child.material &&
          child.material.emissiveIntensity !== undefined
        ) {
          child.material.emissiveIntensity = 0.3 + (scale - 1) * 2;
        }
      });
    }

    renderer.render(scene, camera);
  }

  animate();

  // ========== CLICK FOR RAIN ==========
  const heartContainer = document.getElementById("hero-3d-heart");
  const clickText = document.getElementById("click-me-text");
  const heartbeatAudio = document.getElementById("heartbeat-audio");
  const sparkleAudio = document.getElementById("sparkle-audio");

  // Set initial volume for heartbeat
  if (heartbeatAudio) {
    heartbeatAudio.volume = 0.5;
  }
  if (sparkleAudio) {
    sparkleAudio.volume = 0.7;
  }

  // Hover - play heartbeat sound (loop)
  heartContainer.addEventListener("mouseenter", () => {
    if (heartbeatAudio) {
      heartbeatAudio.currentTime = 0;
      heartbeatAudio.play().catch((e) => console.log("Heartbeat audio:", e));
      console.log("💓 Heartbeat playing...");
    }
  });

  // Mouse leave - stop heartbeat
  heartContainer.addEventListener("mouseleave", () => {
    if (heartbeatAudio) {
      heartbeatAudio.pause();
      heartbeatAudio.currentTime = 0;
      console.log("💓 Heartbeat stopped");
    }
  });

  // Make both heart and text clickable
  heartContainer.addEventListener("click", triggerRain);
  clickText.addEventListener("click", triggerRain);

  function triggerRain() {
    // Play sparkle sound
    if (sparkleAudio) {
      sparkleAudio.currentTime = 0;
      sparkleAudio.play().catch((e) => console.log("Sparkle audio:", e));
      console.log("✨ Sparkle sound!");
    }

    // Stop heartbeat if playing
    if (heartbeatAudio) {
      heartbeatAudio.pause();
      heartbeatAudio.currentTime = 0;
    }

    createHeartRain();
    console.log("💕 Heart rain!");
    // Hide click text after first click
    clickText.style.opacity = "0";
    clickText.style.pointerEvents = "none";
  }
}

// ================================
// HEART RAIN EVERYWHERE (FULL SCREEN)
// ================================
function createHeartRain() {
  const rainCanvas = document.getElementById("heart-rain-canvas");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  const renderer = new THREE.WebGLRenderer({
    canvas: rainCanvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.position.z = 50;

  // Create medium-sized heart (same as main heart)
  function createMediumHeart() {
    const shape = new THREE.Shape();
    const x = 0,
      y = 0;

    shape.moveTo(x + 0.5, y + 0.5);
    shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
    shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 3,
    });
  }

  const heartGeo = createMediumHeart();
  const hearts = [];

  // Calculate screen coverage
  const aspect = window.innerWidth / window.innerHeight;
  const vFOV = THREE.MathUtils.degToRad(camera.fov);
  const height = 2 * Math.tan(vFOV / 2) * camera.position.z;
  const width = height * aspect;

  // Create 300 hearts spread EVERYWHERE
  for (let i = 0; i < 300; i++) {
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(
        `hsl(${340 + Math.random() * 20}, 100%, ${50 + Math.random() * 30}%)`,
      ),
      emissive: new THREE.Color(0xff0844),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.95,
    });

    const heart = new THREE.Mesh(heartGeo, material);

    // SPREAD EVERYWHERE - full screen width including corners and edges
    heart.position.x = (Math.random() - 0.5) * width * 1.5; // Extra wide
    heart.position.y = Math.random() * height * 1.2 + height * 0.3; // From top to way above
    heart.position.z = (Math.random() - 0.5) * 80; // Deep 3D spread

    heart.rotation.x = Math.random() * Math.PI * 2;
    heart.rotation.y = Math.random() * Math.PI * 2;
    heart.rotation.z = Math.random() * Math.PI * 2;

    // Random sizes for variety
    const randomScale = 0.6 + Math.random() * 0.8; // 0.6 to 1.4
    heart.scale.set(randomScale, randomScale, randomScale);

    heart.userData = {
      fallSpeed: Math.random() * 0.25 + 0.15,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.06,
        y: (Math.random() - 0.5) * 0.06,
        z: (Math.random() - 0.5) * 0.06,
      },
      initialX: heart.position.x,
      width: width,
      height: height,
    };

    scene.add(heart);
    hearts.push(heart);
  }

  // Enhanced lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xff0844, 3, 150);
  pointLight1.position.set(20, 30, 30);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xff758c, 2, 150);
  pointLight2.position.set(-20, 30, 30);
  scene.add(pointLight2);

  let duration = 0;
  const maxDuration = 350;

  function animateRain() {
    duration++;

    hearts.forEach((heart) => {
      // Fall down
      heart.position.y -= heart.userData.fallSpeed;

      // Rotate in all directions
      heart.rotation.x += heart.userData.rotationSpeed.x;
      heart.rotation.y += heart.userData.rotationSpeed.y;
      heart.rotation.z += heart.userData.rotationSpeed.z;

      // Gentle horizontal drift
      heart.position.x +=
        Math.sin(duration * 0.02 + heart.userData.initialX) * 0.02;

      // Reset hearts that fall off screen - respawn at random X position
      if (heart.position.y < -heart.userData.height * 0.6) {
        heart.position.y = heart.userData.height * 0.7;
        heart.position.x = (Math.random() - 0.5) * heart.userData.width * 1.5;
        heart.position.z = (Math.random() - 0.5) * 80;
      }
    });

    renderer.render(scene, camera);

    if (duration < maxDuration) {
      requestAnimationFrame(animateRain);
    } else {
      hearts.forEach((heart) => scene.remove(heart));
      renderer.clear();
      console.log("Heart rain complete!");
    }
  }

  animateRain();
}

// ================================
// BACKGROUND HEARTS
// ================================
function initThreeJsHearts() {
  const canvas = document.getElementById("hearts-canvas");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.position.z = 30;

  function createHeartShape() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
    shape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
    shape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
    shape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);
    return shape;
  }

  const hearts = [];
  const heartShape = createHeartShape();

  for (let i = 0; i < 30; i++) {
    const geometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3,
    });

    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(
        `hsl(${340 + Math.random() * 20}, 100%, ${50 + Math.random() * 20}%)`,
      ),
      emissive: new THREE.Color(0xff0844),
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.6,
      shininess: 100,
    });

    const heart = new THREE.Mesh(geometry, material);
    heart.position.x = (Math.random() - 0.5) * 60;
    heart.position.y = (Math.random() - 0.5) * 60;
    heart.position.z = (Math.random() - 0.5) * 60;
    heart.rotation.x = Math.random() * Math.PI;
    heart.rotation.y = Math.random() * Math.PI;

    heart.userData = {
      speedX: (Math.random() - 0.5) * 0.02,
      speedY: (Math.random() - 0.5) * 0.02,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
    };

    scene.add(heart);
    hearts.push(heart);
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xff0844, 2, 100);
  pointLight1.position.set(10, 10, 10);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xff758c, 2, 100);
  pointLight2.position.set(-10, -10, 10);
  scene.add(pointLight2);

  let mouseX = 0,
    mouseY = 0;
  let targetX = 0,
    targetY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    camera.position.x = targetX * 5;
    camera.position.y = targetY * 5;
    camera.lookAt(scene.position);

    hearts.forEach((heart) => {
      heart.position.x += heart.userData.speedX;
      heart.position.y += heart.userData.speedY;
      heart.rotation.y += heart.userData.rotationSpeed;

      if (Math.abs(heart.position.x) > 30) heart.userData.speedX *= -1;
      if (Math.abs(heart.position.y) > 30) heart.userData.speedY *= -1;
    });

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ================================
// HERO PARTICLES
// ================================
function initHeroParticles() {
  const container = document.querySelector(".hero-particles");

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            border-radius: 50%;
            background: rgba(255, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 140}, ${Math.random() * 0.5 + 0.3});
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float-particle ${Math.random() * 10 + 5}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
            box-shadow: 0 0 10px currentColor;
        `;
    container.appendChild(particle);
  }

  const style = document.createElement("style");
  style.textContent = `
        @keyframes float-particle {
            0%, 100% { transform: translate(0, 0); opacity: 0; }
            10% { opacity: 1; }
            50% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); opacity: 1; }
            90% { opacity: 1; }
        }
    `;
  document.head.appendChild(style);
}

// ================================
// GSAP ANIMATIONS
// ================================
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".meter-container", {
    scale: 0,
    rotation: 360,
    scrollTrigger: {
      trigger: ".love-meter-section",
      start: "top center",
      end: "center center",
      scrub: 1,
    },
  });

  gsap.from(".ring-box", {
    y: 200,
    opacity: 0,
    scrollTrigger: {
      trigger: ".proposal-section",
      start: "top center",
      end: "center center",
      scrub: 1,
    },
  });
}

// ================================
// LOVE METER - UPDATED WITH MASK
// ================================
function initLoveMeter() {
  const heartFill = document.querySelector(".heart-fill");
  const counterNumber = document.querySelector(".counter-number");
  const loveCounter = document.querySelector(".love-counter");
  const loveImageContainer = document.getElementById("love-image-container");
  const confettiCanvas = document.getElementById("confetti-canvas");
  const loveMeterSection = document.querySelector(".love-meter-section");
  const ctx = confettiCanvas.getContext("2d");

  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  let hasAnimated = false;

  // Create Intersection Observer to trigger when section comes into view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          fillHeart();
        }
      });
    },
    {
      threshold: 0.5, // Trigger when 50% of the section is visible
    },
  );

  // Start observing the love meter section
  observer.observe(loveMeterSection);

  function fillHeart() {
    const duration = 2000; // 2 seconds for animation
    const startTime = performance.now();

    // Get the gradient stops
    const gradStop1 = document.getElementById("gradStop1");
    const gradStop2 = document.getElementById("gradStop2");
    const gradStop3 = document.getElementById("gradStop3");

    let count = 0;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Animate gradient stops to fill from bottom (100%) to top (0%)
      // The gradient is vertical (y1="100%" y2="0%"), so we animate the stop offsets
      const fillPercent = progress * 100;

      // Stop 1: Always at 0% (bottom), fully opaque
      gradStop1.setAttribute("offset", "0%");

      // Stop 2: The "fill line" - moves from 0% to 100%
      gradStop2.setAttribute("offset", `${fillPercent}%`);
      gradStop2.setAttribute("style", "stop-color: #ff758c; stop-opacity: 1");

      // Stop 3: Just above the fill line, transparent
      const transparentOffset = Math.min(fillPercent + 0.1, 100);
      gradStop3.setAttribute("offset", `${transparentOffset}%`);
      gradStop3.setAttribute("style", "stop-color: #ff758c; stop-opacity: 0");

      // Update counter (0 to 100)
      const newCount = Math.floor(progress * 100);
      if (newCount !== count) {
        count = newCount;
        counterNumber.textContent = count;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        setTimeout(() => {
          // Fade out counter and heart
          loveCounter.classList.add("fade-out");
          heartFill.style.opacity = "0";
          heartFill.style.transition = "opacity 1s ease";

          // Fade in image
          setTimeout(() => {
            loveImageContainer.classList.add("visible");
          }, 500);

          // Launch confetti
          setTimeout(() => {
            launchConfetti();
          }, 1000);
        }, 500);
      }
    }

    requestAnimationFrame(animate);
  }

  function launchConfetti() {
    const particles = [];
    const colors = ["#ff0844", "#ff758c", "#ffb3d9", "#ffffff"];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: confettiCanvas.width / 2,
        y: confettiCanvas.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    function animateConfetti() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        if (p.y > confettiCanvas.height) {
          particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        requestAnimationFrame(animateConfetti);
      }
    }

    animateConfetti();
  }
}

// ================================
// FIREWORKS
// ================================
function initFireworks() {
  const canvas = document.getElementById("fireworks-canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const fireworks = [];
  const particles = [];
  let animationId = null;
  let isAnimating = false;

  class Firework {
    constructor(x, y) {
      this.x = x;
      this.y = canvas.height;
      this.targetY = y;
      this.speed = 3;
      this.exploded = false;
      this.hue = Math.random() * 60 + 320;
    }

    update() {
      if (!this.exploded) {
        this.y -= this.speed;
        if (this.y <= this.targetY) {
          this.explode();
          this.exploded = true;
        }
      }
    }

    explode() {
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle(this.x, this.y, this.hue));
      }
    }

    draw() {
      if (!this.exploded) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
        ctx.fill();
      }
    }
  }

  class Particle {
    constructor(x, y, hue) {
      this.x = x;
      this.y = y;
      this.hue = hue;
      this.velocity = {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8,
      };
      this.gravity = 0.05;
      this.friction = 0.98;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
      this.velocity.y += this.gravity;
      this.velocity.x *= this.friction;
      this.velocity.y *= this.friction;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
      ctx.shadowBlur = 5;
      ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
      ctx.fill();
      ctx.restore();
    }
  }

  function animate() {
    ctx.fillStyle = "rgba(26, 10, 30, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.05) {
      fireworks.push(
        new Firework(
          Math.random() * canvas.width,
          Math.random() * canvas.height * 0.5,
        ),
      );
    }

    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update();
      fireworks[i].draw();

      if (fireworks[i].exploded) {
        fireworks.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();

      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    if (isAnimating) {
      animationId = requestAnimationFrame(animate);
    }
  }

  // Return control functions
  return {
    start: () => {
      if (!isAnimating) {
        isAnimating = true;
        canvas.classList.add("active");
        animate();
        console.log("🎆 Fireworks started!");
      }
    },
    stop: () => {
      isAnimating = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      console.log("🎆 Fireworks stopped");
    },
  };
}

// ================================
// GIFT SECTION
// ================================
function initGiftSection() {
  const giftBox = document.getElementById("gift-box");
  const giftReveal = document.getElementById("gift-reveal");
  const giftOpenAudio = document.getElementById("gift-open-audio");
  const giftConfettiCanvas = document.getElementById("gift-confetti-canvas");
  const giftSubtitle = document.querySelector(".gift-subtitle");

  if (giftOpenAudio) {
    giftOpenAudio.volume = 0.7;
  }

  giftBox.addEventListener("click", () => {
    openGift();
  });

  function openGift() {
    giftBox.classList.add("opening");

    // Hide the "Tap to open" text
    if (giftSubtitle) {
      giftSubtitle.classList.add("hidden");
    }

    // Play gift opening sound
    if (giftOpenAudio) {
      giftOpenAudio.currentTime = 0;
      giftOpenAudio.play().catch((e) => console.log("Gift audio:", e));
    }

    // Show reveal content after lid animation
    setTimeout(() => {
      giftBox.style.opacity = "0";
      giftReveal.classList.add("visible");
      launchGiftConfetti();
    }, 800);

    console.log("🎁 Gift opened!");
  }

  function launchGiftConfetti() {
    const canvas = giftConfettiCanvas;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#ff0844", "#ff758c", "#ffb3d9", "#ffd700", "#ffed4e"];
    const particleCount = 200;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        gravity: 0.3,
        life: 1.0,
        decay: Math.random() * 0.01 + 0.005,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.life -= p.decay;

        if (p.life > 0) {
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        } else {
          particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    }

    animate();
  }

  // Return the open function for external triggering
  return {
    open: openGift,
  };
}

// ================================
// PROPOSAL BUTTON
// ================================
function initProposalButton(fireworksController) {
  const yesButton = document.querySelector(".proposal-yes");
  const noButton = document.getElementById("proposal-no");
  const music = document.getElementById("background-music");
  const fireworksAudio = document.getElementById("fireworks-audio");
  const proposalSection = document.querySelector(".proposal-section");
  const giftSection = document.querySelector(".gift-section");

  // Set audio volumes
  if (fireworksAudio) {
    fireworksAudio.volume = 0.6;
  }

  // Yes button click handler
  yesButton.addEventListener("click", () => {
    createHeartExplosion(yesButton);
    music.play().catch((e) => console.log("Music:", e));

    // Start fireworks
    if (fireworksController) {
      fireworksController.start();
    }

    // Play fireworks audio after 2 seconds
    setTimeout(() => {
      if (fireworksAudio) {
        fireworksAudio.currentTime = 0;
        fireworksAudio.play().catch((e) => console.log("Fireworks audio:", e));
        console.log("🎆 Fireworks audio playing!");
      }
    }, 2000);

    // Hide No button
    noButton.style.opacity = "0";
    noButton.style.pointerEvents = "none";

    setTimeout(() => {
      yesButton.querySelector("span").textContent = "Forever and Always ❤️";
      yesButton.style.background = "linear-gradient(135deg, #ffd700, #ffed4e)";
      yesButton.style.color = "#1a0a1e";
    }, 500);

    // After 4 seconds, fade to gift section
    setTimeout(() => {
      console.log("🎁 Transitioning to gift section...");

      // Fade out fireworks audio
      if (fireworksAudio) {
        let volume = fireworksAudio.volume;
        const fadeAudioInterval = setInterval(() => {
          if (volume > 0.05) {
            volume -= 0.05;
            fireworksAudio.volume = volume;
          } else {
            fireworksAudio.pause();
            fireworksAudio.volume = 0.6; // Reset for next time
            clearInterval(fadeAudioInterval);
          }
        }, 50);
      }

      // Stop fireworks
      if (fireworksController) {
        fireworksController.stop();
      }

      // Fade out proposal section
      proposalSection.style.transition = "opacity 1s ease";
      proposalSection.style.opacity = "0";

      // Show gift section after fade
      setTimeout(() => {
        proposalSection.style.display = "none";

        // Hide all previous sections
        document.getElementById("splash-screen").style.display = "none";
        document.getElementById("hero").style.display = "none";
        document.getElementById("love-meter").style.display = "none";

        giftSection.style.display = "flex";

        // Small delay before making visible for smooth transition
        setTimeout(() => {
          giftSection.classList.add("visible");
          // Scroll to top to show gift section properly
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);
      }, 1000);
    }, 4000);
  });

  // No button - move away on hover
  noButton.addEventListener("mouseenter", (e) => {
    const button = e.target;
    const parent = button.parentElement;
    const parentRect = parent.getBoundingClientRect();

    // Get random position within the viewport
    const maxX = window.innerWidth - button.offsetWidth - 100;
    const maxY = window.innerHeight - button.offsetHeight - 100;

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    // Convert to position relative to parent
    const parentX = parentRect.left;
    const parentY = parentRect.top;

    const newX = randomX - parentX;
    const newY = randomY - parentY;

    button.style.position = "fixed";
    button.style.left = randomX + "px";
    button.style.top = randomY + "px";
    button.style.transform = "none";

    console.log("😏 No button moved away!");
  });

  // Make No button shake occasionally
  setInterval(() => {
    if (noButton.style.opacity !== "0") {
      noButton.style.animation = "none";
      setTimeout(() => {
        noButton.style.animation = "button-shake 0.5s ease";
      }, 10);
    }
  }, 5000);
}

// Add shake animation
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
  @keyframes button-shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);

function createHeartExplosion(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 30; i++) {
    const heart = document.createElement("div");
    heart.textContent = "❤️";
    heart.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            font-size: ${Math.random() * 20 + 10}px;
            pointer-events: none;
            z-index: 10000;
            transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
    document.body.appendChild(heart);

    setTimeout(() => {
      const angle = (Math.PI * 2 * i) / 30;
      const distance = Math.random() * 200 + 100;
      heart.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`;
      heart.style.opacity = "0";
    }, 10);

    setTimeout(() => heart.remove(), 1600);
  }
}

// ================================
// OBSERVERS
// ================================
function initIntersectionObservers() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".reason-item").forEach((el) => {
    observer.observe(el);
  });
}

// ================================
// SMOOTH SCROLL
// ================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// ================================
// RESIZE
// ================================
function handleResize() {
  const confettiCanvas = document.getElementById("confetti-canvas");
  const fireworksCanvas = document.getElementById("fireworks-canvas");
  const giftConfettiCanvas = document.getElementById("gift-confetti-canvas");

  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  if (fireworksCanvas) {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
  }

  if (giftConfettiCanvas) {
    giftConfettiCanvas.width = window.innerWidth;
    giftConfettiCanvas.height = window.innerHeight;
  }
}

// ================================
// INIT
// ================================
window.addEventListener("DOMContentLoaded", () => {
  console.log("🎉 Initializing Valentine's website...");

  initSplashScreen();
  init3DPulsingHeart();
  initThreeJsHearts();
  initHeroParticles();
  initScrollAnimations();
  initLoveMeter();

  const fireworksController = initFireworks();
  initProposalButton(fireworksController);
  initGiftSection();

  initIntersectionObservers();
  initSmoothScroll();

  window.addEventListener("resize", handleResize);

  console.log("✅ Website ready!");
  console.log("💕 Click the heart to see the rain effect!");
});

// ================================
// CURSOR TRAIL
// ================================
document.addEventListener("mousemove", (e) => {
  if (Math.random() > 0.9) {
    const trail = document.createElement("div");
    trail.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: rgba(255, 117, 140, 0.6);
            pointer-events: none;
            z-index: 9999;
            animation: trail-fade 1s ease-out forwards;
        `;
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 1000);
  }
});

const trailStyle = document.createElement("style");
trailStyle.textContent = `
    @keyframes trail-fade {
        to {
            transform: scale(3);
            opacity: 0;
        }
    }
`;
document.head.appendChild(trailStyle);
