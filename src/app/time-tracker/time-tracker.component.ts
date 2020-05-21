import { Component, OnInit } from '@angular/core';
import {Tache} from '../model/tache';
import {StockageLocalService} from '../stockage-local.service';

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styles: [
  ]
})
export class TimeTrackerComponent implements OnInit {

  taches: Tache[];
  idTache: number;

  constructor(private stockageLocalService: StockageLocalService) { }

  ngOnInit(): void {
    this.taches = this.stockageLocalService.recupererTaches();
    this.idTache = this.taches.length;
  }

  ajouterTache(titreTache) {
    // let nouvelleTache = {
    const nouvelleTache = {
      id: this.idTache + 1,
      titre: titreTache.value,
      estDemaree: false
    };
    this.taches.push(nouvelleTache);
    this.stockageLocalService.stockerTache(nouvelleTache);
    titreTache.value = '';
    this.idTache++;
  }
}
