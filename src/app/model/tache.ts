export class Tache {
  constructor(public titre: string, public temps: number, public estDemaree: boolean,
              public date1: Date, public date2: Date) {}
}

type CouplesDates = [Date, Date];

/*private static reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
private static reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

private dateParser = function (key, value) {
  if (typeof value === "string") {
    // try to parse as ISO format
    var formatType = FacadeService.reISO.exec(value);
    if (formatType) return new Date(value);

    // try to parse as MsAjax format
    formatType = FacadeService.reMsAjax.exec(value);
    if (formatType) {
      var b = formatType[1].split(/[-+,.]/);
      return new Date(b[0] ? +b[0] : 0 - +b[1]);
    }
  }
  return value;
};
taFonction() {
  const tonObjetAuFormatTextuel = JSON.stringify( tonObjet );
  const tonObjetParseAvecLesBonnesDatesQuiVontBien = JSON.parse( tonObjetAuFormatTextuel, dateParser );
}*/
