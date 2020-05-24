import { Component, OnInit, OnDestroy } from '@angular/core';
import {Tache} from '../model/tache';
import {Categorie} from '../model/categorie';
import {TachesService} from '../services/taches/taches.service';
import {CategorieService} from '../services/categories/categorie.service';
// import {StockageLocalService} from '../services/stockage-local/stockage-local.service';
import {interval, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styles: [
  ]
})
export class TimeTrackerComponent implements OnInit, OnDestroy {

  edited = false;

  categories: Categorie[];
  taches: Tache[];
  categoriesSubscription: Subscription;
  tachesSubscription: Subscription;

  // idTache: number;
  compteur: number[];
  // dateActive: Date[];
  subsTemps: Subscription[] = [];
  saveForm: FormGroup;
  editForm: FormGroup;
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
    this.initForm();
    // this.taches = this.stockageLocalService.recupererTaches();
    // this.idTache = this.taches.length;
    // this.idTache = 0;
    this.compteur = [];
    this.taches.forEach(() => {
      this.subsTemps.push(new Subscription());
    });
    // this.dateActive = [];
    // this.taches.forEach((tache: Tache) => {
    //   if (tache.estDemaree) {
    //     this.demarerStopperTache(tache);
    //   }
    // });
  }

  initForm() {
    this.saveForm = this.formBuilder.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      parent: ['', Validators.required]
    });
  }

  onSave() {
    if (this.saveForm.get('type').value === 'tache') {
      this.onSaveTache();
    } else if (this.saveForm.get('type').value === 'categorie'){
      this.onSaveCategorie();
    } else {
      console.log('Error: Veuillez choisir ce que vous voulez enregistrer');
    }
  }

  onSaveTache() {
    const titre = this.saveForm.get('title').value;
    const temps = 0;
    const estDemaree = false;
    // const date1 = new Date();
    // const date2 = new Date();
    const parent = this.saveForm.get('parent').value === '' ? -1 : this.getCategorieIdByName(this.saveForm.get('parent').value);
    const newTache = new Tache(titre, temps, estDemaree, /*date1, date2, */parent);
    this.tachesService.createNewTache(newTache);
  }

  onQuickStart() {
    const titre = 'Quick Start '/* + ++this.nbQuickStartTaches*/;
    const temps = 0;
    const estDemaree = false;
    // const Date1 = new Date();
    // const Date2 = new Date();
    const parent = -1;
    const newTache = new Tache(titre, temps, estDemaree/*, Date1, Date2*/ , parent);
    this.tachesService.createNewQuickStartTache(newTache);
    this.tachesService.emitTaches();
    this.taches.forEach((tache) => {
      if (tache === newTache) {
        this.demarerStopperTache(tache);
      }
    });
  }

  onEdit(tache: Tache) {
    this.tachesService.modifyTache(tache, this.editForm.get('nveauTitre').value, this.editForm.get('nvelleCate').value);
    this.edited = false;
  }

  onSaveCategorie() {
    const titre = this.saveForm.get('title').value;
    const temps = 0;
    const parent = this.saveForm.get('parent').value === 'Aucun' ? -1 : this.getCategorieIdByName(this.saveForm.get('parent').value);
    const newCategorie = new Categorie(titre, temps, parent);
    this.categorieService.createNewCategorie(newCategorie);
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
    this.categories.forEach((categorie) => {
      if (categorie.parent === categorieId) {
        res.push(categorie);
      }
    });
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

  getTacheWithoutParent() {
    const res = [];
    this.taches.forEach((tache) => {
      if (tache.parent === -1) {
        res.push(tache);
      }
    });
    return res;
  }

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
    const indice = this.taches.indexOf(tache);
    tache.estDemaree = !tache.estDemaree;
    if (tache.estDemaree) {
      this.subsTemps[indice] = interval(1000).subscribe((valeur: number) => (this.compteur[indice] = valeur));
      // this.subsTemps[indice] = interval(1000).subscribe((valeur: number) => (tache.temps = valeur));
      // this.dateActive[indice] = new Date();
    } else {
      tache.temps += this.compteur[indice];
      this.compteur[indice] = 0;
      this.subsTemps[indice].unsubscribe();
      this.tachesService.updateTemps(tache);

      // const maintenant = new Date();
      // tache.date1 = this.dateActive[indice];
      // tache.date2 = maintenant;
      // this.dateActive[indice] = null;
    }
  }

  tempsDynamique(tache: Tache, i: number) {
    const date = new Date(0);
    date.setSeconds(this.compteur[i] ? tache.temps + this.compteur[i] : tache.temps); // specify value for SECONDS here
    return date.toISOString().substr(11, 8);
    // return this.compteur[i] ? tache.temps + this.compteur[i] : tache.temps;
  }

  supprimerTache(tache: Tache) {
    if (tache.estDemaree) {
      this.demarerStopperTache(tache);
    }
    this.tachesService.removeTache(tache);
  }

  modifierTache(tache: Tache) {
    this.edited = true;
  }

  ngOnDestroy() {
    this.tachesSubscription.unsubscribe();
  }


}


