// Supermarket minigames: pure rules (no DOM / three.js), unit tested.

// ------------------------------------------------------------------ Pfandautomat
// Deposit values (Germany): single-use plastic bottles & cans €0.25 (Pfand logo),
// reusable glass beer bottles €0.08, reusable PET bottles €0.15. No deposit on wine
// bottles, jars or drink cartons. Machines can't read crushed cans.

export const PFAND_ITEMS = [
  { id: "water", kind: "pet", pfand: 0.25, name: { en: "Water bottle 1.5 l (Pfand logo)", vi: "Chai nước 1,5 l (logo Pfand)" } },
  { id: "can", kind: "can", pfand: 0.25, name: { en: "Soda can (Pfand logo)", vi: "Lon nước ngọt (logo Pfand)" } },
  { id: "wine", kind: "wine", pfand: 0, name: { en: "Wine bottle", vi: "Chai rượu vang" } },
  { id: "beer", kind: "beer", pfand: 0.08, name: { en: "Glass beer bottle (Mehrweg)", vi: "Chai bia thuỷ tinh (Mehrweg)" } },
  { id: "carton", kind: "carton", pfand: 0, name: { en: "Milk carton", vi: "Hộp sữa giấy" } },
  { id: "crushed", kind: "crushed", pfand: 0, name: { en: "Crushed can", vi: "Lon bị bóp méo" } },
  { id: "juice", kind: "pet2", pfand: 0.25, name: { en: "Juice bottle, plastic (Pfand logo)", vi: "Chai nước ép nhựa (logo Pfand)" } },
  { id: "jar", kind: "jar", pfand: 0, name: { en: "Glass jam jar", vi: "Lọ mứt thuỷ tinh" } },
  { id: "mehrwegPet", kind: "pet3", pfand: 0.15, name: { en: "Thick reusable water bottle (Mehrweg)", vi: "Chai nước nhựa dày tái sử dụng (Mehrweg)" } },
];

export const PFAND_WHY = {
  wine: { en: "Wine bottles have **no Pfand**: they go to the glass bank.", vi: "Chai vang **không có Pfand**: bỏ thùng kính." },
  carton: { en: "Drink cartons have **no Pfand**: yellow bin.", vi: "Hộp giấy đựng đồ uống **không có Pfand**: thùng vàng." },
  crushed: {
    en: "The machine must **read the barcode and shape**. Crushed cans get rejected, so don't squash your Pfand!",
    vi: "Máy cần **đọc mã vạch và hình dạng**. Lon bị bóp méo sẽ bị từ chối, đừng bóp chai lon có Pfand!",
  },
  jar: { en: "Jars aren't drink containers: **no Pfand**. Glass bank.", vi: "Lọ không phải chai đồ uống: **không có Pfand**. Bỏ thùng kính." },
  keptPfand: { en: "That one had Pfand! You just left **{v}** behind.", vi: "Món đó có Pfand! Bạn vừa bỏ lỡ **{v}**." },
};

export class PfandMachine {
  constructor(items = PFAND_ITEMS) {
    this.items = items.map((i) => ({ ...i }));
    this.index = 0;
    this.total = 0;
    this.right = 0;
    this.log = [];
  }
  get current() {
    return this.items[this.index] || null;
  }
  get done() {
    return this.index >= this.items.length;
  }
  get maxTotal() {
    return this.items.reduce((s, i) => s + i.pfand, 0);
  }
  /** Feed the current item into the machine. */
  insert() {
    const it = this.current;
    if (!it) return null;
    const accepted = it.pfand > 0;
    if (accepted) {
      this.total = round2(this.total + it.pfand);
      this.right++;
    }
    this.log.push({ id: it.id, action: "insert", ok: accepted });
    this.index++;
    return { item: it, accepted, ok: accepted };
  }
  /** Keep the current item aside (glass bank / yellow bin). */
  keep() {
    const it = this.current;
    if (!it) return null;
    const ok = it.pfand === 0;
    if (ok) this.right++;
    this.log.push({ id: it.id, action: "keep", ok });
    this.index++;
    return { item: it, ok, lost: ok ? 0 : it.pfand };
  }
  result() {
    return {
      score: Math.round((this.right / this.items.length) * 100),
      passed: true,
      total: this.total,
      max: round2(this.maxTotal),
      mistakes: this.log.filter((l) => !l.ok).map((l) => l.id),
    };
  }
}

const round2 = (v) => Math.round(v * 100) / 100;
export const euro = (v) => `${v.toFixed(2).replace(".", ",")} €`;

// ------------------------------------------------------------------ Checkout race
// The cashier scans fast; scanned items slide to the tray. Clear the OLDEST item in the
// tray into the cart (normal / heavy) or the top basket (fragile) before the tray overflows.

export const GROCERIES = [
  { id: "water", icon: "💧", type: "heavy", name: { en: "Water", vi: "Nước" } },
  { id: "eggs", icon: "🥚", type: "fragile", name: { en: "Eggs", vi: "Trứng" } },
  { id: "potatoes", icon: "🥔", type: "heavy", name: { en: "Potatoes", vi: "Khoai tây" } },
  { id: "bread", icon: "🍞", type: "fragile", name: { en: "Bread", vi: "Bánh mì" } },
  { id: "milk", icon: "🥛", type: "heavy", name: { en: "Milk", vi: "Sữa" } },
  { id: "pasta", icon: "🍝", type: "normal", name: { en: "Pasta", vi: "Mì Ý" } },
  { id: "berries", icon: "🍓", type: "fragile", name: { en: "Strawberries", vi: "Dâu tây" } },
  { id: "cheese", icon: "🧀", type: "normal", name: { en: "Cheese", vi: "Phô mai" } },
  { id: "detergent", icon: "🧴", type: "heavy", name: { en: "Detergent", vi: "Nước giặt" } },
  { id: "apples", icon: "🍎", type: "normal", name: { en: "Apples", vi: "Táo" } },
  { id: "chips", icon: "🥨", type: "fragile", name: { en: "Pretzels", vi: "Bánh quy xoắn" } },
  { id: "rice", icon: "🍚", type: "heavy", name: { en: "Rice 5 kg", vi: "Gạo 5 kg" } },
  { id: "tomatoes", icon: "🍅", type: "fragile", name: { en: "Tomatoes", vi: "Cà chua" } },
  { id: "coffee", icon: "☕", type: "normal", name: { en: "Coffee", vi: "Cà phê" } },
  { id: "beer", icon: "🍺", type: "heavy", name: { en: "Beer crate", vi: "Két bia" } },
  { id: "croissant", icon: "🥐", type: "fragile", name: { en: "Croissants", vi: "Bánh sừng bò" } },
];

export const CHECKOUT_TUNING = {
  startInterval: 1.15, // seconds between scans at the start
  endInterval: 0.5, // …and at the end (German cashier speed!)
  slide: 0.9, // seconds an item slides along the belt to the tray
  trayMax: 5,
};

export class CheckoutRace {
  constructor(list = GROCERIES, tuning = {}) {
    this.T = { ...CHECKOUT_TUNING, ...tuning };
    this.list = list.map((g, i) => ({ ...g, uid: i }));
    this.time = 0;
    this.nextScan = 0.8;
    this.scanned = 0;
    this.belt = []; // { item, t } sliding
    this.tray = []; // waiting to be packed (oldest first)
    this.cart = [];
    this.top = [];
    this.pileups = 0;
    this.crushed = 0;
    this.misplaced = 0;
    this.out = [];
    this.done = false;
  }

  interval() {
    const k = this.list.length > 1 ? this.scanned / (this.list.length - 1) : 1;
    return this.T.startInterval + (this.T.endInterval - this.T.startInterval) * k;
  }

  step(dt) {
    if (this.done) return;
    this.time += dt;
    if (this.scanned < this.list.length && this.time >= this.nextScan) {
      const item = this.list[this.scanned++];
      this.belt.push({ item, t: 0 });
      this.nextScan = this.time + this.interval();
      this.out.push({ type: "scan", item });
    }
    for (const b of this.belt) b.t += dt / this.T.slide;
    while (this.belt.length && this.belt[0].t >= 1) {
      const { item } = this.belt.shift();
      if (this.tray.length >= this.T.trayMax) {
        // Pile-up: the item tumbles onto the pile; you lose time sorting it out.
        this.pileups++;
        this.out.push({ type: "pileup", item });
      }
      this.tray.push(item);
      this.out.push({ type: "tray", item });
    }
    if (this.scanned >= this.list.length && !this.belt.length && !this.tray.length) {
      this.done = true;
      this.out.push({ type: "done" });
    }
  }

  /** Put the oldest tray item into "cart" or "top". */
  place(where) {
    const item = this.tray.shift();
    if (!item) return null;
    let ok = true;
    let reason = "";
    if (where === "cart" && item.type === "fragile") {
      // Something heavy will land on it.
      this.crushed++;
      ok = false;
      reason = "crushed";
    } else if (where === "top" && item.type === "heavy") {
      this.misplaced++;
      ok = false;
      reason = "heavy";
    }
    (where === "top" ? this.top : this.cart).push(item);
    this.out.push({ type: "placed", item, where, ok, reason });
    return { item, ok, reason };
  }

  result() {
    const score = Math.max(0, 100 - this.pileups * 12 - this.crushed * 10 - this.misplaced * 6);
    return { score, passed: true, pileups: this.pileups, crushed: this.crushed, misplaced: this.misplaced, items: this.list.length };
  }
}
