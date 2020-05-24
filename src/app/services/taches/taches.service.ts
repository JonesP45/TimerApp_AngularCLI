import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import { Tache } from '../../model/tache';
import * as firebase from 'firebase';
import DataSnapshot = firebase.database.DataSnapshot;


@Injectable({
  providedIn: 'root'
})
export class TachesService {

  taches: Tache[] = [];
  quickStartTaches: Tache[] = [];
  nbQuickStartTaches: number;
  tachesSubject = new Subject<Tache[]>();

  constructor() {
    this.getTaches();
    let reset = false;
    firebase.database().ref('/nbQuickStartTaches').on('value', (data: DataSnapshot) => {
      if (data.val() && data.val() < 0) {
        reset = true;
        this.nbQuickStartTaches = 0;
      } else {
        this.nbQuickStartTaches = data.val() ? data.val() : 0;
      }
    });
    if (reset) {
      firebase.database().ref('/nbQuickStartTaches').set(0);
    }
  }

  emitTaches() {
    this.tachesSubject.next(this.taches);
    // this.tachesSubject.next(this.quickStartTaches);
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

  updateTemps(tache: Tache) {
    const quickStartTacheIndexToRemove = this.taches.findIndex(
      (tacheE1) => {
        if (tacheE1 === tache){
          return true;
        }
      }
    );
    const tacheIndexToRemove = this.taches.findIndex(
      (tacheE1) => {
        if (tacheE1 === tache){
          return true;
        }
      }
    );
    if (quickStartTacheIndexToRemove !== -1) {
      this.quickStartTaches[quickStartTacheIndexToRemove] = tache;
    }
    this.taches[tacheIndexToRemove] = tache;
    this.saveTache();
    this.emitTaches();
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

  createNewTache(newTache: Tache) {
    this.taches.push(newTache);
    this.saveTache();
    this.emitTaches();
  }

  createNewQuickStartTache(newTache: Tache) {
    newTache.titre += ++this.nbQuickStartTaches;
    firebase.database().ref('/nbQuickStartTaches').set(this.nbQuickStartTaches);
    this.taches.push(newTache);
    this.quickStartTaches.push(newTache);
    this.saveTache();
    this.emitTaches();
  }

  removeTache(tache: Tache) {
    const quickStartTacheIndexToRemove = this.taches.findIndex(
      (tacheE1) => {
        if (tacheE1 === tache){
          return true;
        }
      }
    );
    console.log(quickStartTacheIndexToRemove);
    const tacheIndexToRemove = this.taches.findIndex(
      (tacheE1) => {
        if (tacheE1 === tache){
          return true;
        }
      }
    );
    if (quickStartTacheIndexToRemove !== -1) {
      this.quickStartTaches.splice(quickStartTacheIndexToRemove, 1);
      firebase.database().ref('/nbQuickStartTaches').set(--this.nbQuickStartTaches);
    }
    this.taches.splice(tacheIndexToRemove, 1);
    this.saveTache();
    this.emitTaches();
  }

}
