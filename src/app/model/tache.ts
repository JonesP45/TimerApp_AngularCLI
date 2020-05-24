export class Tache {
  constructor(public titre: string, public temps: number, public estDemaree: boolean,
              public date1: Date, public date2: Date) {}
}

type CouplesDates = [Date, Date];
