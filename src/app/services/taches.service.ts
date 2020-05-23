import { Injectable } from '@angular/core';
import { Tache } from '../model/tache';
import * as firebase from 'firebase';
import DataSnapshot = firebase.database.DataSnapshot;
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TachesService {

  taches: Tache[] = [];
  tachesSubject = new Subject<Tache[]>();

  constructor() {
    this.getTaches();
  }

  emitTaches() {
    this.tachesSubject.next(this.taches);
  }

  saveTache() {
    firebase.database().ref('/taches').set(this.taches);
  }

  getTaches() {
    firebase.database().ref('/taches')
      .on('value', (data: DataSnapshot) => {
        this.taches = data.val() ? data.val() : [];
        this.emitTaches();
      });
  }

  getSingleTache(id: number) {
    return new Promise(
      (resolve, reject) => {
        firebase.database().ref('/taches/' + id).once('value').then(
          (data: DataSnapshot) => {
            resolve(data.val());
          }, (error) => {
            reject(error);
          }
        );
      }
    );
  }

  createNewTache(newTache: Tache){
    this.taches.push(newTache);
  }

  removeTache(tache: Tache){
    const tacheIndexToRemove = this.taches.findIndex(
      (tacheE1) => {
        if (tacheE1 === tache){
          return true;
        }
      }
    );
    this.taches.splice(tacheIndexToRemove, 1);
  }
}
