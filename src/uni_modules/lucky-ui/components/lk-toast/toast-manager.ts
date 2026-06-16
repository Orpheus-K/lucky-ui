import { ref, reactive } from 'vue';
import { createToastItem, shouldScheduleToastClose, type ToastItem } from './toast.utils';
export type { ToastItem } from './toast.utils';

const list = ref<ToastItem[]>([]);
let seed = 0;

export function useToast() {
  function show(opts: Partial<ToastItem> | string) {
    const opt = createToastItem({
      id: ++seed,
      input: opts,
    });
    list.value.push(opt);
    if (shouldScheduleToastClose(opt.duration)) {
      setTimeout(() => hide(opt.id), opt.duration);
    }
    return opt.id;
  }

  function hide(id: number) {
    const item = list.value.find(t => t.id === id);
    if (item) {
      item.visible = false;
    }
  }

  function remove(id: number) {
    list.value = list.value.filter(t => t.id !== id);
  }

  function close(id: number) {
    hide(id);
  }

  function clear() {
    list.value = [];
  }
  return { show, close, hide, remove, clear, list };
}

export const toastStore = reactive(useToast());
