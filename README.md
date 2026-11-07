# FootSimu Premium ⚽

Une interface web responsive en français pour consulter un calendrier de football et simuler les scores de la semaine. Aucun framework ni installation nécessaires.

## Démarrer

Ouvrez `index.html` dans un navigateur. La période initiale est du **7 au 13 novembre 2026** ; les flèches permettent de parcourir les semaines.

### Charger un calendrier

- Configurez une clé API football-data.org via **Source des matchs**, puis cliquez sur **Actualiser les matchs**. La couverture des compétitions et les limites dépendent du compte API.
- Ou ajoutez des rencontres avec **Match manuel**. Les matchs et la clé sont conservés dans le stockage local du navigateur.

### Lire les simulations

Chaque match affiche le score le plus probable et les probabilités 1/N/2. Les paramètres de buts attendus (xG) sont modifiables pour tester des scénarios ; les statistiques de la semaine se recalculent automatiquement.

La simulation utilise une distribution de Poisson simplifiée. Les valeurs initiales ne représentent pas des données officielles sur les équipes. Ce site ne garantit aucun résultat et ne fournit pas de conseils de pari.

## Publication

Pour mettre le site en ligne gratuitement, activez GitHub Pages dans les paramètres du dépôt et choisissez la branche contenant `index.html` comme source.
