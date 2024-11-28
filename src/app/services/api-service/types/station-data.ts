export interface StationDataResponse {
  offset: number; // Offset des ersten Ergebnisobjekts in Bezug auf die Gesamtanzahl der Treffer, die durch die Abfrage erzeugt wurden
  limit: number; // Maximale Anzahl der zurückzugebenden Ergebnisobjekte
  total: number; // Gesamtanzahl der Treffer, die durch die Abfrage erzeugt wurden
  result: StationData[]; // Ergebnisobjekte, die durch die Abfrage erzeugt wurden
}

export interface StationData {
  number: number; // Einzigartige ID, repräsentiert einen spezifischen Bahnhof
  ifopt: string; // Station's IFOPT Nummer (keine Ahnung was das ist)
  name: string;
  mailingAddress: MailingAddress;
  category: number; // Stationen mit den Kategorien -1 oder 0 sind nicht aktiv, z.B. geplant, verkauft, ohne Zugstopps.
  priceCategory: number; // Der Preis für Zughalte an einer spezifischen Station (1..7)
  hasParking: boolean;
  hasBicycleParking: boolean;
  hasLocalPublicTransport: boolean;
  hasPublicFacilities: boolean;
  hasLockerSystem: boolean;
  hasTaxiRank: boolean;
  hasTravelNecessities: boolean;
  hasSteplessAccess: string;
  hasMobilityService: string;
  hasWiFi: boolean;
  hasTravelCenter: boolean;
  hasRailwayMission: boolean;
  hasDBLounge: boolean;
  hasLostAndFound: boolean;
  hasCarRental: boolean;
  federalState: string;
  regionalbereich: Regionalbereich;
  aufgabentraeger: Aufgabentraeger;
  timeTableOffice: TimeTableOffice;
  szentrale: Szentrale;
  stationManagement: StationManagement;
  evaNumbers: EvaNumber[];
  ril100Identifiers: Ril100Identifier[];
  productLine: ProductLine;
}

export interface MailingAddress {
  city: string;
  zipcode: string;
  street: string;
}

export interface Regionalbereich {
  number: number;
  name: string;
  shortName: string;
}

export interface Aufgabentraeger {
  shortName: string;
  name: string;
}

export interface TimeTableOffice {
  email: string;
  name: string;
}

export interface Szentrale {
  number: number;
  publicPhoneNumber: string;
  name: string;
}

export interface StationManagement {
  number: number;
  name: string;
}

export interface EvaNumber {
  number: number;
  geographicCoordinates: GeographicCoordinates;
  isMain: boolean;
}

export interface GeographicCoordinates {
  type: string;
  coordinates: number[];
}

export interface Ril100Identifier {
  rilIdentifier: string;
  isMain: boolean;
  hasSteamPermission: boolean;
  steamPermission: string;
  geographicCoordinates: GeographicCoordinates;
  primaryLocationCode: string;
}

export interface ProductLine {
  productLine: string;
  segment: string;
}
