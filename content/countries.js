// Country registry for the globe menu. Pure data (no imports) so tests can load it.
// lat/lon = where the pin sits on the globe (a well-known city, not the geometric centre).

export const COUNTRIES = [
  { id: "germany", flag: "🇩🇪", name: { en: "Germany", vi: "Đức" }, lat: 51.0, lon: 10.0, color: "#ffb703" },
  { id: "vietnam", flag: "🇻🇳", name: { en: "Vietnam", vi: "Việt Nam" }, lat: 21.03, lon: 105.85, color: "#ef476f" },
];

const byId = new Map(COUNTRIES.map((c) => [c.id, c]));

export const getCountry = (id) => byId.get(id);
export const countryName = (id) => byId.get(id)?.name ?? { en: id, vi: id };
