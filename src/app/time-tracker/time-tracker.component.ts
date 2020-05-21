import { Component, OnInit } from '@angular/core';
import {Tache} from '../model/tache';
import {StockageLocalService} from '../stockage-local.service';
import {interval, Subscription} from 'rxjs';

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styles: [
  ]
})
export class TimeTrackerComponent implements OnInit {

  taches: Tache[];
  idTache: number;
  compteur: number[];
  dateActive: Date[];
  subsTemps: Subscription[] = [];

  constructor(private stockageLocalService: StockageLocalService) { }

  ngOnInit(): void {
    this.taches = this.stockageLocalService.recupererTaches();
    this.idTache = this.taches.length;
    this.compteur = [];
    this.taches.forEach(element => {
      this.subsTemps.push(new Subscription());
    });
    this.dateActive = [];
  }

  ajouterTache(titreTache) {
    // let nouvelleTache = {
    const nouvelleTache = {
      id: this.idTache + 1,
      titre: titreTache.value,
      estDemaree: false,
      temps: 0,
      dates: []
    };
    this.taches.push(nouvelleTache);
    this.stockageLocalService.stockerTache(nouvelleTache);
    titreTache.value = '';
    this.idTache++;
  }

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
      tache.dates.push([this.dateActive[indice], maintenant]);
      this.dateActive[indice] = null;
    }
  }

  tempsDynamique(tache: Tache, i: number) {
    return this.compteur[i] ? tache.temps + this.compteur[i] : tache.temps;
  }
}
