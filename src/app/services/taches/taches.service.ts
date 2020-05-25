import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import { Tache } from '../../model/tache';
import * as firebase from 'firebase';
import DataSnapshot = firebase.database.DataSnapshot;

@Injectable({
  providedIn: 'root'
})

export class TachesService {

  taches: Tache[] = []; // liste des taches enregistrees en base
  nbQuickStartTaches: number; // le nombre de quick tache en base
  tachesSubject = new Subject<Tache[]>(); // Sujet de taches

/**
 * Crée une instance du service de tache
 */
  constructor() {
    this.getTaches();
    let reset = false;
    // Reccupere le nombre de quick task en base
    firebase.database().ref('/nbQuickStartTaches').on('value', (data: DataSnapshot) => {
      if (data.val() && data.val() < 0) {
        reset = true;
        this.nbQuickStartTaches = 0;
      } else {
        this.nbQuickStartTaches = data.val() ? data.val() : 0;
      }
    });
  }

  /**
   * Previens les observateurs que la liste des taches a changee
   */
  emitTaches() {
    this.tachesSubject.next(this.taches);
  }

  /**
   * Sauvegarde la liste des taches dans la base de donnees
   */
  saveTache() {
    firebase.database().ref('/taches').set(this.taches);
  }

  /**
   * Recupere toutes les taches presentent dans la base de donnees
   */
  getTaches() {
    firebase.database().ref('/taches')
      .on('value', (data: DataSnapshot) => {
        this.taches = data.val() ? data.val() : [];
        this.emitTaches();
      });
  }

  /**
   * Actualise le temps passe sur une tache
   * @param Tache tache La tache a laquelle on veut actualier son temps
   */
  updateTemps(tache: Tache) {
    const tacheIndexToUpdate = this.taches.findIndex(
      (tacheE1) => {
        if (tacheE1 === tache){
          return true;
        }
      }
    );
    this.taches[tacheIndexToUpdate] = tache;
    this.saveTache();
    this.emitTaches();
    return tache;
  }

  /**
   * Ajoute une nouvelle tache a la liste des taches
   * @param Tache newTache La tache que l'on veut ajouter aux taches
   */
  createNewTache(newTache: Tache) {
    this.taches.push(newTache);
    this.saveTache();
    this.emitTaches();
  }

  /**
   * Cree une nouvelle quick task
   * @param Tache newTache La nouvelle quick task que l'on veut ajouter aux taches
   */
  createNewQuickStartTache(newTache: Tache) {
    newTache.titre += ++this.nbQuickStartTaches;
    firebase.database().ref('/nbQuickStartTaches').set(this.nbQuickStartTaches);
    this.taches.push(newTache);
    this.saveTache();
    this.emitTaches();
  }

  /**
   * Retire une tache de la liste des taches et applique la modification en base
   * @param Tache tache La tache que l'on veut retirer
   */
  removeTache(tache: Tache) {
    const tacheIndexToRemove = this.taches.indexOf(tache);
    // Si l'on retire une quick task alors on met a jour le compteur
    if (tache.parent === -1 || this.taches[tacheIndexToRemove].parent === -1) {
      firebase.database().ref('/nbQuickStartTaches').set(--this.nbQuickStartTaches);
    }
    this.taches.splice(tacheIndexToRemove, 1);
    this.saveTache();
    this.emitTaches();
  }

  /**
   * Permet de modifier le titre et la categorie d'une tache
   * @param Tache  tache     La tache que l'on veut modifier
   * @param string newTitre  Le nouveau titre de la tache
   * @param number newParent L'id de la nouvelle categorie de la tache
   */
  modifyTache(tache: Tache, newTitre: string, newParent: number) {
    const tacheIndexToModify = this.taches.indexOf(tache);
    // Si l'on modifie une quick task alors ce n'en est plus une
    if (this.taches[tacheIndexToModify].parent === -1 && newParent !== -1) {
      firebase.database().ref('/nbQuickStartTaches').set(--this.nbQuickStartTaches);
    }

    this.taches[tacheIndexToModify].titre = newTitre;
    this.taches[tacheIndexToModify].parent = newParent;
    this.saveTache();
    this.emitTaches();
  }

  /**
   * Permet de creer une quick task en base
   * @param Tache  tache     La quick task qui va etre modifiee => devient une tache
   * @param string newTitre  Le nouveau titre de la quick task
   * @param number newParent La nouvelle categorie de la quick task
   */
  saveQuickStart(tache: Tache, newTitre: string, newParent: number) {
    const tacheIndexToSaveSuickStart = this.taches.findIndex(
      (tacheE1) => {
        if (tacheE1 === tache){
          return true;
        }
      }
    );
    /**
     * Si l'on modifie une quick task alors ce n'en est plus une
     * TODO: Verifier si le if est utile
     */
    if (this.taches[tacheIndexToSaveSuickStart].parent === -1 && newParent !== -1) {
      firebase.database().ref('/nbQuickStartTaches').set(--this.nbQuickStartTaches);
    }
    this.taches[tacheIndexToSaveSuickStart] = tache;
    this.taches[tacheIndexToSaveSuickStart].titre = newTitre;
    this.taches[tacheIndexToSaveSuickStart].parent = newParent;
    this.saveTache();
    this.emitTaches();
  }
}
