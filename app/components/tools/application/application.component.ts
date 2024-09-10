import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { getDownloadURL } from '@angular/fire/storage';
import { getStorage, ref } from '@firebase/storage';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit {

  @Input() public data: {
    title: string,
    description: string,
    imageURL: string,
    downloadURL: string,
    downloadSize: string,
    installationSize: string,
    type: string,
    publishDate: string
  };

  public detailsShown: boolean = false;

  constructor() { }

  ngOnInit(): void { }

  public async download(): Promise<void> {
    const storage = getStorage();
    const dldRef = ref(storage, this.data.downloadURL);
    const url = await getDownloadURL(dldRef);
    
    let a = document.createElement('a');
    a.href = url;
    a.download = this.data.downloadURL;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}