import { Component, OnInit, OnDestroy } from '@angular/core';
import {Tache} from '../model/tache';
import {TachesService} from '../services/taches/taches.service';
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

  taches: Tache[];
  tachesSubscription: Subscription;

  // idTache: number;
  compteur: number[];
  dateActive: Date[];
  subsTemps: Subscription[] = [];
  tacheForm: FormGroup;

  constructor(private tachesService: TachesService, private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
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
    this.dateActive = [];
    // this.taches.forEach((tache: Tache) => {
    //   if (tache.estDemaree) {
    //     this.demarerStopperTache(tache);
    //   }
    // });
  }

  initForm() {
    this.tacheForm = this.formBuilder.group({
      title: ['', Validators.required]
    });
  }

  onDeleteTache(tache: Tache) {
    this.tachesService.removeTache(tache);
  }

  onSaveTache() {
    const titre = this.tacheForm.get('title').value;
    const temps = 0;
    const estDemaree = false;
    const Date1 = new Date();
    const Date2 = new Date();
    const newTache = new Tache(titre, temps, estDemaree, Date1, Date2);
    this.tachesService.createNewTache(newTache);
  }

  onQuickStart() {
    const titre = 'Quick Start '/* + ++this.nbQuickStartTaches*/;
    const temps = 0;
    const estDemaree = true;
    const Date1 = new Date();
    const Date2 = new Date();
    const newTache = new Tache(titre, temps, estDemaree, Date1, Date2);
    this.tachesService.createNewQuickStartTache(newTache);
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
      this.dateActive[indice] = new Date();
    } else {
      tache.temps += this.compteur[indice];
      this.compteur[indice] = 0;
      this.subsTemps[indice].unsubscribe();
      const maintenant = new Date();
      tache.date1 = this.dateActive[indice];
      tache.date2 = maintenant;
      this.dateActive[indice] = null;
    }
  }

  tempsDynamique(tache: Tache, i: number) {
    return this.compteur[i] ? tache.temps + this.compteur[i] : tache.temps;
  }

  supprimerTache(tache: Tache) {
    this.tachesService.removeTache(tache);
  }

  ngOnDestroy() {
    this.tachesSubscription.unsubscribe();
  }

  modifierTache(tache: Tache) {

  }
}
