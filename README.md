# Unum Solum — Motif Designer

Interface web de calibration et génération de motifs singularisés, avec preview
3D et certification blockchain (staging). Version 1 démo.

Stack : Vite + React 18 + TypeScript · `@selvajs/compute` (Rhino Compute) ·
Netlify Functions · Three.js (J3+) · Crossmint staging (J6+).

## Jalon courant

**J1 — Squelette technique**. Valide la chaîne navigateur → Function Netlify
`/api/solve` → Rhino Compute → Grasshopper, via une définition de test
`grasshopper/test1.gh` qui double son input.

## Setup local

### Prérequis

- Node.js ≥ 20
- Rhino Compute lancé en local sur le port 6500
  (`C:\APP_US\compute.rhino3d` sur la machine de dev). La définition
  `grasshopper/test1.gh` doit être accessible par Compute.
- Netlify CLI (`npm i -g netlify-cli`) — utilisé par `npm run dev`.

### Installation

```bash
npm install
cp .env.example .env
# Éditer .env si Rhino Compute requiert une clé API.
```

### Lancement

```bash
npm run dev
```

Ouvre `http://localhost:8888`. Le serveur Vite tourne sur 5173, mais c'est
`netlify dev` qui orchestre Vite + Functions sur 8888 et applique les redirects
de `netlify.toml`. Cliquer sur **Test** : la valeur d'entrée doit revenir
doublée.

### Scripts

| Commande            | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | `netlify dev` (Vite + Functions, redirects, env)    |
| `npm run build`     | `tsc -b && vite build`                              |
| `npm run preview`   | Preview du bundle de prod                           |
| `npm run lint`      | ESLint avec `--max-warnings=0`                      |
| `npm run typecheck` | `tsc --noEmit`                                      |

## Déploiement

Le repo est lié à un site Netlify. Tout push sur `main` déclenche un build et
un déploiement automatique.

### Variables d'environnement (Netlify dashboard)

| Variable             | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `RHINO_COMPUTE_URL`  | URL publique de Rhino Compute (Cloudflare Tunnel ou IP VPS) |
| `RHINO_COMPUTE_KEY`  | Clé API Rhino Compute (header `RhinoComputeKey`)     |

Tant que le tunnel Cloudflare n'est pas monté, le bouton Test ne fonctionne
**pas** sur l'environnement Netlify de prod (Netlify ne peut pas joindre
`localhost:5000`). La validation J1 se fait en local via `npm run dev`.

## Structure du projet

```
unum-solum-motif-designer/
├── grasshopper/
│   ├── test1.gh          # définition de test J1 (input × 2)
│   └── README.md
├── netlify/
│   └── functions/
│       └── solve.ts      # proxy HTTP vers Rhino Compute
├── src/
│   ├── App.tsx           # page d'accueil + bouton Test
│   ├── main.tsx
│   ├── styles.css
│   └── compute/
│       ├── client.ts     # GrasshopperClient + solveTest()
│       └── types.ts
├── index.html
├── netlify.toml
├── package.json
├── tsconfig*.json
├── vite.config.ts
└── .env.example
```

Les dossiers `src/three/`, `src/crossmint/`, `src/export/`, `src/store/`,
`src/ui/` seront introduits aux jalons concernés (J2 → J7) selon le CDC §6.2.

## Roadmap des jalons

| Jalon | Tag   | Livrable principal                                       |
| ----- | ----- | -------------------------------------------------------- |
| J1    | v0.1  | Chaîne de transport validée (bouton Test)                |
| J2    | v0.2  | Panneau paramètres dynamique + preview 2D temps réel     |
| J3    | v0.3  | Preview 3D Three.js avec GLB de référence                |
| J4    | v0.4  | Export ZIP technique (SVG, JSON descripteur, etc.)       |
| J5    | v0.5  | Export GLB de la pièce gravée                            |
| J6    | v0.6  | Certificat blockchain Crossmint staging                  |
| J7    | v0.7  | Polish démo, mode présentation, charte visuelle          |

Référence détaillée : CDC V2 (mai 2026), section 8.

## Licence et confidentialité

Repository privé — usage interne Unum Solum.
