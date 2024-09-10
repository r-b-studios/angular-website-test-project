import { Injectable } from '@angular/core';
import { onAuthStateChanged } from '@angular/fire/auth';
import { getAuth, signOut, GoogleAuthProvider, User, signInWithPopup } from '@firebase/auth';
import { get, getDatabase, ref } from '@firebase/database';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user: User;
  public isAdmin: boolean;

  public get signedIn(): boolean {
    return this.user != null;
  }

  constructor() { 
    const auth = getAuth();

    onAuthStateChanged(auth, user => {
      this.user = user;

      if (this.signedIn) {
        const db = getDatabase();

        get(ref(db, 'admin/' + user.uid))
          .then(res => {
            this.isAdmin = res.exists();
          });
      } else {
        this.isAdmin = false;
      }
    });
  }
  
  public signIn(): void {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .catch(console.error);
  }

  public signOut(): void {
    const auth = getAuth();
    
    signOut(auth)
      .catch(err => {
        console.error(err.message);
      });
  }
}