Idler RPG — Generator V23

Etap: Excel -> wyposażenie + itemy kupca.

Źródło nadrzędne balansu:
- balans_uzbrojenia(1).xlsx

Źródło receptur:
- crafting_recipes(4).xlsx

Najważniejsze zmiany V23:
- wiersze oznaczone „Kupiec” w arkuszach wyposażenia są traktowane jako osobny katalog sklepu;
- itemy kupca są generowane do items.generated.js nawet bez receptury;
- Damage/Armor/requiredLevel pochodzą z arkusza balansu;
- ceny zakupu trafiają do idlerMerchantPrices;
- wartość sprzedaży pochodzi z arkusza Sprzedaz;
- stare itemy kupca nie nadpisują danych z głównego skoroszytu balansu.

Test V23:
- 70 receptur
- 225 wygenerowanych item entries
- 168 pozycji z balansu wyposażenia
- 84 ceny kupca
- 84 itemy kupca
- 48 potworów odczytanych z arkusza Moby

Uwaga:
Balans potworów jest nadal tylko analizowany. Nie zmieniamy automatycznie HP/Attack lokacji na tym etapie.
