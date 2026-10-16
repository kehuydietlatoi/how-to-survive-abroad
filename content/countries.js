// Country registry for the globe menu. Pure data (no imports) so tests can load it.
// lat/lon = where the pin sits on the globe (a well-known city, not the geometric centre).

export const COUNTRIES = [
  { id: "germany", flag: "🇩🇪", name: { en: "Germany", vi: "Đức" }, lat: 51.0, lon: 10.0, color: "#ffb703" },
  { id: "vietnam", flag: "🇻🇳", name: { en: "Vietnam", vi: "Việt Nam" }, lat: 21.03, lon: 105.85, color: "#ef476f" },
  { id: "japan", flag: "🇯🇵", name: { en: "Japan", vi: "Nhật Bản" }, lat: 35.68, lon: 139.69, color: "#e63946" },
  { id: "korea", flag: "🇰🇷", name: { en: "South Korea", vi: "Hàn Quốc" }, lat: 37.57, lon: 126.98, color: "#4361ee" },
  { id: "thailand", flag: "🇹🇭", name: { en: "Thailand", vi: "Thái Lan" }, lat: 13.75, lon: 100.5, color: "#f72585" },
  { id: "india", flag: "🇮🇳", name: { en: "India", vi: "Ấn Độ" }, lat: 28.61, lon: 77.21, color: "#fb8500" },
  { id: "usa", flag: "🇺🇸", name: { en: "United States", vi: "Hoa Kỳ" }, lat: 39.5, lon: -98.35, color: "#3a86ff" },
  { id: "uk", flag: "🇬🇧", name: { en: "United Kingdom", vi: "Vương quốc Anh" }, lat: 51.51, lon: -0.13, color: "#7b2cbf" },
  { id: "france", flag: "🇫🇷", name: { en: "France", vi: "Pháp" }, lat: 48.86, lon: 2.35, color: "#118ab2" },
  { id: "italy", flag: "🇮🇹", name: { en: "Italy", vi: "Ý" }, lat: 41.9, lon: 12.5, color: "#06d6a0" },
  { id: "netherlands", flag: "🇳🇱", name: { en: "Netherlands", vi: "Hà Lan" }, lat: 52.37, lon: 4.9, color: "#ff8c42" },
  { id: "australia", flag: "🇦🇺", name: { en: "Australia", vi: "Úc" }, lat: -33.87, lon: 151.21, color: "#2ec4b6" },
];

const byId = new Map(COUNTRIES.map((c) => [c.id, c]));

export const getCountry = (id) => byId.get(id);
export const countryName = (id) => byId.get(id)?.name ?? { en: id, vi: id };
