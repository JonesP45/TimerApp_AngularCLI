import { Injectable } from '@angular/core';
import {Tache} from './model/tache';

@Injectable({
  providedIn: 'root'
})
export class StockageLocalService {

  constructor() { }

  taches: object[] = [];

  recupererTaches() {
    try {
      if (localStorage.taches != null) {
        return JSON.parse(localStorage.taches);
      } else {
        return [];
      }
    } catch (error) {
      console.error('Imposible de récupérer depuis localStorage', error);
    }
  }

  stockerTache(tache: Tache) {
    try {
      this.taches = this.recupererTaches();
      this.taches.push(tache);
      localStorage.taches = JSON.stringify(this.taches);
    } catch (error) {
      console.error('Imposible de persister dans localStorage', error);
    }
  }
}
