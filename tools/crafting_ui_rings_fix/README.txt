NAPRAWA PIERŚCIENI W CRAFTING UI

Podmień:
js/ui/craftingUI.js

na:
craftingUI_rings_fixed.js

Nie zmieniaj nazwy pliku docelowego — po podmianie ma się dalej nazywać:
craftingUI.js

Ta wersja rozpoznaje ring/amulet/talisman bezpośrednio po items[recipe.resultItemId].type,
więc receptury pierścieni nie znikną nawet wtedy, gdy recipe.category jest puste lub ma inną wartość.

Po podmianie użyj Ctrl+F5.
