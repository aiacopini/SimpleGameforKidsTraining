// ============================================================
// DICE.JS - D&D Dice rolling and stat system
// Dungeons of Drakenmoor
// ============================================================

const Dice = {
    roll(sides) {
        return Math.floor(Math.random() * sides) + 1;
    },

    rollMultiple(count, sides) {
        let total = 0;
        const rolls = [];
        for (let i = 0; i < count; i++) {
            const r = this.roll(sides);
            rolls.push(r);
            total += r;
        }
        return { total, rolls };
    },

    d4() { return this.roll(4); },
    d6() { return this.roll(6); },
    d8() { return this.roll(8); },
    d10() { return this.roll(10); },
    d12() { return this.roll(12); },
    d20() { return this.roll(20); },
    d100() { return this.roll(100); },

    modifier(stat) {
        return Math.floor((stat - 10) / 2);
    },

    attackRoll(attackBonus) {
        const natural = this.d20();
        return {
            natural,
            total: natural + attackBonus,
            isCrit: natural === 20,
            isFumble: natural === 1,
        };
    },

    savingThrow(stat, dc) {
        const roll = this.d20();
        const mod = this.modifier(stat);
        return {
            roll,
            modifier: mod,
            total: roll + mod,
            success: (roll + mod) >= dc,
        };
    },

    damageRoll(count, sides, bonus = 0) {
        const { total, rolls } = this.rollMultiple(count, sides);
        return {
            total: Math.max(1, total + bonus),
            rolls,
            bonus,
        };
    },
};

// Character stats and class definitions
const CLASS_DEFS = {
    warrior: {
        name: 'Warrior',
        stats: { str: 16, dex: 10, con: 14, int: 8, wis: 10, cha: 12 },
        hp: 120, maxHp: 120,
        mp: 30, maxMp: 30,
        armor: 6,
        speed: 140,
        attackSpeed: 0.6,
        attackRange: 38,
        damage: { count: 1, sides: 10, bonus: 3 },
        specialCooldown: 4,
        specialCost: 15,
        dodgeCooldown: 1.0,
        color: '#cc8833',
        abilities: [
            { name: 'Cleave', desc: 'Wide sweeping attack hitting all nearby enemies', type: 'melee_aoe', damage: { count: 2, sides: 8, bonus: 3 }, range: 50 },
        ],
        levelUpHp: 12,
        levelUpMp: 3,
    },
    mage: {
        name: 'Mage',
        stats: { str: 6, dex: 10, con: 8, int: 18, wis: 14, cha: 10 },
        hp: 70, maxHp: 70,
        mp: 100, maxMp: 100,
        armor: 1,
        speed: 120,
        attackSpeed: 0.8,
        attackRange: 200,
        damage: { count: 2, sides: 6, bonus: 4 },
        specialCooldown: 3,
        specialCost: 25,
        dodgeCooldown: 1.2,
        color: '#3366cc',
        abilities: [
            { name: 'Fireball', desc: 'Explosive ball of fire dealing area damage', type: 'projectile_aoe', damage: { count: 3, sides: 8, bonus: 4 }, range: 250, radius: 60 },
        ],
        levelUpHp: 6,
        levelUpMp: 10,
    },
    rogue: {
        name: 'Rogue',
        stats: { str: 10, dex: 18, con: 10, int: 12, wis: 10, cha: 14 },
        hp: 80, maxHp: 80,
        mp: 60, maxMp: 60,
        armor: 3,
        speed: 180,
        attackSpeed: 0.35,
        attackRange: 32,
        damage: { count: 1, sides: 6, bonus: 4 },
        specialCooldown: 5,
        specialCost: 20,
        dodgeCooldown: 0.6,
        color: '#33aa55',
        abilities: [
            { name: 'Shadow Strike', desc: 'Teleport behind target and deal massive damage', type: 'teleport_attack', damage: { count: 3, sides: 8, bonus: 4 }, range: 150 },
        ],
        levelUpHp: 8,
        levelUpMp: 5,
    },
};

// Items
const ITEM_DEFS = {
    health_potion: { name: 'Health Potion', desc: 'Restores 40 HP', type: 'consumable', effect: 'heal', value: 40, color: '#cc3333', slot: '1' },
    mana_potion: { name: 'Mana Potion', desc: 'Restores 30 MP', type: 'consumable', effect: 'mana', value: 30, color: '#3333cc', slot: '2' },
    strength_elixir: { name: 'Strength Elixir', desc: '+3 damage for 20s', type: 'consumable', effect: 'buff_str', value: 3, duration: 20, color: '#cc6600', slot: '3' },
    gold_small: { name: 'Gold (10)', type: 'gold', value: 10, color: '#ddaa33' },
    gold_large: { name: 'Gold (25)', type: 'gold', value: 25, color: '#ffcc33' },
    key: { name: 'Dungeon Key', desc: 'Opens locked doors', type: 'key', color: '#dddd33' },
};

function createPlayerStats(className) {
    const def = CLASS_DEFS[className];
    return {
        className,
        name: def.name,
        level: 1,
        xp: 0,
        xpToLevel: 100,
        ...JSON.parse(JSON.stringify(def.stats)),
        hp: def.hp,
        maxHp: def.maxHp,
        mp: def.mp,
        maxMp: def.maxMp,
        armor: def.armor,
        speed: def.speed,
        attackSpeed: def.attackSpeed,
        attackRange: def.attackRange,
        damage: { ...def.damage },
        specialCooldown: def.specialCooldown,
        specialCost: def.specialCost,
        dodgeCooldown: def.dodgeCooldown,
        color: def.color,
        abilities: [...def.abilities],
        gold: 0,
        keys: 0,
        inventory: [
            { ...ITEM_DEFS.health_potion, count: 3 },
            { ...ITEM_DEFS.mana_potion, count: 2 },
            { ...ITEM_DEFS.strength_elixir, count: 1 },
        ],
        buffs: [],
        kills: 0,
    };
}

function gainXP(stats, amount) {
    stats.xp += amount;
    let leveled = false;
    while (stats.xp >= stats.xpToLevel) {
        stats.xp -= stats.xpToLevel;
        stats.level++;
        stats.xpToLevel = Math.floor(stats.xpToLevel * 1.5);
        const def = CLASS_DEFS[stats.className];
        stats.maxHp += def.levelUpHp;
        stats.hp = stats.maxHp;
        stats.maxMp += def.levelUpMp;
        stats.mp = stats.maxMp;
        stats.damage.bonus += 1;
        leveled = true;
    }
    return leveled;
}
