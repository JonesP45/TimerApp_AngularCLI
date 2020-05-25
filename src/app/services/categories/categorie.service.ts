import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import * as firebase from 'firebase';
import DataSnapshot = firebase.database.DataSnapshot;
import {Categorie} from '../../model/categorie';


@Injectable({
  providedIn: 'root'
})
export class CategorieService {

  categories: Categorie[] = []; // liste des categories enregistrees
  categorieSubject = new Subject<Categorie[]>(); // Sujet de categories

  /**
   * Crée une instance du service de categorie
   */
  constructor() {
    this.getCategories();
  }

  /**
   * Previens les observateurs que la liste des categories a changee
   */
  emitCategorie() {
    this.categorieSubject.next(this.categories);
    // this.tachesSubject.next(this.quickStartTaches);
  }

  /**
   * Sauvegarde la liste des categories dans la base de donnees
   */
  saveCategorie() {
    firebase.database().ref('/categories').set(this.categories);
  }

  /**
   * Recupere toutes les categories presentent dans la base de donnees
   */
  getCategories() {
    firebase.database().ref('/categories')
      .on('value', (data: DataSnapshot) => {
        this.categories = data.val() ? data.val() : [];
        this.emitCategorie();
      });
  }

  /**
   * Ajoute une nouvelle categorie a la liste des categories
   * @param Categorie newCategorie La categorie que l'on veut ajouter aux categories
   */
  createNewCategorie(newCategorie: Categorie) {
    this.categories.push(newCategorie);
    this.saveCategorie();
    this.emitCategorie();
  }

  /**
   * Retire une categorie de la liste des categories et applique la modification en base
   * @param Categorie categorie La categorie que l'on veut retirer
   */
  removeCategorie(categorie: Categorie) {
    const categorieIndexToRemove = this.categories.findIndex(
      (categorieE1) => {
        if (categorieE1 === categorie){
          return true;
        }
      }
    );
    this.categories.splice(categorieIndexToRemove, 1);
    this.saveCategorie();
    this.emitCategorie();
  }

  modifyCategorie(categorie: Categorie, newTitre: string, newParent: number) {
    const categorieIndexToModify = this.categories.findIndex(
      (categorieE1) => {
        if (categorieE1 === categorie) {
          return true;
        }
      }
    );
    this.categories[categorieIndexToModify].titre = newTitre;
    this.categories[categorieIndexToModify].parent = newParent;
    this.saveCategorie();
    this.emitCategorie();
  }

  /**
   * Actualise le temps passe sur une categorie
   * @param Categorie categorie La categorie a laquelle on veut actualier son temps
   */
  updateTemps(categorie: Categorie) {
    const categorieIndexToUpdate = this.categories.findIndex(
      (categorieE1) => {
        if (categorieE1 === categorie){
          return true;
        }
      }
    );
    this.categories[categorieIndexToUpdate] = categorie;
    this.saveCategorie();
    this.emitCategorie();
  }
}
