FINALNY PAKIET GENERATORA CRAFTINGU

Podmień w swoim projekcie:
1. tools/generate_recipes.py
2. tools/drop_rules.py
3. crafting/crafting_recipes.xlsx

Potem w terminalu VS Code, będąc w głównym folderze gry:
python tools\generate_recipes.py

Ten pakiet został lokalnie sprawdzony:
Generated recipes: 98
Generated new item entries: 0
Warnings: 0

Excel zachowuje oryginalne arkusze użytkownika i dodaje uporządkowane arkusze Recipes_* oraz GeneratorConfig.
Bazowe itemy są zapisane jawnie jako Base ItemId, a Gold/EXP/Czas są uzupełnione w tabelach.
