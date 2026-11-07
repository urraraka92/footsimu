# FootSimu ⚽

Petit site web statique en français pour consulter des matchs de football et calculer un score prévisionnel.

## Utilisation

1. Ouvrez `index.html` dans un navigateur ou publiez le dépôt avec GitHub Pages.
2. La période affichée par défaut est du **7 au 13 novembre 2026**. Utilisez les flèches ou les dates pour changer de semaine.
3. Ajoutez des rencontres manuellement avec **Ajouter un match**, ou configurez une clé `football-data.org` via **API des matchs** puis cliquez sur **Charger les matchs**.
4. Ajustez les buts attendus (xG) pour chaque équipe : les scores et probabilités 1/N/2 se recalculent automatiquement.

Les matchs et la clé API sont conservés dans le stockage local du navigateur. Les rencontres de l’API dépendent des compétitions auxquelles votre clé donne accès. Sans clé, le site fonctionne aussi en mode manuel.

## Modèle de prédiction

Le site utilise une distribution de Poisson simplifiée sur les buts attendus à domicile et à l’extérieur. Le score affiché est la combinaison la plus probable dans une grille de 0 à 8 buts. Les valeurs initiales (1,45 et 1,12) sont des hypothèses neutres, pas une analyse de forme ou une garantie. Modifiez-les selon vos propres données pour une estimation plus pertinente.

Les pronostics sont indicatifs uniquement et ne constituent pas des résultats réels ni des conseils de pari.

## Fichiers

- `index.html` : application complète (HTML, styles et JavaScript), sans installation ni dépendances externes.
