// Product-supplied location catalogue. Preserve the neighborhood labels verbatim.
export type LocationGroup = { name: string; neighborhoods: string[] };
export type LocationArea = {
  name: string;
  kind: "subcity" | "surrounding";
  groups: LocationGroup[];
};
const group = (name: string, entries: string): LocationGroup => ({
  name,
  neighborhoods: entries.split("|"),
});
export const LOCATION_AREAS: LocationArea[] = [
  {
    name: "Bole Subcity",
    kind: "subcity",
    groups: [
      group(
        "Main Bole Corridor",
        "Bole Medhanialem|Bole Brass|Bole Rwanda|Bole Japan|Edna Mall area|Bole Airport|Millennium Hall|Bole Printing|Bole Michael|Bole Homes|Bole Ambassador|Bole Tele",
      ),
      group(
        "Wolo Sefer & Meskel Flower",
        "Wolo Sefer (Bole section)|Meskel Flower|Olympia (border)|Denver|Gazebo Roundabout",
      ),
      group(
        "22 & Atlas Corridor",
        "22 Mazoria|Atlas|Capital Hotel area|Zerihun Building|Golagol|Auraris Hotel area",
      ),
      group(
        "Gerji Corridor",
        "Gerji Mebrat Hail|Gerji Giorgis|Gerji Roba|Unity University|Imperial|Anbesa Garage|Korea Hospital (border)|Civil Service College area",
      ),
      group(
        "Bole Bulbula & Arabsa",
        "Bole Bulbula (93 Mazoria, Church, Condominium)|Bole Arabsa (Condominium)|Bole Lemi (border)",
      ),
    ],
  },
  {
    name: "Yeka Subcity",
    kind: "subcity",
    groups: [
      group(
        "Wesen, Kara & Kotebe Corridor",
        "Wesen Grocery|Kotebe 02|Kotebe Michael|Kotebe Kidane Mihret|Kotebe University|Hana Mariam (Kotebe)|Kara Alo|Kara Market|Yeka Abado|Tafo|Ankorcha|Selam Sefer|Gabriel",
      ),
      group(
        "Megenagna & Lamberet Corridor",
        "Megenagna Square|Zefmesh|Egziabher Ab|Lamberet Bus Station|Shola Market|Signal|Balderas Condominium|Wuha Limat|22 Mazoria (Yeka section)",
      ),
      group(
        "CMC & Ayat Corridor",
        "CMC Michael|Ayat Square (North)|Meri Loqe|Altad|Tsehay Real Estate",
      ),
      group(
        "Kebena & Ferensay Corridor",
        "Kebena Medhanialem|British Embassy (Bel Air)|Ferensay Legasion|Gurara|Ferensay Kela|Bella Condominium|Menelik Hospital|Yeka Michael|Cheshire",
      ),
    ],
  },
  {
    name: "Kirkos Subcity",
    kind: "subcity",
    groups: [
      group(
        "Kazanchis & Meskel Square",
        "Kazanchis (Total, Menaheria, ECA)|Urael|Bambis|Meskel Square|Filwoha|Palace area|Stadium|Leghar",
      ),
      group(
        "Gotera & Lancha Corridor",
        "Gotera Interchange|Gotera Condominium|Lancha|Riche|Toke|Qera (Kirkos section)|Bulgaria Mazoria|Cherkos",
      ),
      group(
        "Mexico & Sarbet Corridor",
        "Mexico Square|Wabi Shebelle|Sarbet (African Union area)|Karl Square|Wolo Sefer (Kirkos section)|Olympia (Kirkos section)",
      ),
    ],
  },
  {
    name: "Arada Subcity",
    kind: "subcity",
    groups: [
      group(
        "Piassa & Churchill",
        "Piassa|Giorgis|Churchill Avenue|Tewodros Square|Degol Square|Somale Tera|Atkilt Tera|Doro Manekiya|Italian Sefer|Gedam Sefer|Eri Bekentu",
      ),
      group(
        "Kilos & Janmeda",
        "4 Kilo|5 Kilo|6 Kilo (Arada section)|Janmeda|Ras Mekonnen Bridge|Semen Mazegaja|Basha Wolde Chilot|Kebena (Arada section)",
      ),
    ],
  },
  {
    name: "Lideta Subcity",
    kind: "subcity",
    groups: [
      group(
        "Mexico & Sengatera",
        "Mexico (Lideta section)|Sengatera|Goma Qoteba|Business College area|Police Hospital|Molamaru",
      ),
      group(
        "Lideta & Tor Hailoch",
        "Lideta Church|Lideta Condominium|Balcha Hospital|Tor Hailoch (Lideta section)|Abinet (Lideta section)|Geja Sefer|Teklehaimanot (border)|African Union (Lideta section)",
      ),
    ],
  },
  {
    name: "Nifas Silk-Lafto Subcity",
    kind: "subcity",
    groups: [
      group(
        "Sar Bet & Mekanisa",
        "Sar Bet (Adams Pavilion, Canadian Embassy)|Bisrate Gabriel|Mekanisa (Abo, Michael, Condominium)|Vatican Embassy|German Square|Qera (Nifas Silk section)|Gofa Sefer (Gofa Gabriel, Gofa Camp)",
      ),
      group(
        "Jemo & Lebu",
        "Jemo 1|Jemo 2|Jemo 3|Lebu Mebrat Hail|Lebu Music House|Lebu Varnero|Lafto (Lafto Mall, Lafto Church)|Haile Garment|Hana Mariam (Lafto)|Mango Sefer|Korea Hospital area",
      ),
    ],
  },
  {
    name: "Kolfe Keranio Subcity",
    kind: "subcity",
    groups: [
      group(
        "Ayer Tena & Betel",
        "Ayer Tena|Zenebework|Alert Hospital|Betel|Tor Hailoch (Kolfe section)|Dutch Embassy|Total (3 Quter Mazoria)|Weyira Sefer|Kara Kore|Repi",
      ),
      group(
        "Kolfe & Asko",
        "Kolfe|Keranio|18 Mazoria|Lukanda|Philipos|Asko (Kolfe section)|Wingate (border)|Atana Tera (border)",
      ),
    ],
  },
  {
    name: "Gullele Subcity",
    kind: "subcity",
    groups: [
      group(
        "Shiro Meda & Entoto",
        "Shiro Meda|Entoto (Maryam, Kidane Mihret, Park)|US Embassy|6 Kilo (Gullele section)|Ferensay (border)|Kechene Medhanialem|Kuskwam",
      ),
      group(
        "Addisu Gebeya & Paster",
        "Addisu Gebeya|Semen Hotel|Rufael|Paster|St. Paul Hospital|Wingate|Shegole|Asko (Gullele section)|Lazarist|Medhanialem School area",
      ),
    ],
  },
  {
    name: "Addis Ketema Subcity",
    kind: "subcity",
    groups: [
      group(
        "Merkato & Surrounding",
        "Merkato|Autobus Tera|Teklehaimanot|Gojam Berenda|Bomb Tera|Dubai Tera|Shama Tera|Chid Tera|Ehil Berenda|Cinema Ras|American Gibi",
      ),
      group(
        "Teklehaimanot & Abinet",
        "Teklehaimanot|Sebategna|Abinet (Addis Ketema section)|Kwas Meda|Mesalemiya|Atana Tera|18 Mazoria (Addis Ketema section)|Kolfe (border)",
      ),
    ],
  },
  {
    name: "Akaky Kaliti Subcity",
    kind: "subcity",
    groups: [
      group(
        "Saris & Kaliti",
        "Saris Abo|Saris Adey Abeba|Saris Hana Mariam|Kaliti Menaheria|Kaliti Customs|Kaliti Gabriel|Worku Sefer|Sheger Building area",
      ),
      group(
        "Akaky, Tulu Dimtu & Koye",
        "Akaky Town (01, Cherqa Cherq)|Gelan Condominium|Tulu Dimtu|Kilinto|Koye Feche (Akaky border)|Bole Lemi 2 (Industrial Village)|Dukem Gate|Abba Samuel",
      ),
    ],
  },
  {
    name: "Lemi Kura Subcity",
    kind: "subcity",
    groups: [
      group(
        "Ayat & Summit",
        "Ayat (Zone 2, Zone 3, Zone 5, 49 Mazoria)|Summit (Condominium, 72, Summit Giorgis, Moha Soft Drinks)|Figa",
      ),
      group(
        "CMC, Meri & Arabsa",
        "CMC (South section)|Meri|Goro (Lemi Kura section)|Bole Arabsa (Condominium)|Yeka Abado (Lemi Kura section)|Bole Lemi Industrial Park|Chefe|Anfo",
      ),
    ],
  },
  {
    name: "Koye Feche",
    kind: "surrounding",
    groups: [
      group(
        "Koye Feche",
        "Koye Feche Condominium blocks|Koye Feche town center|near Kilinto|Industrial Park area",
      ),
    ],
  },
  {
    name: "Sebeta",
    kind: "surrounding",
    groups: [
      group(
        "Sebeta",
        "Sebeta town center|Alemgena|Furi|Welete|Dima|Hawas|Lafto border areas",
      ),
    ],
  },
  {
    name: "Legetafo-Legedadi",
    kind: "surrounding",
    groups: [
      group(
        "Legetafo-Legedadi",
        "Legetafo town|Legedadi|Ropack|CCD Homes (Country Club Developers)|Dalol|Ayat border real estates",
      ),
    ],
  },
  {
    name: "Sululta",
    kind: "surrounding",
    groups: [
      group(
        "Sululta",
        "Sululta town center|Chancho|Nono|Woserbi|Gefersa (Sululta section)",
      ),
    ],
  },
  {
    name: "Gelan & Dukem",
    kind: "surrounding",
    groups: [
      group(
        "Gelan & Dukem",
        "Gelan town|Dukem town|Eastern Industrial Zone|Kaliti outer border",
      ),
    ],
  },
  {
    name: "Bishoftu (Debre Zeit)",
    kind: "surrounding",
    groups: [
      group(
        "Bishoftu (Debre Zeit)",
        "Bishoftu town center|Babogaya Lake area|Kuriftu|Qajima|Chelelaka|Resorts & Villas area",
      ),
    ],
  },
];
export function getLocationArea(area: string) {
  return LOCATION_AREAS.find((a) => a.name === area);
}
export function neighborhoodBelongsTo(area: string, neighborhood: string) {
  return !!getLocationArea(area)?.groups.some((g) =>
    g.neighborhoods.includes(neighborhood),
  );
}
export function validateListingLocation(area: string, neighborhood: string) {
  const selected = getLocationArea(area);
  if (!selected || !neighborhoodBelongsTo(area, neighborhood))
    throw new Error(
      "Select a valid sub-city/area and a neighborhood belonging to it.",
    );
  return {
    area,
    neighborhood,
    city: selected.kind === "subcity" ? "Addis Ababa" : selected.name,
  };
}
// Old broad locations remain readable and searchable, without inventing a precise sefer.
export const LEGACY_AREA_MAP: Record<string, string> = {
  Bole: "Bole Subcity",
  Gerji: "Bole Subcity",
  Kazanchis: "Kirkos Subcity",
  Gotera: "Kirkos Subcity",
  Mexico: "Kirkos Subcity",
  Kirkos: "Kirkos Subcity",
  Piazza: "Arada Subcity",
  "Arat Kilo": "Arada Subcity",
  "Sidist Kilo": "Arada Subcity",
  Lideta: "Lideta Subcity",
  Yeka: "Yeka Subcity",
  Megenagna: "Yeka Subcity",
  "Nifas Silk": "Nifas Silk-Lafto Subcity",
  Jemo: "Nifas Silk-Lafto Subcity",
  Gullele: "Gullele Subcity",
  "Addis Ketema": "Addis Ketema Subcity",
  "Kolfe Keranio": "Kolfe Keranio Subcity",
  "Akaki Kality": "Akaky Kaliti Subcity",
  Sululta: "Sululta",
  Sebeta: "Sebeta",
  "Koye Feche": "Koye Feche",
  Gelan: "Gelan & Dukem",
  Legetafo: "Legetafo-Legedadi",
};
