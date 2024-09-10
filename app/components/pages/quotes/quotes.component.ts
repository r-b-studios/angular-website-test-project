import { Component, OnInit } from '@angular/core';
import { getDatabase, get, set, remove, ref, DataSnapshot } from '@firebase/database';
import { AddsService } from 'src/app/shared/adds/adds.service';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.scss']
})
export class QuotesComponent implements OnInit {

  public quotes: string[] = [];
  public suggestions: { quote: string, key: string }[] = [];
  private $suggestions: HTMLElement;
  private $search: HTMLInputElement;
  private latestSearch: string;

  constructor(public auth: AuthService, public adds: AddsService) { }

  ngOnInit(): void { 
    this.$suggestions = this.adds.id('suggestions');
    this.$search = this.adds.id('search') as HTMLInputElement;
    this.latestSearch = this.$search.value;

    this.$search.onblur = e => {
      const sender = e.relatedTarget as HTMLElement;
      setTimeout(() => this.suggestions = [], 100);
    };

    const db = getDatabase();

    get(ref(db, 'quotes'))
      .then(res => {
        const keys = Object.keys(res.toJSON());
        let temp: DataSnapshot[] = [];

        keys.forEach(k => {
          temp.push(res.child(k));
        });

        for (let k = 0; k < temp.length; k++) {
          for (let i = 0; i < temp.length - 1; i++) {

            const a = this.adds.keys(temp[i], 'likes').length - this.adds.keys(temp[i], 'dislikes').length;
            const b = this.adds.keys(temp[i + 1], 'likes').length - this.adds.keys(temp[i + 1], 'dislikes').length;

            if (a < b || Math.random() < 0.5) {
              const tmp = temp[i + 1];
              temp[i + 1] = temp[i];
              temp[i] = tmp;
            }
          }
        }

        temp.forEach(q => {
          this.quotes.push(q.key);
        });
      });

    setInterval(() => this.search());
  }

  public focusSearch(): void {
    this.adds.id('search').focus();
  }

  public createQuote(): void {
    if (this.auth.signedIn && this.auth.isAdmin) {

      const $quote = this.adds.id('quote-input') as HTMLTextAreaElement;
      const $author = this.adds.id('author-input') as HTMLTextAreaElement;

      if ($quote.value.length > 0 && $author.value.length > 0) {

        const $previous = this.adds.id('previous-input') as HTMLTextAreaElement;
        const $description = this.adds.id('description-input') as HTMLTextAreaElement;

        const db = getDatabase();
        const uid = this.adds.getUID();

        set(ref(db, 'quotes/' + uid), {
          previous: $previous.value,
          quote: $quote.value,
          description: $description.value,
          author: $author.value
        }).then(() => {
          let temp = [ uid ];
          this.quotes.forEach(x => temp.push(x));
          this.quotes = temp;

          $previous.value = $description.value = $quote.value = $author.value = '';
        })
      }
    }
  }

  public deleteQuote(key: string): void {
    this.quotes = this.quotes.filter(f => f != key);

    const db = getDatabase();
    remove(ref(db, 'quotes/' + key));
  }

  public search(onChangeOnly: boolean = true): void {
    if ((this.$search.value != this.latestSearch || !onChangeOnly) && this.$search.value.length > 0) {
      this.latestSearch = this.$search.value;
      let _suggestions = [];

      this.quotes.forEach(q => {
        const db = getDatabase();
      
        get(ref(db, 'quotes/' + q))
          .then(res => {
            const quote = res.child('quote').val();

            const array: string[] = [
              quote,
              res.child('previous').val(),
              res.child('description').val(),
              res.child('author').val()
            ];

            let matches = false;

            array.forEach(x => {
              if (x.toLowerCase().includes(this.$search.value.toLowerCase())) {
                matches = true;
              }
            });

            if (_suggestions.length < 10) {
              if (matches) {
                _suggestions.push({
                  quote: quote,
                  key: q
                });
              }
            }
          });
      });

      this.suggestions = _suggestions;
    }

    if (this.$search.value.length == 0) {
      this.suggestions = [];
    }
  }

  public goToQuote(key: string): void {
    const quote = this.adds.id(key);
    const rect = quote.getBoundingClientRect();
    const y = rect.top  + scrollY - 150;

    scrollTo(0, y);
  }
}