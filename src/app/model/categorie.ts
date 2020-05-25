export class Categorie {
  /**
   * Crée une instance de categorie
   * @param string titre  Le titre de la categorie
   * @param number temps  Le temps passe sur la categorie
   * @param number parent La categorie contenant cette categorie (-1 = pas de parent)
   */
  constructor(public titre: string, public temps: number, public parent: number) {}
}

