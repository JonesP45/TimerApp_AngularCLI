import { Component } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Dev-MultiPlat';
  constructor() {
    const config = {
      apiKey: 'AIzaSyCcW0fuN0UHMtabMy3zPJyX3aOoGDxkM4g',
      authDomain: 'dev-multi-plat.firebaseapp.com',
      databaseURL: 'https://dev-multi-plat.firebaseio.com',
      projectId: 'dev-multi-plat',
      storageBucket: 'dev-multi-plat.appspot.com',
      messagingSenderId: '393575435207',
      appId: '1:393575435207:web:7b8c26f1ab3529aac8e7e2'
    };
    firebase.initializeApp(config);
  }
}
