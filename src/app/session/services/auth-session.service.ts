import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private auth = inject(Auth);
  private initPromise: Promise<User>;

  constructor() {
    this.initPromise = this.ensureSession();
  }

  async ensureReady(): Promise<User> {
    return this.initPromise;
  }

  private async ensureSession(): Promise<User> {
    const user = await new Promise<User | null>((resolve) => {
      const unsub = onAuthStateChanged(this.auth, (u) => {
        unsub();
        resolve(u);
      });
    });

    if (user) return user;

    const cred = await signInAnonymously(this.auth);
    return cred.user;
  }
}
