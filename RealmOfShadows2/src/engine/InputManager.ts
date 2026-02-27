import { InputState } from '../types';

const KEY_MAP: Record<string, keyof typeof ACTION_MAP> = {
  'ArrowLeft': 'left',
  'ArrowRight': 'right',
  'ArrowUp': 'up',
  'ArrowDown': 'down',
  'KeyA': 'left',
  'KeyD': 'right',
  'KeyW': 'up',
  'KeyS': 'down',
  'Space': 'jump',
  'KeyZ': 'attack',
  'KeyX': 'roll',
  'KeyJ': 'attack',
  'KeyK': 'roll',
  'KeyE': 'interact',
  'Enter': 'interact',
  'Escape': 'pause',
  'KeyP': 'pause',
};

const ACTION_MAP = {
  left: true,
  right: true,
  up: true,
  down: true,
  jump: true,
  attack: true,
  roll: true,
  interact: true,
  pause: true,
} as const;

type Action = keyof typeof ACTION_MAP;

export class InputManager {
  private held = new Set<Action>();
  private justPressed = new Set<Action>();
  private justPressedBuffer = new Set<Action>(); // accumulated between polls
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundBlur: () => void;

  constructor() {
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundBlur = this.onBlur.bind(this);
  }

  attach() {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('blur', this.boundBlur);
  }

  detach() {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('blur', this.boundBlur);
  }

  private onKeyDown(e: KeyboardEvent) {
    const action = KEY_MAP[e.code];
    if (action) {
      e.preventDefault();
      if (!this.held.has(action)) {
        this.justPressedBuffer.add(action);
      }
      this.held.add(action);
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    const action = KEY_MAP[e.code];
    if (action) {
      e.preventDefault();
      this.held.delete(action);
    }
  }

  private onBlur() {
    this.held.clear();
    this.justPressedBuffer.clear();
  }

  /** Call once per game frame to get current input snapshot */
  poll(): InputState {
    // Transfer buffered just-pressed to snapshot, then clear buffer
    this.justPressed = new Set(this.justPressedBuffer);
    this.justPressedBuffer.clear();

    return {
      left: this.held.has('left'),
      right: this.held.has('right'),
      up: this.held.has('up'),
      down: this.held.has('down'),
      jump: this.held.has('jump'),
      jumpJustPressed: this.justPressed.has('jump'),
      attack: this.held.has('attack'),
      attackJustPressed: this.justPressed.has('attack'),
      roll: this.held.has('roll'),
      rollJustPressed: this.justPressed.has('roll'),
      interact: this.held.has('interact'),
      interactJustPressed: this.justPressed.has('interact'),
      pause: this.held.has('pause'),
      pauseJustPressed: this.justPressed.has('pause'),
    };
  }
}
