// Shared "Lindenstraße" home street (your flat at no. 12), reused by several German
// scenarios. Built around x = x0: road along x at z ≈ 0.5, pavement z -3.5..-9.5,
// gardens and houses to the north (-z). Returns { items, walls, spawns, landlady, traffic }.
// variant: suburban (default) keeps gardens; altbau adds a continuous shop-house row.

export function lindenstrasse(x0 = 0, { bins = true, glass = false, variant = "suburban" } = {}) {
  if (!["suburban", "altbau"].includes(variant)) throw new Error(`Unknown Lindenstraße variant: ${variant}`);
  const X = (x) => x0 + x;
  const items = [
    { prop: "slab", args: [50, 6, 0.16, "#dcd6cc"], p: [X(0), -6.5] },
    { prop: "slab", args: [50, 10, 0.05, variant === "suburban" ? "#9fd38a" : "#bcbab4"], p: [X(0), -14.2] },
    { prop: "busStopSign", args: ["34", "Lindenstraße"], p: [X(-8), -3.9] },
    { prop: "signBoard", args: [["Lindenstraße 12"], { w: 1.6, h: 0.4, color: "#1f5fbf", fg: "#fff" }], p: [X(1.4), -9.6], y: 1.4, collide: false },
    { npc: "character-female-d", p: [X(-1.6), -8.2], r: 160, id: "landlady" },
  ];
  if (variant === "suburban") {
    items.push(
      { model: "suburban/building-type-c", p: [X(-12), -14], tint: "#ffe3c7" },
      { model: "suburban/building-type-a", p: [X(0), -14], tint: "#fff3d6", id: "home" },
      { model: "suburban/building-type-f", p: [X(12), -14], tint: "#e3f0ff" },
      { model: "suburban/fence-1x4", p: [X(-6), -9.8] },
      { model: "suburban/fence-1x4", p: [X(6), -9.8] },
      { model: "suburban/tree-large", p: [X(-17), -9.8] },
      { model: "suburban/tree-small", p: [X(17), -9.8] },
      { prop: "wall", args: [5, 0.7, 0.8, "#5d8d4e"], p: [X(-6), -10.5] },
      { prop: "wall", args: [5, 0.7, 0.8, "#6d9e53"], p: [X(6), -10.5] },
      { prop: "plant", p: [X(-3.4), -10.7] },
      { prop: "plant", p: [X(3.4), -10.7] },
    );
  } else {
    for (let i = -2; i <= 2; i++) items.push({
      prop: "altbauFacade", args: [i % 2 ? 5 : 4, i === -1 ? "spaeti" : i === 2 ? "baeckerei" : "", i + 2, 8],
      p: [X(i * 8.2), -14], ...(i === 0 ? { id: "home" } : {}),
    });
    items.push(
      { prop: "litfassSaeule", args: [2], p: [X(-5.3), -7.8] },
      { prop: "bikeRack", args: [5], p: [X(-14), -8.1], y: 0.16 },
      { prop: "streetSignDE", args: ["Lindenstraße", "12"], p: [X(-2.8), -9.1], y: 0.16 },
    );
  }

  // Four pavement loops, clear of the doorway, bins and glass-bank approaches.
  const walkers = [
    [[-18, -4.8], [-3.8, -4.8]], [[-9, -6.4], [-3.8, -6.4]],
    [[4, -4.8], [14, -4.8]], [[11, -6.1], [22, -6.1]],
  ];
  walkers.forEach((path, i) => items.push({
    npc: ["character-male-b", "character-female-c", "character-female-a", "character-male-e"][i],
    id: `streetWalker${i}`, path: path.map(([x, z]) => [X(x), z]),
    speed: 0.85 + i * 0.08, pause: [0.3, 0.8], loop: "pingpong", collide: false,
  }));
  items.push({ prop: "bikeLaneMarking", args: [66], p: [X(0), -0.25], r: 90, y: 0.05 });

  const cycleLane = { from: [X(-36), -0.25], to: [X(36), -0.25], speed: [2.6, 2.6], spacing: 14, count: 4 };
  const traffic = [
    { from: [X(-36), 2.7], to: [X(36), 2.7], speed: [4, 5.5], spacing: 18, count: 3,
      vehicles: [{ prop: "germanCar", args: ["#426a91"] }, { prop: "parcelVan" }, { prop: "germanCar", args: ["#9a5550"] }] },
    { ...cycleLane, vehicles: [{ prop: "cityBike", args: ["#335c70", 1], y: 0.05 }, { prop: "cityBike", args: ["#8a545e", 2], y: 0.05 }] },
    // Fixed-speed companion lane seats animated riders on the bikes. Set the travel heading
    // before bounds are measured; keep the cycle track beyond the pavement yield envelope.
    { ...cycleLane, from: [X(-36.2), -0.25], to: [X(35.8), -0.25], vehicles: [
      { npc: "character-male-b", anim: "drive", r: 90, y: 0.35 },
      { npc: "character-female-c", anim: "drive", r: 90, y: 0.35 },
    ] },
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
    traffic,
    spawns: { home: [X(0), -7.6, 0] },
    landlady: { p: [X(-1.6), -8.2] },
  };
}
