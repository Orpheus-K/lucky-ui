export interface ScrollLockStyle {
  overflow: string;
}

export type ScrollLockTargetResolver = () => ScrollLockStyle | null;

const activeOwners = new Set<object>();
let activeStyle: ScrollLockStyle | null = null;
let ownedOverflow = '';

function resolveBodyStyle(): ScrollLockStyle | null {
  let style: ScrollLockStyle | null = null;
  // #ifdef H5
  if (typeof document !== 'undefined' && document.body) style = document.body.style;
  // #endif
  return style;
}

function acquire(owner: object, style: ScrollLockStyle): boolean {
  if (activeOwners.has(owner)) return true;

  if (activeOwners.size === 0) {
    activeStyle = style;
    ownedOverflow = style.overflow;
    style.overflow = 'hidden';
  } else if (activeStyle !== style) {
    return false;
  }

  activeOwners.add(owner);
  return true;
}

function release(owner: object): void {
  if (!activeOwners.delete(owner) || activeOwners.size > 0) return;

  if (activeStyle?.overflow === 'hidden') activeStyle.overflow = ownedOverflow;
  activeStyle = null;
  ownedOverflow = '';
}

export function createBodyScrollLock(resolveTarget: ScrollLockTargetResolver = resolveBodyStyle) {
  const owner = {};

  return {
    sync(shouldLock: boolean): boolean {
      if (!shouldLock) {
        release(owner);
        return false;
      }

      if (activeOwners.has(owner)) return true;
      const target = resolveTarget();
      return target ? acquire(owner, target) : false;
    },
    release(): void {
      release(owner);
    },
    isLocked(): boolean {
      return activeOwners.has(owner);
    },
  };
}
