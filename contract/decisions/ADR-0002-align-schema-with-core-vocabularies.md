---
status: accepted
date: 2026-11-20
decision-makers: équipe du registre
---
# Les propriétés de la fiche reprennent les noms des prédicats des vocabulaires

## Contexte et problème

La fiche d'une règle décrit un service public. Ce concept existe déjà dans les vocabulaires:
[CPSV-AP](https://semiceu.github.io/CPSV-AP/releases/3.2.0/) décrit un service public (Public
Service), [CPOV](https://semiceu.github.io/Core-Personal-Vocabulary/releases/2.00/) son
organisation compétente, [ELI](http://data.europa.eu/eli/ontology) les textes qui le fondent, et
DCTERMS/SKOS/schema.org les métadonnées générales.
[CPRMV](https://standaarden.open-regels.nl/standards/cprmv/0.4.0/) étend CPSV-AP pour la gestion
publique des règles, le propos d'
[regels.overheid.nl](https://regels.overheid.nl) : un jeu de règles (RuleSet) y formalise un ou
plusieurs textes et est publié à son tour comme une ressource légale. Une fiche décrit au plus
proche ce jeu de règles, ce qui explique les emprunts de CPRMV ci-dessous. L'ADR-0001 posait « le
format de données s'inspire tant que possible des ontologies » mais la version 0.3.0 du schéma
gardait des clés personnelles (`valid_from`, `competent_authority`…) dont le rapprochement n'était
documenté que dans les descriptions, à charge du lecteur de faire la traduction.

Reprendre les prédicats dans les clés rend le rapprochement visible dans la donnée elle-même:
celui qui lit une fiche voit `cprmv:isBasedOn` sans avoir besoin du schéma ou du RDF qui
expliquerait `legal_resources`. Et le jour où l'interopérabilité devient un besoin, l'alignement
est déjà dans les fichiers.

## Décision

Chaque propriété de la fiche (schéma au format JSON Schema 2020-12) reprend le nom de son prédicat
dans les vocabulaires quand un équivalent existe, sinon un nom propre au catalogue. La fiche reste
du JSON Schema simple: pas de JSON-LD, pas de fichier `@context` publié pour l'instant.

| Clé | Prédicat | Vocabulaire | Rapprochement |
|---|---|---|---|
| `@id` | identité du nœud | JSON-LD | L'URI canonique identifie la fiche, comme le sujet d'un triple |
| `dct:identifier` | `dcterms:identifier` | DCTERMS | Identifiant invariant de la règle |
| `schema:version` | `schema:version` | schema.org | Version semver de la règle |
| `dct:title` / `dct:description` | `dcterms:title` / `dcterms:description` | DCTERMS | Objet `{fr, en}` valant language map |
| `cprmv:validFrom` / `cprmv:validUntil` | RuleSet.validFrom / RuleSet.validUntil | CPRMV | Bornes de validité du jeu de règles ; CPRMV exige validFrom (1..1), la fiche admet qu'il soit inconnue |
| `dct:subject` | `dcterms:subject` | DCTERMS | Tags thématiques, chaînes libres plutôt que `skos:Concept` |
| `dct:source` | `dcterms:source` | DCTERMS | Dépôt source de la règle |
| `dct:created` / `dct:modified` | `dcterms:created` / `dcterms:modified` | DCTERMS | Dates de la fiche |
| `cv:hasCompetentAuthority` | `cv:hasCompetentAuthority` | CPSV-AP | Sous-clés: `@id` et `skos:prefLabel` (nom d'une organisation selon CPOV) |
| `cv:thematicArea` | `cv:thematicArea` | CPSV-AP | Domaine de politique publique |
| `cprmv:method` | RuleSet.method (vers un RuleMethod) | CPRMV | Méthode de codification : le moteur de calcul (CPRMV compte OpenFisca parmi les RuleMethod) ; la fiche opte pour une énumération maison à la place du RuleMethod identifié |
| `cprmv:isBasedOn` | RuleSet.isBasedOn (≡ `eli:based_on`) | CPRMV | Textes dont le jeu de règles est la formalisation : CPRMV préfère cette relation à l'« implements » de CPSV-AP. Chaque texte: `eli:title` (ELI) et `schema:url` (adresse où le lire) |
| `source_commit`, `input_schema`, `output_schema`, `sample_input`, `entrypoint`, `source_openness` | aucun équivalent | - | Noms propres au catalogue, l'alignement se fera le jour où un vocabulaire les décrit |

### Limites assumées du rapprochement

- **JSON Schema n'est pas du RDF.** Sans `@context` ni JSON-LD, aucun processeur ne résout
  `cv:hasCompetentAuthority` en `http://data.europa.eu/m8g/hasCompetentAuthority`: le trait d'union
  des vocabulaires n'a ici qu'une valeur documentaire, pour l'humain qui lit la donnée. La sémantique
  machine reste à construire (voir les options).
- **ELI distingue trois niveaux** (`eli:LegalResource`, l'œuvre juridique; `eli:LegalExpression`,
  une version à une date, dans une langue; `eli:Format`, le fichier). La fiche les aplatit:
  `eli:title` est formellement du niveau expression et `schema:url` conduit à une expression ou un
  format. Fidéliser les trois niveaux exigerait un objet imbriqué lourd à saisir à la main.
- **CPRMV est un premier projet public de travail** (0.4.0, publié par le ministère néerlandais de
  l'Intérieur en février 2026, modifiable ou remplaçable). Les clés empruntées (`cprmv:validFrom`,
  `cprmv:validUntil`, `cprmv:method`, `cprmv:isBasedOn`) suivront les évolutions d'une
  standardisation encore en cours ; elles n'ont pas la stabilité de DCTERMS ou d'ELI.
- **Les vocabulaires contrôlés sont approximés en chaînes.** `cv:thematicArea` attend un
  `skos:Concept` identifié, la fiche donne une valeur d'énumération maison (`solidarity`,
  `taxation`…). De même `dct:subject` donne des tags libres, pas des URIs de concepts, et
  `cprmv:method` donne un moteur de calcul à la place du RuleMethod identifié de CPRMV.
- **Six propriétés restent hors vocabulaires** (`source_commit`, `input_schema`, `output_schema`,
  `sample_input`, `entrypoint`, `source_openness`): aucun prédicat standard ne décrit un
  commit épinglé, le schéma d'entrées/sorties d'un algorithme ni l'ouverture du code. `entrypoint`
  est proche d'une méthode d'exécution de CPRMV (ExecutionMethod), mais CPRMV n'identifie que des
  méthodes reconnues, pas leurs paramètres opérationnels (type, cible, artefact). Leur donner un
  faux préfixe mentirait; elles attendent un éventuel vocabulaire du registre.
- **La contrainte entre deux valeurs d'une même fiche** (`sample_input` doit valider contre
  `input_schema`) ne peut pas s'exprimer dans le schéma: elle vit dans la tâche
  `contract:validate:samples` de la chaîne de validation.

### Conséquences

- Positive, parce que le rapprochement avec les vocabulaires est visible dans les fiches, pas
  seulement dans la documentation du schéma
- Positive, parce que la voie vers un futur export sémantique (JSON-LD, plugin d'export) est déjà
  tracée: un `@context` donnerait aux clés actuelles leur résolution, le format de saisie ne
  changera pas
- Négative, parce que les clés contenant `:` imposent l'accès par crochet en TypeScript
  (`record['cv:thematicArea']`) et le quoting de toutes les clés des littéraux (règle ESLint
  quote-props)
- Négative, parce qu'un lecteur qui ne connaît pas les vocabulaires voit des clés plus opaques que
  `valid_from` ou `thematic_area`

## Options considérées

- Garder des clés personnelles et documenter le prédicat dans la description de chaque propriété.
  C'était l'état de la version 0.3.0: le rapprochement existe mais reste invisible dans la donnée.
- Passer les fiches en JSON-LD avec un `@context` publié. Rejeté pour l'instant: la validation
  SHACL et les objets complexes sont un besoin encore lointain (déjà motivé à l'ADR-0001), et la
  rédaction d'un fichier `@context` n'est pas nécessaire tant qu'aucune machine ne consomme la
  fiche comme du RDF. Le format actuel fait que cette option reste ouverte sans réécriture.
- Renommer aussi les propriétés sans équivalent avec un préfixe maison (`regles:entrypoint`).
  Rejeté: un préfixe qui ne résout nulle part ajoute le bruit d'un espace de noms sans la garantie
  d'un vocabulaire publié. Elles gardent un nom propre au catalogue, à aligner si un jour un
  vocabulaire les décrit.
