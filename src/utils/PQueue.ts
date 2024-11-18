import { QueueItem } from "../types/PuzzleTypes";

class PQueue {
  private queue: QueueItem[] = [];

  constructor(items: QueueItem[]) {
    this.queue = items;
    this.sort();
  }

  sort() {
    this.queue.sort((a, b) => a.f - b.f);
  }

  add(item: QueueItem) {
    this.queue.push(item);
    this.sort();
  }

  addMany(items: QueueItem[]) {
    this.queue.push(...items);
    this.sort();
  }

  first(): QueueItem | undefined {
    return this.queue[0];
  }

  dequeue(): QueueItem | undefined {
    return this.queue.shift();
  }

  size(): number {
    return this.queue.length;
  }

  getItems(): QueueItem[] {
    return this.queue;
  }
}

export default PQueue;
