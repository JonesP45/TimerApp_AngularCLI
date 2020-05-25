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
  // quickStartTaches: Tache[] = [];
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
    // if (reset) {
    //   firebase.database().ref('/nbQuickStartTaches').set(0);
    // }
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

  updateTemps(tache: Tache) {
    // const quickStartTacheIndexToRemove = this.taches.indexOf(tache);
    // const quickStartTacheIndexToUpdate = this.taches.findIndex(
    //   (tacheE1) => {
    //     if (tacheE1 === tache){
    //       return true;
    //     }
    //   }
    // );
    // const tacheIndexToRemove = this.taches.indexOf(tache);
    const tacheIndexToUpdate = this.taches.findIndex(
      (tacheE1) => {
        if (tacheE1 === tache){
          return true;
        }
      }
    );
    // if (quickStartTacheIndexToUpdate !== -1) {
    //   this.quickStartTaches[quickStartTacheIndexToUpdate] = tache;
    // }
    this.taches[tacheIndexToUpdate] = tache;
    this.saveTache();
    this.emitTaches();
  }

  // getSingleTache(id: number) {
  //   return new Promise(
  //     (resolve, reject) => {
  //       firebase.database().ref('/taches/' + id).once('value').then(
  //         (data: DataSnapshot) => {
  //           resolve(data.val());
  //         }, (error) => {
  //           reject(error);
  //         }
  //       );
  //     }
  //   );
  // }

  createNewTache(newTache: Tache) {
    this.taches.push(newTache);
    this.saveTache();
    this.emitTaches();
  }

  createNewQuickStartTache(newTache: Tache) {
    newTache.titre += ++this.nbQuickStartTaches;
    firebase.database().ref('/nbQuickStartTaches').set(this.nbQuickStartTaches);
    this.taches.push(newTache);
    this.saveTache();
    this.emitTaches();
  }

  removeTache(tache: Tache) {
    // const quickStartTacheIndexToRemove = this.taches.findIndex(
    //   (tacheE1) => {
    //     if (tacheE1 === tache){
    //       return true;
    //     }
    //   }
    // );
    const tacheIndexToRemove = this.taches.indexOf(tache);
    // const tacheIndexToRemove = this.taches.findIndex(
    //   (tacheE1) => {
    //     console.log(tache);
    //     console.log(tacheE1);
    //     if (tacheE1 === tache) {
    //       return true;
    //     }
    //   }
    // );
    console.log(this.taches);
    console.log(tacheIndexToRemove);
    if (this.taches[tacheIndexToRemove].parent === -1) {
      firebase.database().ref('/nbQuickStartTaches').set(--this.nbQuickStartTaches);
    }
    this.taches.splice(tacheIndexToRemove, 1);
    this.saveTache();
    this.emitTaches();
  }

  modifyTache(tache: Tache, newTitre: string, newParent: number) {
    const tacheIndexToModify = this.taches.findIndex(
      (tacheE1) => {
        if (tacheE1 === tache) {
          return true;
        }
      }
    );
    if (this.taches[tacheIndexToModify].parent === -1 && newParent !== -1) {
      firebase.database().ref('/nbQuickStartTaches').set(--this.nbQuickStartTaches);
    }

    this.taches[tacheIndexToModify].titre = newTitre;
    this.taches[tacheIndexToModify].parent = newParent;
    this.saveTache();
    this.emitTaches();
  }
}
