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

  edited = false; // Pour savoir quelle tache est seletionnee
  editForm: FormGroup; // Formulaire pour modifier une tache
  editTache: Tache = null; // La tache que l'on veut modifier

  showChildren: boolean[] = []; // Pour savoir sur quelle categorie on clique pour afficher ses taches

  categories: Categorie[]; // Les categories presentent en base
  taches: Tache[]; // Les taches presentent en base
  categoriesSubscription: Subscription; // L'observateur des categories pour actualiser categories
  tachesSubscription: Subscription; // L'observateur des taches pour actualiser taches

  // idTache: number;
  compteurTache: number[]; // Pour faire defiler le temps qui passe pour chaque taches
  subsTempsTache: Subscription[] = []; // L'observateur pour actualiser le compteur d'une tache
  // dateActive: Date[];
  saveForm: FormGroup; // Formulaire pour enregister une tache ou une categorie

  /**
   * Crée une instance de time-tracker
   * @param TachesService    tacheService     Le service peremetant d'interagir avec les taches
   * @param FormBuilder      formBuilder      Permet de creer les formulaires
   * @param CategorieService categorieService Le service peremetant d'interagir avec les categories
   */
  constructor(private tachesService: TachesService, private formBuilder: FormBuilder, private categorieService: CategorieService) {
  }

  ngOnInit(): void {
    // S'abonne au sujet categorie
    this.categoriesSubscription = this.categorieService.categorieSubject.subscribe(
      (categories: Categorie[]) => {
        this.categories = categories;
      }
    );
    this.categorieService.emitCategorie();
    // S'abonne au sujet tache
    this.tachesSubscription = this.tachesService.tachesSubject.subscribe(
      (taches: Tache[]) => {
        this.taches = taches;
      }
    );
    this.tachesService.emitTaches();

    // Initialise les formualaires
    this.initFormSave();
    this.initFormEdited();

    // Initialise toutes les categories fermee (on ne voit pas les taches qui leurs sont associées)
    this.categories.forEach(() => {
      this.showChildren.push(false);
    });

    /*this.compteurTache = [];
    this.tachesService.taches.forEach(() => {
      this.subsTempsTache.push(new Subscription());
      // this.edited.push(false);
      // this.editForm.push(this.formBuilder.group({
      //   nveauTitre: [''],
      //   nvelleCate: ['']
      // }));
    });*/

    // Initialise l'observale des compteurs des taches
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

  /**
   * Initialise le formulaire pour creer une tache/categorie
   */
  initFormSave() {
    this.saveForm = this.formBuilder.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      parent: [''/*, Validators.required*/]
    });
  }

  /**
   * Initialise le formulaire pour editer les taches
   */
  initFormEdited() {
    this.editForm = this.formBuilder.group({
      typeTache: [''],
      tacheExistante: [''],
      nveauTitre: [''],
      nvelleCate: [''],
      nveauTitreQuickStart: [''],
      nvelleCateQuickStart: ['']
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

  /**
   * Est appele lors de la validation du formulaire de creation de tache/categorie (saveForm)
   */
  onSave() {
    if (this.saveForm.get('type').value === 'tache') {
      this.onSaveTache();
    } else if (this.saveForm.get('type').value === 'categorie'){
      this.onSaveCategorie();
    }
    this.initFormSave();
  }

  /**
   * Permet a l'utilisateur de creer une tache
   */
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

  /**
   * Permet a l'utilisateur de creer une quick task
   */
  onQuickStart() {
    const titre = 'Quick Start '/* + ++this.nbQuickStartTaches*/;
    const temps = 0;
    const estDemaree = false;
    // const Date1 = new Date();
    // const Date2 = new Date();
    const parent = -1; // Pas de categorie (uniquement present dans All tasks)
    const newTache = new Tache(titre, temps, estDemaree/*, Date1, Date2*/ , parent);
    this.tachesService.createNewQuickStartTache(newTache);
    this.demarerStopperTache(this.taches[this.taches.length - 1]);
  }

  /**
   * Permet a l'utilisateur de creer une categorie
   * TODO: Gestion des erreurs
   */
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
      // Nom de la categorie existe deja
      console.log('error');
    }
  }

  /**
   * Permet d'editier le nom et la categorie d'une tache
   * @param Tache tache La tache que l'on veut modifier
   */
  onEdit(tache: Tache) {
    // Si la tache est une quick task
    if (tache.parent === -1) {
      if (this.editForm.get('typeTache').value === 'newTache') {
        this.categories[this.getCategorieIdByName(this.editForm.get('nvelleCateQuickStart').value)].temps += tache.temps;
        this.categorieService.updateTemps(this.categories[this.getCategorieIdByName(this.editForm.get('nvelleCateQuickStart').value)]);
        this.tachesService.saveQuickStart(tache, this.editForm.get('nveauTitreQuickStart').value,
          this.getCategorieIdByName(this.editForm.get('nvelleCateQuickStart').value));
      } else {
        this.taches[this.editForm.get('tacheExistante').value].temps += tache.temps;
        this.tachesService.updateTemps(this.taches[this.editForm.get('tacheExistante').value]);

        this.categories[this.taches[this.editForm.get('tacheExistante').value].parent].temps += tache.temps;
        this.categorieService.updateTemps(this.categories[this.taches[this.editForm.get('tacheExistante').value].parent]);
        this.tachesService.removeTache(tache);
      }
    } else {
      this.categories[tache.parent].temps -= tache.temps;
      this.categorieService.updateTemps(this.categories[tache.parent]);
      this.tachesService.modifyTache(tache, this.editForm.get('nveauTitre').value,
        this.getCategorieIdByName(this.editForm.get('nvelleCate').value));
      this.categories[this.getCategorieIdByName(this.editForm.get('nvelleCate').value)].temps += tache.temps;
      this.categorieService.updateTemps(this.categories[this.getCategorieIdByName(this.editForm.get('nvelleCate').value)]);
    }
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

  /**
   * Permet de recuperer toutes la tache d'une categorie
   * @param number categorieId L'id de la categorie
   * @return Tache[] La liste des taches associees a categorieId
   */
  getCategorieChildren(categorieId: number) {
    const res = [];
    // Si la categorie est All tasks alors on recupere toutes les taches
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

  /**
   * Permet de recuperer l'id d'une categorie avec son nom
   * @param string categorieNom Le nom de la categorie
   * @return number L'id de la categorie ayant le nom categorieNom
   */
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

  /**
   * Permet de recuperer toutes les taches demarees
   * @return Tache[] Les taches demarees
   */
  getTachesDemaree() {
    const res = [];
    this.taches.forEach((tache) => {
      if (tache.estDemaree) {
        res.push(tache);
      }
    });
    return res;
  }

  /**
   * Permet d'afficher les taches associees a une categorie
   * @param number indice L'id de la categorie
   */
  showTacheOfCategorie(indice: number) {
    let i = 0;
    this.showChildren.forEach(() => {
      if (i !== indice) {
        this.showChildren[i] = false;
      }
      i++;
    });
    this.showChildren[indice] = !this.showChildren[indice];
  }

  getTachesWithoutParent() {
    const res = [];
    this.taches.forEach((tache) => {
      if (tache.parent === -1) {
        res.push(tache);
      }
    });
    return res;
  }

  getTachesWithParent() {
    const res = [];
    this.taches.forEach((tache) => {
      if (tache.parent !== -1) {
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

  /**
   * Permet de d'inverser l'etat d'une tache (si elle est demaree elle se met en pause et inversement)
   * @param Tache tache La tache a laquelle on veut modifier son etat
   */
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


      // if (tache.parent === -1) {
      //   this.tachesService.saveQuickStart(tache, );
      // } else {
      // }
      // Si la tache est une quick task, alors quand on la met en pause alors il faut lui donner un nom et une categorie
      if (tache.parent === -1) {
        this.modifierTache(tache);
      } else {
        this.tachesService.updateTemps(tache);
      }

      // const maintenant = new Date();
      // tache.date1 = this.dateActive[indice];
      // tache.date2 = maintenant;
      // this.dateActive[indice] = null;
    }
  }

  /**
   * Permet de demarrer le timer d'une tache
   * @param Tache tache la tache que l'on veut lancer
   */
  demarerTache(tache: Tache) {
    const indice = this.taches.indexOf(tache);
    this.subsTempsTache[indice] = interval(1000).subscribe((valeur: number) => (this.compteurTache[indice] = valeur));
  }

  /**
   * Permet de stopper le timer d'une tache et actualise le timer de sa categorie
   * @param Tache tache
   */
  stopperTache(tache: Tache) {
    const indice = this.taches.indexOf(tache);
    tache.temps += this.compteurTache[indice];
    this.categories[this.getCategorieIdByName('All tasks')].temps += this.compteurTache[indice];
    this.categorieService.updateTemps(this.categories[this.getCategorieIdByName('All tasks')]);
    if (tache.parent !== -1) {
      this.categories[tache.parent].temps += this.compteurTache[indice];
      this.categorieService.updateTemps(this.categories[tache.parent]);
    }
    this.compteurTache[indice] = 0;
    this.subsTempsTache[indice].unsubscribe();
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

  /**
   * Permet d'actualiser toutes les secondes le timer le timer d'une tache (Affichage)
   * @param Tache tache La tache a laquelle on veut actualier le timer
   */
  tempsDynamiqueTache(tache: Tache/*, i: number*/) {
    const i = this.taches.indexOf(tache);
    const date = new Date(0);
    date.setSeconds(this.compteurTache[i] ? tache.temps + this.compteurTache[i] : tache.temps); // specify value for SECONDS here
    return date.toISOString().substr(11, 8);
    // return this.compteur[i] ? tache.temps + this.compteur[i] : tache.temps;
  }

  /**
   * Actualise le timer d'une categorie
   * @param Categorie categorie La categorie a laquelle on veut modifier le timer
   */
  tempsCategorie(categorie: Categorie) {
    const date = new Date(0);
    date.setSeconds( categorie.temps); // specify value for SECONDS here
    return date.toISOString().substr(11, 8);
    // return this.compteur[i] ? tache.temps + this.compteur[i] : tache.temps;
  }

  /**
   * Permet de supprimer une tache
   * @param Tache tache La tache que l'on veut supprimer
   */
  supprimerTache(tache: Tache) {
    // Si la tache est demarre on la stop avant de la supprimer
    if (tache.estDemaree) {
      this.stopperTache(tache);
    }
    // Si la tache n'est pas une quick task on modifie le timer de la categorie associee
    if (tache.parent !== -1) {
      this.categories[tache.parent].temps -= tache.temps;
      if (this.categories[tache.parent].temps < 0) {
        this.categories[tache.parent].temps = 0;
      }
      this.categorieService.updateTemps(this.categories[tache.parent]);
    }
    // Modifie le timer la categorie de All tasks
    this.categories[this.getCategorieIdByName('All tasks')].temps -= tache.temps;
    if (this.categories[this.getCategorieIdByName('All tasks')].temps < 0) {
      this.categories[this.getCategorieIdByName('All tasks')].temps = 0;
    }
    this.categorieService.updateTemps(this.categories[this.getCategorieIdByName('All tasks')]);
    this.tachesService.removeTache(tache);
  }

  /**
   * Permet de supprimer une categorie est toutes les taches qui lui sont associes
   * @param Categorie acategorie La categorie que l'on veut supprimer
   */
  supprimerCategorie(categorie: Categorie) {
    const id = this.getCategorieIdByName(categorie.titre);
    const children = this.getCategorieChildren(id);
    children.forEach((child) => {
      this.supprimerTache(child);
    });
    this.categorieService.removeCategorie(categorie);
  }

  /**
   * Permet de modifier une tache en pré chargeant ses données dans le formulaire
   * @param Tache tache la tache que l'on va modifier
   */
  modifierTache(tache: Tache) {
    // this.initFormEdited();
    this.editTache = tache;
    if (tache.parent !== -1) {
      this.editForm = this.formBuilder.group({
        typeTache: [''],
        tacheExistante: [''],
        nveauTitre: [tache.titre, Validators.required],
        nvelleCate: [tache.parent !== -1 ? this.categories[tache.parent].titre : '', Validators.required],
        nveauTitreQuickStart: [''],
        nvelleCateQuickStart: ['']
      });
    } else {
      this.editForm = this.formBuilder.group({
        typeTache: [''],
        tacheExistante: [''],
        nveauTitre: [''],
        nvelleCate: [''],
        nveauTitreQuickStart: [tache.titre],
        nvelleCateQuickStart: [tache.parent !== -1 ? this.categories[tache.parent].titre : '']
      });
    }
    this.edited = true;
  }

  ngOnDestroy() {
    this.tachesSubscription.unsubscribe();
  }


}


