interface Point {
  clientX: number;
  clientY: number;
  identifier: number;
}

interface DesktopScrollHandlers {
  enabled: () => boolean;
  start: (point: Point) => void;
  move: (point: Point) => boolean;
  end: (point: Point) => void;
  cancel: () => void;
  step: (direction: number) => void;
}

/** H5 输入适配：只监听组件自己的根节点，不访问 uni-app 内部 DOM。 */
export function bindHorizontalScrollDesktop(root: HTMLElement, handlers: DesktopScrollHandlers) {
  let pointerId: number | undefined;
  let suppressClick = false;
  let wheelTimer: ReturnType<typeof setTimeout> | undefined;
  const point = (event: PointerEvent): Point => ({
    clientX: event.clientX,
    clientY: event.clientY,
    identifier: event.pointerId,
  });
  const down = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.button !== 0 || !handlers.enabled()) return;
    pointerId = event.pointerId;
    suppressClick = false;
    handlers.start(point(event));
  };
  const move = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    if (handlers.move(point(event))) {
      suppressClick = true;
      event.preventDefault();
      // 开始横向拖拽后捕获指针，移出卡片再松手也能正确结束。
      if (!root.hasPointerCapture(event.pointerId)) root.setPointerCapture(event.pointerId);
    }
  };
  const up = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    pointerId = undefined;
    handlers.end(point(event));
    if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
  };
  const cancel = () => {
    if (pointerId === undefined) return;
    const id = pointerId;
    pointerId = undefined;
    handlers.cancel();
    if (root.hasPointerCapture(id)) root.releasePointerCapture(id);
  };
  const leave = () => {
    if (pointerId !== undefined && !root.hasPointerCapture(pointerId)) cancel();
  };
  const click = (event: MouseEvent) => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const wheel = (event: WheelEvent) => {
    if (!handlers.enabled() || pointerId !== undefined) return;
    const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
    if (!delta || (!event.shiftKey && Math.abs(event.deltaY) > Math.abs(delta))) return;
    event.preventDefault();
    // 一次触控板滚动（含惯性事件）只前进一项；纵向滚轮留给页面。
    if (!wheelTimer) handlers.step(Math.sign(delta));
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      wheelTimer = undefined;
    }, 180);
  };
  root.addEventListener('pointerdown', down);
  root.addEventListener('pointermove', move);
  root.addEventListener('pointerup', up);
  root.addEventListener('pointercancel', cancel);
  root.addEventListener('lostpointercapture', cancel);
  root.addEventListener('pointerleave', leave);
  root.addEventListener('click', click, true);
  root.addEventListener('wheel', wheel, { passive: false });
  return () => {
    cancel();
    clearTimeout(wheelTimer);
    root.removeEventListener('pointerdown', down);
    root.removeEventListener('pointermove', move);
    root.removeEventListener('pointerup', up);
    root.removeEventListener('pointercancel', cancel);
    root.removeEventListener('lostpointercapture', cancel);
    root.removeEventListener('pointerleave', leave);
    root.removeEventListener('click', click, true);
    root.removeEventListener('wheel', wheel);
  };
}
