import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  private scrollY = 0;
  private shouldRestore = false;

  save() {
    this.scrollY = window.scrollY;
    this.shouldRestore = true;
  }

  restoreIfNeeded() {
    if (this.shouldRestore) {
      window.scrollTo({ top: this.scrollY });
      this.shouldRestore = false;
    }
  }

  markForRestore() {
    this.shouldRestore = true;
  }

  clear() {
    this.shouldRestore = false;
  }
}
