/**
 * Utilitaire pour gérer le pluriel et le genre en français
 */

/**
 * Pluralise un mot français en fonction du nombre
 * @param count - Le nombre d'éléments
 * @param singular - La forme singulière
 * @param plural - La forme plurielle (optionnelle, ajoute 's' par défaut)
 * @returns Le mot au singulier ou au pluriel
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count <= 1) return singular;
  return plural || `${singular}s`;
}

/**
 * Retourne le nombre suivi du mot au pluriel correct
 * @param count - Le nombre d'éléments
 * @param singular - La forme singulière
 * @param plural - La forme plurielle (optionnelle)
 * @returns Ex: "1 personne" ou "5 personnes"
 */
export function pluralizeWithCount(count: number, singular: string, plural?: string): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}

/**
 * Accorde l'article défini avec le nombre
 * @param count - Le nombre d'éléments
 * @param singular - Article singulier (ex: "le", "la", "l'")
 * @param plural - Article pluriel (ex: "les")
 * @returns L'article approprié
 */
export function articleDefini(count: number, singular: string, plural: string = 'les'): string {
  return count <= 1 ? singular : plural;
}

/**
 * Accorde l'article indéfini avec le nombre
 * @param count - Le nombre d'éléments
 * @param singular - Article singulier (ex: "un", "une")
 * @param plural - Article pluriel (ex: "des")
 * @returns L'article approprié
 */
export function articleIndefini(count: number, singular: string, plural: string = 'des'): string {
  return count <= 1 ? singular : plural;
}

/**
 * Accorde un adjectif avec le genre et le nombre
 * @param count - Le nombre d'éléments
 * @param isFeminine - Si le nom est féminin
 * @param masculinSingular - Forme masculine singulière
 * @param femininSingular - Forme féminine singulière (optionnelle, ajoute 'e' par défaut)
 * @param masculinPlural - Forme masculine plurielle (optionnelle)
 * @param femininPlural - Forme féminine plurielle (optionnelle)
 * @returns L'adjectif accordé
 */
export function accordAdjectif(
  count: number,
  isFeminine: boolean,
  masculinSingular: string,
  femininSingular?: string,
  masculinPlural?: string,
  femininPlural?: string
): string {
  if (count <= 1) {
    return isFeminine ? (femininSingular || `${masculinSingular}e`) : masculinSingular;
  } else {
    if (isFeminine) {
      return femininPlural || `${femininSingular || masculinSingular + 'e'}s`;
    } else {
      return masculinPlural || `${masculinSingular}s`;
    }
  }
}

/**
 * Dictionnaire de mots courants avec leurs formes plurielles irrégulières
 */
export const irregularPlurals: Record<string, string> = {
  'personne': 'personnes',
  'membre': 'membres',
  'événement': 'événements',
  'mariage': 'mariages',
  'génération': 'générations',
  'photo': 'photos',
  'famille': 'familles',
  'enfant': 'enfants',
  'parent': 'parents',
  'grand-parent': 'grands-parents',
  'arrière-grand-parent': 'arrière-grands-parents',
  'anniversaire': 'anniversaires',
  'décès': 'décès',
  'naissance': 'naissances',
  'jour': 'jours',
  'mois': 'mois',
  'année': 'années',
  'siècle': 'siècles',
};

/**
 * Utilise le dictionnaire pour pluraliser automatiquement
 * @param count - Le nombre
 * @param word - Le mot à pluraliser
 * @returns Le mot pluralisé
 */
export function smartPluralize(count: number, word: string): string {
  if (count <= 1) return word;
  return irregularPlurals[word.toLowerCase()] || `${word}s`;
}

/**
 * Exemples d'utilisation :
 * 
 * pluralize(1, 'personne') // "personne"
 * pluralize(5, 'personne') // "personnes"
 * 
 * pluralizeWithCount(1, 'membre') // "1 membre"
 * pluralizeWithCount(10, 'membre') // "10 membres"
 * 
 * articleDefini(1, 'la', 'les') // "la"
 * articleDefini(5, 'la', 'les') // "les"
 * 
 * accordAdjectif(1, false, 'nouveau') // "nouveau"
 * accordAdjectif(1, true, 'nouveau') // "nouvelle"
 * accordAdjectif(5, false, 'nouveau') // "nouveaux"
 * accordAdjectif(5, true, 'nouveau') // "nouvelles"
 */
