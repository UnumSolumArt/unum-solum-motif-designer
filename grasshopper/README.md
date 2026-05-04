# Grasshopper definitions

Définitions Grasshopper consommées par le Motif Designer via Rhino Compute.

## `test1.gh` — Jalon 1

Définition minimale qui sert à valider la chaîne de transport bout-en-bout
(navigateur → Function Netlify `/api/solve` → Rhino Compute → Grasshopper).

- **Input** : un paramètre numérique (le premier input exposé est utilisé par
  le bouton « Test » de l'interface).
- **Output** : la valeur d'entrée doublée (`input × 2`).
- **Côté code** : référencé par son nom de fichier `test1.gh` dans
  `src/compute/client.ts` (constante `TEST_DEFINITION`). Le fichier doit être
  accessible par Rhino Compute selon sa configuration (chemin absolu ou
  relatif au dossier de définitions Compute, selon le mode de résolution choisi
  côté serveur).

## Définitions à venir

- `unum_solum_motif.gh` — définition principale V1 (jalons J2+), avec
  paramètres exposés via le plugin Selva.

## Convention

Les fichiers `.gh` sont versionnés en binaire (pas de diff lisible). Documenter
ici toute modification structurelle (ajout/suppression d'inputs, renommage,
changement d'unité…).
