// Keyboard + touch input. Movement is a 2D vector in screen space (x right, y up).

export class Input {
  constructor(touchRoot) {
    this.keys = new Set();
    this.pressed = new Set(); // keys pressed since last consume
    this.touch = { x: 0, y: 0, active: false };
    this.touchButtons = new Set();
    this.enabled = true;

    addEventListener("keydown", (e) => {
      // Dialogs handle their keys in the capture phase and mark them handled.
      if (e.repeat || e.defaultPrevented) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      const k = e.key.toLowerCase();
      this.keys.add(k);
      this.pressed.add(k);
    });
    addEventListener("keyup", (e) => this.keys.delete(e.key.toLowerCase()));
    addEventListener("blur", () => this.keys.clear());

    if (touchRoot) this._setupTouch(touchRoot);
  }

  _setupTouch(root) {
    const stick = root.querySelector(".stick");
    const knob = root.querySelector(".stick-knob");
    let id = null;
    let cx = 0;
    let cy = 0;
    const R = 50;
    const start = (e) => {
      const t = e.changedTouches[0];
      id = t.identifier;
      const r = stick.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      move(e);
      e.preventDefault();
    };
    const move = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== id) continue;
        let dx = t.clientX - cx;
        let dy = t.clientY - cy;
        const d = Math.hypot(dx, dy);
        if (d > R) {
          dx = (dx / d) * R;
          dy = (dy / d) * R;
        }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        this.touch = { x: dx / R, y: -dy / R, active: true };
      }
      e.preventDefault();
    };
    const end = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== id) continue;
        id = null;
        knob.style.transform = "";
        this.touch = { x: 0, y: 0, active: false };
      }
    };
    stick.addEventListener("touchstart", start, { passive: false });
    stick.addEventListener("touchmove", move, { passive: false });
    stick.addEventListener("touchend", end);
    stick.addEventListener("touchcancel", end);

    for (const btn of root.querySelectorAll("[data-key]")) {
      const key = btn.dataset.key;
      const down = (e) => {
        e.preventDefault();
        this.keys.add(key);
        this.pressed.add(key);
        btn.classList.add("down");
      };
      const up = () => {
        this.keys.delete(key);
        btn.classList.remove("down");
      };
      btn.addEventListener("touchstart", down, { passive: false });
      btn.addEventListener("touchend", up);
      btn.addEventListener("mousedown", down);
      btn.addEventListener("mouseup", up);
      btn.addEventListener("mouseleave", up);
    }
  }

  down(...names) {
    return this.enabled && names.some((n) => this.keys.has(n));
  }

  /** True once per key press. */
  consume(...names) {
    let hit = false;
    for (const n of names) if (this.pressed.delete(n)) hit = true;
    return this.enabled && hit;
  }

  clearPressed() {
    this.pressed.clear();
  }

  /** Movement vector: x = right, y = forward (away from camera). */
  moveVector() {
    if (!this.enabled) return { x: 0, y: 0 };
    let x = 0;
    let y = 0;
    if (this.down("a", "arrowleft")) x -= 1;
    if (this.down("d", "arrowright")) x += 1;
    if (this.down("w", "arrowup")) y += 1;
    if (this.down("s", "arrowdown")) y -= 1;
    if (this.touch.active) {
      x += this.touch.x;
      y += this.touch.y;
    }
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  get run() {
    return this.down("shift", "run");
  }
}
