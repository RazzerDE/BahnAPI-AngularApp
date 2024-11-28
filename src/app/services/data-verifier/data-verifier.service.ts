import {Injectable} from '@angular/core';
import {Schedule, Timetable} from "../api-service/types/timetables";
import {Parser} from "xml2js";
import {Station} from "../api-service/types/stations";
import {StationData} from "../api-service/types/station-data";
import {Elevator} from "../api-service/types/elevators";

@Injectable({
  providedIn: 'root'
})
export class DataVerifierService {
  // wird genutzt um die Autovervollständigung bei Input-Feldern zu zeigen
  station_names: string[] = [];
  filtered_station_names: string[] = [];
  completion_name: string = '';
  completion_name_end: string = '';

  // Aktuelle API-Daten (Stationen, Fahrpläne, Aufzüge)
  current_station: Station | undefined;
  station_stops: Timetable | undefined;
  stations: StationData[] = [];
  elevators: Elevator[] = [];

  private parser: Parser = new Parser({explicitArray: false, trim: true, explicitRoot: false, mergeAttrs: true});

  /**
   * Konvertiert einen XML-String in ein JSON-Objekt - wird verwendet, um die XML-Antwort der API zu parsen.
   *
   * @param xml - Der zu konvertierende XML-String.
   * @returns Ein Promise, das die JSON-Darstellung des XML-Strings zurückgibt.
   */
  xmlToJson(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.parser.parseString(xml, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Aktualisiert den Cache, indem gespeicherte Daten aus dem localStorage abgerufen werden.
   * Wenn Daten gefunden werden, werden die entsprechenden Eigenschaften im Service aktualisiert.
   */
  updateCache(): void {
    const temp_stations: string | null = localStorage.getItem('stations');
    const temp_elevators: string | null = localStorage.getItem('elevators');
    const temp_current_station: string | null = localStorage.getItem('current_station');
    const temp_station_names: string | null = localStorage.getItem('station_names');
    if (temp_stations && temp_stations.length > 0) {
      this.stations = JSON.parse(localStorage.getItem('stations') || '');
    }

    if (temp_elevators && temp_elevators.length > 0) {
      this.elevators = JSON.parse(localStorage.getItem('elevators') || '');
    }

    if (temp_station_names && temp_station_names.length > 0) {
      this.station_names = JSON.parse(localStorage.getItem('station_names') || '');
    }

    if (temp_current_station) {
      if (this.current_station === undefined) {
        localStorage.removeItem('current_station');
        return;
      }
      this.current_station = JSON.parse(localStorage.getItem('current_station') || '');
    }
  }

  /**
   * Filtert die Fahrplandaten, um direkte Verbindungen zur angegebenen Zielstation zu finden.
   *
   * @param timetable - Die abgerufenen Fahrplandaten.
   * @param destinationStation - Der Name der Zielbahnhofstation.
   * @param show_arrival - Ein boolescher Wert, der bestimmt, ob Ankunftszeiten angezeigt werden sollen.
   * @returns Ein Array von Fahrplänen, die direkte Verbindungen zur Zielstation haben.
   */
  filterDirectRoutes(timetable: Timetable, destinationStation: string, show_arrival?: boolean): Schedule[] {
    const normalizedDestination: string = this.normalizeStationName(destinationStation);
    // Normalisiert die Namen der Stationen aufgrund unterschiedlicher Namenskonventionen der BahnAPI
    return timetable.s.filter((schedule: Schedule) => {
      const path: string | undefined = show_arrival ? schedule.ar?.ppth : schedule.dp?.ppth;
      if (path) {
        const plannedPath: string[] = path.split('|');
        return plannedPath.some(station => this.normalizeStationName(station) === normalizedDestination);
      }
      return false;
    });
  }

  /**
   * Normalisiert einen Stationsnamen, indem er in Kleinbuchstaben umgewandelt und Leerzeichen sowie Bindestriche entfernt werden.
   *
   * @param stationName - Der Name der Station, die normalisiert werden soll.
   * @returns Der normalisierte Stationsname.
   */
  normalizeStationName(stationName: string): string {
    return stationName.toLowerCase().replace(/[\s-]/g, '');
  }


  /**
   * Schaltet die Sichtbarkeit des Fehlerwarnfelds basierend auf dem angegebenen Fehlertyp um.
   *
   * @param error_type - Der anzuzeigende Fehlertyp. Kann einer der folgenden sein:
   *   - 'invalid_station_end': Die Endstation ist ungültig.
   *   - 'invalid_station_start': Die Startstation ist ungültig.
   *   - 'same_station': Die Start- und Endstation sind gleich.
   *   - 'no_stations': Keine direkten Verbindungen für die angegebenen Stationen gefunden.
   *   Wenn kein Fehlertyp angegeben wird, wird das Warnfeld ausgeblendet.
   */
  toggleErrorAlert(error_type?: 'invalid_station_end' | 'invalid_station_start' | 'same_station' | 'no_stations'): void {
    const alert_box: HTMLDivElement = document.getElementById('invalidAlert') as HTMLDivElement;
    const alert_title: HTMLHeadingElement = document.getElementById('alert_title') as HTMLHeadingElement;
    const alert_info: HTMLSpanElement = document.getElementById('alert_info') as HTMLSpanElement;
    if (!alert_box || !alert_title || !alert_info) {
      return;
    }

    if (!error_type) { // Alert-Box verstecken
      alert_box.classList.add('hidden');
      return;
    }

    // überprüfe, ob ein Fehler bereits angezeigt wird
    if (!alert_box.classList.contains('hidden')) {
      return;
    }

    if (error_type === 'same_station') {
      alert_title.innerText = 'Ungültige Stationen';
      alert_info.innerText = 'Die Start-Station kann nicht gleich der Ziel-Station sein.';
    } else if (error_type === 'no_stations') {
      alert_title.innerText = 'Keine Züge gefunden';
      alert_info.innerText = 'Es wurden keine Züge für die angegebene Direktverbindung gefunden.';
    } else if (error_type.startsWith('invalid_station')) {
      const stationType: string = error_type === 'invalid_station_start' ? 'Start' : 'End';
      alert_title.innerText = `Ungültige ${stationType}station`;
      alert_info.innerText = `Die angegebene ${stationType}station wurde nicht in der API gefunden.
                              Achte auf Bindestriche, Groß- und Kleinschreibung und Leerzeichen!`;
    }

    if (alert_box.classList.contains('hidden')) { // Alert-box anzeigen
      alert_box.classList.remove('hidden');
    }
  }

  /**
   * Formatiert die angegebene Zeitzeichenkette in das Format "HH:MM".
   * @param pt - Die Zeitzeichenkette im Format "YYYYMMDDHHMM".
   * @returns Die formatierte Zeitzeichenkette.
   */
  formatTime(pt: string): string {
    return `${pt.slice(6, 8)}:${pt.slice(8, 10)}`;
  }

  /**
   * Schaltet die Sichtbarkeit des Auto-Vervollständigungsmenüs um.
   * Wenn das Menü derzeit ausgeblendet ist, wird es angezeigt, wenn zwischengespeicherte Stationsnamen vorhanden sind.
   * Wenn das Menü derzeit sichtbar ist, wird es ausgeblendet.
   */
  toggleAutoCompletionMenu(input: HTMLInputElement): void {
    const autoCompletionMenu: HTMLDivElement = document.getElementById('autoCompletionMenu') as HTMLDivElement;
    if (!autoCompletionMenu) {
      return;
    }

    if (this.station_names.length > 0 && input.value.length > 0 && !this.station_names.includes(input.value)) {
      console.log(this.station_names)
      // zeig nur Einträge an, die mit dem eingegebenen Text beginnen
      this.filtered_station_names = this.station_names.filter((station: string): boolean => station.toLowerCase().startsWith(input.value.toLowerCase()));
      console.log(this.filtered_station_names);
      if (autoCompletionMenu.classList.contains('hidden') && this.filtered_station_names.length > 0) {
        autoCompletionMenu.classList.remove('hidden');
      }
    }

    if (this.station_names.length === 0 || input.value.length === 0 || this.filtered_station_names.length === 0 || this.station_names.includes(input.value)) {
      if (!autoCompletionMenu.classList.contains('hidden')) {
        autoCompletionMenu.classList.add('hidden');
      }
    }
  }

  /**
   * Aktualisiert die Liste der Stationsnamen.
   * Wenn ein einzelner Stationsname angegeben wird, fügt er ihn der Liste hinzu, wenn er noch nicht existiert.
   * Wenn ein Array von Stationsdaten angegeben wird, ersetzt es die aktuelle Liste durch die Namen aus dem Array.
   *
   * @param station - Ein einzelner Stationsname oder ein Array von Stationsdaten.
   */
  updateStationList(station: string | StationData[]): void {
    if (typeof station === 'string') {
      if (!this.station_names.includes(station)) {
        this.station_names.push(station);
      }
    }

    // cache updaten
    localStorage.setItem('station_names', JSON.stringify(this.station_names));
  }

}
