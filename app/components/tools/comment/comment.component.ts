import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { get, getDatabase, ref, remove } from '@firebase/database';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { DatabaseService } from 'src/app/shared/database/database.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Output() public onDelete = new EventEmitter();
  @Input() public key: string;
  @Input() public quoteKey: string;
  public author: string;
  public authorUID: string;
  public message: string;
  public time: string;

  public get info(): string {
    function z(v: number): string {
      const $v = v.toString();
      return $v.length > 1 ? $v : '0' + $v;
    }

    const t = new Date(parseInt(this.time));
    return `${this.author} am ${z(t.getDate())}.${z(t.getMonth() + 1)}.${t.getFullYear()} um ${z(t.getHours())}:${z(t.getMinutes())}`;
  }

  constructor() { }

  ngOnInit(): void { 
    const db = getDatabase();

    get(ref(db, 'quotes/' + this.quoteKey + '/comments/' + this.key))
      .then(res => {
        if (res.exists()) {
          this.author = res.child('author').val();
          this.authorUID = res.child('authorUID').val();
          this.message = res.child('message').val();
          this.time = res.child('time').val();
        } else {
          this.onDelete.emit();
        }
      });
  }
}