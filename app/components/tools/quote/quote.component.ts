import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { getDatabase, get, set, remove, ref } from '@firebase/database';
import { AddsService } from 'src/app/shared/adds/adds.service';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss']
})
export class QuoteComponent implements OnInit {

  @Output() public onDelete = new EventEmitter();
  @Input() public key: string;
  public previous: string;
  public quote: string;
  public description: string;
  public author: string;
  public likes: string[];
  public dislikes: string[];
  public comments: string[];
  public commentsShown: boolean;
  public editMode: boolean;

  public get liked(): boolean {
    if (this.auth.signedIn) {
      return this.likes.includes(this.auth.user.uid);
    }

    return false;
  }

  public get disliked(): boolean {
    if (this.auth.signedIn) {
      return this.dislikes.includes(this.auth.user.uid);
    }

    return false;
  }

  constructor(public adds: AddsService, public auth: AuthService) { }

  ngOnInit(): void {
    const db = getDatabase();

    get(ref(db, 'quotes/' + this.key))
      .then(res => {
        if (res.exists()) {
          this.previous = res.child('previous').val();
          this.quote = res.child('quote').val();
          this.description = res.child('description').val();
          this.author = res.child('author').val();
          this.likes = this.adds.keys(res, 'likes');
          this.dislikes = this.adds.keys(res, 'dislikes');
          this.comments = this.adds.keys(res, 'comments');
        } else {

          this.onDelete.emit();
        }
      });
  }

  public like(): void {
    if (this.auth.signedIn) {
      const db = getDatabase();
      const lref = ref(db, 'quotes/' + this.key + '/likes/' + this.auth.user.uid);
      const dref = ref(db, 'quotes/' + this.key + '/dislikes/' + this.auth.user.uid);
  
      get(lref).then(a => {
        if (a.exists()) {
          remove(lref);
          this.likes = this.likes.filter(x => x != this.auth.user.uid);
        } else {
          set(lref, '');
          this.likes.push(this.auth.user.uid);
  
          get(dref).then(b => {
            if (b.exists()) {
              remove(dref);
              this.dislikes = this.dislikes.filter(x => x != this.auth.user.uid);
            }
          });
        } 
      });
    }
  }

  public dislike(): void {
    if (this.auth.signedIn) {
      const db = getDatabase();
      const lref = ref(db, 'quotes/' + this.key + '/likes/' + this.auth.user.uid);
      const dref = ref(db, 'quotes/' + this.key + '/dislikes/' + this.auth.user.uid);
  
      get(dref).then(a => {
        if (a.exists()) {
          remove(dref);
          this.dislikes = this.dislikes.filter(x => x != this.auth.user.uid);
        } else {
          set(dref, '');
          this.dislikes.push(this.auth.user.uid);
  
          get(lref).then(b => {
            if (b.exists()) {
              remove(lref);
              this.likes = this.likes.filter(x => x != this.auth.user.uid);
            }
          });
        } 
      });
    }
  }

  public sendComment(): void {
    if (this.auth.signedIn) {
      const db = getDatabase();
      const $message = this.adds.id('message-input') as HTMLTextAreaElement;

      if ($message.value.length > 0) {
        const uid = this.adds.getUID();

        set(ref(db, 'quotes/' + this.key + '/comments/' + uid), {
          author: this.auth.user.displayName,
          authorUID: this.auth.user.uid,
          message: $message.value,
          time: Date.now().toString()
        }).then(() => {
          this.comments.push(uid);
          $message.value = '';
        });
      }
    }
  }

  public deleteComment(key: string): void {
    if (this.auth.signedIn) {
      const db = getDatabase();
      const $ref =  ref(db, 'quotes/' + this.key + '/comments/' + key);

      get($ref)
        .then(res => {
          if (res.child('authorUID').val() == this.auth.user.uid || this.auth.isAdmin) {
            remove($ref)
              .then(() => {
                this.comments = this.comments.filter(x => x != key);
              });
          }
        });
    }
  }

  public edit(cancel: boolean = false): void {
    if (this.auth.isAdmin) {
      const $quote = this.adds.id('quote-' + this.key) as HTMLInputElement;
      const $author = this.adds.id('author-' + this.key) as HTMLInputElement;
      const $previous = this.adds.id('previous-' + this.key) as HTMLInputElement;
      const $description = this.adds.id('description-' + this.key) as HTMLInputElement;
  
      if (this.editMode) {
  
        if ($quote.value.length > 0 && $author.value.length > 0) {
  
          const db = getDatabase();
  
          if (!cancel) {
            set(ref(db, 'quotes/' + this.key + '/quote'), this.quote = $quote.value);
            set(ref(db, 'quotes/' + this.key + '/author'), this.author = $author.value);
            set(ref(db, 'quotes/' + this.key + '/previous'), this.previous = $previous.value);
            set(ref(db, 'quotes/' + this.key + '/description'), this.description = $description.value);
          }
  
          $quote.value = $author.value = $previous.value = $description.value = '';
        }
      } else {
        $quote.value = this.quote;
        $author.value = this.author;
        $previous.value = this.previous;
        $description.value = this.description;
      }
  
      this.editMode = !this.editMode;
    }
  }
}