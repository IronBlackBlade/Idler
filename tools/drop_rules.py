"""Rules used by the recipe generator to rank monster-drop materials."""

COMMON_STOP_WORDS = {
    'the', 'and', 'of', 'from', 'with', 'to', 'a', 'an',
    't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't12', 't13', 't14'
}

CATEGORY_RULES = {
    'sword': {
        'preferred': ['fang', 'claw', 'tooth', 'bone', 'shell', 'fragment', 'blade', 'plate', 'scale'],
        'avoid': ['wing', 'feather', 'venom', 'silk'],
    },
    'mace': {
        'preferred': ['bone', 'rock', 'stone', 'core', 'horn', 'shell', 'plate', 'fragment'],
        'avoid': ['feather', 'silk'],
    },
    'wand': {
        'preferred': ['crystal', 'essence', 'shard', 'feather', 'wing', 'core', 'spore'],
        'avoid': ['tail', 'ear'],
    },
    'bow': {
        'preferred': ['fur', 'skin', 'hide', 'feather', 'wing', 'silk', 'sinew', 'claw', 'tendon'],
        'avoid': ['rock', 'stone', 'plate'],
    },
    'crossbow': {
        'preferred': ['bone', 'claw', 'tooth', 'horn', 'silk', 'sinew', 'core', 'fragment'],
        'avoid': ['feather', 'wing'],
    },
    'shield': {
        'preferred': ['shell', 'plate', 'scale', 'bone', 'stone', 'rock', 'core'],
        'avoid': ['feather', 'silk', 'wing'],
    },
    'helmet': {
        'preferred': ['shell', 'plate', 'scale', 'bone', 'skin', 'fur', 'horn'],
        'avoid': ['venom', 'spore'],
    },
    'armor': {
        'preferred': ['skin', 'hide', 'shell', 'plate', 'scale', 'fur', 'bone'],
        'avoid': ['feather', 'venom'],
    },
    'pants': {
        'preferred': ['skin', 'hide', 'fur', 'silk', 'wool', 'bone'],
        'avoid': ['rock', 'core'],
    },
    'boots': {
        'preferred': ['skin', 'hide', 'fur', 'leather', 'claw', 'sinew'],
        'avoid': ['feather', 'rock', 'stone'],
    },
    'gloves': {
        'preferred': ['skin', 'hide', 'fur', 'claw', 'silk', 'bone'],
        'avoid': ['rock', 'stone'],
    },
    'ring': {
        'preferred': ['crystal', 'gem', 'essence', 'shard', 'fang', 'claw', 'core'],
        'avoid': ['fur', 'skin', 'wool'],
    },
    'amulet': {
        'preferred': ['crystal', 'gem', 'essence', 'shard', 'core', 'feather', 'venom'],
        'avoid': ['wool', 'fur'],
    },
    'talisman': {
        'preferred': ['crystal', 'essence', 'shard', 'core', 'feather', 'fang', 'claw'],
        'avoid': ['rock', 'stone'],
    },
}

GLOBAL_PREFERRED = ['crystal', 'essence', 'core', 'fragment', 'scale', 'plate', 'shell', 'fang', 'claw', 'tooth', 'bone', 'skin', 'fur', 'feather', 'silk']
GLOBAL_AVOID = ['coin', 'pouch', 'recipe', 'key', 'trophy']


def score_material(category: str, item_id: str, item_name: str, rarity: str, drop_chance: float, result_name: str = "") -> int:
    text = f"{item_id} {item_name}".lower()
    rules = CATEGORY_RULES.get(category, {})
    score = 0

    # Strong category affinity.
    for idx, keyword in enumerate(rules.get('preferred', [])):
        if keyword in text:
            score += 40 - min(idx * 2, 24)

    for keyword in rules.get('avoid', []):
        if keyword in text:
            score -= 20

    for idx, keyword in enumerate(GLOBAL_PREFERRED):
        if keyword in text:
            score += 8 - min(idx // 3, 5)

    for keyword in GLOBAL_AVOID:
        if keyword in text:
            score -= 100

    # Small semantic bonus when the material itself matches the crafted item.
    result_text = str(result_name or "").lower()
    semantic_pairs = {
        "smoczy": ["dragon", "scale", "claw", "fang"],
        "wilczy": ["wolf", "fur", "fang", "claw"],
        "lodow": ["ice", "frost", "snow", "wolf"],
        "ognist": ["lava", "fire", "burn", "flame"],
        "cieni": ["shadow", "void", "dark"],
        "kryształ": ["crystal", "gem", "shard"],
        "krysztal": ["crystal", "gem", "shard"],
    }
    for polish_fragment, english_keywords in semantic_pairs.items():
        if polish_fragment in result_text and any(k in text for k in english_keywords):
            score += 12

    rarity_bonus = {
        'legendary': 18,
        'epic': 14,
        'rare': 10,
        'uncommon': 5,
        'common': 0,
    }.get(str(rarity).lower(), 0)
    score += rarity_bonus

    # Slightly prefer reasonably attainable drops, without allowing chance to dominate.
    try:
        score += min(10, max(0, float(drop_chance) / 10))
    except (TypeError, ValueError):
        pass

    return round(score)
