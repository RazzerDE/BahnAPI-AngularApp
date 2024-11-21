export interface Station {
  p: string; // List of platforms. A sequence of platforms separated by the pipe symbols ("|").
  meta: string; // List of meta stations. A sequence of station names separated by the pipe symbols ("|").
  name: string; // Station name.
  eva: number; // EVA station number.
  ds100: string; // DS100 station code.
  db: string; // not documentated
  creationts: string; // not documentated - Creation timestamp?.
}

export interface Stations {
  station: Station;
}
