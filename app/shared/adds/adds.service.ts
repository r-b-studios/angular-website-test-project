import { Injectable } from '@angular/core';
import { get, getDatabase, ref, DataSnapshot } from '@firebase/database';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AddsService {

  constructor(public auth: AuthService) { }

  public id(id: string): HTMLElement {
    return document.getElementById(id) as HTMLElement;
  }

  public getUID(): string | null {
    if (this.auth.signedIn) {
      return this.auth.user.uid + '-' + Date.now().toString() + '-' + ((Math.random() * 1000000) | 0).toString();
    } else {
      return null;
    }
  }

  public keys(ds: DataSnapshot, key: string): string[] {
    return ds.hasChild(key) ? Object.keys(ds.child(key).toJSON()) : [];
  }
}