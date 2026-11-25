# Tests

`mise run check` lance, en local comme en CI, le lint, la vérification des types, les tests unitaires et la génération des deux sites. La génération échoue sur une fiche invalide ou en double et sur une route mal déclarée : elle vérifie le parcours d'une fiche de `data/` jusqu'à ses pages.

On écrit un test unitaire pour une logique qui a des branches, comme la validation des fiches dans `core`, les presenters de `web/catalogue/` ou les refus de `web/modules/view-routes.ts`. Le test vérifie ce qu'une personne observe, par exemple un message d'erreur et le fichier qu'il nomme, et il échoue quand on retire le code qu'il vérifie.

Les tests de `engines/catala` exécutent les exemples de `engines/catala/tests/examples.json`. Chaque exemple désigne le dossier d'un dépôt à un commit : pytest télécharge chaque exemple au premier lancement dans un clone ou un worktree neuf du dépôt et à chaque lancement de la CI, puis le garde dans son cache (`.pytest_cache/`). Après un changement de `download`, dans `engines/catala/tests/examples.py`, on lance `uv run pytest --cache-clear`.
