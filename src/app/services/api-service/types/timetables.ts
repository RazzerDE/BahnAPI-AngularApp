export interface Timetable {
  station: string; // Station name.
  s: Schedule[]; // List of TimetableStop.
}

export interface Schedule {
  id: string; // An id that uniquely identifies the stop.
  tl: TrainLine; // It's a compound data type that contains common data items that characterize a Trip.
  ar?: Arrival; // An event (arrival or departure) that is part of a stop.
  dp?: Departure; // An event (arrival or departure) that is part of a stop.
}

export interface TrainLine {
  f: string; // Filter flags
  t: string; // Trip type
  o: string; // Owner. A unique short-form and only intended to map a trip to specific evu.
  c: string; // Category. Trip category, e.g. "ICE" or "RE".
  n: string; // Trip/train number, e.g. "4523".
}

export interface Arrival {
  pt: string; // Planned departure or arrival time. 'YYMMddHHmm' format, e.g. '1404011437' for 14:37 on April the 1st of 2014.
  pp: string; // Planned plattform
  l: string; // Line. The line indicator (e.g. "3" for an S-Bahn or "45S" for a bus).
  tra?: string; // Transition. Trip id of the next or previous train of a shared train.
  ppth: string; // Planned Path. A sequence of station names separated by the pipe symbols ('|'). The first element is the trip's start station.
}

export interface Departure {
  pt: string; // Planned departure or arrival time. 'YYMMddHHmm' format, e.g. '1404011437' for 14:37 on April the 1st of 2014.
  pp: string; // Planned plattform
  l: string; // Line. The line indicator (e.g. "3" for an S-Bahn or "45S" for a bus).
  ppth: string; // Planned Path. A sequence of station names separated by the pipe symbols ('|'). The first element is the trip's start station.
}
