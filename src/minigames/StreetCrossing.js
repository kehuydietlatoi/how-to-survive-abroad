import * as THREE from "three";
import { CrossingSim } from "./crossingSim.js";
import { motorbike } from "../world/props.js";
import { Character } from "../world/Character.js";
import { sfx } from "../core/Audio.js";
import { t } from "../i18n/i18n.js";

// 3D view + controls for the street-crossing minigame. Traffic runs all the time
// ("ambient"); the minigame puts the player into the simulation.
//
// Sim frame → world: worldX = crossX + simX, worldZ = roadZ - simZ
// (the player starts on the +z kerb, nearest the camera, and crosses toward -z).

const BIKE_COLORS = ["#e85d75", "#4da3ff", "#f6c945", "#6cc070", "#b084f5", "#ff9f43", "#2b2b2b"];
const RIDERS = ["character-male-b", "character-female-b", "character-male-c", "character-female-d", "character-male-d", "character-female-e", "character-male-f", "character-female-f"];

class TrafficView {
  constructor(ctx, params) {
    this.ctx = ctx;
    this.crossX = params.crossX ?? 0;
    this.roadZ = params.roadZ ?? 0;
    this.sim = new CrossingSim({ seed: (Math.random() * 1e9) | 0, active: false });
    this.group = new THREE.Group();
    ctx.world.root.add(this.group);
    this.views = new Map(); // bike id -> { obj, rider }
    this.pool = [];
    this.crossing = null; // set while the minigame runs
    this.ready = this._prepare();
  }

  async _prepare() {
    // Pre-create riders so spawning never waits on async loading.
    const n = 40;
    for (let i = 0; i < n; i++) this.pool.push(await this._makeView(i));
  }

  async _makeView(i) {
    const obj = new THREE.Group();
    const bike = motorbike(BIKE_COLORS[i % BIKE_COLORS.length]);
    bike.scale.setScalar(1.35);
    obj.add(bike);
    const rider = await Character.create(RIDERS[i % RIDERS.length]);
    rider.play("drive");
    rider.mixer.setTime(Math.random());
    rider.root.position.set(0, 0.42, -0.35);
    obj.add(rider.root);
    // Conical hat on some riders.
    if (i % 3 === 0) {
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.28, 16), new THREE.MeshToonMaterial({ color: "#f2dca0" }));
      hat.position.set(0, 2.25, -0.35);
      obj.add(hat);
    }
    obj.visible = false;
    this.group.add(obj);
    return { obj, rider };
  }

  update(dt) {
    const sim = this.sim;
    if (this.crossing) this.crossing.preStep(dt);
    sim.step(dt, this.crossing ? this.crossing.input() : {});
    for (const e of sim.events.splice(0)) this.crossing?.onEvent(e);

    const alive = new Set();
    for (const b of sim.bikes) {
      alive.add(b.id);
      let v = this.views.get(b.id);
      if (!v) {
        v = this.pool.pop();
        if (!v) continue; // pool still loading
        this.views.set(b.id, v);
        v.obj.visible = true;
      }
      v.obj.position.set(this.crossX + b.x, 0, this.roadZ - b.z);
      const lean = THREE.MathUtils.clamp((b.targetZ - b.z) * 0.25, -0.3, 0.3);
      v.obj.rotation.y = b.dir > 0 ? Math.PI / 2 + lean * b.dir : -Math.PI / 2 + lean * b.dir;
      v.obj.position.y = b.honk > 0 ? Math.abs(Math.sin(b.honk * 30)) * 0.04 : 0;
      v.rider.update(dt);
    }
    for (const [id, v] of this.views) {
      if (!alive.has(id)) {
        v.obj.visible = false;
        this.views.delete(id);
        this.pool.push(v);
      }
    }
  }

  dispose() {
    this.group.removeFromParent();
  }
}

/** One crossing attempt, driving the player character from the sim. */
class Crossing {
  constructor(ctx, view) {
    this.ctx = ctx;
    this.view = view;
    this.sim = view.sim;
    this.input_ = { forward: 0, run: false, hand: false };
    this.hud = document.getElementById("minigame");
    this.hud.className = "show";
    this.hud.innerHTML = `<div class="mg-hud"><div class="hearts"></div><div class="hint">${t("crossHint")}</div></div>`;
    this.heartsEl = this.hud.querySelector(".hearts");
    this.flash = 0;
    this.sim.beginCrossing();
    this._render();
  }

  input() {
    return this.input_;
  }

  preStep() {
    const inp = this.ctx.input;
    const mv = inp.moveVector();
    this.input_ = {
      forward: mv.y > 0.3 ? 1 : mv.y < -0.3 ? -1 : 0,
      run: inp.run,
      hand: inp.down("h"),
    };
  }

  onEvent(e) {
    if (e.type === "hit") {
      sfx.bump();
      sfx.honk();
      this.ctx.ui.toast("bump", "bad");
      this.flash = 0.6;
    } else if (e.type === "near") {
      sfx.honk();
      this.ctx.ui.toast("nearMiss");
    }
  }

  update(dt) {
    const p = this.sim.player;
    const pl = this.ctx.player;
    const wx = this.view.crossX + p.x;
    const wz = this.view.roadZ - p.z;
    pl.position.set(wx, this.ctx.world.heightAt(wx, wz), wz);
    pl.root.rotation.y = Math.PI; // keep facing the far kerb (-z), even when stepping back
    if (this.input_.hand) pl.play("interact-right");
    else if (Math.abs(p.vz) > 2) pl.play("sprint");
    else if (Math.abs(p.vz) > 0.2) pl.play("walk", { timeScale: 0.8 });
    else pl.play("idle");
    if (this.flash > 0) {
      this.flash -= dt;
      pl.root.visible = Math.floor(this.flash * 12) % 2 === 0;
    } else pl.root.visible = true;
    this._render();
  }

  _render() {
    const full = this.sim.hearts;
    const html = `${t("hearts")}: ${"❤️".repeat(Math.max(0, full))}${"🤍".repeat(Math.max(0, this.sim.T.hearts - full))}`;
    if (this.heartsEl.innerHTML !== html) this.heartsEl.innerHTML = html;
  }

  close() {
    this.ctx.player.root.visible = true;
    this.hud.className = "";
    this.hud.innerHTML = "";
  }
}

export const StreetCrossing = {
  ambient(ctx, params = {}) {
    const view = new TrafficView(ctx, params);
    ctx.traffic = view;
    return view;
  },

  async run(ctx, params = {}) {
    const view = ctx.traffic;
    await view.ready;
    const tips = [];
    let attempts = 0;
    for (;;) {
      attempts++;
      const crossing = new Crossing(ctx, view);
      view.crossing = crossing;
      const upd = (dt) => crossing.update(dt);
      ctx.game.updaters.add(upd);
      await new Promise((resolve) => {
        const check = () => {
          if (view.sim.done || ctx.scene.disposed) {
            ctx.game.updaters.delete(check);
            resolve();
          }
        };
        ctx.game.updaters.add(check);
      });
      ctx.game.updaters.delete(upd);
      view.crossing = null;
      crossing.close();
      const res = view.sim.result();
      if (ctx.scene.disposed) return res;
      view.sim.deactivate();
      if (res.passed) {
        sfx.good();
        const z = view.roadZ - (view.sim.T.roadHalf + 0.6);
        ctx.player.position.set(view.crossX, ctx.world.heightAt(view.crossX, z), z);
        ctx.player.play("idle");
        if (res.ran) tips.push({ tip: params.tipRan, good: false });
        if (res.wentBack) tips.push({ tip: params.tipBack, good: false });
        if (res.hits === 0 && !res.ran && !res.wentBack) tips.push({ tip: params.tipPerfect, good: true });
        await ctx.ui.info(
          {
            en: `${t({ en: "You made it across!" })}\nBumps: **${res.hits}** · Close calls: **${res.nearMisses}**${res.ran ? "\nYou ran – riders couldn't predict you." : ""}${res.wentBack ? "\nYou stepped back – that's when bumps happen." : ""}`,
            vi: `Bạn đã qua đường!\nVa chạm: **${res.hits}** · Suýt va: **${res.nearMisses}**${res.ran ? "\nBạn đã chạy – người lái không đoán được bạn." : ""}${res.wentBack ? "\nBạn lùi lại – lúc đó dễ va chạm nhất." : ""}`,
          },
          { icon: "🎉" }
        );
        return { ...res, score: res.score, tips, attempts };
      }
      // Failed: back to the kerb and try again.
      sfx.bad();
      const z0 = view.roadZ + view.sim.T.roadHalf + 0.4;
      ctx.player.position.set(view.crossX, ctx.world.heightAt(view.crossX, z0), z0);
      await ctx.ui.info("crossFail", { icon: "😵", button: "retry" });
      tips.push({ tip: params.tipBack, good: false });
    }
  },
};
