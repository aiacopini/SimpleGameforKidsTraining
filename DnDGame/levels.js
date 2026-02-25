// ============================================================
// LEVELS.JS - All 5 level definitions with maps and encounters
// Dungeons of Drakenmoor
// ============================================================

const LEVEL_INFO = [
    {
        name: 'The Goblin Caves',
        desc: 'A network of foul tunnels beneath the Drakenmoor hills. Goblins have been raiding nearby villages...',
        theme: 'goblin_cave',
        music: 'goblin_cave',
        bossMusic: 'boss',
        floor: 'Level 1 of 5',
    },
    {
        name: 'The Enchanted Forest',
        desc: 'An ancient woodland corrupted by dark magic. The trees themselves have turned hostile...',
        theme: 'enchanted_forest',
        music: 'enchanted_forest',
        bossMusic: 'boss',
        floor: 'Level 2 of 5',
    },
    {
        name: 'The Undead Crypt',
        desc: 'Deep beneath a forgotten cathedral, the dead do not rest. A lich commands an army of bones...',
        theme: 'undead_crypt',
        music: 'undead_crypt',
        bossMusic: 'boss',
        floor: 'Level 3 of 5',
    },
    {
        name: "The Dragon's Volcano",
        desc: 'A molten hellscape where fire drakes hunt and an ancient red dragon guards its hoard...',
        theme: 'dragon_volcano',
        music: 'dragon_volcano',
        bossMusic: 'boss',
        floor: 'Level 4 of 5',
    },
    {
        name: "The Dark Lord's Castle",
        desc: 'The final bastion of evil. Shadow and death lurk in every corridor. The Dark Lord awaits...',
        theme: 'dark_castle',
        music: 'dark_castle',
        bossMusic: 'boss',
        floor: 'Level 5 of 5 — FINAL',
    },
];

// Map legend for building:
// 0=void, 1=floor, 2=wall, 3=wall_top, 4=door, 5=chest, 6=stairs, 7=trap
// 8=water, 9=lava, 10=pillar, 11=torch, 12=boss_door, 13=entrance, 14=rubble, 15=bone_pile

function generateLevel(levelIndex) {
    // Each level is a hand-designed dungeon
    switch (levelIndex) {
        case 0: return generateGoblinCave();
        case 1: return generateEnchantedForest();
        case 2: return generateUndeadCrypt();
        case 3: return generateDragonVolcano();
        case 4: return generateDarkCastle();
        default: return generateGoblinCave();
    }
}

function generateGoblinCave() {
    const W = 40, H = 35;
    const tiles = new Array(W * H).fill(T.VOID);
    const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = t; };
    const fill = (x1, y1, x2, y2, t) => { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) set(x, y, t); };
    const walls = (x1, y1, x2, y2) => {
        for (let x = x1; x <= x2; x++) { set(x, y1, T.WALL_TOP); set(x, y2, T.WALL); }
        for (let y = y1; y <= y2; y++) { set(x1, y, T.WALL); set(x2, y, T.WALL); }
    };
    const room = (x1, y1, x2, y2) => { fill(x1, y1, x2, y2, T.FLOOR); walls(x1, y1, x2, y2); };

    // Room 1 - Entrance
    room(2, 2, 10, 8);
    set(6, 5, T.ENTRANCE);
    set(4, 3, T.TORCH); set(8, 3, T.TORCH);

    // Corridor to Room 2
    fill(10, 4, 14, 6, T.FLOOR);
    set(10, 4, T.WALL_TOP); set(10, 6, T.WALL);
    set(14, 4, T.WALL_TOP); set(14, 6, T.WALL);
    set(10, 5, T.DOOR);

    // Room 2 - Guard room
    room(14, 1, 24, 10);
    set(17, 2, T.TORCH); set(21, 2, T.TORCH);
    set(19, 5, T.PILLAR); set(16, 8, T.RUBBLE); set(22, 3, T.RUBBLE);

    // Corridor south
    fill(18, 10, 20, 14, T.FLOOR);
    set(18, 10, T.WALL); set(20, 10, T.WALL);

    // Room 3 - Storage
    room(14, 14, 24, 20);
    set(16, 15, T.CHEST); set(22, 15, T.CHEST);
    set(19, 17, T.PILLAR);
    set(15, 18, T.TORCH); set(23, 18, T.TORCH);

    // Corridor east from Room 2
    fill(24, 4, 28, 6, T.FLOOR);
    set(24, 5, T.DOOR);

    // Room 4 - Shaman's quarters
    room(28, 1, 37, 10);
    set(30, 2, T.TORCH); set(35, 2, T.TORCH);
    set(32, 5, T.PILLAR); set(34, 8, T.BONE_PILE);
    set(36, 3, T.CHEST);

    // Corridor south from Room 4
    fill(32, 10, 34, 14, T.FLOOR);

    // Room 5 - Pit room with traps
    room(26, 14, 37, 22);
    set(28, 16, T.TRAP); set(30, 18, T.TRAP); set(33, 16, T.TRAP); set(35, 19, T.TRAP);
    set(27, 15, T.TORCH); set(36, 15, T.TORCH);
    set(31, 20, T.WATER); set(32, 20, T.WATER); set(33, 20, T.WATER);

    // Corridor south from Storage
    fill(18, 20, 20, 24, T.FLOOR);

    // Room 6 - Big room before boss
    room(10, 24, 26, 32);
    set(12, 25, T.TORCH); set(24, 25, T.TORCH); set(12, 31, T.TORCH); set(24, 31, T.TORCH);
    set(14, 28, T.PILLAR); set(22, 28, T.PILLAR);
    set(18, 26, T.RUBBLE); set(20, 30, T.BONE_PILE);
    set(13, 26, T.CHEST);

    // Corridor east to boss
    fill(26, 27, 29, 29, T.FLOOR);
    set(26, 28, T.BOSS_DOOR);

    // Room 7 - BOSS ROOM
    room(29, 24, 38, 33);
    set(31, 25, T.TORCH); set(36, 25, T.TORCH); set(31, 32, T.TORCH); set(36, 32, T.TORCH);
    set(33, 27, T.PILLAR); set(33, 31, T.PILLAR);
    set(36, 31, T.STAIRS);

    // Connect pit room to big room
    fill(30, 22, 32, 24, T.FLOOR);

    const enemies = [
        // Room 2 guards
        createEnemy(ENT.GOBLIN, 17 * TILE, 5 * TILE),
        createEnemy(ENT.GOBLIN, 21 * TILE, 4 * TILE),
        createEnemy(ENT.GOBLIN, 19 * TILE, 8 * TILE),
        // Room 3
        createEnemy(ENT.GOBLIN, 18 * TILE, 16 * TILE),
        createEnemy(ENT.GOBLIN_ARCHER, 20 * TILE, 18 * TILE),
        // Room 4 - shaman
        createEnemy(ENT.GOBLIN_SHAMAN, 33 * TILE, 5 * TILE),
        createEnemy(ENT.GOBLIN, 30 * TILE, 7 * TILE),
        createEnemy(ENT.WOLF, 35 * TILE, 3 * TILE),
        // Room 5 - pit room
        createEnemy(ENT.GOBLIN_ARCHER, 28 * TILE, 17 * TILE),
        createEnemy(ENT.GOBLIN, 34 * TILE, 16 * TILE),
        createEnemy(ENT.WOLF, 30 * TILE, 20 * TILE),
        // Room 6 - pre-boss
        createEnemy(ENT.GOBLIN, 13 * TILE, 27 * TILE),
        createEnemy(ENT.GOBLIN, 23 * TILE, 27 * TILE),
        createEnemy(ENT.GOBLIN_ARCHER, 18 * TILE, 26 * TILE),
        createEnemy(ENT.GOBLIN_SHAMAN, 16 * TILE, 30 * TILE),
        createEnemy(ENT.WOLF, 21 * TILE, 30 * TILE),
        // Boss room
        createEnemy(ENT.GOBLIN_KING, 34 * TILE, 28 * TILE),
    ];

    const chests = [
        { x: 16, y: 15, opened: false, loot: [{ ...ITEM_DEFS.health_potion, count: 2 }] },
        { x: 22, y: 15, opened: false, loot: [{ ...ITEM_DEFS.gold_large, count: 1 }] },
        { x: 36, y: 3, opened: false, loot: [{ ...ITEM_DEFS.mana_potion, count: 2 }] },
        { x: 13, y: 26, opened: false, loot: [{ ...ITEM_DEFS.strength_elixir, count: 1 }] },
    ];

    return {
        width: W, height: H, tiles, enemies, chests,
        playerStart: { x: 6 * TILE, y: 5 * TILE },
        bossRoom: { x: 29, y: 24, w: 10, h: 10 },
        stairs: { x: 36, y: 31 },
    };
}

function generateEnchantedForest() {
    const W = 42, H = 38;
    const tiles = new Array(W * H).fill(T.VOID);
    const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = t; };
    const fill = (x1, y1, x2, y2, t) => { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) set(x, y, t); };
    const walls = (x1, y1, x2, y2) => {
        for (let x = x1; x <= x2; x++) { set(x, y1, T.WALL_TOP); set(x, y2, T.WALL); }
        for (let y = y1; y <= y2; y++) { set(x1, y, T.WALL); set(x2, y, T.WALL); }
    };
    const room = (x1, y1, x2, y2) => { fill(x1, y1, x2, y2, T.FLOOR); walls(x1, y1, x2, y2); };

    // Forest clearing - entrance
    room(2, 2, 12, 10);
    set(7, 6, T.ENTRANCE);
    set(4, 3, T.TORCH); set(10, 3, T.TORCH);
    set(5, 8, T.WATER); set(6, 8, T.WATER); set(7, 8, T.WATER);

    // Path east
    fill(12, 5, 16, 7, T.FLOOR);
    set(12, 6, T.DOOR);

    // Mushroom grove
    room(16, 2, 26, 12);
    set(18, 3, T.TORCH); set(24, 3, T.TORCH);
    set(20, 6, T.PILLAR); set(22, 8, T.PILLAR); // Mushroom pillars
    set(19, 10, T.WATER); set(20, 10, T.WATER);
    set(24, 5, T.CHEST);

    // Path south
    fill(20, 12, 22, 16, T.FLOOR);

    // Spider's nest
    room(14, 16, 28, 24);
    set(16, 17, T.TORCH); set(26, 17, T.TORCH);
    set(18, 20, T.RUBBLE); set(24, 22, T.RUBBLE);
    set(20, 19, T.TRAP); set(22, 21, T.TRAP);
    set(26, 23, T.CHEST);

    // Path east from mushroom grove
    fill(26, 6, 30, 8, T.FLOOR);
    set(26, 7, T.DOOR);

    // Treant grove
    room(30, 2, 39, 12);
    set(32, 3, T.TORCH); set(37, 3, T.TORCH);
    set(34, 6, T.PILLAR); set(36, 9, T.PILLAR);
    set(32, 10, T.WATER); set(33, 10, T.WATER); set(34, 10, T.WATER);
    set(38, 4, T.CHEST);

    // Path south from treant grove
    fill(34, 12, 36, 16, T.FLOOR);

    // Fairy glade
    room(30, 16, 39, 24);
    set(32, 17, T.TORCH); set(37, 17, T.TORCH);
    set(34, 20, T.WATER); set(35, 20, T.WATER); set(36, 20, T.WATER);
    set(34, 21, T.WATER); set(35, 21, T.WATER);

    // Connect spider nest to fairy glade
    fill(28, 19, 30, 21, T.FLOOR);
    set(28, 20, T.DOOR);

    // Path south from spider nest
    fill(20, 24, 22, 28, T.FLOOR);

    // Grand clearing (pre-boss)
    room(10, 28, 28, 36);
    set(12, 29, T.TORCH); set(26, 29, T.TORCH); set(12, 35, T.TORCH); set(26, 35, T.TORCH);
    set(16, 32, T.PILLAR); set(22, 32, T.PILLAR);
    set(18, 30, T.WATER); set(19, 30, T.WATER); set(20, 30, T.WATER);
    set(14, 34, T.CHEST);

    // Boss corridor
    fill(28, 31, 31, 33, T.FLOOR);
    set(28, 32, T.BOSS_DOOR);

    // Boss room - Guardian's sanctum
    room(31, 28, 40, 37);
    set(33, 29, T.TORCH); set(38, 29, T.TORCH); set(33, 36, T.TORCH); set(38, 36, T.TORCH);
    set(35, 31, T.PILLAR); set(35, 35, T.PILLAR);
    set(38, 35, T.STAIRS);

    const enemies = [
        // Mushroom grove
        createEnemy(ENT.SPIDER, 19 * TILE, 5 * TILE),
        createEnemy(ENT.SPIDER, 23 * TILE, 8 * TILE),
        createEnemy(ENT.FAIRY, 21 * TILE, 4 * TILE),
        // Spider's nest
        createEnemy(ENT.SPIDER, 17 * TILE, 18 * TILE),
        createEnemy(ENT.SPIDER, 22 * TILE, 20 * TILE),
        createEnemy(ENT.SPIDER, 25 * TILE, 18 * TILE),
        createEnemy(ENT.SPIDER, 19 * TILE, 22 * TILE),
        // Treant grove
        createEnemy(ENT.TREANT, 33 * TILE, 5 * TILE),
        createEnemy(ENT.TREANT, 37 * TILE, 8 * TILE),
        createEnemy(ENT.FAIRY, 35 * TILE, 4 * TILE),
        // Fairy glade
        createEnemy(ENT.FAIRY, 33 * TILE, 19 * TILE),
        createEnemy(ENT.FAIRY, 36 * TILE, 21 * TILE),
        createEnemy(ENT.SPIDER, 32 * TILE, 22 * TILE),
        // Pre-boss clearing
        createEnemy(ENT.TREANT, 14 * TILE, 31 * TILE),
        createEnemy(ENT.SPIDER, 24 * TILE, 31 * TILE),
        createEnemy(ENT.FAIRY, 18 * TILE, 34 * TILE),
        createEnemy(ENT.SPIDER, 22 * TILE, 34 * TILE),
        createEnemy(ENT.TREANT, 12 * TILE, 33 * TILE),
        // Boss
        createEnemy(ENT.FOREST_GUARDIAN, 35 * TILE, 32 * TILE),
    ];

    const chests = [
        { x: 24, y: 5, opened: false, loot: [{ ...ITEM_DEFS.health_potion, count: 2 }] },
        { x: 26, y: 23, opened: false, loot: [{ ...ITEM_DEFS.mana_potion, count: 2 }] },
        { x: 38, y: 4, opened: false, loot: [{ ...ITEM_DEFS.strength_elixir, count: 1 }] },
        { x: 14, y: 34, opened: false, loot: [{ ...ITEM_DEFS.health_potion, count: 3 }] },
    ];

    return {
        width: W, height: H, tiles, enemies, chests,
        playerStart: { x: 7 * TILE, y: 6 * TILE },
        bossRoom: { x: 31, y: 28, w: 10, h: 10 },
        stairs: { x: 38, y: 35 },
    };
}

function generateUndeadCrypt() {
    const W = 44, H = 38;
    const tiles = new Array(W * H).fill(T.VOID);
    const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = t; };
    const fill = (x1, y1, x2, y2, t) => { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) set(x, y, t); };
    const walls = (x1, y1, x2, y2) => {
        for (let x = x1; x <= x2; x++) { set(x, y1, T.WALL_TOP); set(x, y2, T.WALL); }
        for (let y = y1; y <= y2; y++) { set(x1, y, T.WALL); set(x2, y, T.WALL); }
    };
    const room = (x1, y1, x2, y2) => { fill(x1, y1, x2, y2, T.FLOOR); walls(x1, y1, x2, y2); };

    // Crypt entrance
    room(2, 2, 12, 10);
    set(7, 6, T.ENTRANCE);
    set(4, 3, T.TORCH); set(10, 3, T.TORCH);
    set(5, 8, T.BONE_PILE); set(9, 8, T.BONE_PILE);

    // Corridor
    fill(12, 5, 16, 7, T.FLOOR);
    set(12, 6, T.DOOR);

    // Ossuary
    room(16, 1, 28, 12);
    set(18, 2, T.TORCH); set(26, 2, T.TORCH);
    set(20, 5, T.PILLAR); set(24, 5, T.PILLAR); set(22, 9, T.PILLAR);
    set(18, 10, T.BONE_PILE); set(23, 3, T.BONE_PILE); set(26, 10, T.BONE_PILE);
    set(17, 4, T.CHEST);

    // Corridor south
    fill(21, 12, 23, 16, T.FLOOR);

    // Burial chamber
    room(14, 16, 30, 24);
    set(16, 17, T.TORCH); set(28, 17, T.TORCH); set(16, 23, T.TORCH); set(28, 23, T.TORCH);
    set(18, 20, T.PILLAR); set(26, 20, T.PILLAR);
    set(20, 18, T.BONE_PILE); set(24, 22, T.BONE_PILE);
    set(22, 17, T.TRAP); set(20, 21, T.TRAP); set(24, 19, T.TRAP);
    set(29, 22, T.CHEST);

    // East wing
    fill(30, 5, 34, 7, T.FLOOR);
    fill(28, 5, 30, 7, T.FLOOR);
    set(28, 6, T.DOOR);

    // Wraith hall
    room(34, 2, 42, 12);
    set(36, 3, T.TORCH); set(40, 3, T.TORCH);
    set(38, 6, T.PILLAR); set(36, 9, T.PILLAR); set(40, 9, T.PILLAR);
    set(37, 4, T.WATER); set(38, 4, T.WATER); set(39, 4, T.WATER);
    set(41, 5, T.CHEST);

    // South from wraith hall
    fill(37, 12, 39, 16, T.FLOOR);

    // Dark chapel
    room(32, 16, 42, 24);
    set(34, 17, T.TORCH); set(40, 17, T.TORCH);
    set(36, 20, T.PILLAR); set(38, 20, T.PILLAR); set(40, 20, T.PILLAR);
    set(35, 22, T.BONE_PILE); set(39, 22, T.BONE_PILE);

    // Connect burial chamber to dark chapel
    fill(30, 19, 32, 21, T.FLOOR);
    set(30, 20, T.DOOR);

    // South corridor to boss area
    fill(21, 24, 23, 28, T.FLOOR);

    // Pre-boss hall
    room(10, 28, 30, 36);
    set(12, 29, T.TORCH); set(28, 29, T.TORCH); set(12, 35, T.TORCH); set(28, 35, T.TORCH);
    set(16, 32, T.PILLAR); set(24, 32, T.PILLAR); set(20, 30, T.PILLAR);
    set(14, 34, T.BONE_PILE); set(26, 34, T.BONE_PILE);
    set(15, 30, T.CHEST);

    // Boss corridor
    fill(30, 31, 33, 33, T.FLOOR);
    set(30, 32, T.BOSS_DOOR);

    // Lich's sanctum
    room(33, 28, 42, 37);
    set(35, 29, T.TORCH); set(40, 29, T.TORCH); set(35, 36, T.TORCH); set(40, 36, T.TORCH);
    set(37, 31, T.PILLAR); set(37, 35, T.PILLAR);
    set(40, 35, T.STAIRS);

    const enemies = [
        // Ossuary
        createEnemy(ENT.SKELETON, 19 * TILE, 5 * TILE),
        createEnemy(ENT.SKELETON, 25 * TILE, 8 * TILE),
        createEnemy(ENT.ZOMBIE, 22 * TILE, 4 * TILE),
        // Burial chamber
        createEnemy(ENT.SKELETON, 17 * TILE, 19 * TILE),
        createEnemy(ENT.SKELETON, 27 * TILE, 19 * TILE),
        createEnemy(ENT.ZOMBIE, 22 * TILE, 22 * TILE),
        createEnemy(ENT.SKELETON_MAGE, 20 * TILE, 18 * TILE),
        // Wraith hall
        createEnemy(ENT.WRAITH, 37 * TILE, 6 * TILE),
        createEnemy(ENT.WRAITH, 39 * TILE, 9 * TILE),
        createEnemy(ENT.SKELETON, 36 * TILE, 4 * TILE),
        // Dark chapel
        createEnemy(ENT.SKELETON_MAGE, 36 * TILE, 18 * TILE),
        createEnemy(ENT.ZOMBIE, 39 * TILE, 21 * TILE),
        createEnemy(ENT.WRAITH, 34 * TILE, 22 * TILE),
        createEnemy(ENT.SKELETON, 38 * TILE, 18 * TILE),
        // Pre-boss hall
        createEnemy(ENT.SKELETON, 14 * TILE, 31 * TILE),
        createEnemy(ENT.SKELETON, 26 * TILE, 31 * TILE),
        createEnemy(ENT.ZOMBIE, 18 * TILE, 34 * TILE),
        createEnemy(ENT.SKELETON_MAGE, 22 * TILE, 30 * TILE),
        createEnemy(ENT.WRAITH, 20 * TILE, 34 * TILE),
        // Boss
        createEnemy(ENT.LICH, 38 * TILE, 32 * TILE),
    ];

    const chests = [
        { x: 17, y: 4, opened: false, loot: [{ ...ITEM_DEFS.health_potion, count: 2 }] },
        { x: 29, y: 22, opened: false, loot: [{ ...ITEM_DEFS.mana_potion, count: 3 }] },
        { x: 41, y: 5, opened: false, loot: [{ ...ITEM_DEFS.strength_elixir, count: 1 }] },
        { x: 15, y: 30, opened: false, loot: [{ ...ITEM_DEFS.health_potion, count: 3 }] },
    ];

    return {
        width: W, height: H, tiles, enemies, chests,
        playerStart: { x: 7 * TILE, y: 6 * TILE },
        bossRoom: { x: 33, y: 28, w: 10, h: 10 },
        stairs: { x: 40, y: 35 },
    };
}

function generateDragonVolcano() {
    const W = 44, H = 40;
    const tiles = new Array(W * H).fill(T.VOID);
    const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = t; };
    const fill = (x1, y1, x2, y2, t) => { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) set(x, y, t); };
    const walls = (x1, y1, x2, y2) => {
        for (let x = x1; x <= x2; x++) { set(x, y1, T.WALL_TOP); set(x, y2, T.WALL); }
        for (let y = y1; y <= y2; y++) { set(x1, y, T.WALL); set(x2, y, T.WALL); }
    };
    const room = (x1, y1, x2, y2) => { fill(x1, y1, x2, y2, T.FLOOR); walls(x1, y1, x2, y2); };

    // Volcano entrance
    room(2, 2, 12, 10);
    set(7, 6, T.ENTRANCE);
    set(4, 3, T.TORCH); set(10, 3, T.TORCH);
    set(5, 9, T.LAVA); set(6, 9, T.LAVA);

    // Lava corridor
    fill(12, 5, 16, 7, T.FLOOR);
    set(12, 6, T.DOOR);
    set(14, 5, T.LAVA);

    // Fire imp cavern
    room(16, 1, 28, 12);
    set(18, 2, T.TORCH); set(26, 2, T.TORCH);
    set(20, 6, T.LAVA); set(21, 6, T.LAVA); set(22, 6, T.LAVA);
    set(20, 7, T.LAVA); set(21, 7, T.LAVA);
    set(25, 9, T.LAVA); set(26, 9, T.LAVA);
    set(24, 4, T.PILLAR); set(18, 8, T.RUBBLE);
    set(27, 3, T.CHEST);

    // South corridor
    fill(21, 12, 23, 16, T.FLOOR);

    // Golem forge
    room(14, 16, 30, 26);
    set(16, 17, T.TORCH); set(28, 17, T.TORCH);
    set(20, 20, T.LAVA); set(21, 20, T.LAVA); set(22, 20, T.LAVA); set(23, 20, T.LAVA); set(24, 20, T.LAVA);
    set(20, 21, T.LAVA); set(21, 21, T.LAVA); set(22, 21, T.LAVA); set(23, 21, T.LAVA); set(24, 21, T.LAVA);
    set(18, 18, T.PILLAR); set(26, 18, T.PILLAR); set(18, 24, T.PILLAR); set(26, 24, T.PILLAR);
    set(15, 24, T.CHEST);
    set(22, 18, T.TRAP); set(22, 24, T.TRAP);

    // East wing
    fill(28, 6, 32, 8, T.FLOOR);
    set(28, 7, T.DOOR);

    // Drake den
    room(32, 2, 42, 12);
    set(34, 3, T.TORCH); set(40, 3, T.TORCH);
    set(36, 7, T.LAVA); set(37, 7, T.LAVA); set(38, 7, T.LAVA);
    set(36, 8, T.LAVA); set(37, 8, T.LAVA);
    set(34, 5, T.PILLAR); set(40, 9, T.RUBBLE);
    set(41, 4, T.CHEST);

    // South from drake den
    fill(36, 12, 38, 16, T.FLOOR);

    // Volcanic bridge
    room(32, 16, 42, 26);
    set(34, 17, T.TORCH); set(40, 17, T.TORCH);
    set(34, 19, T.LAVA); set(35, 19, T.LAVA); set(39, 19, T.LAVA); set(40, 19, T.LAVA);
    set(34, 23, T.LAVA); set(35, 23, T.LAVA); set(39, 23, T.LAVA); set(40, 23, T.LAVA);
    set(36, 21, T.PILLAR); set(38, 21, T.PILLAR);

    // Connect golem forge to volcanic bridge
    fill(30, 20, 32, 22, T.FLOOR);
    set(30, 21, T.DOOR);

    // South to boss area
    fill(21, 26, 23, 30, T.FLOOR);

    // Pre-boss - Dragon's hoard approach
    room(10, 30, 30, 38);
    set(12, 31, T.TORCH); set(28, 31, T.TORCH); set(12, 37, T.TORCH); set(28, 37, T.TORCH);
    set(16, 34, T.PILLAR); set(24, 34, T.PILLAR);
    set(18, 36, T.LAVA); set(19, 36, T.LAVA); set(20, 36, T.LAVA);
    set(22, 32, T.RUBBLE); set(26, 36, T.RUBBLE);
    set(14, 32, T.CHEST);

    // Boss corridor
    fill(30, 33, 33, 35, T.FLOOR);
    set(30, 34, T.BOSS_DOOR);

    // Dragon's lair
    room(33, 30, 43, 39);
    set(35, 31, T.TORCH); set(41, 31, T.TORCH); set(35, 38, T.TORCH); set(41, 38, T.TORCH);
    set(37, 33, T.LAVA); set(38, 33, T.LAVA); set(39, 33, T.LAVA);
    set(37, 37, T.PILLAR); set(41, 37, T.PILLAR);
    set(41, 37, T.STAIRS);

    const enemies = [
        // Fire imp cavern
        createEnemy(ENT.FIRE_IMP, 19 * TILE, 4 * TILE),
        createEnemy(ENT.FIRE_IMP, 25 * TILE, 3 * TILE),
        createEnemy(ENT.FIRE_IMP, 22 * TILE, 9 * TILE),
        // Golem forge
        createEnemy(ENT.LAVA_GOLEM, 17 * TILE, 19 * TILE),
        createEnemy(ENT.FIRE_IMP, 27 * TILE, 18 * TILE),
        createEnemy(ENT.FIRE_IMP, 16 * TILE, 23 * TILE),
        createEnemy(ENT.LAVA_GOLEM, 25 * TILE, 23 * TILE),
        // Drake den
        createEnemy(ENT.FIRE_DRAKE, 35 * TILE, 5 * TILE),
        createEnemy(ENT.FIRE_DRAKE, 39 * TILE, 8 * TILE),
        createEnemy(ENT.FIRE_IMP, 37 * TILE, 4 * TILE),
        // Volcanic bridge
        createEnemy(ENT.FIRE_IMP, 35 * TILE, 18 * TILE),
        createEnemy(ENT.LAVA_GOLEM, 38 * TILE, 22 * TILE),
        createEnemy(ENT.FIRE_DRAKE, 36 * TILE, 24 * TILE),
        // Pre-boss
        createEnemy(ENT.FIRE_IMP, 14 * TILE, 33 * TILE),
        createEnemy(ENT.LAVA_GOLEM, 26 * TILE, 33 * TILE),
        createEnemy(ENT.FIRE_DRAKE, 20 * TILE, 35 * TILE),
        createEnemy(ENT.FIRE_IMP, 16 * TILE, 36 * TILE),
        createEnemy(ENT.FIRE_IMP, 24 * TILE, 36 * TILE),
        // Boss
        createEnemy(ENT.RED_DRAGON, 37 * TILE, 34 * TILE),
    ];

    const chests = [
        { x: 27, y: 3, opened: false, loot: [{ ...ITEM_DEFS.health_potion, count: 3 }] },
        { x: 15, y: 24, opened: false, loot: [{ ...ITEM_DEFS.mana_potion, count: 3 }] },
        { x: 41, y: 4, opened: false, loot: [{ ...ITEM_DEFS.strength_elixir, count: 2 }] },
        { x: 14, y: 32, opened: false, loot: [{ ...ITEM_DEFS.health_potion, count: 3 }] },
    ];

    return {
        width: W, height: H, tiles, enemies, chests,
        playerStart: { x: 7 * TILE, y: 6 * TILE },
        bossRoom: { x: 33, y: 30, w: 11, h: 10 },
        stairs: { x: 41, y: 37 },
    };
}

function generateDarkCastle() {
    const W = 46, H = 42;
    const tiles = new Array(W * H).fill(T.VOID);
    const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = t; };
    const fill = (x1, y1, x2, y2, t) => { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) set(x, y, t); };
    const walls = (x1, y1, x2, y2) => {
        for (let x = x1; x <= x2; x++) { set(x, y1, T.WALL_TOP); set(x, y2, T.WALL); }
        for (let y = y1; y <= y2; y++) { set(x1, y, T.WALL); set(x2, y, T.WALL); }
    };
    const room = (x1, y1, x2, y2) => { fill(x1, y1, x2, y2, T.FLOOR); walls(x1, y1, x2, y2); };

    // Castle gatehouse
    room(2, 2, 14, 10);
    set(8, 6, T.ENTRANCE);
    set(4, 3, T.TORCH); set(12, 3, T.TORCH);
    set(6, 3, T.PILLAR); set(10, 3, T.PILLAR);

    // Main corridor
    fill(14, 5, 18, 7, T.FLOOR);
    set(14, 6, T.DOOR);

    // Great hall
    room(18, 1, 32, 14);
    set(20, 2, T.TORCH); set(30, 2, T.TORCH); set(20, 13, T.TORCH); set(30, 13, T.TORCH);
    set(22, 5, T.PILLAR); set(28, 5, T.PILLAR); set(22, 10, T.PILLAR); set(28, 10, T.PILLAR);
    set(25, 7, T.PILLAR);
    set(21, 3, T.BONE_PILE); set(29, 12, T.BONE_PILE);
    set(31, 4, T.CHEST);

    // East wing corridor
    fill(32, 6, 36, 8, T.FLOOR);
    set(32, 7, T.DOOR);

    // Armory
    room(36, 2, 44, 12);
    set(38, 3, T.TORCH); set(42, 3, T.TORCH);
    set(40, 6, T.PILLAR); set(38, 9, T.PILLAR); set(42, 9, T.PILLAR);
    set(37, 4, T.RUBBLE); set(43, 10, T.RUBBLE);
    set(43, 4, T.CHEST);

    // South from great hall
    fill(24, 14, 26, 18, T.FLOOR);

    // Throne antechamber
    room(16, 18, 34, 28);
    set(18, 19, T.TORCH); set(32, 19, T.TORCH); set(18, 27, T.TORCH); set(32, 27, T.TORCH);
    set(20, 22, T.PILLAR); set(30, 22, T.PILLAR); set(25, 20, T.PILLAR); set(25, 26, T.PILLAR);
    set(22, 20, T.TRAP); set(28, 24, T.TRAP); set(22, 26, T.TRAP); set(28, 20, T.TRAP);
    set(19, 26, T.CHEST);

    // South from armory
    fill(39, 12, 41, 18, T.FLOOR);

    // Shadow chamber
    room(36, 18, 44, 28);
    set(38, 19, T.TORCH); set(42, 19, T.TORCH);
    set(40, 22, T.PILLAR); set(38, 25, T.PILLAR); set(42, 25, T.PILLAR);
    set(37, 26, T.BONE_PILE); set(43, 20, T.BONE_PILE);
    set(43, 26, T.CHEST);

    // Connect antechamber to shadow chamber
    fill(34, 22, 36, 24, T.FLOOR);
    set(34, 23, T.DOOR);

    // South to boss approach
    fill(24, 28, 26, 32, T.FLOOR);

    // Grand corridor / boss approach
    room(10, 32, 32, 40);
    set(12, 33, T.TORCH); set(30, 33, T.TORCH); set(12, 39, T.TORCH); set(30, 39, T.TORCH);
    set(16, 36, T.PILLAR); set(26, 36, T.PILLAR); set(21, 34, T.PILLAR); set(21, 38, T.PILLAR);
    set(14, 38, T.BONE_PILE); set(28, 38, T.BONE_PILE);
    set(18, 34, T.TRAP); set(24, 38, T.TRAP);
    set(14, 34, T.CHEST);

    // Boss corridor
    fill(32, 35, 35, 37, T.FLOOR);
    set(32, 36, T.BOSS_DOOR);

    // Dark Lord's throne room
    room(35, 32, 45, 41);
    set(37, 33, T.TORCH); set(43, 33, T.TORCH); set(37, 40, T.TORCH); set(43, 40, T.TORCH);
    set(39, 35, T.PILLAR); set(41, 35, T.PILLAR); set(39, 39, T.PILLAR); set(41, 39, T.PILLAR);
    set(43, 39, T.STAIRS);

    const enemies = [
        // Great hall
        createEnemy(ENT.DARK_KNIGHT, 22 * TILE, 4 * TILE),
        createEnemy(ENT.DARK_KNIGHT, 28 * TILE, 8 * TILE),
        createEnemy(ENT.SHADOW_ASSASSIN, 25 * TILE, 11 * TILE),
        // Armory
        createEnemy(ENT.DARK_KNIGHT, 39 * TILE, 5 * TILE),
        createEnemy(ENT.DARK_KNIGHT, 41 * TILE, 9 * TILE),
        createEnemy(ENT.SHADOW_ASSASSIN, 38 * TILE, 8 * TILE),
        // Throne antechamber
        createEnemy(ENT.DARK_KNIGHT, 19 * TILE, 21 * TILE),
        createEnemy(ENT.DARK_KNIGHT, 31 * TILE, 21 * TILE),
        createEnemy(ENT.DEMON, 25 * TILE, 24 * TILE),
        createEnemy(ENT.SHADOW_ASSASSIN, 22 * TILE, 26 * TILE),
        createEnemy(ENT.SHADOW_ASSASSIN, 28 * TILE, 26 * TILE),
        // Shadow chamber
        createEnemy(ENT.DEMON, 40 * TILE, 21 * TILE),
        createEnemy(ENT.SHADOW_ASSASSIN, 38 * TILE, 24 * TILE),
        createEnemy(ENT.DARK_KNIGHT, 42 * TILE, 24 * TILE),
        // Boss approach
        createEnemy(ENT.DARK_KNIGHT, 14 * TILE, 35 * TILE),
        createEnemy(ENT.DARK_KNIGHT, 28 * TILE, 35 * TILE),
        createEnemy(ENT.DEMON, 20 * TILE, 37 * TILE),
        createEnemy(ENT.SHADOW_ASSASSIN, 24 * TILE, 37 * TILE),
        createEnemy(ENT.DEMON, 16 * TILE, 38 * TILE),
        // Final boss
        createEnemy(ENT.DARK_LORD, 40 * TILE, 36 * TILE),
    ];

    const chests = [
        { x: 31, y: 4, opened: false, loot: [{ ...ITEM_DEFS.health_potion, count: 3 }] },
        { x: 43, y: 4, opened: false, loot: [{ ...ITEM_DEFS.mana_potion, count: 3 }] },
        { x: 19, y: 26, opened: false, loot: [{ ...ITEM_DEFS.strength_elixir, count: 2 }] },
        { x: 43, y: 26, opened: false, loot: [{ ...ITEM_DEFS.health_potion, count: 3 }] },
        { x: 14, y: 34, opened: false, loot: [{ ...ITEM_DEFS.health_potion, count: 5 }] },
    ];

    return {
        width: W, height: H, tiles, enemies, chests,
        playerStart: { x: 8 * TILE, y: 6 * TILE },
        bossRoom: { x: 35, y: 32, w: 11, h: 10 },
        stairs: { x: 43, y: 39 },
    };
}
