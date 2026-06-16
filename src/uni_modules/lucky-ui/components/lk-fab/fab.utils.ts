import type { CSSProperties, StyleValue } from 'vue';
import type { FabAction, FabDirection, FabPosition } from './fab.props';

const themeColors: Record<string, string> = {
  primary: 'var(--lk-color-primary)',
};

export function toFabRpx(value: string | number): number {
  if (typeof value === 'number') return value;
  if (value.endsWith('rpx')) return parseFloat(value);
  if (value.endsWith('px')) return parseFloat(value) * 2;
  return parseFloat(value);
}

export function resolveFabSafeBottom(options: {
  safeAreaInsetBottom: boolean;
  safeBottom: number;
}): number {
  return options.safeAreaInsetBottom ? options.safeBottom : 0;
}

export function resolveFabInitialPosition(options: {
  position: FabPosition;
  windowWidth: number;
  windowHeight: number;
  sizePx: number;
  offsetPx: number;
  safeBottomPx: number;
  statusBarHeight: number;
}) {
  const right = options.windowWidth - options.sizePx - options.offsetPx;
  const bottom = options.windowHeight - options.sizePx - options.offsetPx - options.safeBottomPx;
  const top = options.offsetPx + options.statusBarHeight;

  if (options.position === 'bottom-left') return { x: options.offsetPx, y: bottom };
  if (options.position === 'top-right') return { x: right, y: top };
  if (options.position === 'top-left') return { x: options.offsetPx, y: top };
  return { x: right, y: bottom };
}

export function resolveFabBounds(options: {
  windowWidth: number;
  windowHeight: number;
  sizePx: number;
  safeBottomPx: number;
  statusBarHeight: number;
}) {
  return {
    minX: 0,
    maxX: options.windowWidth - options.sizePx,
    minY: options.statusBarHeight,
    maxY: options.windowHeight - options.sizePx - options.safeBottomPx,
  };
}

export function applyFabRubberBand(value: number, min: number, max: number): number {
  if (value < min) return min - (min - value) * 0.3;
  if (value > max) return max + (value - max) * 0.3;
  return value;
}

export function resolveFabDragPosition(options: {
  startPosX: number;
  startPosY: number;
  dx: number;
  dy: number;
  windowWidth: number;
  windowHeight: number;
  sizePx: number;
  safeBottomPx: number;
  statusBarHeight: number;
}) {
  const bounds = resolveFabBounds(options);
  return {
    x: applyFabRubberBand(options.startPosX + options.dx, bounds.minX, bounds.maxX),
    y: applyFabRubberBand(options.startPosY + options.dy, bounds.minY, bounds.maxY),
  };
}

export function resolveFabFinalPosition(options: {
  x: number;
  y: number;
  windowWidth: number;
  windowHeight: number;
  sizePx: number;
  safeBottomPx: number;
  statusBarHeight: number;
  magnetic: boolean;
  offsetPx: number;
  velocityX: number;
}) {
  const bounds = resolveFabBounds(options);
  let finalX = Math.max(bounds.minX, Math.min(bounds.maxX, options.x));
  const finalY = Math.max(bounds.minY, Math.min(bounds.maxY, options.y));

  if (options.magnetic) {
    const predictX = finalX + options.sizePx / 2 + options.velocityX * 150;
    finalX =
      predictX < options.windowWidth / 2
        ? options.offsetPx
        : options.windowWidth - options.sizePx - options.offsetPx;
  }

  return { x: finalX, y: finalY };
}

export function canClickFabAction(action: FabAction): boolean {
  return !action.disabled;
}

export function shouldToggleFabOnClick(actionCount: number): boolean {
  return actionCount > 0;
}

export function shouldCloseFabOnOverlay(closeOnOverlay: boolean): boolean {
  return closeOnOverlay;
}

export function resolveFabThemeColor(color: string): string {
  return themeColors[color] || color;
}

export function resolveFabMainStyle(options: {
  posX: number;
  posY: number;
  sizePx: number;
  zIndex: number;
  color: string;
  dragging: boolean;
}): CSSProperties & Record<string, string | number> {
  return {
    left: `${options.posX}px`,
    top: `${options.posY}px`,
    width: `${options.sizePx}px`,
    height: `${options.sizePx}px`,
    zIndex: options.zIndex,
    '--fab-color': resolveFabThemeColor(options.color),
    transition: options.dragging
      ? 'none'
      : 'left 0.35s cubic-bezier(0.25, 1, 0.5, 1), top 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
  };
}

export function resolveFabRootStyle(options: {
  zIndex: number;
  customStyle: StyleValue;
}): StyleValue {
  return [{ zIndex: options.zIndex }, options.customStyle];
}

export function resolveFabMainClass(options: {
  expanded: boolean;
  dragging: boolean;
  blur: boolean;
}) {
  return [
    'lk-fab__main',
    {
      'is-expanded': options.expanded,
      'is-dragging': options.dragging,
      'is-blur': options.blur,
    },
  ];
}

export function resolveFabActionClass(options: {
  action: FabAction;
  blur: boolean;
  atRightSide: boolean;
}) {
  return {
    'is-disabled': !!options.action.disabled,
    'is-blur': options.blur,
    'is-at-right': options.atRightSide,
    'is-at-left': !options.atRightSide,
  };
}

export function resolveFabDirection(options: {
  preferred: FabDirection;
  actionSizePx: number;
  gapPx: number;
  actionCount: number;
  sizePx: number;
  posX: number;
  posY: number;
  windowWidth: number;
  windowHeight: number;
  safeBottomPx: number;
  statusBarHeight: number;
}): FabDirection {
  const needed = (options.actionSizePx + options.gapPx) * Math.max(options.actionCount, 1);
  const spaces: Record<FabDirection, number> = {
    up: Math.max(0, options.posY - options.statusBarHeight),
    down: Math.max(
      0,
      options.windowHeight - options.safeBottomPx - (options.posY + options.sizePx)
    ),
    left: Math.max(0, options.posX),
    right: Math.max(0, options.windowWidth - (options.posX + options.sizePx)),
  };

  if (spaces[options.preferred] >= needed) return options.preferred;

  const priorities: Record<FabDirection, FabDirection[]> = {
    up: ['up', 'down', 'left', 'right'],
    down: ['down', 'up', 'left', 'right'],
    left: ['left', 'right', 'up', 'down'],
    right: ['right', 'left', 'up', 'down'],
  };

  for (const direction of priorities[options.preferred]) {
    if (spaces[direction] >= needed) return direction;
  }

  return (Object.entries(spaces).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    options.preferred) as FabDirection;
}

export function resolveFabActionStyle(options: {
  index: number;
  actionSizePx: number;
  gapPx: number;
  sizePx: number;
  direction: FabDirection;
  expanded: boolean;
  actionCount: number;
}): CSSProperties {
  const distance = (options.actionSizePx + options.gapPx) * (options.index + 1);
  const offsetToCenter = options.sizePx / 2 - options.actionSizePx / 2;

  let x = offsetToCenter;
  let y = offsetToCenter;

  if (options.direction === 'up') y = -distance + offsetToCenter;
  if (options.direction === 'down') y = distance + offsetToCenter;
  if (options.direction === 'left') x = -distance + offsetToCenter;
  if (options.direction === 'right') x = distance + offsetToCenter;

  return {
    width: `${options.actionSizePx}px`,
    height: `${options.actionSizePx}px`,
    transform: options.expanded
      ? `translate(${x}px, ${y}px) scale(1)`
      : `translate(${offsetToCenter}px, ${offsetToCenter}px) scale(0)`,
    opacity: options.expanded ? 1 : 0,
    transitionDelay: options.expanded
      ? `${options.index * 0.05}s`
      : `${(options.actionCount - options.index - 1) * 0.03}s`,
  };
}

export function resolveFabIconStyle(options: {
  expanded: boolean;
  activeIcon: string;
}): CSSProperties {
  return {
    transform: options.expanded && !options.activeIcon ? 'rotate(45deg)' : 'rotate(0deg)',
    transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
  };
}

export function resolveFabIsAtRightSide(options: {
  posX: number;
  sizePx: number;
  windowWidth: number;
}): boolean {
  return options.posX + options.sizePx / 2 > options.windowWidth / 2;
}

export function resolveFabCurrentIcon(options: {
  expanded: boolean;
  icon: string;
  activeIcon: string;
}): string {
  return options.expanded && options.activeIcon ? options.activeIcon : options.icon;
}
