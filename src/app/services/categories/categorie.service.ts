import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import * as firebase from 'firebase';
import DataSnapshot = firebase.database.DataSnapshot;
import {Categorie} from '../../model/categorie';


@Injectable({
  providedIn: 'root'
})
export class CategorieService {

  categories: Categorie[] = [];
  categorieSubject = new Subject<Categorie[]>();

  constructor() {
    this.getCategories();
  }

  emitCategorie() {
    this.categorieSubject.next(this.categories);
    // this.tachesSubject.next(this.quickStartTaches);
  }

  saveCategorie() {
    firebase.database().ref('/categories').set(this.categories);
  }

  getCategories() {
    firebase.database().ref('/categories')
      .on('value', (data: DataSnapshot) => {
        this.categories = data.val() ? data.val() : [];
        this.emitCategorie();
      });
  }

  createNewCategorie(newCategorie: Categorie) {
    this.categories.push(newCategorie);
    this.saveCategorie();
    this.emitCategorie();
  }

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

  updateTemps(categorie: Categorie) {
    const categorieIndexToRemove = this.categories.findIndex(
      (categorieE1) => {
        if (categorieE1 === categorie){
          return true;
        }
      }
    );
    this.categories[categorieIndexToRemove] = categorie;
    this.saveCategorie();
    this.emitCategorie();
  }
}
