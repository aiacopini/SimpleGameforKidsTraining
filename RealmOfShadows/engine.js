// ============================================================
// REALM OF SHADOWS - Core Engine
// A 2D Top-Down Action RPG
// ============================================================

// ============================================================
// SECTION 1: GAME CONSTANTS & CONFIGURATION
// ============================================================

/** Canvas dimensions in pixels */
const CANVAS_WIDTH = 800, CANVAS_HEIGHT = 600;

/** Size of a single map tile in pixels */
const TILE_SIZE = 32;

/** Target frames per second */
const FPS = 60;

/** Maximum delta time (ms) to prevent spiral of death */
const MAX_DT = 33;

/** Camera smooth follow interpolation factor */
const CAMERA_LERP = 0.08;

/** Camera lookahead distance in pixels */
const CAMERA_LOOKAHEAD = 30;

/** Duration of invulnerability frames after taking damage (ms) */
const INVULN_DURATION = 1000;

/** Gravity constant (unused in top-down, reserved for effects) */
const GRAVITY = 0;

/** Friction applied to entity velocity each frame */
const FRICTION = 0.85;

// ============================================================
// SECTION 2: GAME STATE MACHINE
// ============================================================

/**
 * Enumeration of all possible game states.
 * The game can only be in one state at a time.
 */
const GameState = Object.freeze({
    MENU:             'MENU',
    CHARACTER_SELECT: 'CHARACTER_SELECT',
    PLAYING:          'PLAYING',
    BOSS_FIGHT:       'BOSS_FIGHT',
    LEVEL_TRANSITION: 'LEVEL_TRANSITION',
    GAME_OVER:        'GAME_OVER',
    VICTORY:          'VICTORY',
    PAUSED:           'PAUSED'
});

/**
 * Defines valid state transitions. Each key is a state, and its value
 * is the array of states it is allowed to transition to.
 */
const StateTransitions = Object.freeze({
    [GameState.MENU]:             [GameState.CHARACTER_SELECT, GameState.PLAYING],
    [GameState.CHARACTER_SELECT]: [GameState.PLAYING, GameState.MENU],
    [GameState.PLAYING]:          [GameState.BOSS_FIGHT, GameState.LEVEL_TRANSITION, GameState.GAME_OVER, GameState.PAUSED, GameState.VICTORY],
    [GameState.BOSS_FIGHT]:       [GameState.LEVEL_TRANSITION, GameState.GAME_OVER, GameState.PAUSED, GameState.VICTORY],
    [GameState.LEVEL_TRANSITION]: [GameState.PLAYING, GameState.BOSS_FIGHT, GameState.VICTORY],
    [GameState.GAME_OVER]:        [GameState.MENU, GameState.CHARACTER_SELECT],
    [GameState.VICTORY]:          [GameState.MENU],
    [GameState.PAUSED]:           [GameState.PLAYING, GameState.BOSS_FIGHT, GameState.MENU]
});

/**
 * StateMachine manages current game state and validates transitions.
 * Provides hooks for onEnter and onExit of each state.
 */
const StateMachine = {
    /** Current active state */
    current: GameState.MENU,

    /** Previous state for resume/back support */
    previous: null,

    /** Callbacks fired when entering a state: { STATE_NAME: fn } */
    onEnterCallbacks: {},

    /** Callbacks fired when exiting a state: { STATE_NAME: fn } */
    onExitCallbacks: {},

    /**
     * Attempt to transition to a new state.
     * @param {string} newState - The target state from GameState enum.
     * @returns {boolean} True if transition succeeded, false otherwise.
     */
    transition(newState) {
        // Validate the transition is allowed
        const allowed = StateTransitions[this.current];
        if (!allowed || allowed.indexOf(newState) === -1) {
            console.warn(`[StateMachine] Invalid transition: ${this.current} -> ${newState}`);
            return false;
        }

        // Fire exit callback for current state
        if (this.onExitCallbacks[this.current]) {
            this.onExitCallbacks[this.current]();
        }

        // Store previous and update current
        this.previous = this.current;
        this.current = newState;

        // Fire enter callback for new state
        if (this.onEnterCallbacks[this.current]) {
            this.onEnterCallbacks[this.current]();
        }

        console.log(`[StateMachine] ${this.previous} -> ${this.current}`);
        return true;
    },

    /**
     * Register a callback for when entering a specific state.
     * @param {string} state - The state to hook into.
     * @param {Function} fn - Callback to fire on enter.
     */
    onEnter(state, fn) {
        this.onEnterCallbacks[state] = fn;
    },

    /**
     * Register a callback for when exiting a specific state.
     * @param {string} state - The state to hook into.
     * @param {Function} fn - Callback to fire on exit.
     */
    onExit(state, fn) {
        this.onExitCallbacks[state] = fn;
    },

    /**
     * Check if the game is currently in a given state.
     * @param {string} state - State to check.
     * @returns {boolean}
     */
    is(state) {
        return this.current === state;
    },

    /**
     * Force set the state without transition validation (use sparingly).
     * @param {string} state - State to force.
     */
    forceState(state) {
        this.previous = this.current;
        this.current = state;
    },

    /**
     * Reset state machine to MENU.
     */
    reset() {
        this.previous = null;
        this.current = GameState.MENU;
    }
};

// ============================================================
// SECTION 3: INPUT SYSTEM
// ============================================================

/**
 * Input handles all keyboard and mouse input.
 * Tracks key states, mouse position, and mouse button state.
 * Provides a normalized 8-directional movement vector.
 */
const Input = {
    /** Map of key codes/names to their pressed state */
    keys: {},

    /** Map of keys that were just pressed this frame (for single-fire actions) */
    justPressed: {},

    /** Internal buffer for keys pressed between frames */
    _justPressedBuffer: {},

    /** Mouse state: position and click status */
    mouse: {
        x: 0,
        y: 0,
        clicked: false,
        down: false
    },

    /**
     * Initialize input listeners on the document and canvas.
     * Call once at game start.
     * @param {HTMLCanvasElement} canvas - The game canvas for mouse events.
     */
    init(canvas) {
        // Keyboard down handler
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            // Prevent default for game keys to stop scrolling, etc.
            if (['arrowup','arrowdown','arrowleft','arrowright',' ','e','shift','escape','enter'].indexOf(key) !== -1 ||
                ['w','a','s','d'].indexOf(key) !== -1) {
                e.preventDefault();
            }
            if (!this.keys[key]) {
                this._justPressedBuffer[key] = true;
            }
            this.keys[key] = true;
        });

        // Keyboard up handler
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;
            this._justPressedBuffer[key] = false;
        });

        // Mouse move handler - track position relative to canvas
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mouse.x = (e.clientX - rect.left) * scaleX;
            this.mouse.y = (e.clientY - rect.top) * scaleY;
        });

        // Mouse down handler
        canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.mouse.down = true;
            this.mouse.clicked = true;
        });

        // Mouse up handler
        canvas.addEventListener('mouseup', (e) => {
            this.mouse.down = false;
        });

        // Prevent context menu on right-click
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    },

    /**
     * Called once per frame to synchronize just-pressed buffer.
     * Must be called at the END of the game update loop.
     */
    update() {
        // Copy buffer to justPressed, then clear buffer
        for (const key in this.justPressed) {
            this.justPressed[key] = false;
        }
        for (const key in this._justPressedBuffer) {
            if (this._justPressedBuffer[key]) {
                this.justPressed[key] = true;
                this._justPressedBuffer[key] = false;
            }
        }
        // Reset single-frame click flag
        this.mouse.clicked = false;
    },

    /**
     * Check if a key was just pressed this frame (single-fire).
     * @param {string} key - Key name (lowercase).
     * @returns {boolean}
     */
    isJustPressed(key) {
        return !!this.justPressed[key.toLowerCase()];
    },

    /**
     * Check if a key is currently held down.
     * @param {string} key - Key name (lowercase).
     * @returns {boolean}
     */
    isDown(key) {
        return !!this.keys[key.toLowerCase()];
    },

    /**
     * Calculate a normalized 8-directional movement vector from WASD/Arrow keys.
     * @returns {{ x: number, y: number }} Normalized direction vector (length 0 or 1).
     */
    getMovementVector() {
        let dx = 0;
        let dy = 0;

        // Horizontal input
        if (this.keys['a'] || this.keys['arrowleft'])  dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;

        // Vertical input
        if (this.keys['w'] || this.keys['arrowup'])    dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown'])  dy += 1;

        // Normalize diagonal movement so it does not exceed speed 1
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
            dx /= len;
            dy /= len;
        }

        return { x: dx, y: dy };
    },

    /**
     * Reset all input state. Useful when changing game states.
     */
    reset() {
        for (const key in this.keys) {
            this.keys[key] = false;
        }
        for (const key in this.justPressed) {
            this.justPressed[key] = false;
        }
        for (const key in this._justPressedBuffer) {
            this._justPressedBuffer[key] = false;
        }
        this.mouse.clicked = false;
        this.mouse.down = false;
    }
};

// ============================================================
// SECTION 4: CAMERA SYSTEM
// ============================================================

/**
 * Camera provides smooth-follow, lookahead, and screen shake.
 * All world-space drawing is offset by the camera position.
 */
const Camera = {
    /** Camera world position (top-left corner) */
    x: 0,
    y: 0,

    /** Target position for smooth interpolation */
    targetX: 0,
    targetY: 0,

    /** Screen shake offset applied on top of position */
    shakeX: 0,
    shakeY: 0,

    /** Screen shake internal state */
    _shakeIntensity: 0,
    _shakeDuration: 0,
    _shakeTimer: 0,
    _shakeDecay: 0,

    /**
     * Trigger a screen shake effect.
     * @param {number} intensity - Maximum pixel displacement.
     * @param {number} duration - Duration of shake in milliseconds.
     */
    shake(intensity, duration) {
        this._shakeIntensity = intensity;
        this._shakeDuration = duration;
        this._shakeTimer = duration;
        // Decay brings intensity down to zero over the duration
        this._shakeDecay = intensity / duration;
    },

    /**
     * Update camera position to follow a target entity.
     * Should be called every frame.
     * @param {Object} target - Entity with x, y, w, h, vx, vy properties.
     * @param {number} mapW - Total map width in pixels (for clamping).
     * @param {number} mapH - Total map height in pixels (for clamping).
     * @param {number} dt - Delta time in seconds.
     */
    update(target, mapW, mapH, dt) {
        if (!target) return;

        // Calculate center of target entity
        const centerX = target.x + target.w / 2;
        const centerY = target.y + target.h / 2;

        // Apply lookahead in the direction the target is moving
        const lookX = (target.vx || 0) > 0 ? CAMERA_LOOKAHEAD :
                      (target.vx || 0) < 0 ? -CAMERA_LOOKAHEAD : 0;
        const lookY = (target.vy || 0) > 0 ? CAMERA_LOOKAHEAD :
                      (target.vy || 0) < 0 ? -CAMERA_LOOKAHEAD : 0;

        // Desired camera position: center target on screen with lookahead
        this.targetX = centerX + lookX - CANVAS_WIDTH / 2;
        this.targetY = centerY + lookY - CANVAS_HEIGHT / 2;

        // Smooth follow using linear interpolation
        this.x += (this.targetX - this.x) * CAMERA_LERP;
        this.y += (this.targetY - this.y) * CAMERA_LERP;

        // Clamp camera to map bounds so we never show outside the map
        if (mapW > CANVAS_WIDTH) {
            this.x = Math.max(0, Math.min(this.x, mapW - CANVAS_WIDTH));
        } else {
            this.x = (mapW - CANVAS_WIDTH) / 2;
        }

        if (mapH > CANVAS_HEIGHT) {
            this.y = Math.max(0, Math.min(this.y, mapH - CANVAS_HEIGHT));
        } else {
            this.y = (mapH - CANVAS_HEIGHT) / 2;
        }

        // Update screen shake
        if (this._shakeTimer > 0) {
            const progress = this._shakeTimer / this._shakeDuration;
            const currentIntensity = this._shakeIntensity * progress;
            this.shakeX = (Math.random() * 2 - 1) * currentIntensity;
            this.shakeY = (Math.random() * 2 - 1) * currentIntensity;
            this._shakeTimer -= dt * 1000;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
            this._shakeTimer = 0;
        }
    },

    /**
     * Apply camera transform to the canvas context.
     * Call before drawing world-space objects.
     * @param {CanvasRenderingContext2D} ctx
     */
    apply(ctx) {
        ctx.save();
        ctx.translate(
            -Math.round(this.x) + Math.round(this.shakeX),
            -Math.round(this.y) + Math.round(this.shakeY)
        );
    },

    /**
     * Restore the canvas context to screen-space.
     * Call after drawing world-space objects (before drawing UI).
     * @param {CanvasRenderingContext2D} ctx
     */
    reset(ctx) {
        ctx.restore();
    },

    /**
     * Convert screen coordinates to world coordinates.
     * @param {number} screenX
     * @param {number} screenY
     * @returns {{ x: number, y: number }}
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x - this.shakeX,
            y: screenY + this.y - this.shakeY
        };
    },

    /**
     * Convert world coordinates to screen coordinates.
     * @param {number} worldX
     * @param {number} worldY
     * @returns {{ x: number, y: number }}
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x + this.shakeX,
            y: worldY - this.y + this.shakeY
        };
    },

    /**
     * Check if a world-space rectangle is visible on screen.
     * Useful for culling off-screen entities.
     * @param {number} x - World x.
     * @param {number} y - World y.
     * @param {number} w - Width.
     * @param {number} h - Height.
     * @returns {boolean}
     */
    isVisible(x, y, w, h) {
        return (
            x + w > this.x &&
            x < this.x + CANVAS_WIDTH &&
            y + h > this.y &&
            y < this.y + CANVAS_HEIGHT
        );
    },

    /**
     * Instantly center camera on a position (no lerp).
     * @param {number} x - World x.
     * @param {number} y - World y.
     */
    snapTo(x, y) {
        this.x = x - CANVAS_WIDTH / 2;
        this.y = y - CANVAS_HEIGHT / 2;
        this.targetX = this.x;
        this.targetY = this.y;
    }
};

// ============================================================
// SECTION 5: COLLISION SYSTEM (AABB)
// ============================================================

/**
 * Collision provides axis-aligned bounding box (AABB) collision checks
 * along with circle-rect and point-rect tests.
 * All rect objects are expected to have { x, y, w, h } properties.
 */
const Collision = {
    /**
     * Test overlap between two axis-aligned rectangles.
     * @param {{ x: number, y: number, w: number, h: number }} a - First rectangle.
     * @param {{ x: number, y: number, w: number, h: number }} b - Second rectangle.
     * @returns {boolean} True if the rectangles overlap.
     */
    rectRect(a, b) {
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
        );
    },

    /**
     * Test overlap between a circle and an axis-aligned rectangle.
     * Used for projectile vs entity collision.
     * @param {number} cx - Circle center x.
     * @param {number} cy - Circle center y.
     * @param {number} r - Circle radius.
     * @param {{ x: number, y: number, w: number, h: number }} rect - Rectangle.
     * @returns {boolean} True if the circle and rectangle overlap.
     */
    circleRect(cx, cy, r, rect) {
        // Find the closest point on the rectangle to the circle center
        const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
        const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));

        // Calculate distance from closest point to circle center
        const dx = cx - closestX;
        const dy = cy - closestY;

        return (dx * dx + dy * dy) <= (r * r);
    },

    /**
     * Test if a point lies inside an axis-aligned rectangle.
     * @param {number} px - Point x.
     * @param {number} py - Point y.
     * @param {{ x: number, y: number, w: number, h: number }} rect - Rectangle.
     * @returns {boolean} True if the point is inside the rectangle.
     */
    pointRect(px, py, rect) {
        return (
            px >= rect.x &&
            px <= rect.x + rect.w &&
            py >= rect.y &&
            py <= rect.y + rect.h
        );
    },

    /**
     * Check if a world position corresponds to a solid tile on the map.
     * @param {number} x - World x position.
     * @param {number} y - World y position.
     * @param {Object} map - Map object with `tiles` 2D array, `width`, `height`.
     *                       Non-zero tile values are considered solid.
     * @returns {boolean} True if the tile at (x, y) is solid.
     */
    checkTile(x, y, map) {
        // Convert world position to tile coordinates
        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(y / TILE_SIZE);

        // Out of bounds is treated as solid (wall)
        if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) {
            return true;
        }

        // Non-zero tile values are solid
        return map.tiles[tileY][tileX] !== 0;
    },

    /**
     * Resolve collision between a moving entity and the tile map.
     * Adjusts entity position to prevent overlap with solid tiles.
     * Uses separate X and Y resolution for smooth sliding along walls.
     * @param {Entity} entity - The entity to resolve.
     * @param {Object} map - Map with `tiles`, `width`, `height`.
     */
    resolveEntityTileCollision(entity, map) {
        if (!map || !map.tiles) return;

        const bounds = entity.getBounds();

        // Check all four corners plus midpoints of each edge
        const checkPoints = [
            { x: bounds.x,              y: bounds.y },               // top-left
            { x: bounds.x + bounds.w,   y: bounds.y },               // top-right
            { x: bounds.x,              y: bounds.y + bounds.h },     // bottom-left
            { x: bounds.x + bounds.w,   y: bounds.y + bounds.h },    // bottom-right
            { x: bounds.x + bounds.w/2, y: bounds.y },               // top-mid
            { x: bounds.x + bounds.w/2, y: bounds.y + bounds.h },    // bottom-mid
            { x: bounds.x,              y: bounds.y + bounds.h/2 },   // left-mid
            { x: bounds.x + bounds.w,   y: bounds.y + bounds.h/2 }    // right-mid
        ];

        for (let i = 0; i < checkPoints.length; i++) {
            const pt = checkPoints[i];
            if (this.checkTile(pt.x, pt.y, map)) {
                // Determine which tile we are colliding with
                const tileX = Math.floor(pt.x / TILE_SIZE) * TILE_SIZE;
                const tileY = Math.floor(pt.y / TILE_SIZE) * TILE_SIZE;

                // Calculate overlap on each axis
                const overlapLeft   = (bounds.x + bounds.w) - tileX;
                const overlapRight  = (tileX + TILE_SIZE) - bounds.x;
                const overlapTop    = (bounds.y + bounds.h) - tileY;
                const overlapBottom = (tileY + TILE_SIZE) - bounds.y;

                // Find minimum overlap axis to push out
                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapY = Math.min(overlapTop, overlapBottom);

                if (minOverlapX < minOverlapY) {
                    // Resolve horizontally
                    if (overlapLeft < overlapRight) {
                        entity.x -= overlapLeft;
                    } else {
                        entity.x += overlapRight;
                    }
                    entity.vx = 0;
                } else {
                    // Resolve vertically
                    if (overlapTop < overlapBottom) {
                        entity.y -= overlapTop;
                    } else {
                        entity.y += overlapBottom;
                    }
                    entity.vy = 0;
                }
            }
        }
    },

    /**
     * Get the overlap vector between two rectangles.
     * Returns null if they do not overlap.
     * @param {{ x: number, y: number, w: number, h: number }} a
     * @param {{ x: number, y: number, w: number, h: number }} b
     * @returns {{ x: number, y: number } | null}
     */
    getOverlap(a, b) {
        const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);

        if (overlapX <= 0 || overlapY <= 0) return null;

        // Return the smaller overlap axis as the push-out direction
        if (overlapX < overlapY) {
            const sign = (a.x + a.w / 2) < (b.x + b.w / 2) ? -1 : 1;
            return { x: overlapX * sign, y: 0 };
        } else {
            const sign = (a.y + a.h / 2) < (b.y + b.h / 2) ? -1 : 1;
            return { x: 0, y: overlapY * sign };
        }
    }
};

// ============================================================
// SECTION 6: OBJECT POOL
// ============================================================

/**
 * ObjectPool recycles objects to avoid garbage collection spikes.
 * Used for high-frequency allocations like particles and projectiles.
 */
class ObjectPool {
    /**
     * @param {Function} factory - Function that creates a new object instance.
     * @param {Function} resetFn - Function that resets an object for reuse: reset(obj).
     * @param {number} initialSize - Number of objects to pre-allocate.
     */
    constructor(factory, resetFn, initialSize) {
        /** Factory function to create new objects */
        this.factory = factory;

        /** Reset function to prepare recycled objects for reuse */
        this.resetFn = resetFn;

        /** Pool of available (inactive) objects */
        this.pool = [];

        /** All active objects currently in use */
        this.active = [];

        // Pre-allocate initial pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }

    /**
     * Get an object from the pool (or create a new one if pool is empty).
     * The object is moved to the active list.
     * @returns {Object} A reset, ready-to-use object.
     */
    get() {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            // Pool exhausted - create a new object (pool grows dynamically)
            obj = this.factory();
        }
        this.resetFn(obj);
        this.active.push(obj);
        return obj;
    }

    /**
     * Release an object back into the pool.
     * Removes it from the active list.
     * @param {Object} obj - The object to release.
     */
    release(obj) {
        const index = this.active.indexOf(obj);
        if (index !== -1) {
            this.active.splice(index, 1);
            this.pool.push(obj);
        }
    }

    /**
     * Release all active objects back into the pool.
     */
    releaseAll() {
        while (this.active.length > 0) {
            this.pool.push(this.active.pop());
        }
    }

    /**
     * Update all active objects. Automatically releases objects
     * whose `alive` property is false.
     * @param {number} dt - Delta time in seconds.
     */
    updateAll(dt) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const obj = this.active[i];
            if (obj.update) {
                obj.update(dt);
            }
            if (!obj.alive) {
                this.active.splice(i, 1);
                this.pool.push(obj);
            }
        }
    }

    /**
     * Draw all active objects.
     * @param {CanvasRenderingContext2D} ctx
     */
    drawAll(ctx) {
        for (let i = 0; i < this.active.length; i++) {
            const obj = this.active[i];
            if (obj.draw && obj.alive) {
                obj.draw(ctx);
            }
        }
    }

    /**
     * Get count of currently active objects.
     * @returns {number}
     */
    getActiveCount() {
        return this.active.length;
    }

    /**
     * Get count of available objects in the pool.
     * @returns {number}
     */
    getPoolCount() {
        return this.pool.length;
    }
}

// ============================================================
// SECTION 7: ENTITY BASE CLASS
// ============================================================

/**
 * Entity is the base class for all game objects (player, enemies, NPCs, etc.).
 * Provides position, velocity, health, damage, bounding box, and rendering hooks.
 */
class Entity {
    /**
     * @param {number} x - World x position.
     * @param {number} y - World y position.
     * @param {number} w - Width in pixels.
     * @param {number} h - Height in pixels.
     */
    constructor(x, y, w, h) {
        /** World position */
        this.x = x;
        this.y = y;

        /** Dimensions */
        this.w = w;
        this.h = h;

        /** Velocity */
        this.vx = 0;
        this.vy = 0;

        /** Health */
        this.hp = 100;
        this.maxHp = 100;

        /** Whether this entity is alive and should be updated/drawn */
        this.alive = true;

        /**
         * Facing direction: 'up', 'down', 'left', 'right'
         * Used for sprite selection and attack direction.
         */
        this.facing = 'down';

        /** Invulnerability state (after taking damage) */
        this.invulnerable = false;
        this.invulnTimer = 0;

        /** Movement speed in pixels per second */
        this.speed = 120;

        /** Flash timer for hit feedback */
        this.flashTimer = 0;

        /** Type identifier for collision filtering */
        this.type = 'entity';

        /** Animation frame tracking */
        this.animFrame = 0;
        this.animTimer = 0;
    }

    /**
     * Update entity state. Called every frame.
     * @param {number} dt - Delta time in seconds.
     */
    update(dt) {
        // Apply velocity
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Apply friction to slow down
        this.vx *= FRICTION;
        this.vy *= FRICTION;

        // Stop very small velocities to prevent drifting
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        if (Math.abs(this.vy) < 0.1) this.vy = 0;

        // Update invulnerability timer
        if (this.invulnerable) {
            this.invulnTimer -= dt * 1000;
            if (this.invulnTimer <= 0) {
                this.invulnerable = false;
                this.invulnTimer = 0;
            }
        }

        // Update flash timer
        if (this.flashTimer > 0) {
            this.flashTimer -= dt * 1000;
        }

        // Update facing direction based on velocity
        if (Math.abs(this.vx) > Math.abs(this.vy)) {
            this.facing = this.vx > 0 ? 'right' : 'left';
        } else if (Math.abs(this.vy) > 0.1) {
            this.facing = this.vy > 0 ? 'down' : 'up';
        }

        // Update animation timer
        this.animTimer += dt;
        if (this.animTimer > 0.15) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        // Kill entity if HP drops to 0 or below
        if (this.hp <= 0) {
            this.alive = false;
        }
    }

    /**
     * Draw the entity. Override in subclasses for custom rendering.
     * Base implementation draws a colored rectangle with health bar.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (!this.alive) return;

        // Blink effect during invulnerability
        if (this.invulnerable && Math.floor(this.invulnTimer / 60) % 2 === 0) {
            return; // Skip drawing this frame for blink effect
        }

        // Flash white when hit
        if (this.flashTimer > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = '#888888';
        }

        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Draw health bar above entity if damaged
        if (this.hp < this.maxHp && this.hp > 0) {
            const barWidth = this.w;
            const barHeight = 4;
            const barY = this.y - 8;

            // Background
            ctx.fillStyle = '#333333';
            ctx.fillRect(this.x, barY, barWidth, barHeight);

            // Health fill
            const healthRatio = this.hp / this.maxHp;
            ctx.fillStyle = healthRatio > 0.5 ? '#00ff00' :
                            healthRatio > 0.25 ? '#ffff00' : '#ff0000';
            ctx.fillRect(this.x, barY, barWidth * healthRatio, barHeight);
        }
    }

    /**
     * Apply damage to this entity.
     * Respects invulnerability frames.
     * @param {number} amount - Damage amount.
     * @returns {boolean} True if damage was applied, false if blocked by invuln.
     */
    takeDamage(amount) {
        if (this.invulnerable || !this.alive) return false;

        this.hp -= amount;
        this.flashTimer = 100;

        // Activate invulnerability frames
        this.invulnerable = true;
        this.invulnTimer = INVULN_DURATION;

        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }

        return true;
    }

    /**
     * Heal this entity by a given amount, capped at maxHp.
     * @param {number} amount - Amount to heal.
     */
    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
    }

    /**
     * Get the bounding box for collision detection.
     * @returns {{ x: number, y: number, w: number, h: number }}
     */
    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    /**
     * Get the center point of this entity.
     * @returns {{ x: number, y: number }}
     */
    getCenter() {
        return {
            x: this.x + this.w / 2,
            y: this.y + this.h / 2
        };
    }

    /**
     * Calculate distance to another entity.
     * @param {Entity} other
     * @returns {number} Distance in pixels.
     */
    distanceTo(other) {
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const ox = other.x + other.w / 2;
        const oy = other.y + other.h / 2;
        return Math.sqrt((cx - ox) * (cx - ox) + (cy - oy) * (cy - oy));
    }

    /**
     * Calculate angle to another entity in radians.
     * @param {Entity} other
     * @returns {number} Angle in radians.
     */
    angleTo(other) {
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const ox = other.x + other.w / 2;
        const oy = other.y + other.h / 2;
        return Math.atan2(oy - cy, ox - cx);
    }

    /**
     * Apply a knockback force away from a source position.
     * @param {number} fromX - Source x.
     * @param {number} fromY - Source y.
     * @param {number} force - Knockback strength in pixels.
     */
    knockback(fromX, fromY, force) {
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const angle = Math.atan2(cy - fromY, cx - fromX);
        this.vx += Math.cos(angle) * force;
        this.vy += Math.sin(angle) * force;
    }
}

// ============================================================
// SECTION 8: GAME TIMER / DELTA TIME
// ============================================================

/**
 * GameTimer handles delta time calculation with a cap to prevent
 * the "spiral of death" that occurs when frame time exceeds
 * the simulation step (e.g., when the tab is backgrounded).
 */
const GameTimer = {
    /** Timestamp of the last frame (ms) */
    lastTime: 0,

    /** Delta time in seconds for the current frame */
    dt: 0,

    /** Delta time in milliseconds (uncapped, for reference) */
    rawDtMs: 0,

    /** Running total elapsed time in seconds */
    elapsed: 0,

    /** Frame counter for diagnostics */
    frameCount: 0,

    /** Frames per second (updated every second) */
    fps: 0,

    /** Internal: accumulated time for FPS calculation */
    _fpsAccumulator: 0,

    /** Internal: frame count within current second */
    _fpsFrames: 0,

    /**
     * Initialize the timer. Call before the first game loop iteration.
     */
    init() {
        this.lastTime = performance.now();
        this.dt = 0;
        this.elapsed = 0;
        this.frameCount = 0;
        this.fps = 0;
        this._fpsAccumulator = 0;
        this._fpsFrames = 0;
    },

    /**
     * Update the timer. Call at the start of each frame.
     * @param {number} timestamp - The current timestamp from requestAnimationFrame.
     * @returns {number} Delta time in seconds (capped).
     */
    update(timestamp) {
        // Calculate raw delta time
        this.rawDtMs = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Cap delta time to prevent spiral of death
        // If a frame takes longer than MAX_DT ms (e.g., tab was backgrounded),
        // we clamp it so the simulation does not try to catch up all at once.
        const cappedMs = Math.min(this.rawDtMs, MAX_DT);
        this.dt = cappedMs / 1000; // Convert to seconds

        // Accumulate total elapsed time
        this.elapsed += this.dt;
        this.frameCount++;

        // FPS calculation (updated every second)
        this._fpsAccumulator += this.rawDtMs;
        this._fpsFrames++;
        if (this._fpsAccumulator >= 1000) {
            this.fps = this._fpsFrames;
            this._fpsFrames = 0;
            this._fpsAccumulator -= 1000;
        }

        return this.dt;
    }
};

// ============================================================
// SECTION 9: MAIN GAME OBJECT
// ============================================================

/**
 * Game is the central controller that ties all systems together.
 * It manages the game loop, state transitions, entity lists,
 * and delegates to subsystems.
 */
const Game = {
    /** Current game state (mirrors StateMachine.current) */
    state: GameState.MENU,

    /** Reference to the HTML canvas element */
    canvas: null,

    /** Reference to the 2D rendering context */
    ctx: null,

    /** Current level index (0-based) */
    currentLevel: 0,

    /** Player's accumulated score */
    score: 0,

    /** Remaining lives */
    lives: 3,

    /** Reference to the player entity */
    player: null,

    /** Array of all active entities (enemies, NPCs) */
    entities: [],

    /** Array of active projectiles */
    projectiles: [],

    /** Array of active particles (visual effects) */
    particles: [],

    /** Array of active pickups (health, coins, etc.) */
    pickups: [],

    /** Array of breakable objects in the environment */
    breakables: [],

    /** Current level data (tilemap, spawn points, etc.) */
    levelData: null,

    /** Index of the selected character (from character select screen) */
    selectedCharacter: 0,

    /** Whether the game is currently paused */
    paused: false,

    /** Whether a boss encounter is currently active */
    bossActive: false,

    /** Reference to the current boss entity */
    currentBoss: null,

    /** Number of rooms cleared in the current level */
    roomsCleared: 0,

    /** Total number of rooms in the current level */
    totalRooms: 0,

    /** Object pools for efficient memory management */
    pools: {
        particles: null,
        projectiles: null
    },

    /** requestAnimationFrame ID for cancellation */
    _rafId: null,

    /** Whether the game loop is currently running */
    _running: false,

    /**
     * Initialize the game engine.
     * Sets up canvas, input, pools, and starts the game loop.
     */
    init() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('[Game] Canvas element "gameCanvas" not found!');
            return;
        }
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.ctx = this.canvas.getContext('2d');

        // Disable image smoothing for crisp pixel art
        this.ctx.imageSmoothingEnabled = false;

        // Initialize subsystems
        Input.init(this.canvas);
        GameTimer.init();

        // Create object pools
        this.pools.particles = new ObjectPool(
            () => ({
                x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 0, size: 2,
                color: '#ffffff', alive: false,
                alpha: 1, decay: 0, gravity: 0,
                update(dt) {
                    this.x += this.vx * dt;
                    this.y += this.vy * dt;
                    this.vy += this.gravity * dt;
                    this.life -= dt;
                    this.alpha = Math.max(0, this.life / this.maxLife);
                    if (this.life <= 0) this.alive = false;
                },
                draw(ctx) {
                    if (!this.alive) return;
                    ctx.globalAlpha = this.alpha;
                    ctx.fillStyle = this.color;
                    ctx.fillRect(
                        this.x - this.size / 2,
                        this.y - this.size / 2,
                        this.size, this.size
                    );
                    ctx.globalAlpha = 1;
                }
            }),
            (p) => {
                p.x = 0; p.y = 0; p.vx = 0; p.vy = 0;
                p.life = 0; p.maxLife = 0; p.size = 2;
                p.color = '#ffffff'; p.alive = true;
                p.alpha = 1; p.decay = 0; p.gravity = 0;
            },
            200 // Pre-allocate 200 particles
        );

        this.pools.projectiles = new ObjectPool(
            () => ({
                x: 0, y: 0, vx: 0, vy: 0,
                w: 8, h: 8, radius: 4,
                damage: 10, speed: 200,
                alive: false, owner: null,
                type: 'projectile',
                piercing: false, life: 0,
                color: '#ffff00',
                update(dt) {
                    this.x += this.vx * dt;
                    this.y += this.vy * dt;
                    this.life -= dt;
                    if (this.life <= 0) this.alive = false;
                },
                draw(ctx) {
                    if (!this.alive) return;
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                },
                getBounds() {
                    return {
                        x: this.x - this.w / 2,
                        y: this.y - this.h / 2,
                        w: this.w,
                        h: this.h
                    };
                }
            }),
            (p) => {
                p.x = 0; p.y = 0; p.vx = 0; p.vy = 0;
                p.w = 8; p.h = 8; p.radius = 4;
                p.damage = 10; p.speed = 200;
                p.alive = true; p.owner = null;
                p.type = 'projectile';
                p.piercing = false; p.life = 3;
                p.color = '#ffff00';
            },
            50 // Pre-allocate 50 projectiles
        );

        // Register state machine callbacks
        StateMachine.onEnter(GameState.PLAYING, () => {
            this.paused = false;
            this.bossActive = false;
        });

        StateMachine.onEnter(GameState.BOSS_FIGHT, () => {
            this.bossActive = true;
            Camera.shake(8, 500);
        });

        StateMachine.onEnter(GameState.GAME_OVER, () => {
            this._running = false;
        });

        StateMachine.onEnter(GameState.PAUSED, () => {
            this.paused = true;
        });

        StateMachine.onExit(GameState.PAUSED, () => {
            this.paused = false;
        });

        StateMachine.onEnter(GameState.VICTORY, () => {
            this._running = false;
        });

        // Set initial state
        this.state = GameState.MENU;
        StateMachine.forceState(GameState.MENU);
        this._running = true;

        // Start the game loop
        this._rafId = requestAnimationFrame((ts) => this.loop(ts));

        console.log('[Game] Realm of Shadows engine initialized.');
    },

    /**
     * Main update function. Delegates to the appropriate update
     * handler based on the current game state.
     * @param {number} dt - Delta time in seconds.
     */
    update(dt) {
        this.state = StateMachine.current;

        switch (this.state) {
            case GameState.MENU:
                this._updateMenu(dt);
                break;

            case GameState.CHARACTER_SELECT:
                this._updateCharacterSelect(dt);
                break;

            case GameState.PLAYING:
            case GameState.BOSS_FIGHT:
                this._updateGameplay(dt);
                break;

            case GameState.LEVEL_TRANSITION:
                this._updateLevelTransition(dt);
                break;

            case GameState.GAME_OVER:
                this._updateGameOver(dt);
                break;

            case GameState.VICTORY:
                this._updateVictory(dt);
                break;

            case GameState.PAUSED:
                this._updatePaused(dt);
                break;
        }

        // Flush input state at end of frame
        Input.update();
    },

    /**
     * Main draw function. Delegates to the appropriate draw
     * handler based on the current game state.
     */
    draw() {
        const ctx = this.ctx;

        // Clear the entire canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        switch (this.state) {
            case GameState.MENU:
                this._drawMenu(ctx);
                break;

            case GameState.CHARACTER_SELECT:
                this._drawCharacterSelect(ctx);
                break;

            case GameState.PLAYING:
            case GameState.BOSS_FIGHT:
                this._drawGameplay(ctx);
                break;

            case GameState.LEVEL_TRANSITION:
                this._drawLevelTransition(ctx);
                break;

            case GameState.GAME_OVER:
                this._drawGameOver(ctx);
                break;

            case GameState.VICTORY:
                this._drawVictory(ctx);
                break;

            case GameState.PAUSED:
                // Draw gameplay underneath the pause overlay
                this._drawGameplay(ctx);
                this._drawPauseOverlay(ctx);
                break;
        }

        // Draw FPS counter (debug)
        ctx.fillStyle = '#666666';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('FPS: ' + GameTimer.fps, 4, 12);
    },

    /**
     * Transition to a new game state with validation.
     * @param {string} newState - Target state from GameState enum.
     * @returns {boolean} True if transition succeeded.
     */
    changeState(newState) {
        const success = StateMachine.transition(newState);
        if (success) {
            this.state = StateMachine.current;
        }
        return success;
    },

    /**
     * The main game loop. Called by requestAnimationFrame.
     * @param {number} timestamp - High-resolution timestamp.
     */
    loop(timestamp) {
        // Calculate delta time
        const dt = GameTimer.update(timestamp);

        // Run update and draw
        this.update(dt);
        this.draw();

        // Request next frame
        this._rafId = requestAnimationFrame((ts) => this.loop(ts));
    },

    // --------------------------------------------------------
    // State-specific update handlers (stubs for extension)
    // --------------------------------------------------------

    /** Update logic for the main menu state */
    _updateMenu(dt) {
        // Start game on ENTER or SPACE
        if (Input.isJustPressed('enter') || Input.isJustPressed(' ')) {
            this.changeState(GameState.CHARACTER_SELECT);
        }
    },

    /** Update logic for character select state */
    _updateCharacterSelect(dt) {
        // Navigate selection
        if (Input.isJustPressed('arrowleft') || Input.isJustPressed('a')) {
            this.selectedCharacter = Math.max(0, this.selectedCharacter - 1);
        }
        if (Input.isJustPressed('arrowright') || Input.isJustPressed('d')) {
            this.selectedCharacter = Math.min(3, this.selectedCharacter + 1);
        }

        // Confirm selection
        if (Input.isJustPressed('enter') || Input.isJustPressed(' ')) {
            this.changeState(GameState.PLAYING);
        }

        // Back to menu
        if (Input.isJustPressed('escape')) {
            this.changeState(GameState.MENU);
        }
    },

    /** Update logic for active gameplay (PLAYING and BOSS_FIGHT) */
    _updateGameplay(dt) {
        // Pause on ESC
        if (Input.isJustPressed('escape')) {
            this.changeState(GameState.PAUSED);
            return;
        }

        // Update player
        if (this.player && this.player.alive) {
            this.player.update(dt);
        }

        // Update all entities
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const e = this.entities[i];
            e.update(dt);
            if (!e.alive) {
                this.entities.splice(i, 1);
            }
        }

        // Update object pools (projectiles and particles)
        this.pools.projectiles.updateAll(dt);
        this.pools.particles.updateAll(dt);

        // Update pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const p = this.pickups[i];
            if (p.update) p.update(dt);
            if (!p.alive) {
                this.pickups.splice(i, 1);
            }
        }

        // Update breakables
        for (let i = this.breakables.length - 1; i >= 0; i--) {
            const b = this.breakables[i];
            if (b.update) b.update(dt);
            if (!b.alive) {
                this.breakables.splice(i, 1);
            }
        }

        // Update boss
        if (this.bossActive && this.currentBoss) {
            this.currentBoss.update(dt);
            if (!this.currentBoss.alive) {
                this.bossActive = false;
                this.currentBoss = null;
                Camera.shake(12, 800);
            }
        }

        // Update camera
        const mapW = this.levelData ? this.levelData.width * TILE_SIZE : CANVAS_WIDTH;
        const mapH = this.levelData ? this.levelData.height * TILE_SIZE : CANVAS_HEIGHT;
        Camera.update(this.player, mapW, mapH, dt);

        // Check player death
        if (this.player && !this.player.alive) {
            this.lives--;
            if (this.lives <= 0) {
                this.changeState(GameState.GAME_OVER);
            } else {
                // Respawn player at level start (to be implemented)
                this.player.alive = true;
                this.player.hp = this.player.maxHp;
            }
        }
    },

    /** Update logic for level transition state */
    _updateLevelTransition(dt) {
        // Auto-advance after a delay or on key press
        if (Input.isJustPressed('enter') || Input.isJustPressed(' ')) {
            this.currentLevel++;
            this.changeState(GameState.PLAYING);
        }
    },

    /** Update logic for game over state */
    _updateGameOver(dt) {
        if (Input.isJustPressed('enter') || Input.isJustPressed(' ')) {
            this._resetGame();
            this.changeState(GameState.MENU);
        }
    },

    /** Update logic for victory state */
    _updateVictory(dt) {
        if (Input.isJustPressed('enter') || Input.isJustPressed(' ')) {
            this._resetGame();
            StateMachine.forceState(GameState.VICTORY);
            this.changeState(GameState.MENU);
        }
    },

    /** Update logic for paused state */
    _updatePaused(dt) {
        // Resume on ESC or ENTER
        if (Input.isJustPressed('escape') || Input.isJustPressed('enter')) {
            // Return to previous gameplay state
            const target = this.bossActive ? GameState.BOSS_FIGHT : GameState.PLAYING;
            this.changeState(target);
        }
    },

    // --------------------------------------------------------
    // State-specific draw handlers (stubs for extension)
    // --------------------------------------------------------

    /** Draw the main menu screen */
    _drawMenu(ctx) {
        // Title
        ctx.fillStyle = '#cc3333';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('REALM OF SHADOWS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

        // Subtitle
        ctx.fillStyle = '#888888';
        ctx.font = '16px monospace';
        ctx.fillText('A Top-Down Action RPG', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        // Prompt
        const blink = Math.floor(GameTimer.elapsed * 2) % 2 === 0;
        if (blink) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '18px monospace';
            ctx.fillText('Press ENTER to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
        }

        // Version
        ctx.fillStyle = '#444444';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('Engine v1.0', CANVAS_WIDTH - 10, CANVAS_HEIGHT - 10);
    },

    /** Draw the character selection screen */
    _drawCharacterSelect(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT YOUR HERO', CANVAS_WIDTH / 2, 60);

        // Character slots (placeholders)
        const names = ['Warrior', 'Mage', 'Rogue', 'Ranger'];
        const colors = ['#cc4444', '#4444cc', '#44cc44', '#cccc44'];
        const slotW = 120, slotH = 150, gap = 30;
        const totalW = names.length * slotW + (names.length - 1) * gap;
        const startX = (CANVAS_WIDTH - totalW) / 2;

        for (let i = 0; i < names.length; i++) {
            const sx = startX + i * (slotW + gap);
            const sy = 120;
            const selected = i === this.selectedCharacter;

            // Slot border
            ctx.strokeStyle = selected ? '#ffffff' : '#555555';
            ctx.lineWidth = selected ? 3 : 1;
            ctx.strokeRect(sx, sy, slotW, slotH);

            // Character color block
            ctx.fillStyle = colors[i];
            ctx.globalAlpha = selected ? 1 : 0.4;
            ctx.fillRect(sx + 20, sy + 15, slotW - 40, slotH - 50);
            ctx.globalAlpha = 1;

            // Name
            ctx.fillStyle = selected ? '#ffffff' : '#888888';
            ctx.font = '14px monospace';
            ctx.fillText(names[i], sx + slotW / 2, sy + slotH - 10);
        }

        // Instructions
        ctx.fillStyle = '#888888';
        ctx.font = '14px monospace';
        ctx.fillText('Use A/D or Arrow Keys to choose, ENTER to confirm', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60);
        ctx.fillText('ESC to go back', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 35);
    },

    /** Draw active gameplay (world, entities, HUD) */
    _drawGameplay(ctx) {
        // Apply camera transform for world-space rendering
        Camera.apply(ctx);

        // Draw level tiles (placeholder grid if no level data)
        this._drawLevel(ctx);

        // Draw breakables
        for (let i = 0; i < this.breakables.length; i++) {
            const b = this.breakables[i];
            if (b.draw && b.alive) b.draw(ctx);
        }

        // Draw pickups
        for (let i = 0; i < this.pickups.length; i++) {
            const p = this.pickups[i];
            if (p.draw && p.alive) p.draw(ctx);
        }

        // Draw entities
        for (let i = 0; i < this.entities.length; i++) {
            const e = this.entities[i];
            if (e.alive) e.draw(ctx);
        }

        // Draw boss
        if (this.bossActive && this.currentBoss && this.currentBoss.alive) {
            this.currentBoss.draw(ctx);
        }

        // Draw player
        if (this.player && this.player.alive) {
            this.player.draw(ctx);
        }

        // Draw projectiles
        this.pools.projectiles.drawAll(ctx);

        // Draw particles (on top of everything in world space)
        this.pools.particles.drawAll(ctx);

        // Reset camera transform
        Camera.reset(ctx);

        // Draw HUD in screen space
        this._drawHUD(ctx);
    },

    /** Draw the level tilemap */
    _drawLevel(ctx) {
        if (!this.levelData || !this.levelData.tiles) {
            // Draw a placeholder grid
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 0.5;
            const cols = Math.ceil(CANVAS_WIDTH / TILE_SIZE) + 2;
            const rows = Math.ceil(CANVAS_HEIGHT / TILE_SIZE) + 2;
            const startCol = Math.floor(Camera.x / TILE_SIZE);
            const startRow = Math.floor(Camera.y / TILE_SIZE);

            for (let r = startRow; r < startRow + rows; r++) {
                for (let c = startCol; c < startCol + cols; c++) {
                    ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
            return;
        }

        // Only draw visible tiles for performance
        const startCol = Math.max(0, Math.floor(Camera.x / TILE_SIZE));
        const startRow = Math.max(0, Math.floor(Camera.y / TILE_SIZE));
        const endCol = Math.min(this.levelData.width, Math.ceil((Camera.x + CANVAS_WIDTH) / TILE_SIZE) + 1);
        const endRow = Math.min(this.levelData.height, Math.ceil((Camera.y + CANVAS_HEIGHT) / TILE_SIZE) + 1);

        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                const tile = this.levelData.tiles[r][c];
                const px = c * TILE_SIZE;
                const py = r * TILE_SIZE;

                if (tile === 0) {
                    // Floor tile
                    ctx.fillStyle = '#1a1a2e';
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                } else if (tile === 1) {
                    // Wall tile
                    ctx.fillStyle = '#333355';
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.strokeStyle = '#222244';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
                } else {
                    // Other tiles
                    ctx.fillStyle = '#2a2a3e';
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    },

    /** Draw the heads-up display (health, score, lives, etc.) */
    _drawHUD(ctx) {
        const padding = 10;

        // Health bar (top-left)
        if (this.player) {
            const barW = 200;
            const barH = 16;
            const hx = padding;
            const hy = padding + 16;

            // Label
            ctx.fillStyle = '#cccccc';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText('HP', hx, padding);

            // Background
            ctx.fillStyle = '#222222';
            ctx.fillRect(hx, hy, barW, barH);

            // Health fill
            const ratio = Math.max(0, this.player.hp / this.player.maxHp);
            const healthColor = ratio > 0.5 ? '#22cc44' : ratio > 0.25 ? '#cccc22' : '#cc2222';
            ctx.fillStyle = healthColor;
            ctx.fillRect(hx, hy, barW * ratio, barH);

            // Border
            ctx.strokeStyle = '#666666';
            ctx.lineWidth = 1;
            ctx.strokeRect(hx, hy, barW, barH);

            // HP text
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(
                Math.ceil(this.player.hp) + '/' + this.player.maxHp,
                hx + barW / 2,
                hy + 3
            );
        }

        // Score (top-right)
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('SCORE: ' + this.score, CANVAS_WIDTH - padding, padding);

        // Lives (below score)
        ctx.fillStyle = '#cc3333';
        ctx.font = '14px monospace';
        ctx.fillText('LIVES: ' + this.lives, CANVAS_WIDTH - padding, padding + 22);

        // Level (top-center)
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL ' + (this.currentLevel + 1), CANVAS_WIDTH / 2, padding);

        // Rooms cleared
        if (this.totalRooms > 0) {
            ctx.fillText(
                'Rooms: ' + this.roomsCleared + '/' + this.totalRooms,
                CANVAS_WIDTH / 2,
                padding + 16
            );
        }

        // Boss health bar (bottom of screen during boss fights)
        if (this.bossActive && this.currentBoss && this.currentBoss.alive) {
            const bossBarW = CANVAS_WIDTH - 100;
            const bossBarH = 20;
            const bx = 50;
            const by = CANVAS_HEIGHT - 40;

            // Boss name
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(
                this.currentBoss.name || 'BOSS',
                CANVAS_WIDTH / 2,
                by - 8
            );

            // Background
            ctx.fillStyle = '#220000';
            ctx.fillRect(bx, by, bossBarW, bossBarH);

            // Health fill
            const bossRatio = Math.max(0, this.currentBoss.hp / this.currentBoss.maxHp);
            ctx.fillStyle = '#cc0000';
            ctx.fillRect(bx, by, bossBarW * bossRatio, bossBarH);

            // Border
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(bx, by, bossBarW, bossBarH);
        }
    },

    /** Draw level transition screen */
    _drawLevelTransition(ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LEVEL ' + (this.currentLevel + 2), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        ctx.fillStyle = '#888888';
        ctx.font = '16px monospace';
        ctx.fillText('Press ENTER to continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    },

    /** Draw game over screen */
    _drawGameOver(ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#cc0000';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText('Final Score: ' + this.score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

        const blink = Math.floor(GameTimer.elapsed * 2) % 2 === 0;
        if (blink) {
            ctx.fillStyle = '#888888';
            ctx.font = '16px monospace';
            ctx.fillText('Press ENTER to return to menu', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
        }
    },

    /** Draw victory screen */
    _drawVictory(ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VICTORY!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText('Final Score: ' + this.score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

        ctx.fillStyle = '#888888';
        ctx.font = '16px monospace';
        ctx.fillText('The realm is safe... for now.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);

        const blink = Math.floor(GameTimer.elapsed * 2) % 2 === 0;
        if (blink) {
            ctx.fillStyle = '#cccccc';
            ctx.font = '16px monospace';
            ctx.fillText('Press ENTER to return to menu', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 110);
        }
    },

    /** Draw pause overlay on top of gameplay */
    _drawPauseOverlay(ctx) {
        // Semi-transparent dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        ctx.fillStyle = '#888888';
        ctx.font = '16px monospace';
        ctx.fillText('Press ESC or ENTER to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    },

    // --------------------------------------------------------
    // Utility methods
    // --------------------------------------------------------

    /**
     * Spawn a burst of particles at a world position.
     * @param {number} x - World x.
     * @param {number} y - World y.
     * @param {number} count - Number of particles.
     * @param {string} color - CSS color string.
     * @param {Object} [opts] - Optional overrides: { speed, life, size, gravity }.
     */
    spawnParticles(x, y, count, color, opts) {
        const options = opts || {};
        const speed = options.speed || 80;
        const life = options.life || 0.5;
        const size = options.size || 3;
        const gravity = options.gravity || 0;

        for (let i = 0; i < count; i++) {
            const p = this.pools.particles.get();
            const angle = Math.random() * Math.PI * 2;
            const spd = speed * (0.5 + Math.random() * 0.5);
            p.x = x;
            p.y = y;
            p.vx = Math.cos(angle) * spd;
            p.vy = Math.sin(angle) * spd;
            p.life = life * (0.5 + Math.random() * 0.5);
            p.maxLife = p.life;
            p.size = size * (0.5 + Math.random());
            p.color = color;
            p.gravity = gravity;
        }
    },

    /**
     * Spawn a projectile from a position in a given direction.
     * @param {number} x - Spawn x.
     * @param {number} y - Spawn y.
     * @param {number} angle - Direction in radians.
     * @param {Object} owner - The entity that fired it.
     * @param {Object} [opts] - Optional overrides: { speed, damage, color, radius, life, piercing }.
     * @returns {Object} The spawned projectile.
     */
    spawnProjectile(x, y, angle, owner, opts) {
        const options = opts || {};
        const proj = this.pools.projectiles.get();
        proj.x = x;
        proj.y = y;
        proj.speed = options.speed || 200;
        proj.vx = Math.cos(angle) * proj.speed;
        proj.vy = Math.sin(angle) * proj.speed;
        proj.damage = options.damage || 10;
        proj.color = options.color || '#ffff00';
        proj.radius = options.radius || 4;
        proj.w = proj.radius * 2;
        proj.h = proj.radius * 2;
        proj.life = options.life || 3;
        proj.piercing = options.piercing || false;
        proj.owner = owner;
        return proj;
    },

    /**
     * Reset the game to its initial state.
     */
    _resetGame() {
        this.currentLevel = 0;
        this.score = 0;
        this.lives = 3;
        this.player = null;
        this.entities = [];
        this.pickups = [];
        this.breakables = [];
        this.levelData = null;
        this.bossActive = false;
        this.currentBoss = null;
        this.roomsCleared = 0;
        this.totalRooms = 0;
        this.selectedCharacter = 0;
        this.paused = false;
        this._running = true;

        // Release all pooled objects
        this.pools.particles.releaseAll();
        this.pools.projectiles.releaseAll();

        // Reset input
        Input.reset();
    },

    /**
     * Stop the game loop and clean up.
     */
    destroy() {
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this._running = false;
        console.log('[Game] Engine destroyed.');
    }
};

// ============================================================
// AUTO-INITIALIZE ON DOM READY
// ============================================================

/**
 * Start the engine when the DOM is ready.
 * If the script is loaded after the canvas exists, it starts immediately.
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Game.init());
} else {
    Game.init();
}
