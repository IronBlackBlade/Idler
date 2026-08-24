Idler RPG — Excel -> generator v4

Struktura projektu:
- Excel: data/recipes/locations/crafting_recipes.xlsx
- Items: js/data/items.js
- Lokacje: js/data/locations/
- Generator: tools/generate_recipes.py + drop_rules.py

Uruchom w katalogu Idler:
python tools\generate_recipes.py

`RecipeCosts` zawiera koszty/EXP/czas. Wpisy, dla ktorych nie ma jeszcze danych
z obecnego recipes.js, sa oznaczone `DO UZUPEŁNIENIA`.

`GeneratorConfig` zawiera tylko te bazowe itemy, których nie mozna bezpiecznie
wywnioskowac z aktualnego items.js (np. "pancerz kupca lvl 20"). Wpisz prawdziwe
itemId z gry zamiast zgadywac.

Material z lokacji X jest zamieniany na konkretny drop potwora, a boss lokacji X
na drop bossa.

Wynik:
js/generated/recipes.generated.js
js/generated/items.generated.js
js/generated/generation-report.json


Stała nazwa Excela:
data/recipes/locations/crafting_recipes.xlsx
Generator korzysta z tej nazwy automatycznie, więc nie trzeba zmieniać Pythona przy kolejnych wersjach Excela.
