import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthSessionService } from './session/services/auth-session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('dianedStore2');
  private session = inject(AuthSessionService);

  async ngOnInit() {
    await this.session.ensureReady();
  }
}
