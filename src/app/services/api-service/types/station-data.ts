export interface StationDataResponse {
  offset: number; // offset of the first result object with respect to the total number of hits produced by the query
  limit: number; // maximum number of result objects to be returned
  total: number; // total number of hits produced by that query
  result: StationData[]; // result objects produced by that query
}

export interface StationData {
  number: number; // unique identifier representing a specific railway station
  ifopt: string; // the stations IFOPT number (idk what that is)
  name: string;
  mailingAddress: MailingAddress;
  category: number; // Stations with category -1 or 0 are not in production, e.g. planned, saled, without train stops.
  priceCategory: number; // the price for train stops at a specific station (1..7)
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
