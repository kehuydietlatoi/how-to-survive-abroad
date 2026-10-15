import * as THREE from "three";
import { PhoMeal, CONDIMENTS } from "./phoLogic.js";
import { makeBowl, makeCondiments, makeUtensils, toppingPiece, syncBowl, BROTH_TOP } from "../world/phoModel.js";
import { toon } from "../core/Assets.js";
import { sfx } from "../core/Audio.js";
import { t } from "../i18n/i18n.js";
import { esc, rich } from "../ui/ui.js";

// Close-up minigame: season your phở with real Hanoi table condiments, then eat it with
// chopsticks (noodles) and spoon (broth). Rendered in its own small 3D scene.

const TXT = {
  title: { en: "Your phở bò", vi: "Bát phở bò của bạn" },
  seasonHint: {
    en: "Tap the table (or the buttons) to add condiments. Tip: taste first!",
    vi: "Chạm vào đồ trên bàn (hoặc các nút) để thêm gia vị. Mẹo: nếm trước đã!",
  },
  eatHint: {
    en: "Chopsticks for noodles, spoon for broth. Slurping is fine!",
    vi: "Đũa gắp bánh phở, thìa húp nước dùng. Húp xì xụp cũng không sao!",
  },
  taste: { en: "Taste", vi: "Nếm" },
  startEat: { en: "Start eating", vi: "Bắt đầu ăn" },
  noodles: { en: "Noodles", vi: "Gắp phở" },
  broth: { en: "Broth", vi: "Húp nước" },
  tea: { en: "Trà đá", vi: "Trà đá" },
  sour: { en: "Sour", vi: "Chua" },
  spicy: { en: "Spicy", vi: "Cay" },
  fresh: { en: "Fresh", vi: "Thơm" },
  plain: {
    en: "Rich, clear beef broth, maybe a bit plain for you? Season it your way.",
    vi: "Nước dùng bò trong, đậm đà, có lẽ hơi nhạt với bạn? Nêm theo ý mình nhé.",
  },
  nice: { en: "Mmm, just right! 😋", vi: "Ừm, vừa miệng! 😋" },
  tooSpicy: { en: "Whoa, that's very spicy! 🥵", vi: "Ối, cay quá! 🥵" },
  tooSour: { en: "Very sour… 😖", vi: "Chua quá… 😖" },
  notTasted: {
    en: "You added it before tasting. Locals taste the broth first!",
    vi: "Bạn thêm gia vị trước khi nếm. Người Hà Nội thường nếm nước dùng trước!",
  },
  max: { en: "That's plenty of that one.", vi: "Thế là đủ rồi." },
  cough: { en: "*cough cough* Too spicy! Grab the trà đá 🧊", vi: "*khụ khụ* Cay quá! Uống ngụm trà đá đi 🧊" },
  cooled: { en: "Ahh, iced tea saves the day.", vi: "À, trà đá cứu nguy." },
  done: { en: "Hết sạch! (All gone!) 😋", vi: "Hết sạch! 😋" },
};

const VIEW = { fov: 42 };

export const PhoEating = {
  run(ctx) {
    return new Promise((resolve) => {
      const game = ctx.game;
      const meal = new PhoMeal();

      // ---------------------------------------------------------------- 3D scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#ffe7c2");
      scene.add(new THREE.HemisphereLight("#fff6e8", "#b7a58c", 1.7));
      const sun = new THREE.DirectionalLight("#fff1d6", 2.2);
      sun.position.set(0.4, 1.2, 0.5);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      Object.assign(sun.shadow.camera, { left: -0.4, right: 0.4, top: 0.4, bottom: -0.4, near: 0.1, far: 3 });
      sun.shadow.bias = -0.0003;
      scene.add(sun);

      const table = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.7), toon("#4da3ff"));
      table.position.y = -0.02;
      table.receiveShadow = true;
      scene.add(table);
      // street tiles below for context
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), toon("#d8c8ae"));
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.5;
      scene.add(floor);

      const bowl = makeBowl();
      scene.add(bowl);
      const cond = makeCondiments();
      scene.add(cond.group);
      const { chop, spoon } = makeUtensils();
      scene.add(chop, spoon);
      const restChop = new THREE.Vector3(0.1, 0.13, 0.05);
      const restSpoon = new THREE.Vector3(-0.1, 0.11, 0.07);
      // Utensils point their handles toward "you": chopsticks in the right hand, spoon in the left.
      chop.position.copy(restChop);
      chop.lookAt(restChop.clone().add(new THREE.Vector3(0.35, 1, 0.3)));
      spoon.position.copy(restSpoon);
      spoon.lookAt(restSpoon.clone().add(new THREE.Vector3(-0.35, 0, 0.9)));

      // Noodle strand lifted by the chopsticks.
      const strand = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const pts = [];
        for (let s = 0; s <= 8; s++) pts.push(new THREE.Vector3((i - 1.5) * 0.003 + Math.sin(s + i) * 0.003, -s * 0.012, Math.cos(s * 0.7 + i) * 0.003));
        strand.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.0026, 5), toon("#f6f0df")));
      }
      strand.visible = false;
      scene.add(strand);
      const spoonBroth = new THREE.Mesh(new THREE.CircleGeometry(0.018, 14), toon("#e3a85a"));
      spoonBroth.rotation.x = -Math.PI / 2;
      spoonBroth.position.y = 0.022;
      spoonBroth.scale.set(1, 1.3, 1);
      spoonBroth.visible = false;
      spoon.add(spoonBroth);

      const camera = new THREE.PerspectiveCamera(VIEW.fov, 1, 0.01, 10);
      const fit = () => {
        const aspect = innerWidth / innerHeight;
        camera.aspect = aspect;
        // Portrait screens need the camera further away to keep the condiments in view.
        const d = aspect < 1 ? 0.7 / Math.max(aspect, 0.45) : 0.72;
        camera.position.set(0, d * 0.85, d * 0.6);
        camera.lookAt(0, 0, aspect < 1 ? 0.02 : 0.0);
        camera.updateProjectionMatrix();
      };
      fit();
      addEventListener("resize", fit);
      game.view = { scene, camera };
      syncBowl(bowl, meal);

      // ---------------------------------------------------------------- animation helpers
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
      let shake = 0;
      const update = (dt, time) => {
        for (const a of [...anims]) a(dt);
        if (!busy) {
          chop.position.y = restChop.y + Math.sin(time * 2) * 0.004;
          spoon.position.y = restSpoon.y + Math.sin(time * 2 + 1) * 0.003;
        }
        if (shake > 0) {
          shake -= dt;
          camera.position.x = shake > 0 ? Math.sin(time * 60) * 0.006 * shake : 0;
        }
        // gentle steam bob on the broth
        bowl.userData.broth.rotation.z = Math.sin(time * 0.5) * 0.05;
        // hover highlight
        for (const [id, obj] of Object.entries(cond.items)) {
          const target = hovered === id ? 1.08 : 1;
          obj.scale.setScalar(obj.scale.x + (target - obj.scale.x) * Math.min(1, dt * 12));
        }
      };
      game.updaters.add(update);

      // ---------------------------------------------------------------- HUD
      const root = document.getElementById("minigame");
      root.className = "show";
      document.body.classList.add("mg-ui");
      root.innerHTML = `
        <div class="pho-top">
          <div class="pho-title">🍜 ${esc(t(TXT.title))}</div>
          <div class="meters">
            ${["sour", "spicy", "fresh"].map((k) => `<div class="meter ${k}"><span>${esc(t(TXT[k]))}</span><div class="bar"><div></div></div></div>`).join("")}
          </div>
          <div class="pho-msg"></div>
        </div>
        <div class="pho-bottom"></div>`;
      const msgEl = root.querySelector(".pho-msg");
      const bottom = root.querySelector(".pho-bottom");
      const say = (txt, kind = "") => {
        msgEl.className = `pho-msg pop ${kind}`;
        msgEl.innerHTML = rich(t(txt));
        void msgEl.offsetWidth;
      };

      const renderMeters = () => {
        for (const k of ["sour", "spicy", "fresh"]) {
          const v = meal.flavor[k];
          const bar = root.querySelector(`.meter.${k} .bar div`);
          bar.style.width = `${Math.min(100, (v / 5) * 100)}%`;
          bar.classList.toggle("over", (k === "spicy" && meal.tooSpicy) || (k === "sour" && meal.tooSour));
        }
      };

      const renderButtons = () => {
        if (meal.phase === "season") {
          bottom.innerHTML = `
            <div class="pho-row">
              <button class="pbtn taste ${meal.tasted ? "done" : "glow"}" data-a="taste">🥄 ${esc(t(TXT.taste))}</button>
              ${CONDIMENTS.map(
                (c) => `<button class="pbtn" data-c="${c.id}" ${meal.added[c.id] >= c.max ? "disabled" : ""}>
                  <span class="ic">${c.icon}</span><span>${esc(t(c.name))}</span>${meal.added[c.id] ? `<b class="cnt">×${meal.added[c.id]}</b>` : ""}</button>`
              ).join("")}
            </div>
            <button class="btn go" data-a="eat">🥢 ${esc(t(TXT.startEat))} ▶</button>`;
        } else if (meal.phase === "eat") {
          bottom.innerHTML = `
            <div class="pho-row eat">
              <button class="pbtn big" data-a="noodles" ${meal.noodles ? "" : "disabled"}><span class="ic">🥢</span><span>${esc(t(TXT.noodles))}</span><b class="cnt">${meal.noodles}</b></button>
              <button class="pbtn big" data-a="broth" ${meal.broth ? "" : "disabled"}><span class="ic">🥄</span><span>${esc(t(TXT.broth))}</span><b class="cnt">${meal.broth}</b></button>
              <button class="pbtn big ${meal.heat > 0 || meal.coughs ? "glow" : ""}" data-a="tea"><span class="ic">🧊</span><span>${esc(t(TXT.tea))}</span></button>
            </div>`;
        } else bottom.innerHTML = "";
        bottom.querySelectorAll("[data-c]").forEach((b) => (b.onclick = () => addCondiment(b.dataset.c)));
        bottom.querySelectorAll("[data-a]").forEach((b) => (b.onclick = () => action(b.dataset.a)));
      };

      // ---------------------------------------------------------------- actions
      const addCondiment = async (id) => {
        if (busy || meal.phase !== "season") return;
        const before = meal.tasted;
        const r = meal.add(id);
        if (!r.ok) {
          if (r.reason === "max") say(TXT.max);
          return;
        }
        busy = true;
        sfx.click();
        const from = cond.items[id];
        await tween(0.18, (e) => from.position.setY(e * 0.05));
        const piece = toppingPiece(id, bowl.userData.rand);
        const dest = piece.position.clone();
        const start = from.position.clone().setY(0.12);
        bowl.userData.toppings.add(piece);
        await tween(0.35, (e, k) => {
          piece.position.lerpVectors(start, dest, e);
          piece.position.y += Math.sin(k * Math.PI) * 0.08;
        });
        from.position.y = 0;
        sfx.coin();
        busy = false;
        renderMeters();
        say(!before ? TXT.notTasted : TXT[r.comment], meal.tooSpicy || meal.tooSour ? "bad" : !before ? "warn" : "good");
        renderButtons();
      };

      const dipSpoon = async (withBroth) => {
        busy = true;
        const p0 = restSpoon.clone();
        const dip = new THREE.Vector3(-0.03, BROTH_TOP - 0.01 + (bowl.userData.broth.position.y - BROTH_TOP), 0.02);
        await tween(0.3, (e) => spoon.position.lerpVectors(p0, dip, e));
        spoonBroth.visible = withBroth;
        const up = new THREE.Vector3(-0.02, 0.25, 0.25);
        await tween(0.35, (e) => spoon.position.lerpVectors(dip, up, e));
        spoonBroth.visible = false;
        sfx.good();
        await tween(0.3, (e) => spoon.position.lerpVectors(up, p0, e));
        busy = false;
      };

      const liftNoodles = async () => {
        busy = true;
        const p0 = restChop.clone();
        const y = bowl.userData.broth.position.y;
        const dip = new THREE.Vector3(0.01, y + 0.02, 0.0);
        await tween(0.28, (e) => chop.position.lerpVectors(p0, dip, e));
        strand.visible = true;
        const up = new THREE.Vector3(0.0, 0.3, 0.22);
        await tween(0.42, (e) => {
          chop.position.lerpVectors(dip, up, e);
          strand.position.copy(chop.position).add(new THREE.Vector3(0, -0.005, 0));
        });
        strand.visible = false;
        await tween(0.3, (e) => chop.position.lerpVectors(up, p0, e));
        busy = false;
      };

      const action = async (a) => {
        if (busy) return;
        if (a === "taste") {
          await dipSpoon(true);
          const c = meal.taste();
          say(TXT[c], c === "nice" || c === "plain" ? "good" : "bad");
          renderButtons();
        } else if (a === "eat") {
          meal.startEating();
          say(TXT.eatHint);
          renderButtons();
        } else if (a === "noodles") {
          await liftNoodles();
          after(meal.biteNoodles());
        } else if (a === "broth") {
          await dipSpoon(true);
          after(meal.sipBroth());
        } else if (a === "tea") {
          busy = true;
          const glass = cond.items.tea;
          await tween(0.25, (e) => glass.position.setY(e * 0.12));
          await tween(0.25, (e) => glass.position.setY(0.12 * (1 - e)));
          busy = false;
          meal.drinkTea();
          sfx.good();
          say(TXT.cooled, "good");
          renderButtons();
        }
      };

      const after = (r) => {
        if (!r.ok) return;
        syncBowl(bowl, meal);
        if (r.cough) {
          sfx.bad();
          shake = 0.6;
          say(TXT.cough, "bad");
        }
        renderButtons();
        if (r.done) finish();
      };

      // ---------------------------------------------------------------- 3D picking
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      let hovered = null;
      const pick = (e) => {
        const rect = game.renderer.domElement.getBoundingClientRect();
        ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const hits = ray.intersectObjects([cond.group, bowl], true);
        if (!hits.length) return null;
        let o = hits[0].object;
        while (o && !o.userData.condiment && o !== bowl) o = o.parent;
        return o === bowl ? "bowl" : o?.userData.condiment || null;
      };
      const canvas = game.renderer.domElement;
      const onDown = (e) => {
        const id = pick(e);
        if (!id) return;
        if (id === "tea") action("tea");
        else if (id === "bowl") action(meal.phase === "season" ? "taste" : meal.noodles ? "noodles" : "broth");
        else if (meal.phase === "season") addCondiment(id);
      };
      const onMove = (e) => {
        hovered = pick(e);
        canvas.style.cursor = hovered ? "pointer" : "";
      };
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);

      // ---------------------------------------------------------------- finish
      const finish = async () => {
        say(TXT.done, "good");
        sfx.good();
        await new Promise((r) => setTimeout(r, 1200));
        cleanup();
        const res = meal.result();
        const tips = [
          {
            tip: {
              en: "Taste the broth **before** adding lime, chili or vinegar, then season a little at a time.",
              vi: "Nếm nước dùng **trước** khi cho chanh, ớt hay dấm, rồi nêm từng chút một.",
            },
            good: res.tastedFirst,
          },
          {
            tip: {
              en: "Hanoi table: lime (chanh), fresh chili (ớt), chili sauce (tương ớt), garlic vinegar (dấm tỏi), herbs and quẩy to dip in the broth.",
              vi: "Bàn phở Hà Nội: chanh, ớt tươi, tương ớt, dấm tỏi, rau thơm và quẩy chấm nước dùng.",
            },
            good: res.kinds >= 2,
          },
          {
            tip: { en: "Chopsticks in one hand for noodles, spoon in the other for broth.", vi: "Một tay cầm đũa gắp phở, tay kia cầm thìa húp nước." },
            good: true,
          },
        ];
        if (res.coughs)
          tips.push({
            tip: { en: "Too spicy? A glass of **trà đá** (iced tea, often free or very cheap) cools you down.", vi: "Cay quá? Một cốc **trà đá** (thường miễn phí hoặc rất rẻ) sẽ giúp bạn." },
            good: res.drankTea,
          });
        resolve({ ...res, tips });
      };

      const cleanup = () => {
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.style.cursor = "";
        removeEventListener("resize", fit);
        game.updaters.delete(update);
        game.view = null;
        root.className = "";
        root.innerHTML = "";
        document.body.classList.remove("mg-ui");
      };
      ctx.scene.onDispose?.(cleanup);

      renderMeters();
      renderButtons();
      say(TXT.seasonHint);
    });
  },
};
