export class Tache {
  estDemaree: boolean;
  temps: number;
  dates: CouplesDates[];
  constructor(public titre: string){
  }
}


type CouplesDates = [Date, Date];
