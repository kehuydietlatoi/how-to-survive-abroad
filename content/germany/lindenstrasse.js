// Shared "Lindenstraße" home street (your flat at no. 12), reused by several German
// scenarios. Built around x = x0: road along x at z ≈ 0.5, pavement z -3.5..-9.5,
// gardens and houses to the north (-z). Returns { items, walls, spawns, interactables }.

export function lindenstrasse(x0 = 0, { bins = true, glass = false } = {}) {
  const X = (x) => x0 + x;
  const items = [
    { prop: "slab", args: [50, 6, 0.16, "#dcd6cc"], p: [X(0), -6.5] },
    { prop: "slab", args: [50, 10, 0.05, "#9fd38a"], p: [X(0), -14.2] },
    { model: "suburban/building-type-c", p: [X(-12), -14], tint: "#ffe3c7" },
    { model: "suburban/building-type-a", p: [X(0), -14], tint: "#fff3d6", id: "home" },
    { model: "suburban/building-type-f", p: [X(12), -14], tint: "#e3f0ff" },
    { model: "suburban/fence-1x4", p: [X(-6), -9.8] },
    { model: "suburban/fence-1x4", p: [X(6), -9.8] },
    { model: "suburban/tree-large", p: [X(-17), -9.8] },
    { model: "suburban/tree-small", p: [X(17), -9.8] },
    { prop: "busStopSign", args: ["34", "Lindenstraße"], p: [X(-8), -3.9] },
    { prop: "signBoard", args: [["Lindenstraße 12"], { w: 1.6, h: 0.4, color: "#1f5fbf", fg: "#fff" }], p: [X(1.4), -9.6], y: 1.4, collide: false },
    { npc: "character-female-d", p: [X(-1.6), -8.2], r: 160, id: "landlady" },
  ];
  for (let x = -30; x <= 30; x += 10) items.push({ model: "roads/road-straight", p: [X(x), 0.5] });
  if (bins) {
    // Bin corner beside the house: general waste, packaging, paper, organic.
    items.push(
      { prop: "wheelieBin", args: ["#3d4451", "Restmüll"], p: [X(5.2), -8.3] },
      { prop: "wheelieBin", args: ["#f6c945", "Gelbe Tonne"], p: [X(6.3), -8.3] },
      { prop: "wheelieBin", args: ["#2f6db5", "Papier"], p: [X(7.4), -8.3] },
      { prop: "wheelieBin", args: ["#8b5a2b", "Bio"], p: [X(8.5), -8.3] }
    );
  }
  if (glass) {
    items.push(
      { prop: "glassContainer", args: ["#e5e7eb", "Weißglas"], p: [X(16), -7.6] },
      { prop: "glassContainer", args: ["#2f9e44", "Grünglas"], p: [X(17.8), -7.6] },
      { prop: "glassContainer", args: ["#8b5a2b", "Braunglas"], p: [X(19.6), -7.6] },
      {
        prop: "signPost",
        args: [[{ text: "Einwurfzeiten", size: 60 }, { text: "Mo–Sa 7–20 Uhr", size: 70 }], { height: 2.4, w: 1.6, h: 0.8, color: "#ffffff", fg: "#c1121f" }],
        p: [X(14.3), -7.6],
        collide: false,
      }
    );
  }
  const walls = [
    [X(-25), -3.6, X(25), 12], // road side
    [X(-25), -20, X(-24.5), -3],
    [X(24.5), -20, X(25), -3],
    [X(-25), -20, X(25), -19.5],
  ];
  return {
    items,
    walls,
    spawns: { home: [X(0), -7.6, 0] },
    landlady: { p: [X(-1.6), -8.2] },
  };
}
