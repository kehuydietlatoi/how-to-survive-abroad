import * as THREE from "three";
import { PfandMachine, PFAND_ITEMS, PFAND_WHY, euro } from "./shopLogic.js";
import { toon } from "../core/Assets.js";
import { sfx } from "../core/Audio.js";
import { t } from "../i18n/i18n.js";
import { esc, rich } from "../ui/ui.js";

// 3D close-up of a reverse vending machine (Pfandautomat). Feed bottles one by one;
// the machine spins each one to read the barcode. Keep non-deposit items aside.

const TXT = {
  title: { en: "Pfandautomat: return your empties", vi: "Máy trả vỏ chai (Pfandautomat)" },
  hint: {
    en: "Look for the **Pfand logo**. Feed deposit bottles & cans in; keep the rest aside.",
    vi: "Tìm **logo Pfand**. Cho chai/lon có tiền cọc vào máy; giữ lại những món khác.",
  },
  insert: { en: "Into the machine", vi: "Cho vào máy" },
  keep: { en: "Keep aside", vi: "Để riêng" },
  accepted: { en: "+{v} ✔", vi: "+{v} ✔" },
  rejected: { en: "Nicht annehmbar: not accepted!", vi: "Nicht annehmbar: máy không nhận!" },
  keptOk: { en: "Right, no Pfand on this one.", vi: "Đúng, món này không có Pfand." },
  pressBon: { en: "All done! Press the green **Bon** button for your receipt.", vi: "Xong rồi! Bấm nút xanh **Bon** để lấy phiếu." },
  bon: { en: "Bon", vi: "Bon" },
  receipt: { en: "Take receipt", vi: "Lấy phiếu" },
  receiptNote: {
    en: "Hand this receipt at the checkout: the amount comes off your shopping.",
    vi: "Đưa phiếu này ở quầy thu ngân: số tiền sẽ được trừ vào hoá đơn.",
  },
};

function labelTex(lines, bg, fg = "#ffffff", w = 256, h = 128) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.textAlign = "center";
  g.textBaseline = "middle";
  lines.forEach((l, i) => {
    g.font = `bold ${l.size || 40}px "Baloo 2", system-ui, sans-serif`;
    g.fillText(l.text, w / 2, (h / (lines.length + 1)) * (i + 1));
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

const PFAND_LABEL = () => [{ text: "♻ PFAND", size: 38 }, { text: "0,25 €", size: 30 }];

function lathe(points, color, opts) {
  const pts = points.map(([r, y]) => new THREE.Vector2(r, y));
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), toon(color, opts));
  m.castShadow = true;
  return m;
}

function band(r, h, y, tex) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28, 1, true), new THREE.MeshToonMaterial({ map: tex }));
  m.position.y = y;
  return m;
}

/** Item models, ~0.3 m tall, standing on y = 0. */
export function itemModel(kind) {
  const g = new THREE.Group();
  const bottle = [
    [0, 0],
    [0.05, 0],
    [0.055, 0.02],
    [0.055, 0.2],
    [0.03, 0.26],
    [0.018, 0.29],
    [0.018, 0.31],
  ];
  switch (kind) {
    case "pet":
      g.add(lathe(bottle, "#bfe6ff", { opacity: 0.6 }));
      g.add(band(0.057, 0.07, 0.12, labelTex(PFAND_LABEL(), "#1f6fd1")));
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.025, 16), toon("#1f5fbf")).translateY(0.315));
      break;
    case "pet2":
      g.add(lathe(bottle, "#ffb347", { opacity: 0.85 }));
      g.add(band(0.057, 0.07, 0.12, labelTex(PFAND_LABEL(), "#e8590c")));
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.025, 16), toon("#2f9e44")).translateY(0.315));
      break;
    case "pet3":
      g.add(
        lathe(
          [
            [0, 0],
            [0.06, 0],
            [0.062, 0.03],
            [0.06, 0.05],
            [0.062, 0.07],
            [0.062, 0.2],
            [0.032, 0.26],
            [0.02, 0.3],
            [0.02, 0.32],
          ],
          "#b7e4c7",
          { opacity: 0.75 }
        )
      );
      g.add(band(0.064, 0.07, 0.13, labelTex([{ text: "MEHRWEG", size: 34 }, { text: "0,15 €", size: 30 }], "#2b8a3e")));
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.023, 0.025, 16), toon("#2b8a3e")).translateY(0.33));
      break;
    case "can":
    case "crushed": {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.13, 24), new THREE.MeshToonMaterial({ map: labelTex(PFAND_LABEL(), "#d62828") }));
      can.position.y = 0.065;
      g.add(can);
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.01, 24), toon("#c0c4cc")).translateY(0.135));
      if (kind === "crushed") {
        g.scale.set(1.35, 0.45, 0.8);
        g.rotation.z = 0.3;
      }
      break;
    }
    case "wine":
      g.add(
        lathe(
          [
            [0, 0],
            [0.04, 0],
            [0.042, 0.02],
            [0.042, 0.2],
            [0.036, 0.24],
            [0.016, 0.28],
            [0.015, 0.36],
            [0.017, 0.37],
          ],
          "#1f5132"
        )
      );
      g.add(band(0.0425, 0.07, 0.11, labelTex([{ text: "Riesling", size: 40 }], "#f3e9d2", "#7a2a1f")));
      break;
    case "beer":
      g.add(
        lathe(
          [
            [0, 0],
            [0.035, 0],
            [0.037, 0.02],
            [0.037, 0.15],
            [0.03, 0.19],
            [0.015, 0.23],
            [0.015, 0.25],
          ],
          "#7a4a1e"
        )
      );
      g.add(band(0.0375, 0.05, 0.09, labelTex([{ text: "PILS", size: 44 }, { text: "Mehrweg", size: 26 }], "#f6c945", "#7a2a1f")));
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.01, 12), toon("#c0c4cc")).translateY(0.255));
      break;
    case "carton": {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), new THREE.MeshToonMaterial({ map: labelTex([{ text: "MILCH", size: 44 }], "#ffffff", "#1f5fbf") }));
      box.position.y = 0.1;
      g.add(box);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.05, 4), toon("#1f5fbf"));
      roof.position.y = 0.225;
      roof.rotation.y = Math.PI / 4;
      g.add(roof);
      break;
    }
    case "jar":
      g.add(
        lathe(
          [
            [0, 0],
            [0.045, 0],
            [0.048, 0.02],
            [0.048, 0.09],
            [0.04, 0.11],
            [0.04, 0.12],
          ],
          "#ffd6e0",
          { opacity: 0.7 }
        )
      );
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.02, 20), toon("#d4a017")).translateY(0.125));
      g.add(band(0.0485, 0.04, 0.055, labelTex([{ text: "Erdbeer", size: 40 }], "#ffffff", "#c1121f")));
      break;
  }
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  return g;
}

export const PfandAutomat = {
  run(ctx) {
    return new Promise((resolve) => {
      const game = ctx.game;
      const machine = new PfandMachine(PFAND_ITEMS);

      // ---------------------------------------------------------------- scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#e9eef3");
      scene.add(new THREE.HemisphereLight("#ffffff", "#b8c2cc", 1.7));
      const sun = new THREE.DirectionalLight("#fff6e8", 1.8);
      sun.position.set(1, 3, 3);
      sun.castShadow = true;
      scene.add(sun);
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), toon("#dfe6ec"));
      wall.position.set(0, 1.8, -0.4);
      scene.add(wall);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), toon("#c9d2dc"));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.6), toon("#f4f6f8"));
      body.position.set(0, 1.3, -0.1);
      body.castShadow = body.receiveShadow = true;
      scene.add(body);
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 0.05), toon("#2fa84f"));
      panel.position.set(0, 1.45, 0.22);
      scene.add(panel);
      // intake hole with rubber flaps
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 12, 32), toon("#1f2937"));
      ring.position.set(0, 1.45, 0.26);
      scene.add(ring);
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), toon("#0b0f1a"));
      hole.position.set(0, 1.45, 0.25);
      scene.add(hole);
      const laser = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.01), new THREE.MeshBasicMaterial({ color: "#ff3b30", transparent: true, opacity: 0 }));
      laser.position.set(0, 1.45, 0.27);
      scene.add(laser);
      // display
      const dispCanvas = document.createElement("canvas");
      dispCanvas.width = 512;
      dispCanvas.height = 160;
      const dispTex = new THREE.CanvasTexture(dispCanvas);
      dispTex.colorSpace = THREE.SRGBColorSpace;
      const display = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.28), new THREE.MeshBasicMaterial({ map: dispTex }));
      display.position.set(0, 2.3, 0.21);
      scene.add(display);
      const drawDisplay = (line1, line2, color = "#7CFC9A") => {
        const g = dispCanvas.getContext("2d");
        g.fillStyle = "#0b1a10";
        g.fillRect(0, 0, 512, 160);
        g.fillStyle = color;
        g.textAlign = "center";
        g.font = 'bold 54px "Courier New", monospace';
        g.fillText(line1, 256, 66);
        g.font = 'bold 40px "Courier New", monospace';
        g.fillText(line2, 256, 126);
        dispTex.needsUpdate = true;
      };
      drawDisplay("LEERGUT", euro(0));
      // green receipt button
      const bonBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 24), toon("#2fa84f", { emissive: "#0b3d1a" }));
      bonBtn.rotation.x = Math.PI / 2;
      bonBtn.position.set(0.5, 0.78, 0.24);
      scene.add(bonBtn);
      const bonLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.1), new THREE.MeshBasicMaterial({ map: labelTex([{ text: "BON", size: 60 }], "#f4f6f8", "#2fa84f", 256, 96) }));
      bonLabel.position.set(0.5, 0.62, 0.211);
      scene.add(bonLabel);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.22), new THREE.MeshBasicMaterial({ map: labelTex([{ text: "♻ Leergut · Pfandrückgabe", size: 36 }], "#2fa84f", "#ffffff", 512, 90) }));
      sign.position.set(0, 2.75, 0.21);
      scene.add(sign);
      // "keep aside" basket on the floor to the left
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.3, 20, 1, true), toon("#8b5a2b"));
      basket.material = basket.material.clone();
      basket.material.side = THREE.DoubleSide;
      basket.position.set(-1.25, 0.15, 0.9);
      scene.add(basket);

      const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 30);
      const fit = () => {
        camera.aspect = innerWidth / innerHeight;
        const portrait = camera.aspect < 1;
        camera.fov = portrait ? 62 : 42;
        camera.position.set(0, 1.7, portrait ? 5.6 : 5.0);
        camera.lookAt(0, portrait ? 1.35 : 1.45, 0);
        camera.updateProjectionMatrix();
      };
      fit();
      addEventListener("resize", fit);
      game.view = { scene, camera };

      // ---------------------------------------------------------------- item handling
      const HOLD = new THREE.Vector3(0.55, 0.45, 1.3);
      let held = null;
      let busy = false;
      const anims = new Set();
      const tween = (dur, fn) =>
        new Promise((res) => {
          let el = 0;
          const a = (dt) => {
            el += dt;
            const k = Math.min(1, el / dur);
            fn(k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, k);
            if (k >= 1) {
              anims.delete(a);
              res();
            }
          };
          anims.add(a);
        });
      const showNext = () => {
        const it = machine.current;
        if (!it) return;
        held = itemModel(it.kind);
        held.scale.multiplyScalar(1.7);
        held.position.copy(HOLD);
        scene.add(held);
      };
      const update = (dt, time) => {
        for (const a of [...anims]) a(dt);
        if (held && !busy) held.rotation.y = time * 0.9;
      };
      game.updaters.add(update);

      // ---------------------------------------------------------------- HUD
      const root = document.getElementById("minigame");
      root.className = "show";
      document.body.classList.add("mg-ui");
      root.innerHTML = `
        <div class="pf-top">
          <div class="sort-title">${esc(t(TXT.title))}</div>
          <div class="sort-hint">${rich(t(TXT.hint))}</div>
        </div>
        <div class="pf-msg"></div>
        <div class="pf-bottom">
          <div class="pf-name"></div>
          <div class="pf-btns">
            <button class="pf-btn keep" data-a="keep">✋ ${esc(t(TXT.keep))}<small>Q / ←</small></button>
            <button class="pf-btn in" data-a="insert">⤴️ ${esc(t(TXT.insert))}<small>E / →</small></button>
          </div>
        </div>`;
      const nameEl = root.querySelector(".pf-name");
      const msgEl = root.querySelector(".pf-msg");
      const bottom = root.querySelector(".pf-bottom");
      const say = (txt, kind) => {
        msgEl.className = `pf-msg show ${kind}`;
        msgEl.innerHTML = rich(txt);
      };
      const renderName = () => {
        const it = machine.current;
        nameEl.innerHTML = it ? `<b>${machine.index + 1}/${machine.items.length}</b> ${esc(t(it.name))}` : "";
      };

      const doInsert = async () => {
        if (busy || !held) return;
        busy = true;
        const obj = held;
        const r = machine.insert();
        sfx.click();
        // lay the bottle down and push it into the hole
        await tween(0.35, (e) => {
          obj.position.lerpVectors(HOLD, new THREE.Vector3(0, 1.45, 0.75), e);
          obj.rotation.set((Math.PI / 2) * e, 0, 0); // bottom first, like at a real machine
        });
        await tween(0.3, (e) => obj.position.set(0, 1.45, 0.75 - 0.35 * e));
        // spin & scan
        laser.material.opacity = 0.9;
        await tween(0.7, (e) => {
          obj.rotation.y = e * Math.PI * 4;
          laser.position.y = 1.45 + Math.sin(e * Math.PI * 6) * 0.12;
        });
        laser.material.opacity = 0;
        if (r.accepted) {
          sfx.coin();
          await tween(0.3, (e) => obj.position.setZ(0.4 - 0.6 * e));
          scene.remove(obj);
          drawDisplay("LEERGUT", euro(machine.total));
          say(t(TXT.accepted, { v: euro(r.item.pfand) }), "good");
        } else {
          sfx.bad();
          drawDisplay("NICHT", "ANNEHMBAR", "#ff6b6b");
          await tween(0.4, (e) => obj.position.setZ(0.4 + 0.5 * e));
          await tween(0.4, (e) => {
            obj.position.lerpVectors(new THREE.Vector3(0, 1.45, 0.9), new THREE.Vector3(-1.25, 0.35, 0.9), e);
          });
          say(`${t(TXT.rejected)} ${t(PFAND_WHY[r.item.id] || "")}`, "bad");
          setTimeout(() => drawDisplay("LEERGUT", euro(machine.total)), 1200);
        }
        held = null;
        next();
      };

      const doKeep = async () => {
        if (busy || !held) return;
        busy = true;
        const obj = held;
        const r = machine.keep();
        sfx.click();
        await tween(0.45, (e, k) => {
          obj.position.lerpVectors(HOLD, new THREE.Vector3(-1.25, 0.35, 0.9), e);
          obj.position.y += Math.sin(k * Math.PI) * 0.4;
        });
        if (r.ok) say(t(TXT.keptOk), "good");
        else {
          sfx.bad();
          say(t(PFAND_WHY.keptPfand, { v: euro(r.lost) }), "bad");
        }
        held = null;
        next();
      };

      const next = () => {
        busy = false;
        if (machine.done) {
          nameEl.innerHTML = "";
          bottom.querySelector(".pf-btns").innerHTML = `<button class="pf-btn in bon" data-a="bon">🟢 ${esc(t(TXT.bon))}</button>`;
          bottom.querySelector("[data-a=bon]").onclick = pressBon;
          setTimeout(() => say(t(TXT.pressBon), "good"), 900);
          return;
        }
        showNext();
        renderName();
      };

      let receiptShown = false;
      const pressBon = async () => {
        if (receiptShown) return;
        receiptShown = true;
        sfx.print();
        await tween(0.15, (e) => bonBtn.position.setZ(0.24 - 0.03 * e));
        await tween(0.15, (e) => bonBtn.position.setZ(0.21 + 0.03 * e));
        const total = machine.total;
        bottom.innerHTML = `<div class="pf-receipt pop">
            <div class="rc-head">LEERGUT-BON</div>
            <div class="rc-line"><span>Pfand</span><span>${euro(total)}</span></div>
            <div class="rc-bar">||| |||| || ||||| || |||</div>
            <small>${esc(t(TXT.receiptNote))}</small>
            <button class="btn primary">${esc(t(TXT.receipt))}</button>
          </div>`;
        bottom.querySelector("button").onclick = finish;
      };

      const onKey = (e) => {
        const k = e.key.toLowerCase();
        if (machine.done) {
          if (["e", "enter", " "].includes(k)) {
            e.preventDefault();
            if (!receiptShown) pressBon();
            else finish();
          }
          return;
        }
        if (k === "e" || k === "arrowright") {
          e.preventDefault();
          doInsert();
        } else if (k === "q" || k === "arrowleft") {
          e.preventDefault();
          doKeep();
        }
      };
      addEventListener("keydown", onKey, true);
      bottom.querySelector("[data-a=insert]").onclick = doInsert;
      bottom.querySelector("[data-a=keep]").onclick = doKeep;
      // tapping the hole also inserts
      const ray = new THREE.Raycaster();
      const onDown = (e) => {
        const r = game.renderer.domElement.getBoundingClientRect();
        ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
        const hit = ray.intersectObjects([hole, ring, bonBtn, basket]);
        if (!hit.length) return;
        const o = hit[0].object;
        if (o === bonBtn && machine.done) pressBon();
        else if (o === basket) doKeep();
        else doInsert();
      };
      game.renderer.domElement.addEventListener("pointerdown", onDown);

      let finished = false;
      const cleanup = () => {
        removeEventListener("keydown", onKey, true);
        removeEventListener("resize", fit);
        game.renderer.domElement.removeEventListener("pointerdown", onDown);
        game.updaters.delete(update);
        game.view = null;
        root.className = "";
        root.innerHTML = "";
        document.body.classList.remove("mg-ui");
      };
      ctx.scene.onDispose?.(cleanup);
      const finish = () => {
        if (finished) return;
        finished = true;
        cleanup();
        const r = machine.result();
        const tips = [
          {
            tip: {
              en: "Pfand: plastic bottles & cans **€0.25**, reusable glass beer **€0.08**, reusable PET **€0.15**. Wine bottles, jars and cartons have none. Don't crush cans!",
              vi: "Pfand: chai nhựa & lon **0,25 €**, chai bia thuỷ tinh tái sử dụng **0,08 €**, chai PET tái sử dụng **0,15 €**. Chai vang, lọ, hộp giấy không có. Đừng bóp méo lon!",
            },
            good: r.score === 100,
          },
        ];
        resolve({ ...r, flags: { pfandBon: r.total }, tips });
      };

      showNext();
      renderName();
    });
  },
};
