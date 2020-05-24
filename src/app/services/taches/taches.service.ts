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
  // nbQuickStartTaches: number;
  tachesSubject = new Subject<Tache[]>();

  constructor() {
    this.getTaches();
    // firebase.database().ref('/nbQuickStartTaches').on('value', (data: DataSnapshot) => {
    //   this.nbQuickStartTaches = data.val() && data.val() >= 0 ? data.val() : 0;
    // });
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
    // newTache.titre += ++this.nbQuickStartTaches;
    // firebase.database().ref('/nbQuickStartTaches').set(this.nbQuickStartTaches);
    this.taches.push(newTache);
    this.saveTache();
    this.emitTaches();
  }

  removeTache(tache: Tache) {
    const tacheIndexToRemove = this.taches.findIndex(
      (tacheE1) => {
        if (tacheE1 === tache){
          return true;
        }
      }
    );
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

    this.taches[tacheIndexToModify].titre = newTitre;
    this.taches[tacheIndexToModify].parent = newParent;
    this.saveTache();
    this.emitTaches();
  }
}
