// helper functions
const PI2 = Math.PI * 2;
const random = (min, max) => Math.random() * (max - min + 1) + min | 0;
const timestamp = () => new Date().getTime();

// container
class Birthday {
  constructor() {
    this.resize();

    // create a lovely place to store the firework
    this.fireworks = [];
    this.counter = 0;

  }
  
  resize() {
    this.width = window.innerWidth; // Always use full window width
    this.height = window.innerHeight; // Always use full window height
    canvas.width = this.width;
    canvas.height = this.height;
    this.spawnA = this.width / 4;
    this.spawnB = (this.width * 3) / 4;
    this.spawnC = this.height * 0.1;
    this.spawnD = this.height * 0.5;
  }
  
  onClick(evt) {
     const x = evt.clientX || (evt.touches && evt.touches[0].pageX);
     const y = evt.clientY || (evt.touches && evt.touches[0].pageY);
     
     const count = random(3, 5);
     for (let i = 0; i < count; i++) {
       this.fireworks.push(
         new Firework(
           random(this.spawnA, this.spawnB),
           this.height,
           x,
           y,
           random(0, 260),
           random(30, 110)
         )
       );
     }
     this.counter = -1;
  }
  
  update(delta) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(10, 10, 20, ${7 * delta})`;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.globalCompositeOperation = 'lighter';
    for (let firework of this.fireworks) firework.update(delta);

    // if enough time passed... create new new firework
    this.counter += delta * 3; // each second
    if (this.counter >= 1) {
      this.fireworks.push(
        new Firework(
          random(this.spawnA, this.spawnB),
          this.height,
          random(0, this.width),
          random(this.spawnC, this.spawnD),
          random(0, 360),
          random(30, 110)
        )
      );
      this.counter = 0;
    }

    // remove the dead fireworks
    if (this.fireworks.length > 1000) {
      this.fireworks = this.fireworks.filter((firework) => !firework.dead);
    }
  }
}

class Firework {
  constructor(x, y, targetX, targetY, shade, offsprings) {
    this.dead = false;
    this.offsprings = offsprings;

    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;

    this.shade = shade;
    this.history = [];
  }
  update(delta) {
    if (this.dead) return;

    const xDiff = this.targetX - this.x;
    const yDiff = this.targetY - this.y;
    if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) { // is still moving
      this.x += xDiff * 2 * delta;
      this.y += yDiff * 2 * delta;

      this.history.push({
        x: this.x,
        y: this.y
      });

      if (this.history.length > 20) this.history.shift();

    } else {
      if (this.offsprings && !this.madeChilds) {
        
        const babies = this.offsprings / 2;
        for (let i = 0; i < babies; i++) {
          const targetX = this.x + this.offsprings * Math.cos(PI2 * i / babies);
          const targetY = this.y + this.offsprings * Math.sin(PI2 * i / babies);

          birthday.fireworks.push(
            new Firework(this.x, this.y, targetX, targetY, this.shade, 0)
          );

        }

      }
      this.madeChilds = true;
      this.history.shift();
    }
    
    if (this.history.length === 0) this.dead = true;
    else {
      for (let i = 0; i < this.history.length; i++) {
        const point = this.history[i];
        ctx.beginPath();
        ctx.fillStyle = `hsl(${this.shade},100%,${i}%)`;
        ctx.arc(point.x, point.y, 1, 0, PI2, false);
        ctx.fill();
      }
    }
  }
}

const canvas = document.getElementById('birthday');
const ctx = canvas.getContext('2d');

const birthday = new Birthday();
window.onresize = () => birthday.resize();
document.onclick = (evt) => birthday.onClick(evt);
document.ontouchstart = (evt) => birthday.onClick(evt);

let then = timestamp();
(function loop() {
  requestAnimationFrame(loop);

  const now = timestamp();
  const delta = now - then;

  then = now;
  birthday.update(delta / 1000);
})();

let currentTextIndex = 0;

function updateHeaderText() {
  const headerText = document.getElementById("header-text");
  headerText.style.opacity = 0; // Start fade out
  setTimeout(() => {
    const { text, font } = texts[currentTextIndex];
    headerText.textContent = text;
    headerText.style.fontFamily = font;
    headerText.style.opacity = 1; // Fade in
    currentTextIndex = (currentTextIndex + 1) % texts.length;
  }, 1000); // Wait for fade-out to complete
}

let textInterval = setInterval(updateHeaderText, 4000); // 3 seconds for text + 1 second fade

// Shrink header on scroll with adjusted logic
window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  if (window.scrollY === 0) { // Expand header only when at the very top
    header.classList.remove("shrink");
  } else if (window.scrollY > 30) { // Shrink header when scrolled down
    header.classList.add("shrink");
  }
});

// Toggle language selector on click
const languageSelector = document.querySelector(".language-selector");
const languageOptions = document.querySelector(".language-options");

languageSelector.addEventListener("click", () => {
  languageOptions.classList.toggle("active"); // Toggle visibility
});

// Handle language selection and update text immediately
document.querySelectorAll(".language-options li").forEach((option, index) => {
  option.addEventListener("click", () => {
    currentTextIndex = index; // Set the selected language as the current text
    updateHeaderText(); // Update the header text immediately
    clearInterval(textInterval); // Stop the current interval
    textInterval = setInterval(updateHeaderText, 4000); // Restart the interval
    languageOptions.classList.remove("active"); // Close the selector
  });
});