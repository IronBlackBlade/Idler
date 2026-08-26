#!/usr/bin/env python3
"""
Idler RPG - Excel -> generated items/recipes

Reads the current crafting workbook (.xlsx/.xlsm) without third-party Excel
libraries, because the source is only used as data. It generates:
  generated/recipes.generated.js
  generated/items.generated.js
  generated/generation-report.json

The current workbook format is driven by standardized sheets:
  - Recipes_* (one sheet per crafting category)
  - GeneratorConfig

Design rule:
  "materiał z lokacji X" becomes a material group requirement:
    { groupId: "location_X", quantity: N }
  This means the game can later accept any material belonging to that location.

Existing items.js is optional. When supplied, it is used to resolve names to
itemIds and to preserve already-defined item properties for existing results.
New result items are generated as safe skeletons and listed as warnings if
important combat stats are not present in the workbook.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
import posixpath
from pathlib import Path


DEFAULT_EXCEL = Path("crafting/crafting_recipes.xlsx")
try:
    from drop_rules import score_material
except ImportError:
    from .drop_rules import score_material
from xml.etree import ElementTree as ET

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}

INVALID_RESULT_NAMES = {
    "na razie brak",
    "brak",
    "",
}


INGOT_ALIASES = {
    "sztabka miedzi": "copper_ingot",
    "sztabka cyny": "tin_ingot",
    "sztabka brazu": "bronze_ingot",
    "sztabka brązu": "bronze_ingot",
    "sztabka zelaza": "iron_ingot",
    "sztabka żelaza": "iron_ingot",
    "sztabka srebra": "silver_ingot",
    "sztabka zlota": "gold_ingot",
    "sztabka złota": "gold_ingot",
    "sztabka platyny": "platinum_ingot",
    "sztabka mithrilu": "mithril_ingot",
    "sztabka adamantytu": "adamantite_ingot",
    "sztabka smoczej stali": "dragonsteel_ingot",
}

BASE_ALIASES = {
    "stary miecz": "old_sword",
    "żelazny miecz": "iron_sword",
    "stalowy miecz": "steel_sword",
    "miecz strażnika": "guard_sword",
    "ostrze strażnika": "guardian_blade",
    "miecz stalowego strażnika": "steel_guardian_sword",
    "ostrze elitarnego strażnika": "elite_guardian_blade",
    "rycerski miecz": "knight_sword",
    "miecz kapitana": "captain_sword",
    "mistrzowski miecz": "master_sword",
    "stary łuk": "old_bow",
    "łuk myśliwski": "hunter_bow",
    "długi łuk": "long_bow",
    "łuk dębowy": "oak_bow",
    "łuk strażnika": "guardian_bow",
    "łuk stalowego strażnika": "steel_guardian_bow",
    "łuk zwiadowcy": "ranger_bow",
    "łuk wojenny": "war_bow",
    "mistrzowski łuk": "master_bow",
    "prosta kusza": "simple_crossbow",
    "lekka kusza": "light_crossbow",
    "myśliwska kusza": "hunting_crossbow",
    "stalowa kusza": "steel_crossbow",
    "kusza strażnika": "guardian_crossbow",
    "bojowa kusza": "battle_crossbow",
    "ciężka kusza": "heavy_crossbow",
    "prosta różdżka": "simple_wand",
    "uczniowska różdżka": "apprentice_wand",
    "arkaniczna różdżka": "arcane_wand",
    "magiczna różdżka": "magic_wand",
    "mistrzowska różdżka": "master_wand",
    "prosty kostur": "simple_staff",
    "kostur ucznia": "apprentice_staff",
    "kostur adepta": "adept_staff",
    "bojowy kostur": "battle_staff",
    "kostur maga": "mage_staff",
    "ciężki bojowy kostur": "heavy_battle_staff",
    "mistrzowski kostur": "master_staff",
    "pałka": "club",
    "maczuga": "kobold_mace",
    "pałka bojowa": "battle_club",
    "żelazna maczuga": "iron_club",
    "młot wojenny": "war_hammer",
    "buława": "mace",
    "ciężki młot wojenny": "heavy_war_hammer",
    "drewniana różdżka": "wooden_wand",
}

CATEGORY_MAP = {
    "różdzki": "wand",
    "różdżki": "wand",
    "obuchy": "mace",
    "miecze": "sword",
    "łuki": "bow",
    "kusze": "crossbow",
    "pierscienie": "ring",
    "pierścienie": "ring",
    "talizmany": "talisman",
    "pancerze": "armor",
    "pancerze/helmy/buty itd.": "armor",
}

LOCATION_NUMBER_BY_ID = {
    "forest": 1,
    "cave": 2,
    "crystalPeaks": 3,
    "ice": 4,
    "ruins": 5,
    "sunkenKingdom": 6,
    "volcano": 7,
    "abyss": 8,
}

CATEGORY_ITEM_TYPE = {
    "sword": ("weapon", "melee"),
    "mace": ("weapon", "melee"),
    "wand": ("weapon", "magic"),
    "ranged_weapon": ("weapon", "ranged"),
    "magic_weapon": ("weapon", "magic"),
    "ring": ("ring", None),
    "talisman": ("talisman", None),
    "armor": ("armor", None),
    "helmet": ("helmet", None),
    "pants": ("pants", None),
    "boots": ("boots", None),
    "gloves": ("gloves", None),
    "shield": ("shield", None),
}

# Known Polish category/material aliases. The generator prefers exact matches
# from items.js and then falls back to these aliases.
NAME_ALIASES = {
    "kwarc": "quartz",
    "ametyst": "amethyst",
    "szafir": "sapphire",
    "rubin": "ruby",
    "diament": "diamond",
    "pryzmatyczny klejnot": "prismatic_gem",
    "kamień": "stone",
    "kamien": "stone",
    "kamień szlifierski": "whetstone",
    "obsydianowy kamień szlifierski": "obsidian_whetstone",
    "tytanowy kamień szlifierski": "titan_whetstone",
    "pryzmatyczny kamień szlifierski": "prismatic_whetstone",
    "otchłaniowy kamień szlifierski": "abyssal_whetstone",
    "garbowana skóra owcza": "tanned_sheep_leather",
    "garbowana wilcza skóra": "tanned_wolf_leather",
    "garbowana skóra lodowego wilka": "tanned_ice_wolf_leather",
    "garbowana skóra ogara lawy": "tanned_lava_hound_leather",
    "tkanina wełniana": "wool_cloth",
    "płyta chitynowa": "chitin_plate",
    "pradawna płyta chitynowa": "chitin_plate_ancient",
    "płyta z materii pustki": "void_plate",
    "płyta z łusek głebinowców": "deep_scale_plate",
    "płyta z łusek głębinowców": "deep_scale_plate",
    "pryzmatyczna płyta": "prismatic_plate",
    "rozżarzona głowica obuchu": "scorching_mace_head",
    "głowica otchłani": "abyss_mace_head",
    "głowica głębinowa": "deep_mace_head",
    "obciążona głowica obuchu": "weighted_mace_head",
    "runiczny rdzeń": "runic_core",
    "prosty mechanizm spustowy": "simple_crossbow_trigger",
    "wzmocniony mechanizm naciągowy": "reinforced_crossbow_mechanism",
    "mechanizm naciągowy kuszy": "crossbow_tension_mechanism",
    "mechanizm echa otchłani": "abyss_echo_crossbow_mechanism",
    "mechanizm ciśnieniowy lewiatana": "leviathan_pressure_crossbow_mechanism",
    "pajęczy jedwab": "spider_silk",
    "esencja spaczenia": "corruption_essence",
    "esencja księżyca": "moon_essence",
    "kryształowa orchidea": "crystal_orchid",
    "nasiono pradawnego drzewa": "ancient_tree_seed",
    "serce bagna": "swamp_heart",
    "łza leśnej nimfy": "nymph_tear",
}


def norm(s: object) -> str:
    if s is None:
        return ""
    text = str(s).strip().lower()
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text)
    return text


def slugify(text: str) -> str:
    text = norm(text)
    replacements = {
        "ą":"a","ć":"c","ę":"e","ł":"l","ń":"n","ó":"o","ś":"s","ź":"z","ż":"z"
    }
    for a, b in replacements.items():
        text = text.replace(a, b)
    text = re.sub(r"[^a-z0-9]+", "_", text).strip("_")
    return text


def parse_qty(text: str) -> int:
    # Prefer explicit xN. A bare trailing number is only treated as quantity
    # when the text is not a location/boss description (e.g. "lokacji 2").
    m = re.search(r"x\s*(\d+)", text, re.I)
    if m:
        return int(m.group(1))
    n = norm(text)
    if "lokacji" in n or n.startswith("boss"):
        return 1
    m = re.search(r"(\d+)\s*$", text)
    return int(m.group(1)) if m else 1


def parse_tier(text: str) -> int | None:
    m = re.search(r"t\s*(\d+)", norm(text))
    return int(m.group(1)) if m else None


def load_xlsm(path: Path):
    with zipfile.ZipFile(path, "r") as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall("main:si", NS):
                parts = [t.text or "" for t in si.findall(".//main:t", NS)]
                shared.append("".join(parts))

        wb_root = ET.fromstring(z.read("xl/workbook.xml"))
        rels_root = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rel_targets = {}
        for rel in rels_root.findall("pkgrel:Relationship", NS):
            rel_targets[rel.attrib["Id"]] = rel.attrib["Target"]

        sheets = {}
        for sheet in wb_root.findall("main:sheets/main:sheet", NS):
            name = sheet.attrib["name"]
            rid = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            target = rel_targets[rid]
            if target.startswith("/"):
                target = target.lstrip("/")
            if not target.startswith("xl/"):
                target = posixpath.normpath(posixpath.join("xl", target))
            else:
                target = posixpath.normpath(target)
            xml = ET.fromstring(z.read(target))
            rows = {}
            for row in xml.findall(".//main:sheetData/main:row", NS):
                rnum = int(row.attrib["r"])
                cells = {}
                for cell in row.findall("main:c", NS):
                    ref = cell.attrib.get("r", "")
                    col = re.match(r"[A-Z]+", ref)
                    if not col:
                        continue
                    col_letters = col.group(0)
                    v = cell.find("main:v", NS)
                    value = ""
                    ctype = cell.attrib.get("t")
                    if ctype == "inlineStr":
                        texts = [t.text or "" for t in cell.findall(".//main:t", NS)]
                        value = "".join(texts)
                    elif v is not None:
                        raw = v.text or ""
                        if ctype == "s":
                            idx = int(raw)
                            value = shared[idx] if 0 <= idx < len(shared) else ""
                        else:
                            value = raw
                    elif cell.find("main:is", NS) is not None:
                        texts = [t.text or "" for t in cell.findall(".//main:t", NS)]
                        value = "".join(texts)
                    cells[col_letters] = value
                rows[rnum] = cells
            sheets[name] = rows
        return sheets


def col_to_num(col: str) -> int:
    n = 0
    for ch in col:
        n = n * 26 + ord(ch) - 64
    return n


def row_list(rows: dict[int, dict[str, str]], row_no: int, max_col: int = 60):
    out = []
    for i in range(1, max_col + 1):
        # convert 1 -> A
        x = i
        letters = ""
        while x:
            x, rem = divmod(x - 1, 26)
            letters = chr(65 + rem) + letters
        out.append(rows.get(row_no, {}).get(letters, ""))
    return out



def parse_structured_recipe_sheet(rows: dict[int, dict[str, str]], sheet_name: str,
                                  name_to_id: dict[str, str], warnings: list[str],
                                  locations: dict, generator_config: dict):
    """Parse one standardized Recipes_* sheet.

    Columns:
      Tier, Result Item, Result ItemId, Base Item, Base ItemId,
      Material 1, Qty 1, Material 2, Qty 2, Material 3, Qty 3,
      Boss, Qty Boss, Ingot, Qty Ingot, Player Level, Crafting Level,
      Gold Cost, Crafting EXP, Crafting Time (s), Unlock Cost, Requires Scroll
    """
    if not rows:
        return []

    header = row_list(rows, 1, 30)
    header_map = {norm(v): i for i, v in enumerate(header)}
    required = ["tier", "result item"]
    if any(k not in header_map for k in required):
        return []

    recipes = []

    def get(block, key, default=""):
        i = header_map.get(norm(key))
        if i is None or i >= len(block):
            return default
        return block[i]

    for r in sorted(rows):
        if r <= 1:
            continue
        block = row_list(rows, r, 30)
        result_name = str(get(block, "Result Item", "")).strip()
        if not result_name or norm(result_name) in INVALID_RESULT_NAMES:
            continue

        tier_text = get(block, "Tier", "")
        tier = parse_tier(tier_text)
        if tier is None:
            continue

        explicit_result_id = str(get(block, "Result ItemId", "") or "").strip()
        result_id = (
            explicit_result_id
            or resolve_item_id(result_name, name_to_id)
            or (generator_config or {}).get(norm(result_name))
            or slugify(result_name)
        )

        base_name = str(get(block, "Base Item", "") or "").strip()
        explicit_base_id = str(get(block, "Base ItemId", "") or "").strip()
        base_id = explicit_base_id or resolve_item_id(base_name, name_to_id)

        if not base_id and base_name:
            if "t" in norm(base_name) and tier and tier > 1:
                base_id = f"__BASE_BY_PREVIOUS_TIER__:{tier-1}"
            else:
                warnings.append(
                    f"{sheet_name} {tier_text} {result_name}: "
                    f"nie znaleziono bazowego itemId dla '{base_name}'."
                )

        # Materials: named field + explicit quantity.
        materials = []
        used = set()
        material_pairs = [
            ("Material 1", "Qty 1", "material1"),
            ("Material 2", "Qty 2", "material2"),
            ("Material 3", "Qty 3", "special"),
            ("Boss", "Qty Boss", "boss"),
            ("Ingot", "Qty Ingot", "ingot"),
        ]

        for name_key, qty_key, role in material_pairs:
            mat_name = str(get(block, name_key, "") or "").strip()
            if not mat_name:
                continue
            qty = get(block, qty_key, "")
            try:
                qty = int(float(str(qty).strip())) if str(qty).strip() else 1
            except Exception:
                qty = 1

            mat = parse_material(
                mat_name, name_to_id, role, warnings,
                f"{sheet_name} {result_name} {role}",
                locations, "", result_name, len(materials), used
            )
            if mat:
                mat["quantity"] = qty
                materials.append(mat)
                used.add(mat["itemId"])

        def num_or_none(v):
            try:
                if v is None or str(v).strip() == "":
                    return None
                return int(float(str(v).strip()))
            except Exception:
                return None

        gold = num_or_none(get(block, "Gold Cost", ""))
        exp = num_or_none(get(block, "Crafting EXP", ""))
        ctime = num_or_none(get(block, "Crafting Time (s)", "")) 
        unlock = num_or_none(get(block, "Unlock Cost", "")) or 0
        scroll_raw = str(get(block, "Requires Scroll", "") or "").strip().lower()
        scroll = scroll_raw in {"true", "1", "yes", "tak"}

        category, subcategory = resolve_profession_and_subcategory(
            result_id, result_name, {}
        )
        # Structured sheet name is authoritative where possible.
        structured_category = {
            "Recipes_Wands": ("arcanist", "wand"),
            "Recipes_Staves": ("arcanist", "staff"),
            "Recipes_Maces": ("blacksmith", "mace"),
            "Recipes_Swords": ("blacksmith", "sword"),
            "Recipes_Bows": ("bowyer", "bow"),
            "Recipes_Crossbows": ("bowyer", "crossbow"),
            "Recipes_Rings": ("jeweler", "ring"),
            "Recipes_Amulets": ("jeweler", "amulet"),
            "Recipes_Talismans": ("shaman", "talisman"),
            "Recipes_Armor": ("armorer", "armor"),
            "Recipes_Helmets": ("armorer", "helmet"),
            "Recipes_Pants": ("armorer", "pants"),
            "Recipes_Boots": ("armorer", "boots"),
            "Recipes_Gloves": ("armorer", "gloves"),
            "Recipes_Shields": ("armorer", "shield"),
        }.get(sheet_name)
        if structured_category:
            category, subcategory = structured_category

        # Accept both the original compact headers and the newer
        # explicit headers used by the normalized Recipes_* sheets.
        player_level_raw = get(block, "Required Player Level", "")
        if str(player_level_raw).strip() == "":
            player_level_raw = get(block, "Player Level", "")

        crafting_level_raw = get(block, "Required Crafting Level", "")
        if str(crafting_level_raw).strip() == "":
            crafting_level_raw = get(block, "Crafting Level", "")

        recipes.append({
            "id": f"{result_id}_recipe",
            "name": result_name,
            "resultItemId": result_id,
            "category": category,
            "subcategory": subcategory,
            "tier": tier,
            "requiredPlayerLevel": num_or_none(player_level_raw),
            "requiredCraftingLevel": num_or_none(crafting_level_raw),
            "goldCost": gold,
            "craftingExp": exp,
            "craftingTimeSeconds": ctime,
            "requiresScroll": scroll,
            "unlockCost": unlock,
            "materials": materials,
            "_baseName": base_name,
            "_source": f"{sheet_name}:{r}",
            "_baseId": base_id,
        })

    # Normalize previous-tier bases inside this sheet.
    by_tier = {r.get("tier"): r.get("resultItemId") for r in recipes}
    for r in recipes:
        bid = r.get("_baseId")
        if isinstance(bid, str) and bid.startswith("__BASE_BY_PREVIOUS_TIER__:"):
            try:
                prev = int(bid.split(":")[-1])
            except Exception:
                prev = None
            if prev in by_tier:
                r["materials"] = r.get("materials", [])
                r["_baseId"] = by_tier[prev]
            else:
                r["_baseId"] = None

    return recipes

def load_existing_items(path: Path | None):
    items_by_id = {}
    name_to_id = {}
    if not path or not path.exists():
        return items_by_id, name_to_id
    text = path.read_text(encoding="utf-8")
    # Pull object keys and the name field from each object. This intentionally
    # handles the style used by the current items.js rather than being a JS VM.
    pattern = re.compile(r"(?m)^\s*([A-Za-z0-9_]+):\s*\{(.*?)^\s*\},?\s*$", re.S)
    for m in pattern.finditer(text):
        item_id = m.group(1)
        body = m.group(2)
        nm = re.search(r"(?m)^\s*name:\s*\"([^\"]*)\"", body)
        if not nm:
            continue
        name = nm.group(1)
        entry = {"id": item_id, "name": name}
        for field in ["rarity", "type", "weaponType", "weaponClass"] :
            fm = re.search(rf"(?m)^\s*{field}:\s*\"([^\"]*)\"", body)
            if fm:
                entry[field] = fm.group(1)
        for field in ["requiredLevel", "damage", "armor", "strength", "dexterity", "intelligence", "endurance", "luck", "value"]:
            fm = re.search(rf"(?m)^\s*{field}:\s*(-?\d+(?:\.\d+)?)", body)
            if fm:
                num = float(fm.group(1))
                entry[field] = int(num) if num.is_integer() else num
        items_by_id[item_id] = entry
        name_to_id[norm(name)] = item_id
    return items_by_id, name_to_id


def resolve_item_id(name: str, name_to_id: dict[str, str]) -> str | None:
    n = norm(name)
    if not n:
        return None
    if n in NAME_ALIASES:
        return NAME_ALIASES[n]
    if n in INGOT_ALIASES:
        return INGOT_ALIASES[n]
    if n in BASE_ALIASES:
        return BASE_ALIASES[n]
    if n in name_to_id:
        return name_to_id[n]
    n2 = re.sub(r"^\s*na razie brak\s*", "", n)
    if n2 in name_to_id:
        return name_to_id[n2]
    return None



def load_location_loot(locations_dir: Path | None, existing_items: dict[str, dict], warnings: list[str]):
    """Read location JS files and extract normal-monster and boss loot.

    Only files found inside the dedicated locations directory are considered.
    Location numbers are taken from the explicit game progression map above.
    A fallback comment ``// LOCATION: N`` is also supported for future custom
    locations.
    """
    locations = {}
    if not locations_dir or not locations_dir.exists():
        warnings.append(f"Brak katalogu lokacji: {locations_dir}")
        return locations

    for path in sorted(locations_dir.glob("*.js")):
        text = path.read_text(encoding="utf-8")
        object_match = re.search(r'const\s+([A-Za-z0-9_]+)\s*=\s*\{', text)
        location_id = object_match.group(1) if object_match else path.stem

        location_number = LOCATION_NUMBER_BY_ID.get(location_id)
        if location_number is None:
            comment_match = re.search(r'LOCATION\s*:\s*(\d+)', text, re.I)
            if comment_match:
                location_number = int(comment_match.group(1))
            else:
                # Ignore unrelated JS files rather than treating them as broken locations.
                continue

        normal_drops = []
        boss_drops = []

        # Split boss and enemies sections so boss loot is never mixed into the normal pool.
        boss_section = re.search(
            r'\bboss\s*:\s*\{(.*?)(?=\n\s*\},?\s*\n\s*enemies\s*:)',
            text,
            re.S,
        )
        boss_text = boss_section.group(1) if boss_section else ""

        enemies_section = re.search(r'\benemies\s*:\s*\[(.*)\]\s*\}\s*;?\s*$', text, re.S)
        enemies_text = enemies_section.group(1) if enemies_section else ""

        def parse_drops(block_text: str, target: list):
            for item_id, chance_text in re.findall(
                r'\{\s*item:\s*["\']([^"\']+)["\']\s*,\s*chance:\s*([0-9.]+)\s*\}',
                block_text,
            ):
                if item_id.startswith("recipe_"):
                    continue
                try:
                    chance = float(chance_text)
                except ValueError:
                    chance = 0.0
                entry = existing_items.get(item_id, {})
                target.append({
                    "itemId": item_id,
                    "name": entry.get("name", item_id.replace("_", " ")),
                    "rarity": entry.get("rarity", "common"),
                    "chance": chance,
                })

        parse_drops(enemies_text, normal_drops)
        parse_drops(boss_text, boss_drops)

        unique = {}
        for drop in normal_drops:
            previous = unique.get(drop["itemId"])
            if previous is None or drop["chance"] > previous["chance"]:
                unique[drop["itemId"]] = drop

        boss_unique = {}
        for drop in boss_drops:
            previous = boss_unique.get(drop["itemId"])
            if previous is None or drop["chance"] > previous["chance"]:
                boss_unique[drop["itemId"]] = drop

        locations[location_number] = {
            "id": location_id,
            "number": location_number,
            "file": path.name,
            "materials": list(unique.values()),
            "bossMaterials": list(boss_unique.values()),
        }

    return locations


def choose_location_material(category: str, result_name: str, location_number: int, locations: dict, warnings: list[str], occurrence_index: int = 0, used_item_ids=None):
    loc = locations.get(location_number)
    if not loc or not loc["materials"]:
        warnings.append(f"{result_name}: brak danych dropów dla lokacji {location_number}.")
        return None

    used_item_ids = set(used_item_ids or [])
    ranked = sorted(
        loc["materials"],
        key=lambda d: score_material(
            category,
            d["itemId"],
            d["name"],
            d.get("rarity", "common"),
            d.get("chance", 0),
            result_name=result_name,
        ),
        reverse=True,
    )

    # Never repeat a material inside the same recipe if another suitable drop exists.
    unused = [drop for drop in ranked if drop["itemId"] not in used_item_ids]
    if unused:
        return unused[0]["itemId"]
    return ranked[0]["itemId"]


def choose_boss_material(location_number: int, locations: dict, warnings: list[str], result_name: str):
    loc = locations.get(location_number)
    if not loc or not loc["bossMaterials"]:
        warnings.append(f"{result_name}: brak danych dropu bossa dla lokacji {location_number}.")
        return None

    ranked = sorted(
        loc["bossMaterials"],
        key=lambda d: (
            d.get("rarity") == "legendary",
            d.get("rarity") == "epic",
            d.get("rarity") == "rare",
            d.get("chance", 0),
        ),
        reverse=True,
    )
    return ranked[0]["itemId"]


def parse_material(value: str, name_to_id: dict[str, str], role: str, warnings: list[str], context: str, locations=None, category="", result_name="", slot_index=0, used_item_ids=None):
    text = str(value or "").strip()
    n = norm(text)
    if not n or n == "brak":
        return None

    qty = parse_qty(text)
    # Location material requirements become concrete monster drops.
    m = re.search(r"lokacji\s*(\d+)", n)
    if m and role != "boss":
        loc_number = int(m.group(1))
        chosen = choose_location_material(category, result_name, loc_number, locations or {}, warnings, slot_index, used_item_ids)
        if chosen:
            return {"itemId": chosen, "quantity": qty}
        return {"itemId": f"__UNRESOLVED_LOCATION_{loc_number}__", "quantity": qty}

    if n.startswith("boss lokacji"):
        loc = re.search(r"lokacji\s*(\d+)", n)
        loc_number = int(loc.group(1)) if loc else 0
        chosen = choose_boss_material(loc_number, locations or {}, warnings, result_name)
        if chosen:
            return {"itemId": chosen, "quantity": qty}
        return {"itemId": f"__UNRESOLVED_BOSS_{loc_number}__", "quantity": qty}

    # Strip quantity marker before resolving a concrete item name.
    cleaned = re.sub(r"x\s*\d+", "", text, flags=re.I).strip(" ;,-")
    item_id = resolve_item_id(cleaned, name_to_id)
    if not item_id:
        warnings.append(f"{context}: nie znaleziono itemId dla '{cleaned}'. Zostawiam placeholder.")
        return {"itemId": f"__UNRESOLVED__:{slugify(cleaned)}", "quantity": qty}
    return {"itemId": item_id, "quantity": qty}


def detect_blocks(rows: dict[int, dict[str, str]], header_row: int = 3):
    header = row_list(rows, header_row, 60)
    starts = [i for i, value in enumerate(header) if norm(value) == "tier"]
    blocks = []
    for idx, start in enumerate(starts):
        end = starts[idx + 1] if idx + 1 < len(starts) else len(header)
        # Category title is usually directly above the block.
        title = ""
        title_cells = row_list(rows, 2, 60)
        for j in range(start, end):
            if norm(title_cells[j]):
                title = title_cells[j]
                break
        blocks.append((start, end, title, header[start:end]))
    return blocks


def parse_block(rows, start, header, category_title, sheet_name, name_to_id, warnings, locations, recipe_costs, generator_config=None):
    # Current standard layout is 10 columns. The talisman block in Biżuteria
    # has result/base header labels swapped; the data itself is still result/base.
    if len(header) < 10:
        return []
    category = CATEGORY_MAP.get(norm(category_title), slugify(category_title) or "special")
    recipes = []
    for r in sorted(rows):
        if r <= 3:
            continue
        vals = row_list(rows, r, start + 10)
        block = vals[start:start + 10]
        if len(block) < 10:
            continue
        tier_text = block[0]
        result_name = block[1]
        base_name = block[2]
        if not str(tier_text).strip() or not str(result_name).strip():
            continue
        if norm(result_name) in INVALID_RESULT_NAMES or norm(result_name) == "na razie brak":
            continue
        tier = parse_tier(tier_text)
        if tier is None:
            continue
        player_level = int(float(block[8])) if str(block[8]).strip() else None
        craft_level = int(float(block[9])) if str(block[9]).strip() else None
        cost_info = recipe_costs.get(norm(str(result_name).strip()), {})
        configured_result_id = (generator_config or {}).get(norm(str(result_name).strip()))
        result_id = (
            resolve_item_id(result_name, name_to_id)
            or configured_result_id
            or slugify(result_name)
        )
        base_id = resolve_item_id(base_name, name_to_id)
        if not base_id:
            # Higher tiers explicitly saying "wytwarzana z tX" need to point to
            # the previous generated tier. We resolve this later after all rows.
            base_id = f"__BASE_BY_PREVIOUS_TIER__:{tier-1}" if tier and tier > 1 and "t" in norm(base_name) else None
            if base_id is None:
                warnings.append(f"{sheet_name} {tier_text} {result_name}: nie znaleziono bazowego itemId dla '{base_name}'.")
        materials = []
        used_item_ids = set()
        for slot_index, (role, text) in enumerate([("material1", block[3]), ("material2", block[4]), ("special", block[5]), ("boss", block[6]), ("ingot", block[7])]):
            mat = parse_material(
                text,
                name_to_id,
                role,
                warnings,
                f"{sheet_name} {result_name} {role}",
                locations,
                category,
                str(result_name).strip(),
                slot_index,
                used_item_ids,
            )
            if mat:
                materials.append(mat)
                used_item_ids.add(mat["itemId"])
        recipes.append({
            "id": f"{result_id}_recipe",
            "name": str(result_name).strip(),
            "resultItemId": result_id,
            "category": category,
            "tier": tier,
            "requiredPlayerLevel": player_level,
            "requiredCraftingLevel": craft_level,
            "goldCost": cost_info.get("goldCost"),
            "craftingExp": cost_info.get("craftingExp"),
            "craftingTimeSeconds": cost_info.get("craftingTimeSeconds"),
            "requiresScroll": False,
            "unlockCost": 0,
            "materials": materials,
            "_baseName": str(base_name).strip(),
            "_source": f"{sheet_name}!row{r}",
        })
    return recipes




def load_crafting_recipes_table(sheets):
    """Read the normalized 'Crafting Recipes' sheet.

    Columns:
      Tier, Przedmiot, Result itemId, Kategoria, Bazowy item,
      Materiał 1/Ilość 1, Materiał 2/Ilość 2,
      Materiał specjalny/Ilość specjalna,
      Boss/Ilość bossa, Sztabka/Ilość sztabki,
      Poziom postaci, Poziom craftingu, Koszt złota,
      EXP craftingu, Czas craftingu
    """
    rows = sheets.get("Crafting Recipes") or {}
    if not rows:
        return []

    header = row_list(rows, 1, 30)
    index = {norm(v): i for i, v in enumerate(header, start=1) if norm(v)}

    def get(row_no, name):
        col = index.get(norm(name))
        if not col:
            return ""
        return rows.get(row_no, {}).get(num_to_col(col), "")

    def num(value):
        if value in (None, ""):
            return None
        try:
            return int(float(value))
        except (TypeError, ValueError):
            return None

    out = []
    for r in sorted(rows):
        if r <= 1:
            continue
        result_name = str(get(r, "Przedmiot") or "").strip()
        if not result_name or norm(result_name) == "na razie brak":
            continue

        tier = num(get(r, "Tier"))
        if tier is None:
            continue

        category = norm(get(r, "Kategoria")) or category_from_recipe_name(result_name)

        # Result itemId is authoritative when supplied in Excel.
        # This allows recipe names to be different from item names.
        explicit_result_id = str(get(r, "Result itemId") or "").strip()

        result_id = (
            explicit_result_id
            or resolve_item_id(result_name, {})
            or slugify(result_name)
        )

        def material(name_col, qty_col):
            name = str(get(r, name_col) or "").strip()
            qty = num(get(r, qty_col))
            if not name:
                return None
            return name, (qty if qty is not None else parse_qty(name))

        materials_raw = []
        for nc, qc, role in [
            ("Materiał 1", "Ilość 1", "material1"),
            ("Materiał 2", "Ilość 2", "material2"),
            ("Materiał specjalny", "Ilość specjalna", "special"),
            ("Boss", "Ilość bossa", "boss"),
            ("Sztabka", "Ilość sztabki", "ingot"),
        ]:
            value = material(nc, qc)
            materials_raw.append((role, value))

        item_overrides = {
            "id": str(get(r, "Item ID") or "").strip(),
            "rarity": str(get(r, "Rzadkość") or get(r, "Rzadkosc") or "").strip(),
            "type": str(get(r, "Typ itemu") or "").strip(),
            "weaponType": str(get(r, "Typ broni") or "").strip(),
            "weaponClass": str(get(r, "Klasa broni") or "").strip(),
        }
        for field_name, header_name in [
            ("damage", "Obrażenia"),
            ("armor", "Pancerz"),
            ("strength", "Siła"),
            ("dexterity", "Zręczność"),
            ("intelligence", "Inteligencja"),
            ("endurance", "Wytrzymałość"),
            ("luck", "Szczęście"),
            ("value", "Wartość"),
        ]:
            item_overrides[field_name] = num(get(r, header_name))

        out.append({
            "id": f"{result_id}_recipe",
            "name": result_name,
            "resultItemId": result_id,
            "category": category,
            "tier": tier,
            "requiredPlayerLevel": num(get(r, "Poziom postaci")),
            "requiredCraftingLevel": num(get(r, "Poziom craftingu")),
            "goldCost": num(get(r, "Koszt złota")),
            "craftingExp": num(get(r, "EXP craftingu")),
            "craftingTimeSeconds": num(get(r, "Czas craftingu")),
            "requiresScroll": False,
            "unlockCost": 0,
            "_baseName": str(get(r, "Bazowy item") or "").strip(),
            "_materialRows": materials_raw,
            "_itemOverrides": item_overrides,
            "_source": f"Crafting Recipes!row{r}",
        })
    return out


def num_to_col(n):
    letters = ""
    while n:
        n, rem = divmod(n - 1, 26)
        letters = chr(65 + rem) + letters
    return letters





def resolve_profession_and_subcategory(result_id, result_name, items):
    """Return the UI crafting profession category and its subcategory."""
    item = items.get(result_id) if isinstance(items, dict) else None
    if not item:
        return None, None

    item_type = norm(item.get("type", ""))
    weapon_type = norm(item.get("weaponType", ""))
    weapon_class = norm(item.get("weaponClass", ""))
    name = norm(item.get("name", result_name))

    if item_type == "weapon":
        if weapon_type == "ranged":
            if weapon_class == "crossbow" or "kusza" in name:
                return "bowyer", "crossbow"
            return "bowyer", "bow"
        if weapon_type == "magic":
            if "kostur" in name or "staff" in name or "kostur" in norm(result_name):
                return "arcanist", "staff"
            return "arcanist", "wand"
        if weapon_class == "slashing" or "miecz" in name or "ostrze" in name:
            return "blacksmith", "sword"
        if weapon_class == "blunt" or any(x in name for x in ["pałka", "palka", "maczuga", "młot", "mlot", "buława"]):
            return "blacksmith", "mace"
        return "blacksmith", None

    type_to_profession = {
        "shield": "armorer", "helmet": "armorer", "armor": "armorer",
        "pants": "armorer", "boots": "armorer", "gloves": "armorer",
        "ring": "jeweler", "amulet": "jeweler", "talisman": "shaman",
    }
    profession = type_to_profession.get(item_type)
    if profession:
        return profession, item_type

    return None, None

def category_from_item_id(item_id, items):
    """Derive crafting category from the actual item definition."""
    item = items.get(item_id) if isinstance(items, dict) else None
    if not item:
        return None

    item_type = norm(item.get("type", ""))
    weapon_type = norm(item.get("weaponType", ""))
    weapon_class = norm(item.get("weaponClass", ""))

    if item_type == "weapon":
        # Current game data uses weaponClass to distinguish melee families.
        if weapon_class in {"slashing"}:
            return "sword"
        if weapon_class in {"blunt"}:
            return "mace"
        if weapon_class in {"bow"} or weapon_type == "ranged" and "bow" in norm(item.get("name", "")):
            return "bow"
        if weapon_class in {"crossbow"} or weapon_type == "ranged" and "kusza" in norm(item.get("name", "")):
            return "crossbow"
        if item_type == "weapon" and ("różdżka" in norm(item.get("name", "")) or "kostur" in norm(item.get("name", ""))):
            return "wand"

    if item_type in {"ring", "amulet", "talisman"}:
        return item_type

    if item_type in {"armor", "helmet", "shield", "pants", "boots", "gloves"}:
        return "armor"

    return None


def resolve_category(result_id, result_name, items):
    """Prefer the authoritative item data; fallback to name only if needed."""
    category = category_from_item_id(result_id, items)
    if category:
        return category
    return category_from_recipe_name(result_name)


def category_from_recipe_name(name):
    n = norm(name)
    if "pierścień" in n or "pierscien" in n:
        return "ring"
    if "talizman" in n:
        return "talisman"
    if "kusza" in n:
        return "crossbow"
    if "łuk" in n:
        return "bow"
    if "miecz" in n or "ostrze" in n:
        return "sword"
    if "różdżka" in n or "rózdzka" in n or "kostur" in n:
        return "wand"
    if any(x in n for x in ["pałka", "palka", "maczuga", "młot", "mlot", "buława"]):
        return "mace"
    return "armor"



def load_recipe_costs(sheets):
    result = {}
    rows = sheets.get("RecipeCosts") or {}
    for r in sorted(rows):
        if r <= 1:
            continue
        vals = row_list(rows, r, 8)
        if len(vals) < 7:
            continue
        name = norm(vals[0])
        if not name:
            continue
        def num(v):
            if v is None or str(v).strip() == "":
                return None
            try:
                return int(float(v))
            except (TypeError, ValueError):
                return None
        result[name] = {
            "craftingLevel": num(vals[3]),
            "goldCost": num(vals[4]),
            "craftingExp": num(vals[5]),
            "craftingTimeSeconds": num(vals[6]),
        }
    return result



def merchant_base_mapping(sheets):
    rows = sheets.get("GeneratorConfig") or {}
    mapping = {}
    for r, data in rows.items():
        excel_value = str(data.get("B", "")).strip()
        item_id = str(data.get("C", "")).strip()
        if excel_value and item_id:
            mapping[norm(excel_value)] = item_id
    return mapping




def load_damage_workbook(path: Path | None, existing_items: dict[str, dict], warnings: list[str], label: str):
    """Read damage overrides from a standalone weapon workbook.

    Expected sheets: Miecze, Obuchy, Łuki, Kusze, Różdżki, Kostury.
    Expected columns: Lv, ID, Nazwa, Obecny damage, Nowy damage, Zmiana.

    Only ``damage`` is changed; all other fields are preserved from items.js.
    """
    overrides = {}
    if not path:
        return overrides
    if not path.exists():
        warnings.append(f"Brak pliku {label}: {path}")
        return overrides

    try:
        sheets = load_xlsm(path)
    except Exception as exc:
        warnings.append(f"Nie udało się odczytać {label} {path}: {exc}")
        return overrides

    for sheet_name in ["Miecze", "Obuchy", "Łuki", "Kusze", "Różdżki", "Kostury"]:
        rows = sheets.get(sheet_name)
        if not rows:
            continue

        header = row_list(rows, 1, 10)
        index = {norm(v): i for i, v in enumerate(header)}
        id_col = index.get("id")
        damage_col = index.get("nowy damage")
        if id_col is None or damage_col is None:
            warnings.append(
                f"Arkusz {sheet_name} w {label} nie ma kolumn 'ID' i 'Nowy damage'."
            )
            continue

        for row_no in sorted(rows):
            if row_no <= 1:
                continue
            values = row_list(rows, row_no, len(header))
            item_id = str(values[id_col] if id_col < len(values) else "").strip()
            if not item_id:
                continue

            raw_damage = values[damage_col] if damage_col < len(values) else ""
            try:
                new_damage = int(float(str(raw_damage).strip()))
            except (TypeError, ValueError):
                warnings.append(
                    f"{label} {sheet_name} wiersz {row_no}: brak poprawnego 'Nowy damage' dla {item_id}."
                )
                continue

            if item_id not in existing_items:
                warnings.append(
                    f"Item '{item_id}' z {label}, arkusz {sheet_name}, nie istnieje w items.js."
                )
                continue

            updated = dict(existing_items[item_id])
            updated["damage"] = new_damage
            overrides[item_id] = updated

    return overrides


def load_generator_config(sheets):
    config = {}
    rows = sheets.get("GeneratorConfig") or {}
    for r in sorted(rows):
        if r <= 2:
            continue
        vals = row_list(rows, r, 4)
        if len(vals) < 3:
            continue
        name = norm(vals[0])
        item_id = str(vals[2]).strip() if vals[2] is not None else ""
        if name and item_id:
            config[name] = item_id
    return config

def resolve_tier_bases(recipes, name_to_id, generator_config=None):
    generator_config = generator_config or {}
    by_category_tier = {(r["category"], r["tier"]): r for r in recipes}
    generated_name_to_id = {norm(r["name"]): r["resultItemId"] for r in recipes}

    for r in recipes:
        base_name = r["_baseName"]
        base_marker = None
        if base_name:
            base_marker = resolve_item_id(base_name, name_to_id)
            if not base_marker:
                base_marker = generator_config.get(norm(base_name))
            if not base_marker:
                base_marker = generated_name_to_id.get(norm(base_name))

        n = norm(base_name)
        if base_marker:
            if not any(m.get("itemId") == base_marker for m in r["materials"]):
                r["materials"].insert(0, {"itemId": base_marker, "quantity": 1})
        elif re.search(r"wytwarzana|wytwarzany|z t\d+|z t\s*\d+", n):
            prev = re.search(r"t\s*(\d+)", n)
            prev_tier = int(prev.group(1)) if prev else max(1, r["tier"] - 1)
            prev_recipe = by_category_tier.get((r["category"], prev_tier))
            if prev_recipe:
                base_id = prev_recipe["resultItemId"]
                if not any(m.get("itemId") == base_id for m in r["materials"]):
                    r["materials"].insert(0, {"itemId": base_id, "quantity": 1})
            else:
                candidate = [x for x in recipes if x["category"] == r["category"] and x["tier"] == prev_tier]
                if candidate:
                    base_id = candidate[0]["resultItemId"]
                    if not any(m.get("itemId") == base_id for m in r["materials"]):
                        r["materials"].insert(0, {"itemId": base_id, "quantity": 1})
                else:
                    r["materials"].insert(0, {"itemId": f"__UNRESOLVED_BASE__:{slugify(base_name)}", "quantity": 1})
        elif base_name:
            r["materials"].insert(0, {"itemId": f"__UNRESOLVED_BASE__:{slugify(base_name)}", "quantity": 1})

        del r["_baseName"]
        del r["_source"]


def build_generated_items(recipes, existing_items, name_to_id):
    """Create complete item definitions for recipe results that do not exist in items.js.

    Excel can optionally override the generated values with these columns on
    Crafting Recipes: Item ID, Rzadkość, Typ itemu, Typ broni, Klasa broni,
    Obrażenia, Pancerz, Siła, Zręczność, Inteligencja, Wytrzymałość,
    Szczęście, Wartość.
    """
    generated = {}

    # Conservative defaults following the current game's progression.
    damage_by_level = {
        1: 6, 10: 18, 20: 34, 25: 50, 30: 65, 40: 95, 50: 165,
    }
    rarity_by_tier = {
        1: "uncommon", 2: "rare", 3: "rare", 4: "common",
        5: "rare", 6: "epic", 7: "legendary",
    }
    jewelry_stats = {
        "ring": {
            1: {"luck": 1}, 10: {"dexterity": 2, "luck": 2},
            20: {"strength": 2, "endurance": 2, "luck": 2},
            25: {"strength": 3, "dexterity": 1, "endurance": 3, "luck": 2},
            30: {"strength": 5, "dexterity": 4, "endurance": 3, "luck": 3},
            40: {"strength": 7, "dexterity": 4, "endurance": 7, "luck": 7},
            50: {"strength": 13, "dexterity": 9, "endurance": 13, "luck": 12},
        },
        "amulet": {
            1: {"intelligence": 2, "luck": 1}, 10: {"dexterity": 1, "intelligence": 4, "luck": 2},
            20: {"intelligence": 6, "endurance": 3, "luck": 3},
            25: {"intelligence": 6, "endurance": 3, "luck": 2},
            30: {"intelligence": 9, "endurance": 6, "luck": 3},
            40: {"strength": 4, "intelligence": 12, "endurance": 6, "luck": 6},
            50: {"strength": 8, "intelligence": 28, "endurance": 12, "luck": 12},
        },
        "talisman": {
            1: {"intelligence": 1, "luck": 4}, 10: {"dexterity": 2, "intelligence": 2, "luck": 4},
            20: {"intelligence": 3, "endurance": 4, "luck": 6},
            25: {"endurance": 3, "luck": 8}, 30: {"intelligence": 6, "endurance": 6, "luck": 12},
            40: {"strength": 5, "dexterity": 5, "intelligence": 5, "luck": 10},
            50: {"strength": 10, "dexterity": 10, "intelligence": 14, "endurance": 8, "luck": 20},
        },
    }

    profession_to_type = {
        "blacksmith": ("weapon", "melee", {"sword": "slashing", "mace": "blunt"}),
        "bowyer": ("weapon", "ranged", {"bow": "bow", "crossbow": "crossbow"}),
        "arcanist": ("weapon", "magic", {"wand": "wand", "staff": "staff"}),
        "armorer": ("armor", None, {}),
        "jeweler": (None, None, {"ring": "ring", "amulet": "amulet"}),
        "shaman": ("talisman", None, {"talisman": "talisman"}),
    }

    for r in recipes:
        iid = r["resultItemId"]
        if iid in existing_items or iid in generated:
            continue

        overrides = r.get("_itemOverrides") or {}
        level = int(r.get("requiredPlayerLevel") or (r.get("tier") or 1) or 1)
        category = r.get("category")
        subcategory = r.get("subcategory") or ""
        item_type, weapon_type, weapon_classes = profession_to_type.get(category, ("crafting_material", None, {}))
        if subcategory in {"ring", "amulet"}:
            item_type = subcategory
        if category == "armorer" and subcategory in {"shield", "helmet", "armor", "pants", "boots", "gloves"}:
            item_type = subcategory
        weapon_class = weapon_classes.get(subcategory)

        # Prefer an explicit Excel override for type/class.
        item_type = overrides.get("type") or item_type
        weapon_type = overrides.get("weaponType") or weapon_type
        weapon_class = overrides.get("weaponClass") or weapon_class

        rarity = overrides.get("rarity") or rarity_by_tier.get(int(r.get("tier") or 1), "uncommon")
        value = overrides.get("value")
        if value is None:
            value = max(10, int(r.get("goldCost") or 0) * 3)

        item = {
            "id": overrides.get("id") or iid,
            "name": r["name"],
            "rarity": rarity,
            "type": item_type or "crafting_material",
            "requiredLevel": level,
            "value": value,
        }

        if weapon_type:
            item["weaponType"] = weapon_type
        if weapon_class:
            item["weaponClass"] = weapon_class

        if item["type"] == "weapon":
            item["damage"] = overrides.get("damage")
            if item["damage"] is None:
                item["damage"] = damage_by_level.get(level, max(1, int(round(3.2 * level))))
            # Basic stat bonuses for special/rarer crafted weapons can be overridden in Excel.
            if subcategory in {"wand", "staff"} and level >= 10 and overrides.get("intelligence") is None:
                item["intelligence"] = max(1, level // 10)

        elif item["type"] in {"armor", "helmet", "shield", "pants", "boots", "gloves"}:
            item["armor"] = overrides.get("armor")
            if item["armor"] is None:
                armor_base = {1: 6, 10: 14, 20: 28, 25: 38, 30: 50, 40: 80, 50: 120}
                item["armor"] = armor_base.get(level, max(1, int(round(level * 2.4))))
            if overrides.get("endurance") is not None:
                item["endurance"] = overrides["endurance"]
            elif level >= 10:
                item["endurance"] = max(1, level // 3)

        elif item["type"] in {"ring", "amulet", "talisman"}:
            for stat, val in (jewelry_stats.get(item["type"], {}).get(level, {})).items():
                item[stat] = val

        # Explicit Excel stats always win.
        for stat in ["damage", "armor", "strength", "dexterity", "intelligence", "endurance", "luck", "value"]:
            if overrides.get(stat) is not None:
                item[stat] = overrides[stat]

        generated[iid] = item

    return generated


def js_value(v):
    return json.dumps(v, ensure_ascii=False)


def render_items_js(items: dict[str, dict]):
    lines = ["// AUTO-GENERATED FILE. DO NOT EDIT BY HAND.", "// Source: Excel crafting workbook", "", "window.idlerGeneratedItems = {"]
    for iid, item in items.items():
        lines.append(f"    {iid}: {{")
        fields = ["id", "name", "rarity", "type", "weaponType", "weaponClass", "requiredLevel", "damage", "armor", "strength", "dexterity", "intelligence", "endurance", "luck", "value"]
        for field in fields:
            if field not in item:
                continue
            val = item[field]
            if val is None:
                continue
            lines.append(f"        {field}: {js_value(val)},")
        lines.append("    },")
        lines.append("")
    lines.append("};")
    lines.append("")
    return "\n".join(lines)


def clean_recipe(r):
    out = {k: v for k, v in r.items() if not k.startswith("_")}
    # Keep only fields the current game understands plus tier/category.
    return out


def render_recipes_js(recipes):
    lines = ["// AUTO-GENERATED FILE. DO NOT EDIT BY HAND.", "// Source: Excel crafting workbook", "", "window.idlerGeneratedRecipes = ["]
    for recipe in recipes:
        lines.append("    {")
        for key in ["id","name","resultItemId","category","subcategory","tier","requiredPlayerLevel","requiredCraftingLevel","goldCost","craftingExp","craftingTimeSeconds","requiresScroll","unlockCost"]:
            if key in recipe:
                lines.append(f"        {key}: {js_value(recipe[key])},")
        lines.append("        materials: [")
        for mat in recipe["materials"]:
            lines.append(f"            {json.dumps(mat, ensure_ascii=False)},")
        lines.append("        ],")
        lines.append("    },")
        lines.append("")
    lines.append("];" )
    lines.append("")
    return "\n".join(lines)



def render_loader_js():
    return """// AUTO-GENERATED FILE. DO NOT EDIT BY HAND.
// Connects Excel-generated crafting data with the existing game data.

(function () {
    if (typeof items !== "undefined" && window.idlerGeneratedItems) {
        Object.assign(items, window.idlerGeneratedItems);
    }

    if (typeof recipes === "undefined" || !window.idlerGeneratedRecipes) {
        return;
    }

    const generatedByResultId = new Map(
        window.idlerGeneratedRecipes.map(recipe => [recipe.resultItemId, recipe])
    );

    recipes.forEach((recipe, index) => {
        const generated = generatedByResultId.get(recipe.resultItemId);

        if (!generated) {
            return;
        }

        recipes[index] = {
            ...recipe,
            ...generated,
            materials: generated.materials || recipe.materials || [],
        };

        if (typeof items !== "undefined") {
            const resultItem = items[recipe.resultItemId];
            if (resultItem?.type === "ring") {
                recipes[index].category = "jeweler";
                recipes[index].subcategory = "ring";
            } else if (resultItem?.type === "amulet") {
                recipes[index].category = "jeweler";
                recipes[index].subcategory = "amulet";
            } else if (resultItem?.type === "talisman") {
                recipes[index].category = "shaman";
                recipes[index].subcategory = "talisman";
            }
        }

        generatedByResultId.delete(recipe.resultItemId);
    });

    generatedByResultId.forEach(generated => {
        if (typeof items !== "undefined") {
            const resultItem = items[generated.resultItemId];
            if (resultItem?.type === "ring") {
                generated.category = "jeweler";
                generated.subcategory = "ring";
            } else if (resultItem?.type === "amulet") {
                generated.category = "jeweler";
                generated.subcategory = "amulet";
            } else if (resultItem?.type === "talisman") {
                generated.category = "shaman";
                generated.subcategory = "talisman";
            }
        }
        recipes.push(generated);
    });
})();
"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("workbook", nargs="?", type=Path, default=Path("crafting/crafting_recipes.xlsx"))
    ap.add_argument("--items-js", type=Path, default=Path("js/data/items.js"))
    ap.add_argument("--output", type=Path, default=Path("js/generated"))
    ap.add_argument("--locations-dir", type=Path, default=Path("js/data/locations"), help="Folder with location JS files containing enemies/boss loot.")
    ap.add_argument("--merchant-workbook", type=Path, default=Path("crafting/itemy_kupca.xlsx"),
                    help="Excel with merchant weapon damage overrides.")
    ap.add_argument("--craft-workbook", type=Path, default=Path("crafting/itemy_craft.xlsx"),
                    help="Excel with crafted weapon damage overrides.")
    args = ap.parse_args()

    if not args.workbook.exists():
        print(f"Workbook not found: {args.workbook}", file=sys.stderr)
        return 2

    sheets = load_xlsm(args.workbook)
    existing_items, name_to_id = load_existing_items(args.items_js)
    warnings: list[str] = []

    merchant_overrides = load_damage_workbook(
        args.merchant_workbook, existing_items, warnings, "itemy_kupca.xlsx"
    )
    craft_overrides = load_damage_workbook(
        args.craft_workbook, existing_items, warnings, "itemy_craft.xlsx"
    )

    locations = load_location_loot(args.locations_dir, existing_items, warnings)
    # V20: cost/EXP/time are read directly from each Recipes_* sheet.
    recipe_costs = {}
    generator_config = load_generator_config(sheets)
    recipes = []

    # Preferred source: clean standardized Recipes_* sheets.
    structured_sheets = [s for s in sheets.keys() if s.startswith("Recipes_")]
    if structured_sheets:
        for sheet_name in sorted(structured_sheets):
            recipes.extend(parse_structured_recipe_sheet(
                sheets.get(sheet_name) or {},
                sheet_name,
                name_to_id,
                warnings,
                locations,
                generator_config
            ))
        # Skip all legacy-sheet parsing when the structured source exists.
        normalized_rows = []
    else:
        normalized_rows = None

    # "Crafting Recipes" in the current master workbook is an overview/index
    # sheet. The real recipe data lives in Bronie, Biżuteria and Pancerze.
    # Only use the normalized parser when that sheet actually contains the
    # detailed recipe columns.
    crafting_sheet = sheets.get("Crafting Recipes") or {}
    crafting_header = row_list(crafting_sheet, 1, 30)
    has_detailed_crafting_columns = (
        "kategoria" in {norm(v) for v in crafting_header}
        and (
            "koszt złota" in {norm(v) for v in crafting_header}
            or "exp craftingu" in {norm(v) for v in crafting_header}
        )
    )

    if not structured_sheets:
        normalized_rows = (
            load_crafting_recipes_table(sheets)
            if has_detailed_crafting_columns
            else []
        )

    merchant_map = merchant_base_mapping(sheets)
    generator_config.update(merchant_map)

    # Płatnerz uses recipe labels instead of the actual item names.
    # Keep this exception in one place so the Excel structure stays clean.
    generator_config.update({
        "płatnerz t1": "wolf_armor",
        "płatnerz t2": "kobold_armor",
        "płatnerz t3": "guardian_armor",
        "płatnerz t4": "steel_guardian_armor",
        "płatnerz t5": "elite_guardian_armor",
        "płatnerz t6": "commander_armor",
        "płatnerz t7": "dragon_armor",
    })

    if not structured_sheets and normalized_rows:
        for raw in normalized_rows:
            result_name = raw["name"]

            # Excel "Result itemId" is authoritative.
            # It must be used before resolving the recipe name, because
            # recipe names like "Płatnerz t1" are not item names.
            result_id = raw["resultItemId"]
            category, subcategory = resolve_profession_and_subcategory(result_id, result_name, existing_items)

            # Authoritative fallback from the item type. This is especially
            # important for jewelry because the UI expects the profession
            # category "jeweler", not the equipment type "ring".
            result_item = existing_items.get(result_id, {})
            result_type = norm(result_item.get("type", ""))
            if result_type == "ring":
                category, subcategory = "jeweler", "ring"
            elif result_type == "amulet":
                category, subcategory = "jeweler", "amulet"
            elif result_type == "talisman":
                category, subcategory = "shaman", "talisman"

            category = category or raw["category"]
            subcategory = subcategory or raw.get("subcategory")

            materials = []
            used_item_ids = set()

            base_name = raw["_baseName"]
            for role, material_data in raw["_materialRows"]:
                if not material_data:
                    continue
                material_name, quantity = material_data
                mat = parse_material(
                    material_name,
                    name_to_id,
                    role,
                    warnings,
                    f"Crafting Recipes {result_name} {role}",
                    locations,
                    category,
                    result_name,
                    len(materials),
                    used_item_ids,
                )
                if mat:
                    # Preserve explicit quantity from the normalized sheet.
                    mat["quantity"] = quantity
                    materials.append(mat)
                    used_item_ids.add(mat["itemId"])

            materials = [
                m for m in materials
                if m.get("itemId") and not str(m.get("itemId", "")).startswith("__UNRESOLVED_BASE__")
            ]

            recipes.append({
                "id": f"{result_id}_recipe",
                "name": result_name,
                "resultItemId": result_id,
                "category": category,
                "subcategory": subcategory,
                "tier": raw["tier"],
                "requiredPlayerLevel": raw["requiredPlayerLevel"],
                "requiredCraftingLevel": raw["requiredCraftingLevel"],
                "goldCost": raw["goldCost"],
                "craftingExp": raw["craftingExp"],
                "craftingTimeSeconds": raw["craftingTimeSeconds"],
                "requiresScroll": raw["requiresScroll"],
                "unlockCost": raw["unlockCost"],
                "materials": materials,
                "_baseName": base_name,
                "_source": raw["_source"],
            })
    elif not structured_sheets:
        for sheet_name in ["Bronie", "Biżuteria", "Pancerze"]:
            rows = sheets.get(sheet_name)
            if not rows:
                warnings.append(f"Brak arkusza {sheet_name}.")
                continue
            blocks = detect_blocks(rows, 3)
            for start, end, title, header in blocks:
                recipes.extend(parse_block(
                    rows, start, header, title, sheet_name, name_to_id,
                    warnings, locations, recipe_costs, generator_config
                ))


    resolve_tier_bases(recipes, name_to_id, generator_config)
    generated_items = build_generated_items(recipes, existing_items, name_to_id)

    # Standalone weapon workbooks are authoritative for weapon damage.
    # We copy the full existing item definition and replace only ``damage``
    # so no rarity/type/stat metadata is lost.
    generated_items.update(merchant_overrides)
    generated_items.update(craft_overrides)

    # Costs are explicit data in Recipes_*; never guess them.
    for r in recipes:
        if r["goldCost"] is None:
            warnings.append(f"{r['name']}: brak Gold Cost w arkuszu Recipes_*.")
        if r["craftingExp"] is None:
            warnings.append(f"{r['name']}: brak Crafting EXP w arkuszu Recipes_*.")
        if r["craftingTimeSeconds"] is None:
            warnings.append(f"{r['name']}: brak Crafting Time (s) w arkuszu Recipes_*.")

    # Validate duplicate IDs.
    seen = set()
    for r in recipes:
        if r["resultItemId"] in seen:
            warnings.append(f"Duplikat resultItemId: {r['resultItemId']}")
        seen.add(r["resultItemId"])
        for mat in r["materials"]:
            if "itemId" in mat and str(mat["itemId"]).startswith("__"):
                warnings.append(f"{r['name']}: nierozwiązany materiał {mat['itemId']}")

    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "recipes.generated.js").write_text(render_recipes_js(recipes), encoding="utf-8")
    (args.output / "items.generated.js").write_text(render_items_js(generated_items), encoding="utf-8")
    (args.output / "recipeLoader.js").write_text(render_loader_js(), encoding="utf-8")

    report = {
        "workbook": str(args.workbook),
        "recipeCount": len(recipes),
        "generatedItemCount": len(generated_items),
        "merchantDamageOverrideCount": len(merchant_overrides),
        "craftDamageOverrideCount": len(craft_overrides),
        "merchantWorkbook": str(args.merchant_workbook),
        "craftWorkbook": str(args.craft_workbook),
        "warnings": warnings,
        "recipes": recipes,
        "generatedItems": list(generated_items.values()),
    }
    (args.output / "generation-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Generated recipes: {len(recipes)}")
    print(f"Generated item entries: {len(generated_items)}")
    print(f"Merchant damage overrides: {len(merchant_overrides)}")
    print(f"Craft damage overrides: {len(craft_overrides)}")
    print(f"Warnings: {len(warnings)}")
    for warning in warnings[:25]:
        print("WARNING:", warning)
    if len(warnings) > 25:
        print(f"... and {len(warnings)-25} more warnings")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
