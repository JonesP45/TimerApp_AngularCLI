export class Tache {
  /**
   * Crée une instance de tache
   * @param string  titre      Le titre de la tache
   * @param number  temps      Le temps passe sur la tache
   * @param boolean estDemaree A true si la tache est lancee sinon false
   * @param number  parent     La categorie contenant cette categorie (-1 = pas de parent)
   */
  constructor(public titre: string, public temps: number, public estDemaree: boolean,
              /*public date1: Date, public date2: Date,*/ public parent: number) {}
}

type CouplesDates = [Date, Date];
