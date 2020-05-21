export class Tache {
  id: number;
  titre: string;
  estDemaree: boolean;
  temps: number;
  dates: CouplesDates[];
}

type CouplesDates = [Date, Date];
