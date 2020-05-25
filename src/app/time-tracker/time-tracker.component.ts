import { Component, OnInit, OnDestroy } from '@angular/core';
import {Tache} from '../model/tache';
import {Categorie} from '../model/categorie';
import {TachesService} from '../services/taches/taches.service';
import {CategorieService} from '../services/categories/categorie.service';
// import {StockageLocalService} from '../services/stockage-local/stockage-local.service';
import {interval, Subscription} from 'rxjs';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styles: [
  ]
})
export class TimeTrackerComponent implements OnInit, OnDestroy {

  edited = false;
  editForm: FormGroup;
  editTache: Tache = null;

  categories: Categorie[];
  taches: Tache[];
  categoriesSubscription: Subscription;
  tachesSubscription: Subscription;

  // idTache: number;
  compteurTache: number[];
  subsTempsTache: Subscription[] = [];
  // dateActive: Date[];
  saveForm: FormGroup;
  tree: Map<object, any>;

  constructor(private tachesService: TachesService, private formBuilder: FormBuilder, private categorieService: CategorieService) {
  }

  ngOnInit(): void {
    this.categoriesSubscription = this.categorieService.categorieSubject.subscribe(
      (categories: Categorie[]) => {
        this.categories = categories;
      }
    );
    this.categorieService.emitCategorie();
    this.tachesSubscription = this.tachesService.tachesSubject.subscribe(
      (taches: Tache[]) => {
        this.taches = taches;
      }
    );
    this.tachesService.emitTaches();
    this.initFormSave();
    this.initFormEdited();

    /*this.compteurCategorie = [];
    this.categorieService.categories.forEach(() => {
      this.subsTempsCategorie.push(new Subscription());
      // this.edited.push([false]);
    });

    this.compteurTache = [];
    this.tachesService.taches.forEach(() => {
      this.subsTempsTache.push(new Subscription());
      // this.edited.push(false);
      // this.editForm.push(this.formBuilder.group({
      //   nveauTitre: [''],
      //   nvelleCate: ['']
      // }));
    });*/

    this.compteurTache = [];
    this.taches.forEach(() => {
      this.subsTempsTache.push(new Subscription());
      // this.edited.push(false);
      // this.editForm.push(this.formBuilder.group({
      //   nveauTitre: [''],
      //   nvelleCate: ['']
      // }));
    });
  }

  initFormSave() {
    this.saveForm = this.formBuilder.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      parent: [''/*, Validators.required*/]
    });
  }

  initFormEdited() {
    this.editForm = this.formBuilder.group({
      nveauTitre: [''],
      nvelleCate: ['']
    });
    /*this.categories.forEach((categorie: Categorie) => {
      const tmp = [];
      console.log(this.getCategorieChildren(this.getCategorieIdByName(categorie.titre)).length);
      this.getCategorieChildren(this.getCategorieIdByName(categorie.titre)).forEach(() => {
        tmp.push(false);
      });
      this.edited.push(tmp);
    });
    this.categories.forEach(() => {
      const tmp = [];
      this.taches.forEach(() => {
        tmp.push(this.formBuilder.group({
          nveauTitre: [''],
          nvelleCate: ['']
        }));
      });
      this.editForm.push(tmp);
    });*/
  }

  onSave() {
    if (this.saveForm.get('type').value === 'tache') {
      this.onSaveTache();
    } else if (this.saveForm.get('type').value === 'categorie'){
      this.onSaveCategorie();
    }
  }

  onSaveTache() {
    const titre = this.saveForm.get('title').value;
    const temps = 0;
    const estDemaree = false;
    // const date1 = new Date();
    // const date2 = new Date();
    const parent = this.getCategorieIdByName(this.saveForm.get('parent').value);
    const newTache = new Tache(titre, temps, estDemaree, /*date1, date2, */parent);
    this.tachesService.createNewTache(newTache);
  }

  onQuickStart() {
    const titre = 'Quick Start '/* + ++this.nbQuickStartTaches*/;
    const temps = 0;
    const estDemaree = false;
    // const Date1 = new Date();
    // const Date2 = new Date();
    const parent = 1; // id single tasks
    const newTache = new Tache(titre, temps, estDemaree/*, Date1, Date2*/ , parent);
    this.tachesService.createNewQuickStartTache(newTache);
  }

  onSaveCategorie() {
    const titre = this.saveForm.get('title').value;
    const categorieIndexToFind = this.categories.findIndex(
      (categorieE1) => {
        if (categorieE1.titre === titre){
          return true;
        }
      }
    );
    if (categorieIndexToFind === -1) {
      const temps = 0;
      const parent = -1;
        // this.saveForm.get('parent').value === 'Aucun' ? -1 : this.getCategorieIdByName(this.saveForm.get('parent').value);
      const newCategorie = new Categorie(titre, temps, parent);
      this.categorieService.createNewCategorie(newCategorie);
    } else {
      console.log('error');
    }
  }

  onEdit(tache: Tache) {
    this.tachesService.modifyTache(tache, this.editForm.get('nveauTitre').value,
                                   this.getCategorieIdByName(this.editForm.get('nvelleCate').value));
    this.edited = false;
  }

  // getAllChildrenByCategorieId(categorieId: number, res: Map<object, any>) {
  //   this.categories.forEach((categorie) => {
  //     if (categorie.parent === categorieId) {
  //       res.set(categorie, []);
  //       const name = this.getCategorieIdByName(categorie.titre);
  //       this.getAllChildrenByCategorieId(name, res.get(categorie));
  //       this.taches.forEach((tache) => {
  //         if (tache.parent === categorieId) {
  //           res.get(categorie).set(tache, []);
  //         }
  //       });
  //     }
  //   });
  //   this.taches.forEach((tache) => {
  //     if (tache.parent === categorieId) {
  //       res.set(tache, []);
  //     }
  //   });
  // }

  getCategorieChildren(categorieId: number) {
    const res = [];
    if (categorieId === 0) {
      return this.taches;
    }
    this.taches.forEach((tache) => {
      if (tache.parent === categorieId) {
        res.push(tache);
      }
    });
    return res;
  }

  getCategorieIdByName(categorieNom: string) {
    const categorieIndexToFind = this.categories.findIndex(
      (categorieE1) => {
        if (categorieE1.titre === categorieNom){
          return true;
        }
      }
    );
    return categorieIndexToFind;
  }

  // getTacheWithoutParent() {
  //   const res = [];
  //   this.taches.forEach((tache) => {
  //     if (tache.parent === -1) {
  //       res.push(tache);
  //     }
  //   });
  //   return res;
  // }

  // ajouterTache(titreTache) {
  //   // let nouvelleTache = {
  //   const nouvelleTache = {
  //     id: this.idTache + 1,
  //     titre: titreTache.value,
  //     estDemaree: false,
  //     temps: 0,
  //     dates: []
  //   };
  //   // this.taches.push(nouvelleTache);
  //   // this.stockageLocalService.stockerTache(nouvelleTache);
  //   this.tachesService.createNewTache(titreTache);
  //   titreTache.value = '';
  //   this.idTache++;
  // }

  demarerStopperTache(tache: Tache) {
    // console.log(this.taches.length);
    // console.log(this.editForm.length);
    // const indice = this.taches.indexOf(tache);
    tache.estDemaree = !tache.estDemaree;
    if (tache.estDemaree) {
      this.demarerTache(tache);
      // this.subsTemps[indice] = interval(1000).subscribe((valeur: number) => (this.compteur[indice] = valeur));

      // this.subsTemps[indice] = interval(1000).subscribe((valeur: number) => (tache.temps = valeur));
      // this.dateActive[indice] = new Date();
    } else {
      this.stopperTache(tache);
      // tache.temps += this.compteur[indice];
      // this.compteur[indice] = 0;
      // this.subsTemps[indice].unsubscribe();
      this.tachesService.updateTemps(tache);

      // const maintenant = new Date();
      // tache.date1 = this.dateActive[indice];
      // tache.date2 = maintenant;
      // this.dateActive[indice] = null;
    }
  }

  demarerTache(tache: Tache) {
    const indice = this.taches.indexOf(tache);
    this.subsTempsTache[indice] = interval(1000).subscribe((valeur: number) => (this.compteurTache[indice] = valeur));
  }

  stopperTache(tache: Tache) {
    const indice = this.taches.indexOf(tache);
    tache.temps += this.compteurTache[indice];
    this.categories[tache.parent].temps += this.compteurTache[indice];
    this.categorieService.updateTemps(this.categories[tache.parent]);
    // console.log(indice);
    // console.log(tache);
    // console.log(this.taches);
    // console.log(this.subsTempsTache);
    this.compteurTache[indice] = 0;
    this.subsTempsTache[indice].unsubscribe();
    // this.tachesService.updateTemps(tache);
  }

  // demarerStopperCategorie(categorie: Categorie) {
  //   const indice = this.categories.indexOf(categorie);
  //   const children = this.getCategorieChildren(indice);
  //   categorie.estDemaree = !categorie.estDemaree;
  //   if (categorie.estDemaree) {
  //     children.forEach((child) => {
  //       this.demarerTache(child);
  //     });
  //     this.subsTempsCategorie[indice] = interval(1000).subscribe((valeur: number) => (
  //       this.compteurCategorie[indice] = valeur
  //     ));
  //   } else {
  //     children.forEach((child) => {
  //       this.stopperTache(child);
  //     });
  //     categorie.temps += this.compteurCategorie[indice];
  //     this.compteurCategorie[indice] = 0;
  //     this.subsTempsCategorie[indice].unsubscribe();
  //     this.categorieService.updateTemps(categorie);
  //   }
  // }

  tempsDynamiqueTache(tache: Tache, i: number) {
    const date = new Date(0);
    date.setSeconds(this.compteurTache[i] ? tache.temps + this.compteurTache[i] : tache.temps); // specify value for SECONDS here
    return date.toISOString().substr(11, 8);
    // return this.compteur[i] ? tache.temps + this.compteur[i] : tache.temps;
  }

  tempsCategorie(categorie: Categorie) {
    const date = new Date(0);
    date.setSeconds( categorie.temps); // specify value for SECONDS here
    return date.toISOString().substr(11, 8);
    // return this.compteur[i] ? tache.temps + this.compteur[i] : tache.temps;
  }

  supprimerTache(tache: Tache) {
    if (tache.estDemaree) {
      this.demarerStopperTache(tache);
    }
    this.tachesService.removeTache(tache);
  }

  supprimerCategorie(categorie: Categorie) {
    const id = this.getCategorieIdByName(categorie.titre);
    const children = this.getCategorieChildren(id);
    children.forEach((child) => {
      this.supprimerTache(child);
    });
    this.categorieService.removeCategorie(categorie);
  }

  modifierTache(tache: Tache) {
    // this.initFormEdited();
    this.editTache = tache;
    this.editForm = this.formBuilder.group({
      nveauTitre: [tache.titre, Validators.required],
      nvelleCate: [this.categories[tache.parent].titre, Validators.required]
    });
    this.edited = true;
  }

  ngOnDestroy() {
    this.tachesSubscription.unsubscribe();
  }


}


