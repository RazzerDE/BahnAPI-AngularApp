<h1 align="center">
     📡 BahnAPI-AngularApp ~ Deutsche Bahn API
</h1>

<p align="center">
  <i align="center">Lerne den Umgang mit REST-API Diensten in TypeScript.<br />Wurde entwickelt mit der Verwendung von Angular.</i>

  ![image](https://i.imgur.com/GFax1ym.png)

</p>

<h4 align="center">
  <a href="https://angular.dev/">
    <img src="https://img.shields.io/badge/version-Angular_18-27ae60?style=for-the-badge" alt="php version" style="height: 25px;">
  </a>
  <a href="https://developers.deutschebahn.com/db-api-marketplace/apis/frontpage">
    <img src="https://img.shields.io/badge/API_Dienst-Bahn_API-2980b9?style=for-the-badge" alt="php version" style="height: 25px;">
  </a>
  <a href="https://discord.gg/bl4cklist">
    <img src="https://img.shields.io/discord/616655040614236160?style=for-the-badge&logo=discord&label=Discord&color=%237289da" alt="discord server" style="height: 25px;">
  </a>
  <br>
</h4>

## 🗯️ Einführung
› Dieses Projekt dreht sich um die Entwicklung einer benutzerfreundlichen Website. Die Website wurde mit HTML, CSS und TypeScript (JavaScript) erstellt, einige der leistungsstärksten und am weitesten verbreiteten Sprachen in der Webentwicklung.

🤔 - Die <strong>Hauptfunktion</strong> dieser Website besteht darin, am Ende eine kleine Website/Web-App zu haben, auf der ein Benutzer die Ankunfts- und Abfahrtszeiten einer gewünschten Station anzeigen kann. Es sollte auch angezeigt werden, ob es an der gewünschten Station einen Aufzug gibt.

› Dieses Projekt wurde von Yannic Drews & Yanic Döpner für eine Projektarbeit in ihrer Ausbildung zum Fachinformatiker für Anwendungsentwicklung entwickelt - einige Teile des Projekts sind auf Deutsch, da dies die für die Projektarbeit festgelegte Sprache war.

## 🧮 Funktionen
› `BahnAPI-AngularApp` bietet eine Reihe grundlegender Funktionen, die Ihnen beim Umgang mit APIs in TypeScript helfen können und somit Ihren Lernprozess zur effektiven Verwaltung dieser erleichtern. In unserem kleinen Projekt haben wir die **[BahnAPI](https://developers.deutschebahn.com/db-api-marketplace/apis/frontpage)** als Beispiel verwendet.
<br />

Es unterstützt folgende <strong>Funktionen</strong>:
<ul>
  <li>📚 <strong>Einfaches Caching-System</strong>: Keine neuen API-Anfragen bei Seitenaktualisierung.</li>
  <li>⏳ <strong>Tabellen-Datenlader</strong>: Während die Tabellendaten geladen werden, wird ein endloses GIF angezeigt.</li>
  <li>📛 <strong>Fehlerbehandlung</strong>: Zeigt Fehler an, wenn bei den API-Anfragen etwas schiefgeht.</li>
  <li>✍ <strong>Autovervollständigungen</strong>: Die Webseite speichert jeden Bahnhofsnamen und schlägt dir diese vor.</li>
  <li>📡 <strong>Unit-Tests auf 100%</strong>: Sämtlicher Code wurde ausführlich getestet. Einsehbar mit dem Befehl <code>jest</code>.</li>
  <br />
  <li>📺 <strong>Responsives Website-Design</strong>: Unsere Website ist auf allen Geräten responsiv gestaltet.</li>
  <li>🎨 <strong>Theme-Wechsler</strong>: Sie können zwischen hellem und dunklem Modus auf dieser Website wechseln.</li>
  <li>⚡ <strong>Optimiertes Tailwind-CSS</strong>: Wir haben Tailwind-CSS verwendet, um die Menge des geladenen CSS zu reduzieren und die Dinge responsiv zu halten.</li>
</ul>

## 🔨 Installation
› Bevor Sie unsere kleine Website zu Lernzwecken erkunden können, müssen einige Vorbereitungen getroffen werden.

💡 › Sie benötigen einige (kostenlose) <strong>registrierte Pläne von der **[BahnAPI](https://developers.deutschebahn.com/db-api-marketplace/apis/frontpage)**:<br />
- **[Free Timetables](https://developers.deutschebahn.com/db-api-marketplace/apis/product/26497)**
- **[StaDa - Station Data](https://developers.deutschebahn.com/db-api-marketplace/apis/product/145141)**
- **[FaSta - Station Facilities Status](https://developers.deutschebahn.com/db-api-marketplace/apis/product/130978)**

Befolgen Sie dann diese Schritte, um sicherzustellen, dass alles reibungslos läuft:
1. Erstellen Sie eine Anwendung auf dem DB API Marketplace und fügen Sie die oben genannten Pläne hinzu.
2. Setzen Sie Ihre <strong>korrekten API-Login-Daten</strong> in [`src/app/services/api-service/types/environment.ts`](https://github.com/RazzerDE/BahnAPI-AngularApp/blob/main/src/app/services/api-service/types/environment.ts).
3. Führen Sie `npm install` aus, um alle Abhängigkeiten zu installieren.
4. Führen Sie `ng serve` aus, um das Projekt zu kompilieren.
5. Besuchen Sie die Seite `http://localhost:4200` in Ihrem Browser.

Sollte `ng serve` nicht funktionieren, versuchen Sie es mit `npm run start`.
