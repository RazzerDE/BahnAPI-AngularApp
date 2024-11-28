export interface Timetable {
  station: string; // Name der Station.
  s: Schedule[]; // Liste von allen Zugstopps.
}

export interface Schedule {
  id: string; // Einzigartige ID des Zug-Stops.
  tl: TrainLine; // Ein zusammengesetzter Datentyp, der allgemeine Datenobjekte enthält, die eine Fahrt charakterisieren.
  ar?: Arrival; // Ein Ereignis (Ankunft oder Abfahrt), das Teil eines Halts ist.
  dp?: Departure; // Ein Ereignis (Ankunft oder Abfahrt), das Teil eines Halts ist.
}

export interface TrainLine {
  f: string; // Filter-Flags
  t: string; // Fahrt-Typ
  o: string; // Eigentümer. Eine eindeutige Kurzform, die nur dazu dient, eine Fahrt einem bestimmten EVU zuzuordnen.
  c: string; // Kategorie. Fahrtkategorie, z.B. "ICE" oder "RE".
  n: string; // Fahrt-/Zugnummer, z.B. "4523".
}

export interface Arrival {
  pt: string; // Geplante Abfahrts- oder Ankunftszeit. 'YYMMddHHmm' Format, z.B. '1404011437' für 14:37 am 1. April 2014.
  pp: string; // Geplantes Gleis
  l: string; // Linie. Die Linienbezeichnung (z.B. "3" für eine S-Bahn oder "45S" für einen Bus).
  tra?: string; // Übergang. Fahrt-ID des nächsten oder vorherigen Zuges einer gemeinsamen Fahrt.
  ppth: string; // Geplanter Pfad. Eine Folge von Stationsnamen, getrennt durch Pipe-Symbole ('|'). Die erste Station ist die Startstation der Fahrt. Die aktuelle Station ist nie enthalten.
}

export interface Departure {
  pt: string; // Geplante Abfahrts- oder Ankunftszeit. 'YYMMddHHmm' Format, z.B. '1404011437' für 14:37 am 1. April 2014.
  pp: string; // Geplantes Gleis
  l: string; // Linie. Die Linienbezeichnung (z.B. "3" für eine S-Bahn oder "45S" für einen Bus).
  ppth: string; // Geplanter Pfad. Eine Folge von Stationsnamen, getrennt durch Pipe-Symbole ('|'). Die erste Station ist die Startstation der Fahrt. Die aktuelle Station ist nie enthalten.
}
