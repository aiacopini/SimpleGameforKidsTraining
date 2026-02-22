# Goku's Cloud Rider - Candy Land Overhaul Plan

## Issues to Fix
1. Game is absurdly fast (unplayable)
2. Graphics are too small and poor quality
3. Theme needs to be kid-friendly (candy/cookies instead of weapons/lasers)
4. Environment should be softer and more colorful

## Theme: Candy Land
- Goku throws cookies/donuts instead of Ki blasts
- Kamehameha becomes a rainbow candy beam
- Spirit Bomb becomes a giant lollipop
- Melee becomes a candy cane swipe
- Enemies throw candy projectiles (gumdrops, jawbreakers)
- Power-ups: cupcakes (health), candy canes (energy), golden cookie (extra life)
- Bosses: Level 1 = Giant Cupcake Monster, Level 2 = Mega Candy Dragon, Level 3 = Supreme Cake Titan
- Backgrounds: candy fields, chocolate rivers, cookie mountains

## Implementation Steps (Small & Focused)

### Step 1: Fix Game Speed
- Fix delta time calculation (currently divides by 16.67 making dt ~60x too large)
- Reduce SCROLL_SPEED from 2 to 0.8
- Reduce all movement speeds by ~60%
- Reduce all projectile speeds by ~60%
- **Files**: index.html (game loop dt calc, constants)

### Step 2: Fix Colors & Constants
- Update COLORS object with candy-land palette (pink, pastel, bright)
- Replace dark/violent colors with cheerful ones
- Update background color schemes for all 3 levels
- **Files**: index.html (COLORS section)

### Step 3: Improve Goku Sprite (Bigger & Brighter)
- Scale Goku sprite up 2x (from 32x40 to 64x80)
- Redraw with smoother shapes (arcs instead of rects)
- Brighter orange gi, more detailed hair spikes
- Bigger, fluffier Nimbus cloud
- Update hitbox and positioning
- **Files**: index.html (Player class draw methods)

### Step 4: Retheme Player Attacks to Candy
- KiBlast → Cookie projectile (round brown cookie with chips)
- KamehamehaBeam → Rainbow candy beam (multi-colored)
- SpiritBomb → Giant lollipop (spiral colored circle)
- Melee → Candy cane swipe (curved red/white arc)
- Update projectile visuals, keep mechanics
- **Files**: index.html (KiBlast, KamehamehaBeam, SpiritBomb draw methods)

### Step 5: Retheme Power-ups to Candy
- Senzu → Cupcake (pink frosting, cherry on top)
- Ki orb → Candy cane (red/white striped)
- Dragon ball → Golden cookie (star shape)
- Speed → Cotton candy (fluffy pink/blue)
- Make them 2x bigger, more visible
- **Files**: index.html (PowerUp class draw method)

### Step 6: Retheme Level 1 Enemies to Candy Creatures
- RedRibbonSoldier → Gingerbread Man (walks, throws gumdrops)
- BattleRobot → Flying Donut (sine wave, drops sprinkles)
- NinjaAssassin → Jellybean Runner (fast, bouncy)
- Make enemies 1.5-2x bigger, rounder shapes, bright colors
- Reduce enemy speeds to match new game pace
- **Files**: index.html (Level 1 enemy classes)

### Step 7: Retheme Level 2 Enemies
- FriezaSoldier → Candy Corn Flyer (flies, shoots candy)
- BruteWarrior → Chocolate Truffle Charger (charges at player)
- GinyuStriker → Lollipop Dancer (groups, colorful)
- Same size/speed adjustments as Step 6
- **Files**: index.html (Level 2 enemy classes)

### Step 8: Retheme Level 3 Enemies
- CellJunior → Sour Gummy Bear (fast, throws gummy projectiles)
- DarkClone → Shadow Cookie (dark mirror of Goku)
- BuuBlob → Bubble Gum Blob (splits into smaller bubbles)
- Same size/speed adjustments
- **Files**: index.html (Level 3 enemy classes)

### Step 9: Retheme Enemy Projectiles
- Replace all dark/violent projectile colors with candy colors
- Make projectiles look like gumdrops, jawbreakers, sprinkles
- Larger, rounder, more visible projectiles
- Reduce projectile damage for kid-friendly difficulty
- **Files**: index.html (EnemyProjectile class, enemy shoot methods)

### Step 10: Retheme Level 1 Boss - Giant Cupcake Monster
- Replace Mech Robot with Giant Cupcake (96x128 → bigger, rounder)
- Frosting top, cherry eye, candy sprinkle attacks
- Rockets → Sprinkle barrage, Laser → Frosting beam, Ground pound → Cherry bounce
- Cheerful but imposing design
- **Files**: index.html (GiantMechRobot class → rename + redraw)

### Step 11: Retheme Level 2 Boss - Mega Candy Dragon
- Replace Alien Tyrant with Candy Dragon
- Made of licorice, gumdrop scales, candy cane horns
- Death beam → Candy beam, Tail whip → Licorice whip, Supernova → Giant jawbreaker
- Phase 2: Rainbow transformation
- **Files**: index.html (AlienTyrant class → rename + redraw)

### Step 12: Retheme Level 3 Boss - Supreme Cake Titan
- Replace Cosmic Demon with massive multi-tier wedding cake boss
- Fondant arms, candle crown, frosting attacks
- Arm slam → Fondant drops, Mouth beam → Frosting stream, Summon → Mini cupcakes
- Phase 3: Burning candles (dramatic but not scary)
- **Files**: index.html (CosmicDemonKing class → rename + redraw)

### Step 13: Retheme Level 1 Background - Candy Fields
- Replace Earth mountains with candy cane hills
- Cotton candy clouds, gumdrop bushes
- Chocolate river ground, cookie crumble path
- Bright pink/blue sky
- **Files**: index.html (drawEarthBg function)

### Step 14: Retheme Level 2 Background - Chocolate Kingdom
- Replace Namek with chocolate landscape
- Wafer towers instead of spires, chocolate lake
- Cookie buildings, licorice trees
- Warm brown/golden sky
- **Files**: index.html (drawNamekBg function)

### Step 15: Retheme Level 3 Background - Sugar Crystal Realm
- Replace Dark Realm with sparkling sugar crystals
- Rock candy formations, sugar glass platforms
- Rainbow streaks instead of dark nebulas
- Bright but mystical atmosphere (not dark/scary)
- **Files**: index.html (drawDarkRealmBg function)

### Step 16: Update UI/Menus to Candy Theme
- Title screen: "GOKU'S CANDY CLOUD RIDER"
- Pink/pastel color scheme for HUD
- HP bar → Cookie jar meter, Ki bar → Candy meter
- Boss names updated to candy names
- Level names: "Candy Fields", "Chocolate Kingdom", "Sugar Crystal Realm"
- Victory/Game Over screens with candy colors
- **Files**: index.html (menu, HUD, UI drawing functions)

### Step 17: Update Sounds to Be Kid-Friendly
- Softer, more cheerful sound effects
- Replace explosion sounds with "pop" and "splat"
- More musical/whimsical tones
- **Files**: index.html (playSound function)

### Step 18: Final Balance & Polish
- Playtest speed (ensure moderate pace)
- Adjust enemy spawn rates for "Normal" difficulty
- Ensure all boss fights are fair but beatable
- Particle effects: more colorful (confetti, sprinkles)
- Final cleanup and verification
- **Files**: index.html (spawn data, boss HP, damage values)
