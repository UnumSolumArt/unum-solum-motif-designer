/**
 * Types compute pour le Jalon 1.
 * Les types complets MotifParameters / MotifResult / MotifDescriptor
 * arriveront aux jalons J2+.
 */

export interface TestSolveResult {
  /** Valeur retournée par la définition Grasshopper de test (input doublé). */
  doubled: number;
  /** Valeur d'entrée envoyée, pour confirmation visuelle. */
  input: number;
}
