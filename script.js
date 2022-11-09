// Global variable helps with scope, so we take out from window onload
let canvas;
let ctx;
let flowField;
let flowFieldAnimiation;

// document.onload -> fires when DOM is ready
// window.onload -> fires when all resources are rady (css, img, js ...)
window.onload = function () {
  canvas = document.getElementById("canvas1");
  ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height);
  flowField.animate(0);
};

// Animation responsive to window height and width
window.addEventListener("resize", function () {
  cancelAnimationFrame(flowFieldAnimiation);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Starts animiation after resize
  flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height);
  flowField.animate(0);
});

const mouse = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", function (e) {
  mouse.x = e.x;
  mouse.y = e.y;
});

class FlowFieldEffect {
  // startig class feature with # forces it to be private
  // only way to return private value is to create method on that class that returns it
  #ctx;
  #width;
  #height;

  // Mendatory method in js, runs once when we create an instace of a class with "new" keyword
  constructor(ctx, width, height) {
    // assigning outside values to our private variables
    this.#ctx = ctx;
    this.#ctx.strokeStyle = "white";
    this.#ctx.lineWidth = 1;
    this.#width = width;
    this.#height = height;
    this.lastTime = 0;
    // To unify animations frame for fast and slow machines, weuse delta time, interval etc.
    this.interval = 1000 / 60; // 60 frames per secound
    this.timer = 0;
    this.cellSize = 15;
    this.gradient;
    this.#createGradient();
    this.#ctx.strokeStyle = this.gradient;
    this.radius = 0;
    this.vr = 0.03; // velocity of radius
  }

  // Incapsolation is bundling of data and methods that act on that data in the way,
  // that the access to it is restricted from outside the class (bundle)
  // Private method
  #drawLine(angle, x, y) {
    // Calculating distance from mouse
    let positionX = x;
    let positionY = y;
    let dx = mouse.x - positionX;
    let dy = mouse.y - positionY;
    // let distance = Math.sqrt(dx * dx + dy * dy); -> srqt is very expensive, we can skip it
    let distance = dx * dx + dy * dy;
    if (distance > 600000) {
      distance = 600000;
    } else if (distance < 50000) {
      distance = 50000;
    }
    // Multplication is more efficient than dividing
    const length = distance * 0.0001;
    this.#ctx.beginPath();
    this.#ctx.moveTo(x, y);
    // Change line length by multiplying angle value
    this.#ctx.lineTo(
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    );
    this.#ctx.stroke();
  }

  #createGradient() {
    this.gradient = this.#ctx.createLinearGradient(
      0,
      0,
      this.#width,
      this.#height
    );
    this.gradient.addColorStop("0.1", "#ff5c33");
    this.gradient.addColorStop("0.2", "#ff66b3");
    this.gradient.addColorStop("0.4", "#ccccff");
    this.gradient.addColorStop("0.6", "#b3ffff");
    this.gradient.addColorStop("0.8", "#80ff80");
    this.gradient.addColorStop("0.9", "#ffff33");
  }

  // timeStamp here is a value that is returned from requestAnimatonFrame
  animate(timeStamp) {
    const deltaTime = timeStamp - this.lastTime;
    this.lastTime = timeStamp;
    this.angle += 0.1;

    // Here we are using delta time to make sure animaton runs similiar on every machine
    if (this.timer > this.interval) {
      this.#ctx.clearRect(0, 0, this.#width, this.#height);

      //Update the rotate variables, reverses the effecct at some point
      this.radius += this.vr;
      if (this.radius > 5 || this.radius < -5) {
        this.vr *= -1;
      }
      // Map a vector field over screen view
      for (let y = 0; y < this.#height; y += this.cellSize) {
        for (let x = 0; x < this.#width; x += this.cellSize) {
          // Zooming in or out by adding multiply value
          //   const angle = Math.cos(x * 0.01) + Math.sin(y * 0.01);

          // If we wrap angle in brackets we can rote shape even more
          //   const angle = (Math.cos(x * 0.01) + Math.sin(y * 0.01)) * this.radius;

          // If we add mouse animation gets more interactive
          const angle =
            (Math.cos(mouse.x * x * 0.00001) +
              Math.sin(mouse.y * y * 0.00001)) *
            this.radius;

          this.#drawLine(angle, x, y);
        }
      }

      this.timer = 0;
    } else {
      this.timer += deltaTime;
    }
    // console.log(deltaTime);

    // Build in method, takes function as argument, better suited for animation than setInterval
    // After first loop js forgets what .this is, so we need to "bind" it for next loops
    flowFieldAnimiation = requestAnimationFrame(this.animate.bind(this));
  }
}
