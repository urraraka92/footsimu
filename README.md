# FootSimu Premium ⚽

Application web statique en français pour consulter des matchs et simuler leurs scores. Le code est séparé en fichiers HTML, CSS et JavaScript, sans framework ni installation.

## Fichiers

- `index.html` — structure de la page et chargement des ressources.
- `style.css` — styles responsives et thème premium.
- `script.js` — calendrier, ajout/suppression de matchs, stockage local, connexion API et modèle de prédiction.

## Utiliser le site

Ouvrez `index.html` dans un navigateur. La période affichée par défaut est du **7 au 13 novembre 2026**. Les flèches permettent de parcourir les semaines et les champs de date de sélectionner une autre période.

### Ajouter des rencontres

Cliquez sur **Match manuel** et saisissez les équipes ainsi que la date et l'heure. Les rencontres ajoutées sont enregistrées dans le stockage local du navigateur.

### Charger un calendrier automatiquement

1. Créez une clé API auprès de [football-data.org](https://www.football-data.org/client/register).
2. Ouvrez **Source des matchs**, entrez la clé puis cliquez sur **Enregistrer**.
3. Cliquez sur **Actualiser les matchs**.

La clé API est conservée uniquement dans le stockage local du navigateur. Les compétitions accessibles et les limites de requêtes dépendent du fournisseur et de votre offre. Pour un site public, ne partagez pas une clé personnelle intégrée côté navigateur ; utilisez plutôt un serveur intermédiaire sécurisé.

## Modèle de score

Le site utilise une distribution de Poisson simplifiée sur les buts attendus (xG) domicile et extérieur. Le score affiché est le scénario individuel le plus probable ; les probabilités 1/N/2 résultent de l'addition des scénarios simulés. Les valeurs initiales sont des hypothèses neutres, et non des statistiques officielles sur les équipes. Vous pouvez ajuster les xG pour explorer d'autres scénarios.

Les prédictions sont indicatives : elles ne garantissent aucun résultat réel et ne constituent pas des conseils de pari.

## Publication avec GitHub Pages

Dans les paramètres du dépôt GitHub, activez **Pages** et sélectionnez la branche contenant ces fichiers comme source. Publiez `index.html`, `style.css` et `script.js` ensemble au même niveau dans le dépôt.
