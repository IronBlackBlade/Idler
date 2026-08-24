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


V6: generator czyta bezpośrednio arkusz 'Crafting Recipes' z osobnymi kolumnami ilości. Stała nazwa Excela: data/recipes/locations/crafting_recipes.xlsx.


V7: obsługa aktualnego items.js + GeneratorConfig dla bazowych pancerzy kupca oraz poprawione rozpoznawanie kategorii broni.


V8:
- kategoria craftingu jest ustalana przede wszystkim z aktualnego items.js;
- GeneratorConfig mapuje bazowe przedmioty kupca bez placeholderów;
- nierozwiązany bazowy item generuje jedno ostrzeżenie, ale nie trafia jako fikcyjny materiał;
- stała nazwa Excela: data/recipes/locations/crafting_recipes.xlsx.


V9:
- kategoria receptury bierze dane bezpośrednio z aktualnego items.js;
- bazowy item jest dodawany tylko przez resolve_tier_bases(), więc nie dubluje się;
- poprzedni tier dla pancerza T4/T5 jest rozwiązywany po kategorii i tierze;
- GeneratorConfig nadal rozwiązuje bazowe itemy kupca.


V10: items.js parser reads weaponClass; GeneratorConfig is merged into tier-base resolution; empty base names no longer create placeholders.

V11 - integracja z grą:
Generator tworzy 3 pliki w js/generated/:
- items.generated.js
- recipes.generated.js
- recipeLoader.js


V13:
- wygenerowany JS zachowuje subcategory;
- ring zawsze trafia do jeweler/ring;
- amulet zawsze trafia do jeweler/amulet;
- talisman zawsze trafia do shaman/talisman;
- recipeLoader wymusza poprawną profesję również dla już istniejących receptur.
