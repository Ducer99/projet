/**
 * 🎨 COLOR UTILITIES
 * Utilitaires pour la gestion des couleurs familiales et dégradés
 */

// Palette de 12 dégradés distincts pour les familles
export const familyGradients = [
  'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)', // Orange chaud (défaut)
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Violet
  'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', // Vert
  'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)', // Rouge-Orange
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', // Teal
  'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)', // Feu
  'linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)', // Bleu-Violet
  'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)', // Rose
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Pêche
  'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', // Lilas
  'linear-gradient(135deg, #96deda 0%, #50c9c3 100%)'  // Cyan
];

// Couleurs solides correspondantes
export const familySolidColors = [
  '#F6D365', // Orange
  '#667eea', // Violet
  '#56ab2f', // Vert
  '#ee0979', // Rouge
  '#11998e', // Teal
  '#fc4a1a', // Feu
  '#4776e6', // Bleu
  '#f857a6', // Rose
  '#a8edea', // Pastel
  '#ffecd2', // Pêche
  '#d299c2', // Lilas
  '#96deda'  // Cyan
];

/**
 * Obtenir le dégradé d'une famille selon son ID
 * @param familyID - ID de la famille
 * @returns Dégradé CSS
 */
export const getFamilyGradient = (familyID: number | null | undefined): string => {
  if (!familyID) return familyGradients[0];
  return familyGradients[familyID % familyGradients.length];
};

/**
 * Obtenir la couleur solide d'une famille selon son ID
 * @param familyID - ID de la famille
 * @returns Couleur hexadécimale
 */
export const getFamilySolidColor = (familyID: number | null | undefined): string => {
  if (!familyID) return familySolidColors[0];
  return familySolidColors[familyID % familySolidColors.length];
};

/**
 * Extraire la couleur solide d'un dégradé CSS
 * @param gradient - Dégradé CSS
 * @returns Couleur hexadécimale
 */
export const extractSolidFromGradient = (gradient: string): string => {
  const match = gradient.match(/#([0-9A-Fa-f]{6})/);
  return match ? match[0] : '#F6D365';
};

/**
 * Obtenir la couleur de genre (homme/femme)
 * @param sex - 'M' ou 'F'
 * @returns Couleur hexadécimale
 */
export const getGenderColor = (sex: 'M' | 'F' | null | undefined): string => {
  if (sex === 'M') return '#3B82F6'; // Bleu
  if (sex === 'F') return '#EC4899'; // Rose
  return '#9CA3AF'; // Gris par défaut
};

/**
 * Obtenir la couleur de statut (vivant/décédé)
 * @param alive - true si vivant, false si décédé
 * @returns Couleur hexadécimale
 */
export const getStatusColor = (alive: boolean): string => {
  return alive ? '#10B981' : '#9CA3AF'; // Vert ou Gris
};

/**
 * Générer une couleur aléatoire pour les visualisations
 * @returns Couleur hexadécimale
 */
export const getRandomColor = (): string => {
  const colors = familySolidColors;
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Assombrir une couleur hexadécimale
 * @param color - Couleur hexadécimale (#RRGGBB)
 * @param amount - Montant d'assombrissement (0-1)
 * @returns Couleur hexadécimale assombrie
 */
export const darkenColor = (color: string, amount: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) - amount * 255));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) - amount * 255));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) - amount * 255));
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Éclaircir une couleur hexadécimale
 * @param color - Couleur hexadécimale (#RRGGBB)
 * @param amount - Montant d'éclaircissement (0-1)
 * @returns Couleur hexadécimale éclaircie
 */
export const lightenColor = (color: string, amount: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount * 255));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount * 255));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount * 255));
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
