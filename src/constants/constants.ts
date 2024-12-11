export const CONSTANT_ROOM_CAPACITIES = [
  { value: 5, label: "5+" },
  { value: 10, label: "10+" },
  { value: 15, label: "15+" },
  { value: 20, label: "20+" },
  { value: 25, label: "25+" },
];

export const CONSTANT_D_MMM_YYYY = "d MMM yyyy";

export const CONSTANT_DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export const CONSTANT_TIMEZONE_UTC = "UTC";
export const CONSTANT_TIMEZONE_PARIS = "Europe/Paris";

export const CONSTANT_DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 105, 120];

export const CONSTANT_FRENCH_HOLIDAYS = (year: number): string[] => [
  `${year}-01-01`, // Jour de l'An
  `${year}-05-01`, // Fête du Travail
  `${year}-05-08`, // Victoire 1945
  `${year}-07-14`, // Fête Nationale
  `${year}-08-15`, // Assomption
  `${year}-11-01`, // Toussaint
  `${year}-11-11`, // Armistice 1918
  `${year}-12-25`, // Noël
  //calculer Lundi de Pâques
  //calculer Ascension
  //calculer Lundi de Pentecôte
];
