import * as THREE from "three";
import { World } from "../world/World.js";
import { Character } from "../world/Character.js";
import { ScenarioRunner, validateScenario, isAcceptable } from "./ScenarioRunner.js";
import * as ui from "../ui/ui.js";
import { t } from "../i18n/i18n.js";

const WALK = 3.4; // m/s – a bit faster than real life so the slice stays snappy
const RUN = 6;
const PLAYER_RADIUS = 0.35;

/**
 * Plays one scenario: builds its map, spawns the player and walks the ScenarioRunner
 * through its steps (sandbox / choice / minigame / info / travel / end).
 */
export class ScenarioScene {
  constructor(game, input, def, { avatar = "character-female-a", onExit } = {}) {
    this.game = game;
    this.input = input;
    this.def = def;
    this.avatar = avatar;
    this.onExit = onExit;
    this.runner = new ScenarioRunner(def.scenario);
    this.roaming = false;
    this.pendingInteract = null;
    this.disposed = false;
    this.facing = 0;
    this._head = new THREE.Vector3();
    this._disposers = [];
    const errors = validateScenario(def.scenario);
    if (errors.length) console.error("scenario errors", errors);
  }

  async load(onProgress) {
    const { map } = this.def;
    this.game.setEnvironment({ sky: map.sky, fog: map.fog });
    this.game.setCameraRig(map.camera);
    this.world = new World(this.game.scene);
    await this.world.build(map, onProgress);
    this.player = await Character.create(this.avatar);
    this.world.root.add(this.player.root);
    this.world.player = this.player;
    this.teleport(map.spawns.start);
    this._update = (dt, time) => this.update(dt, time);
    this.game.updaters.add(this._update);
    this.minigameCtx = { scene: this, game: this.game, input: this.input, world: this.world, player: this.player, ui };
    // Minigames may want ambient behaviour (e.g. traffic) running all the time.
    this.ambient = [];
    for (const [name, mg] of Object.entries(this.def.minigames || {})) {
      if (mg.ambient) this.ambient.push(mg.ambient(this.minigameCtx, this.def.minigameParams?.[name]));
    }
  }

  teleport(spawn) {
    const [x, z, r = 0] = spawn;
    this.player.position.set(x, this.world.heightAt(x, z), z);
    this.facing = THREE.MathUtils.degToRad(r);
    this.player.root.rotation.y = this.facing;
    this.game.follow(this.player.root, true);
  }

  // ---------------------------------------------------------------- loop

  update(dt, time) {
    if (this.disposed) return;
    this.world.update(dt, time);
    this.world.updateOccluders(dt, this.game.camera, this._head.copy(this.player.position).setY(this.player.position.y + 1));
    this.player.update(dt);
    for (const a of this.ambient) a.update?.(dt, time);

    if (this.input.consume("r") && !ui.isDialogOpen()) this.showRoute();
    if (this.input.consume("escape")) this.exit();

    if (!this.roaming) {
      ui.setPrompt(null);
      return;
    }
    // --- movement ---
    const mv = this.input.moveVector();
    const len = Math.hypot(mv.x, mv.y);
    if (len > 0.05) {
      const speed = (this.input.run ? RUN : WALK) * len;
      const dx = mv.x * speed * dt;
      const dz = -mv.y * speed * dt; // forward = away from the camera (-z)
      const p = this.player.position;
      const res = this.world.collision.move(p.x, p.z, dx, dz, PLAYER_RADIUS);
      p.x = res.x;
      p.z = res.z;
      p.y += (this.world.heightAt(p.x, p.z) - p.y) * Math.min(1, dt * 20);
      const target = Math.atan2(mv.x, -mv.y);
      let diff = target - this.facing;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.facing += diff * Math.min(1, dt * 14);
      this.player.root.rotation.y = this.facing;
      this.player.play(this.input.run ? "sprint" : "walk", { timeScale: this.input.run ? 1 : 1.15 });
    } else {
      this.player.play("idle");
    }

    // --- interaction ---
    const p = this.player.position;
    const near = this.world.nearest(p.x, p.z);
    if (near) {
      ui.setPrompt(t(near.label), () => this._interact(near));
      if (this.input.consume("e", "enter", " ")) this._interact(near);
    } else {
      ui.setPrompt(null);
      this.input.consume("e", "enter", " ");
    }
  }

  _interact(it) {
    if (ui.isDialogOpen()) return;
    this.pendingInteract?.(it);
  }

  // ---------------------------------------------------------------- scenario flow

  async run() {
    ui.setScore(0);
    // Debug / playtest: ?step=<id> jumps straight to a step (spawning at its spawn if it has one).
    const jump = this.def.startStep;
    if (jump && this.runner.stepsById.has(jump)) {
      this.runner.currentId = jump;
      Object.assign(this.runner.flags, { stamped: true, ticketValid: true });
      const spawnStep = this.def.scenario.steps.find((s) => s.id === jump);
      if (spawnStep?.spawn) this.teleport(this.def.map.spawns[spawnStep.spawn]);
    }
    while (!this.disposed) {
      const step = this.runner.current();
      await this.doActions(step.onEnter);
      if (this.disposed) return;
      if (step.type === "end") break;
      const before = this.runner.score;
      await this[`_${step.type}`](step);
      if (this.disposed) return;
      if (this.runner.score !== before) ui.setScore(this.runner.score);
    }
    if (!this.disposed) this.showResult();
  }

  async _info(step) {
    this.setRoaming(false);
    await ui.info(step.text, { speaker: step.speaker, icon: step.icon, card: step.route ? this.routeCard() : null });
    this.runner.acknowledge();
  }

  async _choice(step) {
    this.setRoaming(false);
    ui.setObjective(step.objective || null);
    const { index, first } = await ui.choice(step.prompt, step.options, { speaker: step.speaker, icon: step.icon, acceptable: isAcceptable });
    const opt = this.runner.choose(index, first);
    await this.doActions(opt.actions);
  }

  async _sandbox(step) {
    ui.setObjective(step.objective);
    this.world.setMarker(step.hideMarker ? null : step.target);
    this.setRoaming(true);
    await new Promise((resolve) => {
      this.pendingInteract = async (it) => {
        const res = this.runner.interact(it.id);
        if (res.done) {
          this.pendingInteract = null;
          this.setRoaming(false);
          this.world.setMarker(null);
          resolve();
          return;
        }
        if (res.wrong) {
          ui.setScore(this.runner.score);
          this.setRoaming(false);
          await ui.info(res.wrong.feedback, { speaker: res.wrong.speaker, icon: res.wrong.icon || "🤔" });
          this.setRoaming(true);
        } else if (it.say) {
          this.setRoaming(false);
          await ui.info(it.say, { speaker: it.speaker, icon: it.icon });
          this.setRoaming(true);
        }
      };
    });
    if (step.done) {
      await ui.info(step.done, { icon: "✅" });
    }
  }

  async _minigame(step) {
    this.setRoaming(false);
    ui.setObjective(step.objective);
    const mg = this.def.minigames[step.game];
    this.game.zoomTarget = step.zoom ?? 1;
    const result = await mg.run(this.minigameCtx, step.params || {});
    if (this.disposed) return;
    this.runner.finishMinigame(result);
  }

  async _travel(step) {
    this.setRoaming(false);
    ui.setObjective(null);
    ui.fadeText(step.text);
    await ui.fade(true, 600);
    if (step.spawn) this.teleport(this.def.map.spawns[step.spawn]);
    else this.game.follow(this.player.root, true);
    await this.doActions(step.during);
    await new Promise((r) => setTimeout(r, step.wait ?? 1400));
    ui.fadeText(null);
    await ui.fade(false, 400);
    this.runner.acknowledge();
  }

  setRoaming(on) {
    this.roaming = on;
    this.game.zoomTarget = on ? 1 : 0.62;
    if (on) this.game.follow(this.player.root);
    if (!on) {
      this.player.play("idle");
      ui.setPrompt(null);
    }
    this.input.clearPressed();
  }

  /** Small scripted actions referenced from scenario data. */
  async doActions(actions) {
    for (const a of actions || []) {
      const obj = a.id === "player" ? this.player.root : a.id ? this.world.objects[a.id] : null;
      switch (a.do) {
        case "teleport":
          this.teleport(this.def.map.spawns[a.spawn]);
          break;
        case "visible":
          if (obj) obj.visible = a.on;
          if (obj?.userData.box) obj.userData.box.enabled = a.on;
          break;
        case "interactable": {
          const it = this.world.getInteractable(a.id);
          if (it) it.enabled = a.on;
          break;
        }
        case "walls":
          this.world.setWalls(a.tag, a.on);
          break;
        case "anim":
          (a.id === "player" ? this.player : this.world.objects[`${a.id}:char`])?.play(a.anim, { once: a.once });
          break;
        case "face": {
          const target = this.world.objects[a.id] || this.player.root;
          target.rotation.y = THREE.MathUtils.degToRad(a.r);
          if (!a.id) this.facing = target.rotation.y;
          break;
        }
        case "move":
          if (obj) await tween(obj.position, { x: a.to[0], z: a.to[1] }, a.dur || 1, this.game);
          if (obj?.userData.box) obj.userData.box.enabled = false;
          break;
        case "focus":
          this.game.follow(obj || this.player.root);
          break;
        case "y":
          (a.id === "player" ? this.player.root : obj).position.y = a.y;
          break;
        case "wait":
          await new Promise((r) => setTimeout(r, a.ms));
          break;
        case "toast":
          ui.toast(a.text, a.kind);
          break;
      }
    }
  }

  // ---------------------------------------------------------------- UI bits

  routeCard() {
    const route = this.def.scenario.route;
    if (!route) return null;
    const card = ui.el("div", "route-card");
    for (const leg of route) {
      card.appendChild(
        ui.el("div", "leg", `<span class="badge" style="background:${leg.color}">${ui.esc(leg.badge)}</span><span>${ui.rich(t(leg.text))}</span>`)
      );
    }
    return card;
  }

  async showRoute() {
    if (!this.def.scenario.route) return;
    const wasRoaming = this.roaming;
    this.setRoaming(false);
    await ui.info(this.def.scenario.routeTitle || "route", { icon: "📱", card: this.routeCard(), button: "ok" });
    if (!this.disposed && wasRoaming) this.setRoaming(true);
  }

  showResult() {
    const r = this.runner;
    const stars = r.stars();
    ui.setObjective(null);
    ui.setHudVisible(false);
    const best = Math.max(stars, Number(safeGet(`hsa.best.${this.def.id}`) || 0));
    safeSet(`hsa.best.${this.def.id}`, best);
    const tips = r.journal
      .map((j) => `<li class="${j.good ? "good" : "bad"}">${ui.rich(t(j.tip))}</li>`)
      .join("");
    const s = ui.showScreen(
      `<div class="result pop">
        <h2>${ui.esc(t("complete"))}</h2>
        <div class="stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
        <div>${ui.esc(t("score"))}: <b>${r.score}</b> / ${r.maxScore}</div>
        <h3>📒 ${ui.esc(t("journal"))}</h3>
        <ul class="journal">${tips}</ul>
        <div class="row"><button class="btn" data-a="retry">${ui.esc(t("retry"))}</button>
        <button class="btn secondary" data-a="menu">${ui.esc(t("menu"))}</button></div>
      </div>`
    );
    s.querySelector('[data-a="retry"]').onclick = () => this.onExit?.("retry");
    s.querySelector('[data-a="menu"]').onclick = () => this.onExit?.("menu");
  }

  exit() {
    this.onExit?.("menu");
  }

  /** Register cleanup to run if the scenario is left mid-way (e.g. back to menu during a minigame). */
  onDispose(fn) {
    this._disposers.push(fn);
  }

  dispose() {
    this.disposed = true;
    for (const fn of this._disposers.splice(0)) fn();
    this.game.view = null;
    this.game.setCameraRig(null);
    this.pendingInteract = null;
    this.game.updaters.delete(this._update);
    for (const a of this.ambient || []) a.dispose?.();
    this.world?.dispose();
    ui.setPrompt(null);
    ui.setObjective(null);
  }
}

function tween(target, to, dur, game) {
  const from = Object.fromEntries(Object.keys(to).map((k) => [k, target[k]]));
  return new Promise((resolve) => {
    let el = 0;
    const fn = (dt) => {
      el += dt;
      const k = Math.min(1, el / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      for (const key of Object.keys(to)) target[key] = from[key] + (to[key] - from[key]) * e;
      if (k >= 1) {
        game.updaters.delete(fn);
        resolve();
      }
    };
    game.updaters.add(fn);
  });
}

function safeGet(k) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
}
