export interface Station {
  p: string; // Liste der Bahnsteige. Eine Folge von Bahnsteigen, getrennt durch das Pipe-Symbol ("|").
  meta: string; // Liste der Meta-Bahnhöfe. Eine Folge von Bahnhofsnamen, getrennt durch das Pipe-Symbol ("|").
  name: string; // Bahnhofname.
  eva: number; // EVA-Bahnhofsnummer.
  ds100: string; // DS100-Bahnhofscode.
  db: string; // nicht dokumentiert
  creationts: string; // nicht dokumentiert - Erstellungszeitstempel?.
}

export interface Stations {
  station: Station;
}
