import { Category, ChecklistItem, GuideContent, Vessel } from "./types";

// ---------------------------------------------------------------------------
// Item-Fabrik: für kompakte Schreibweise. Die ids werden beim Aufbau der
// Kategorie vergeben.
// ---------------------------------------------------------------------------
type ItemDraft = Omit<ChecklistItem, "id">;

function i(text: string, opts?: Partial<Omit<ItemDraft, "text">>): ItemDraft {
  return { text, ...opts };
}

function cat(id: string, title: string, icon: string, drafts: ItemDraft[]): Category {
  return {
    id,
    title,
    icon,
    items: drafts.map((d, idx) => ({ ...d, id: `${id}-${idx}` })),
  };
}

// ---------------------------------------------------------------------------
// Gemeinsame Kategorie-Blöcke (für größere Yachten)
// ---------------------------------------------------------------------------

const evrak = (id: string): Category =>
  cat(id, "Papiere & Vertrag", "📜", [
    i("Chartervertrag vor der Unterschrift Zeile für Zeile lesen", { critical: true }),
    i("Kautionshöhe, Rückgabebedingungen und Selbstbeteiligung geklärt"),
    i("Bootszulassung / Registrierungsdokument ist an Bord"),
    i("Versicherungspolice und Deckungsumfang gesehen (Haftpflicht + Kasko)", { critical: true }),
    i("Sportbootführerschein / ICC wurde akzeptiert und registriert"),
    i("Inventarliste Stück für Stück gezählt und unterschrieben", { photo: true, tip: "Jeder bei der Rückgabe fehlende Posten wird von der Kaution abgezogen." }),
    i("Vorhandene Schäden ins Check-in-Protokoll eingetragen und fotografiert", { critical: true, photo: true }),
    i("Treibstoff- und Wasserregelung geklärt (voll übernehmen / voll zurückgeben?)"),
    i("Notfallnummern gespeichert (Vercharterer, Marina, Küstenwache 158)"),
    i("Rückgabezeit, Rückgabeort und Verspätungsgebühr geklärt"),
  ]);

const govde = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Rumpf & Außenbereich", "🛥️", [
    i("Rumpf komplett abgehen: Kratzer, Risse, Gelcoat-Schäden fotografieren", { critical: true, photo: true, tip: "Rumpfkratzer sind der häufigste Streitpunkt. Ein Video-Rundgang ist die sicherste Absicherung." }),
    i("Bug- und Hecksteven auf Anfahrspuren prüfen", { photo: true }),
    i("Relingsdrähte straff und unbeschädigt; Bugkorb und Heckkorb fest"),
    i("Rutschfeste Decksflächen und Teak auf Schäden prüfen", { photo: true }),
    i("Klampen und Beschläge (Augbolzen) fest"),
    i("Luken und Bullaugen öffnen und schließen, keine Risse in den Scheiben", { photo: true, tip: "Eine gerissene Bullaugenscheibe ist ein klassischer Kautionsabzug." }),
    i("Positionslichter funktionieren (grün/rot/Hecklicht/Dampferlicht)", { critical: true }),
    i("Ruderspiel geprüft, Ruder lässt sich leichtgängig drehen"),
    i("Badeleiter / Plattform-Mechanismus funktioniert"),
    ...extra,
  ]);

const motorBlok = (id: string, opts?: { cift?: boolean }): Category =>
  cat(id, "Motor & Maschine", "⚙️", [
    i(`Betriebsstundenzähler fotografieren und ins Protokoll eintragen lassen${opts?.cift ? " (beide Motoren)" : ""}`, { photo: true }),
    i("Ölstand mit dem Peilstab geprüft", { critical: true }),
    i("Kühlwasser-/Frostschutzstand geprüft"),
    i("Keilriemen straff und ohne Risse"),
    i("Seewasserfilter sauber, Deckel dicht"),
    i("Motor gestartet: prüfen, ob Kühlwasser aus dem Auspuff kommt", { critical: true, tip: "Kommt kein Wasser, kann der Impeller defekt sein; der Motor überhitzt in kurzer Zeit." }),
    i("Keine ungewöhnlichen Geräusche/Vibrationen im Leerlauf und unter Last"),
    i("Tankanzeige fotografiert", { photo: true }),
    i("Keine Spuren von Treibstoff-/Öllecks unter der Motorabdeckung"),
    i("Bilge trocken; automatische und manuelle Bilgepumpen getestet", { critical: true }),
    i("Getriebe schaltet weich: vorwärts/rückwärts/neutral"),
    i("Instrumententafel ohne Alarme (Öldruck, Temperatur, Ladung)"),
    i("Aufbewahrungsort von Ersatzteilen und Werkzeugtasche gezeigt (Impeller, Riemen, Sicherungen)"),
    i("Marschdrehzahl, Verbrauch pro Stunde und Tankkapazität notiert", { tip: "Für die Reichweite: Tank (l) ÷ Verbrauch (l/h) × Fahrt (kn)." }),
  ]);

// Der häufigste Streitpunkt: Dinghi (Beiboot) und Außenborder.
// Nummer 1 der Bareboat-Versicherungsfälle sind Verlust von Dinghi/Motor und
// Propellerschäden.
const tender = (id: string): Category =>
  cat(id, "Dinghi & Außenborder", "🚣", [
    i("Dinghi aufgepumpt und unbeschädigt; Schläuche und Boden fotografiert", { photo: true }),
    i("Außenborder gestartet, Kühlwasserstrahl spritzt", { critical: true }),
    i("Außenborder-Propeller in Nahaufnahme fotografiert", { critical: true, photo: true, tip: "Propellerschäden sind der am häufigsten angelastete Posten bei der Rückgabe." }),
    i("Kill-Cord (Notstopp-Leine) am Dinghi vorhanden und funktioniert", { critical: true }),
    i("Paddel, Pumpe, Bugleine und Sicherungsdraht im Dinghi"),
    i("Motor am Dinghi abgeschlossen, Sicherungsleine befestigt", { tip: "Ein ins Wasser gefallener Außenborder ist der häufigste Bareboat-Versicherungsfall." }),
    i("Dinghi-Davits / Hebesystem gezeigt bekommen"),
  ]);

const elektrik = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Elektrik & Navigation", "🧭", [
    i("Batteriespannungen geprüft (Verbraucher- und Starterbatterie getrennt?)"),
    i("Batterien laden bei laufendem Motor (Spannung steigt)"),
    i("GPS / Kartenplotter startet, aktuelle Seekarten geladen", { critical: true }),
    i("Echolot funktioniert und zeigt plausible Werte", { critical: true, tip: "Unbedingt fragen: misst es ab Kiel oder ab Wasserlinie?" }),
    i("UKW-Funkgerät getestet (Kanal 16 Hörwache + Funkcheck)", { critical: true, tip: "Im Notfall ist UKW-Funk Ihr einziges verlässliches Kommunikationsmittel." }),
    i("Autopilot schaltet ein und hält den Kurs"),
    i("Innenbeleuchtung und Leselampen funktionieren"),
    i("12-V-/USB-Steckdosen und ggf. Inverter (220 V) funktionieren"),
    i("Landstromkabel und Ladegerät an Bord"),
    i("Horn / Nebelhorn funktioniert"),
    ...extra,
  ]);

const yelkenArma = (id: string): Category =>
  cat(id, "Segel & Rigg", "⛵", [
    i("Großsegel gesetzt und geborgen: keine Risse, offenen Nähte, UV-Schäden", { photo: true }),
    i("Rollanlage von Genua/Fock läuft leichtgängig", { tip: "Klemmt die Rollanlage, wird das Segelbergen auf See zum Albtraum." }),
    i("Fallen (Groß, Genua, Spi) intakt und in den Blöcken"),
    i("Schoten und Leinen nicht verschlissen, Enden in gutem Zustand"),
    i("Winschen drehen, Sperren halten; Winschkurbeln gezählt (mindestens 2)"),
    i("Reffsystem erklärt bekommen und funktionsfähig", { critical: true, tip: "Bei schwerem Wetter nicht reffen zu können ist eines der größten Risiken." }),
    i("Wanten und Stagen straff; Wantenspanner gesichert"),
    i("Baum, Baumniederholer und Beschläge fest; Baumspiel normal"),
    i("Fallenstopper halten, Beschriftungen lesbar"),
    i("Lazyjacks / Lazybag: Reißverschluss und Nähte intakt"),
  ]);

const guvenlik = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Sicherheitsausrüstung", "🛟", [
    i("Rettungswesten für alle Personen (Kindergrößen für Kinder)", { critical: true }),
    i("Rettungsinsel an ihrem Platz, Zertifikat/Wartungsdatum gültig", { critical: true, photo: true, tip: "Eine abgelaufene Rettungsinsel öffnet sich auf See möglicherweise nicht. Etikett fotografieren." }),
    i("Rettungsring + Leuchtboje vom Cockpit aus erreichbar", { critical: true }),
    i("Signalraketen vollständig und Haltbarkeitsdatum gültig", { critical: true, photo: true }),
    i("Feuerlöscher: Anzahl, Manometer im grünen Bereich, Prüfdaten gültig", { critical: true, photo: true }),
    i("Löschdecke in der Pantry"),
    i("Erste-Hilfe-Kasten vollständig und aktuell"),
    i("EPIRB / PLB (falls vorhanden) per Testknopf geprüft"),
    i("Taschenlampe + Ersatzbatterien"),
    i("Lifebelts (Harness) und Strecktaue (Jacklines)"),
    i("Notpinne: Aufbewahrungsort gezeigt, aufgesteckt und ausprobiert", { critical: true }),
    i("Seeventile: Positionen und Holzpfropfen gezeigt bekommen", { critical: true }),
    i("Gasdetektor / Gasalarm funktioniert"),
    ...extra,
  ]);

const demirPalamar = (id: string): Category =>
  cat(id, "Anker & Festmacher", "⚓", [
    i("Hauptanker und Kettenlänge erfragt (wie viele Meter?)", { tip: "Zum Ankern braucht es mindestens die 3- bis 5-fache Wassertiefe als Kettenlänge." }),
    i("Ankerwinsch fiert und hievt; Fernbedienung funktioniert", { critical: true }),
    i("Kettenbefestigung und Kettenstopper geprüft"),
    i("Zweitanker mit Leine an Bord"),
    i("Fender gezählt und in gutem Zustand (mindestens 6 Stück)", { photo: true }),
    i("Ausreichend Festmacherleinen (4-6 Stück, nicht verschlissen)"),
    i("Lange Landleine (~50 m) für das Anlegen mit dem Heck zur Pier an Bord", { tip: "Im Mittelmeer für das Festmachen mit Heckanker und Landleine in Buchten unerlässlich." }),
    i("Bootshaken für Muring/Boje an Bord"),
  ]);

const suTesisat = (id: string): Category =>
  cat(id, "Wasser & Sanitär", "🚿", [
    i("Frischwassertanks voll; Kapazität erfragt", { photo: true }),
    i("Druckwasserpumpe läuft, gleichmäßiger Wasserfluss an allen Hähnen"),
    i("Warmwasser (Boiler) heizt über Motor/Landstrom"),
    i("Toiletten (WC): Pumpe/Vakuum getestet", { critical: true, tip: "Ein verstopftes WC verdirbt den Urlaub; jede Kabine einzeln testen." }),
    i("Schwarzwassertank (Fäkalientank) leer; Absperrventil gezeigt"),
    i("Duschen und Duschlenzpumpen funktionieren"),
    i("Decksdusche funktioniert"),
    i("Spuren von Wasserlecks: Schrankböden und Tankumgebung trocken"),
  ]);

const mutfakYasam = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Pantry & Wohnbereich", "🍳", [
    i("Herd/Backofen angezündet; Gasflaschenfüllstand und Ersatzflasche geprüft", { critical: true }),
    i("Gasabsperrventil gezeigt bekommen; Schlauch und Schellen intakt", { critical: true }),
    i("Kühlschrank kühlt (vor der Übernahme einschalten lassen und abwarten)"),
    i("Töpfe, Teller, Besteck stimmen mit dem Inventar überein"),
    i("Bettwäsche, Laken, Handtücher für alle Personen übernommen"),
    i("Kabinen, Polster, Kissen: Flecken/Risse fotografieren", { photo: true }),
    i("Türen, Schrankschlösser und Scharniere funktionieren"),
    i("Bimini und Sprayhood intakt, Reißverschlüsse funktionieren", { photo: true }),
    i("Cockpittisch und Cockpitpolster vollständig"),
    i("Fliegengitter und Dichtungen von Türen/Luken intakt"),
    ...extra,
  ]);

const sonKontrol = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Letzte Schritte vor der Übernahme", "✅", [
    i("Das gesamte Boot in einem Video-Rundgang aufnehmen (mit sichtbarem Datum)", { critical: true, photo: true }),
    i("Treibstoff, Wasserstand und Betriebsstunden ins Protokoll eingetragen", { photo: true }),
    i("Technisches Briefing mit dem Handy filmen (besonders das Schaltpanel)", { tip: "Tipp Nummer 1 der ASA: das Briefing aufzeichnen — später erinnert man sich unmöglich an alles." }),
    i("Briefing erhalten: Marinaausfahrt, Sperrgebiete, Wetterlage"),
    i("Geklärt, wen man bei einer Panne anruft und wie der Serviceablauf ist"),
    i("Nach Ankerplätzen und Routenempfehlungen gefragt"),
    i("Rückgabeprozedur geklärt (gibt es eine Taucherkontrolle?)"),
    i("Eine Kopie des Check-in-Protokolls behalten", { critical: true }),
    ...extra,
  ]);

// ---------------------------------------------------------------------------
// BOOTSTYPEN
// ---------------------------------------------------------------------------

const yelkenli: Vessel = {
  id: "yelkenli",
  name: "Segelyacht",
  subtitle: "Bareboat-Segelyachtcharter",
  icon: "⛵",
  duration: "60–90 Min.",
  group: "kiralik",
  categories: [
    evrak("ye-evrak"),
    govde("ye-govde"),
    motorBlok("ye-motor"),
    elektrik("ye-elektrik", [i("Windmessanlage (Anemometer) funktioniert")]),
    yelkenArma("ye-yelken"),
    guvenlik("ye-guvenlik", [i("Radarreflektor hängt im Mast")]),
    demirPalamar("ye-demir"),
    tender("ye-tender"),
    suTesisat("ye-su"),
    mutfakYasam("ye-mutfak"),
    sonKontrol("ye-son"),
  ],
};

const motoryat: Vessel = {
  id: "motoryat",
  name: "Motoryacht",
  subtitle: "Motoryacht / Flybridge",
  icon: "🛥️",
  duration: "45–75 Min.",
  group: "kiralik",
  categories: [
    evrak("mo-evrak"),
    govde("mo-govde", [
      i("Flybridge-Treppe und Handläufe fest"),
      i("Trimmklappen funktionieren"),
      i("Hydraulische Plattform / Gangway (Passerelle) funktioniert"),
    ]),
    motorBlok("mo-motor", { cift: true }),
    cat("mo-jenerator", "Generator & Komfort", "🔌", [
      i("Generator gestartet und unter Last getestet (Klimaanlage + Boiler an)"),
      i("Klimaanlage kühlt/heizt in jeder Kabine"),
      i("Bug-/Heckstrahlruder getestet", { critical: true }),
      i("Wasserabscheider-Filter (Racor) sauber, Position gezeigt bekommen"),
      i("Scheibenwischer und Scheibenwaschanlage funktionieren"),
      i("Suchscheinwerfer (falls vorhanden) funktioniert"),
      i("Watermaker (falls vorhanden): Bedienung erklärt bekommen"),
    ]),
    elektrik("mo-elektrik", [i("Radar startet und liefert ein Bild")]),
    guvenlik("mo-guvenlik", [
      i("Automatische Feuerlöschanlage im Maschinenraum: Anzeige im grünen Bereich", { critical: true }),
    ]),
    demirPalamar("mo-demir"),
    tender("mo-tender"),
    suTesisat("mo-su"),
    mutfakYasam("mo-mutfak"),
    sonKontrol("mo-son"),
  ],
};

const katamaran: Vessel = {
  id: "katamaran",
  name: "Katamaran",
  subtitle: "Zweirumpf-Segelyacht",
  icon: "⛵",
  duration: "75–100 Min.",
  group: "kiralik",
  categories: [
    evrak("ka-evrak"),
    govde("ka-govde", [
      i("Beide Rümpfe einzeln abgehen, alle vier 'Ecken' fotografieren", { photo: true, tip: "Katamarane erleiden Anlegeschäden am häufigsten an den Ecken." }),
      i("Trampolinnetz und Befestigungen intakt, fotografiert", { critical: true, photo: true }),
      i("Brückendeck (Bridgedeck) auf Schlag-/Slamming-Spuren prüfen"),
      i("Notausstiegsluken (Escape Hatches) in den Rümpfen öffnen und sind dicht", { critical: true }),
    ]),
    motorBlok("ka-motor", { cift: true }),
    elektrik("ka-elektrik", [
      i("Batteriebänke in beiden Rümpfen geprüft"),
      i("Solarpaneele liefern Ladestrom"),
    ]),
    yelkenArma("ka-yelken"),
    guvenlik("ka-guvenlik", [
      i("Bilgepumpen in beiden Rümpfen einzeln getestet", { critical: true }),
      i("Nach dem Platz der Rettungsinsel gefragt (unter dem Trampolin oder am Heck?)", { critical: true }),
    ]),
    demirPalamar("ka-demir"),
    cat("ka-bridle", "Katamaran-Spezifisches", "🪢", [
      i("Anker-Hahnepot (Bridle) an Bord und Verwendung gezeigt bekommen", { critical: true, tip: "Beim Katamaran ohne Hahnepot vor Anker zu liegen beschädigt die Kette." }),
      i("Dinghi-Davits: Heben/Fieren gezeigt bekommen"),
      i("Bedienung der Elektrowinsch und manuelle Alternative erklärt bekommen"),
      i("Briefing zum Manövrieren ohne Ruder mit beiden Motoren erhalten"),
      i("Reff-Briefing erhalten: Katamaran krängt nicht, Rigglasten steigen", { critical: true, tip: "Da ein Katamaran nicht krängt, ist Überlastung schwer zu erkennen; frühes Reffen ist Pflicht." }),
    ]),
    tender("ka-tender"),
    suTesisat("ka-su"),
    mutfakYasam("ka-mutfak"),
    sonKontrol("ka-son", [i("Nach Höhen- und Breitenbeschränkungen von Marina/Durchfahrten gefragt (breites Boot!)")]),
  ],
};

const gulet: Vessel = {
  id: "gulet",
  name: "Gulet",
  subtitle: "Blaue Reise mit Crew",
  icon: "⚓",
  duration: "30–45 Min.",
  group: "kiralik",
  categories: [
    cat("gu-evrak", "Vertrag & Leistungsumfang", "📜", [
      i("Route, Anzahl der Nächte und Häfen stehen im Vertrag", { critical: true }),
      i("Verpflegungsplan (Voll-/Halbpension) und Getränkeregelung geklärt"),
      i("Anzahl der Crewmitglieder und ihre Aufgaben erfragt"),
      i("Geklärt, wer Treibstoff, Hafengebühren und Transitlog zahlt"),
      i("APA-/Bordkassen-Bedingungen verstanden"),
      i("Übliche Crew-Trinkgeldpraxis erfragt (meist 5-10 %)"),
      i("Versicherung und Fahrgastkapazitäts-Zertifikat gesehen", { critical: true }),
    ]),
    cat("gu-kamara", "Kabinen & Komfort", "🛏️", [
      i("Kabinen besichtigt: Bett, Klimaanlage, Bad funktionieren"),
      i("Betriebszeiten von Klimaanlage und Generator schriftlich erhalten", { tip: "Viele Gulets lassen die Klimaanlage nur wenige Stunden pro Tag laufen; nicht nur mündlich klären." }),
      i("Die im Vertrag versprochenen Wasserspielzeuge sind wirklich an Bord", { photo: true }),
      i("Bettwäsche und Handtücher sauber und pro Person ausreichend"),
      i("Warmwasser läuft in allen Bädern"),
      i("Sonnenpolster und Sonnensegel vollständig", { photo: true }),
      i("Generator-Laufzeiten erfragt (läuft er nachts?)"),
    ]),
    cat("gu-guvenlik", "Sicherheit", "🛟", [
      i("Rettungswesten gezeigt bekommen (inkl. Kindergrößen)", { critical: true }),
      i("Briefing zu Rettungsinsel und Sammelplatz erhalten", { critical: true }),
      i("Feuerlöscher und Fluchtwege gezeigt bekommen", { critical: true }),
      i("Erste-Hilfe-Kasten und nächste medizinische Anlaufstelle erfragt"),
      i("Regeln für Landgänge mit dem Dinghi erfragt"),
    ]),
    cat("gu-son", "Vor dem Ablegen", "✅", [
      i("Gemeinschaftsbereiche fotografiert (vorhandene Schäden)", { photo: true }),
      i("Route und Wetterlage mit dem Kapitän besprochen"),
      i("Inventar der Wasserspielzeuge (SUP, Schnorchel) aufgenommen"),
      i("Kommunikation: Telefon/WLAN an Bord? Notrufnummern gespeichert"),
    ]),
  ],
};

const suratTeknesi: Vessel = {
  id: "surat",
  name: "Motorboot",
  subtitle: "Motorboot für Tagestörns",
  icon: "🚤",
  duration: "15–25 Min.",
  group: "kiralik",
  categories: [
    cat("su-evrak", "Papiere & Übergabe", "📜", [
      i("Vertrag und Kautionsbedingungen gelesen", { critical: true }),
      i("Führerscheinanforderung erfüllt (SBF/ICC)"),
      i("Vorhandene Kratzer und Schäden fotografiert", { critical: true, photo: true }),
      i("Treibstoffregelung geklärt (pro Stunde oder pro Tankfüllung?)"),
      i("Rückgabezeit und Reviergrenzen erfragt"),
    ]),
    cat("su-govde", "Rumpf & Motor", "⚙️", [
      i("Kratzer an Rumpf und Unterwasserschiff fotografiert", { photo: true }),
      i("Propeller auf Schäden geprüft (verbogene Blätter?)", { critical: true, photo: true }),
      i("Motor kalt gestartet, Kontrollwasserstrahl spritzt (Telltale)", { critical: true }),
      i("Kill-Switch-Leine (Notstopp) angebracht und funktioniert", { critical: true, tip: "Fallen Sie über Bord, ist dies das Einzige, was den Motor stoppt." }),
      i("Trimm/Tilt funktioniert"),
      i("Tankanzeige fotografiert", { photo: true }),
      i("Automatische Bilgepumpe funktioniert, Bootsinneres trocken"),
      i("Lenzstopfen (Drain Plug) am Heck ist EINGESETZT", { critical: true, tip: "Fehlt er, läuft das Boot langsam voll — ein klassischer und gefährlicher Fehler." }),
      i("Lenkung und Gashebel arbeiten ohne Spiel"),
      i("Risse/Flecken an Polstern und Sitzen fotografiert", { photo: true }),
    ]),
    cat("su-guvenlik", "Sicherheit", "🛟", [
      i("Rettungswesten für alle Personen (inkl. Kindergrößen)", { critical: true }),
      i("Feuerlöscher mit Druck und gültigem Prüfdatum", { critical: true }),
      i("Anker + Leine an Bord und am Boot befestigt"),
      i("Wurf-Rettungsring / schwimmfähige Leine an Bord"),
      i("Ausreichend Fender"),
      i("Positionslichter funktionieren (für nach Sonnenuntergang)"),
      i("Paddel / Handlenzpumpe an Bord"),
      i("Wasserdichte Handyhülle / UKW-Funkgerät vorhanden?"),
    ]),
    cat("su-son", "Vor dem Auslaufen", "✅", [
      i("Sperr-/Badezonen und Geschwindigkeitslimits erfragt", { critical: true }),
      i("Wetter- und Windvorhersage geprüft; gefragt, bei welchem Wind man umkehren sollte"),
      i("Gefragt, ob das Auflaufenlassen am Strand (Beaching) verboten ist", { tip: "Aufsetzer am Unterwasserschiff sind einer der Hauptgründe für den Verlust der Kaution." }),
      i("Untiefen, Felsen und Fährrouten auf der Karte gezeigt bekommen"),
      i("Notrufnummer gespeichert (Küstenwache 158)"),
      i("Kurze Probefahrt mit einem Vertreter des Vercharterers gemacht"),
    ]),
  ],
};

const jetski: Vessel = {
  id: "jetski",
  name: "Jetski",
  subtitle: "Persönliches Wasserfahrzeug",
  icon: "🌊",
  duration: "10–15 Min.",
  group: "kiralik",
  categories: [
    cat("je-evrak", "Papiere & Übergabe", "📜", [
      i("Vertrag, Kaution und Stundenpreis geklärt", { critical: true }),
      i("Alle Kratzer am Rumpf auf Video aufgenommen", { critical: true, photo: true }),
      i("Betriebsstunden / Tankstand fotografiert", { photo: true }),
      i("Fahrgebiet auf der Karte gezeigt bekommen"),
    ]),
    cat("je-teknik", "Technische Kontrolle", "⚙️", [
      i("Kill-Cord (Sicherheitsleine) ums Handgelenk gelegt und getestet", { critical: true }),
      i("Anlasser greift, Motor läuft sauber im Leerlauf"),
      i("Jetdüse, Ansauggitter und Ride Plate fotografiert", { photo: true, tip: "Stein-/Felsschäden an der Unterseite sind der häufigste Streitpunkt." }),
      i("Lenkung ohne Spiel, dreht beidseitig bis zum Anschlag"),
      i("Beim Loslassen des Gases fällt der Motor von selbst in den Leerlauf", { critical: true }),
      i("Rückwärtsgang / Bremse (iBR-RiDE) funktioniert, falls vorhanden"),
      i("Spiegel intakt (für Zugsportarten evtl. Pflicht)"),
      i("Staufach schließt, Zulassung in wasserdichter Hülle darin"),
    ]),
    cat("je-guvenlik", "Sicherheit", "🛟", [
      i("Rettungsweste passt und ist intakt", { critical: true }),
      i("Pfeife oder Signalmittel an der Weste"),
      i("Regel verstanden: Abstand zu Badezonen halten", { critical: true }),
      i("Aufrichtrichtung nach dem Kentern erfragt (Aufkleber beachten)", { tip: "Drehst du in die falsche Richtung, läuft Wasser in den Motor." }),
      i("Mindestalter-/Führerscheinanforderungen erfüllt"),
    ]),
  ],
};

const kanoSup: Vessel = {
  id: "kanosup",
  name: "Kajak / SUP",
  subtitle: "Muskelbetriebene Wasserfahrzeuge",
  icon: "🛶",
  duration: "5–10 Min.",
  group: "kiralik",
  categories: [
    cat("kn-teslim", "Übergabe", "📜", [
      i("Rumpf auf Risse/Löcher prüfen", { photo: true }),
      i("Beim SUP: Luftdruck ausreichend (Festigkeit prüfen)"),
      i("Paddel intakt, verstellbare Klemmung funktioniert"),
      i("Leash (Sicherungsleine) intakt", { critical: true }),
    ]),
    cat("kn-guvenlik", "Sicherheit", "🛟", [
      i("Rettungsweste erhalten und angezogen", { critical: true }),
      i("Nach Windrichtung und Strömung gefragt (Vorsicht bei ablandigem Wind!)", { critical: true, tip: "Ablandiger Wind treibt dich aufs offene Meer; die Rückkehr wird sehr schwer." }),
      i("Erlaubtes Gebiet und Rückkehrzeit geklärt"),
      i("Handy in wasserdichter Hülle dabei"),
    ]),
  ],
};

// ---------------------------------------------------------------------------
// EIGNER-LISTEN — Routinekontrollen für das eigene Boot
// ---------------------------------------------------------------------------

const sahipYolaCikis: Vessel = {
  id: "sahip-yolacikis",
  name: "Auslauf-Check",
  subtitle: "Vor jedem Törn (Pre-Departure)",
  icon: "🧭",
  duration: "30–45 Min.",
  group: "sahip",
  categories: [
    cat("yc-plan", "Planung & Wetter", "🌤️", [
      i("Wettervorhersage geprüft: Wind, Böen, Wellen, Sicht", { critical: true, tip: "Verlasse dich nicht auf eine Quelle; prüfe mindestens zwei Vorhersagedienste." }),
      i("Nachrichten für Seefahrer / regionale Warnungen geprüft"),
      i("Route geplant: Distanz, Dauer und Treibstoffbedarf berechnet"),
      i("Alternative Schutzhäfen/Buchten festgelegt"),
      i("Törnplan an jemanden an Land gemeldet (Float Plan)", { critical: true, tip: "Jemand sollte wissen, wohin du fährst und wann du zurück bist — und bei Verspätung nachfragen." }),
      i("Reicht das Tageslicht — bei Ankunft wird es noch nicht dunkel"),
      i("Gezeiten-/Strömungsinformationen geprüft (falls erforderlich)"),
    ]),
    cat("yc-evrak", "Papiere", "📜", [
      i("Bootszulassung / Registrierungsdokument an Bord"),
      i("Versicherungspolice gültig und an Bord"),
      i("Führerschein (SBF/ICC) dabei"),
      i("Crew-/Passagierliste vorbereitet (falls erforderlich)"),
      i("Funklizenz an Bord"),
    ]),
    cat("yc-motor", "Motor (WOBBLE-Check)", "⚙️", [
      i("W — Wasser: Kühlwasserstand + Seewasserfilter sauber", { critical: true }),
      i("O — Öl: Motor- und Getriebeölstand mit dem Peilstab geprüft", { critical: true }),
      i("B — Riemen (Belts): Spannung ~1,5 cm Spiel, keine Risse"),
      i("B — Bilge: trocken; Pumpenautomatik funktioniert", { critical: true }),
      i("L — Lecks: keine Öl-/Treibstoff-/Wasserspuren unter dem Motor"),
      i("E — Auspuff (Exhaust): bei laufendem Motor kommt Wasser aus dem Auspuff", { critical: true }),
      i("S — Sound: keine ungewöhnlichen Geräusche/Vibrationen im Leerlauf"),
      i("Treibstoff nach der Drittel-Regel ausreichend (Hinweg + Rückweg + Reserve)", { critical: true }),
      i("Kein Wasser/Sediment im Wasserabscheider (Racor)"),
      i("Ersatz-Impeller, Riemen, Öl und Werkzeugtasche an Bord"),
      i("Seeventil der Motorkühlung ist OFFEN", { critical: true, tip: "Ein Motor mit geschlossenem Seeventil verbrennt den Impeller in wenigen Minuten." }),
    ]),
    cat("yc-elektrik", "Elektrik & Geräte", "🔋", [
      i("Batteriespannungen voll, Hauptschalter in richtiger Stellung"),
      i("UKW eingeschaltet, auf Kanal 16; Funkcheck durchgeführt", { critical: true }),
      i("Plotter an, Route geladen; Backup-Navigation auf dem Handy vorhanden"),
      i("Positionslichter funktionieren (für den Fall einer nächtlichen Rückkehr)"),
      i("Autopilot getestet"),
      i("Handys am Ladegerät, Powerbank voll"),
      i("Landstromkabel ABGEZOGEN", { critical: true, tip: "Ablegen mit angeschlossenem Kabel ist der Klassiker in jeder Marina." }),
    ]),
    cat("yc-guverte", "Deck & Rigg", "⛵", [
      i("Segel klar zum Setzen, Reffleinen eingeschoren"),
      i("Leinen klariert, Fallen schlagen nicht gegen den Mast"),
      i("Anker gesichert und Ankerwinsch-Stromkreis eingeschaltet; Anker klar"),
      i("Luken und Bullaugen geschlossen und verriegelt", { critical: true }),
      i("Keine losen Gegenstände an Deck; alles festgezurrt/verstaut"),
      i("Fender und Festmacherleinen klar zum Ablegen"),
      i("Dinghi angebunden/sicher in den Davits; Motor abgeschlossen"),
    ]),
    cat("yc-emniyet", "Sicherheit", "🛟", [
      i("Rettungswesten für jede Person bereit; Kinder tragen sie", { critical: true }),
      i("Rettungsinsel an ihrem Platz, hydrostatischer Auslöser eingerichtet"),
      i("Signalraketen und Feuerlöscher an ihren Plätzen, Daten gültig", { critical: true }),
      i("Erste-Hilfe-Kasten und Mittel gegen Seekrankheit an Bord"),
      i("EPIRB/PLB an seinem Platz; Position der MOB-Taste bekannt"),
      i("Gasflaschenventil außerhalb der Nutzung GESCHLOSSEN"),
      i("Hebel der manuellen Bilgepumpe an seinem Platz"),
      i("Holzpfropfen hängen neben den Seeventilen"),
    ]),
    cat("yc-brifing", "Crew-Briefing", "🗣️", [
      i("MOB-Prozedur (Mensch über Bord) erklärt", { critical: true }),
      i("Plätze von Rettungswesten und Rettungsinsel gezeigt"),
      i("Erklärt, wie man über UKW einen MAYDAY-Ruf absetzt", { critical: true, tip: "Fällt der Skipper aus, muss jemand aus der Crew Hilfe rufen können." }),
      i("Plätze der Feuerlöscher und Gasabsperrventil gezeigt"),
      i("Vor dem Baum gewarnt; Regeln für das Verlassen des Cockpits erklärt"),
      i("Toilettenbenutzung erklärt (Papier-Regel!)"),
    ]),
    cat("yc-son", "Unmittelbar vor dem Ablegen", "✅", [
      i("Motor 5-10 Min. warmgelaufen, Instrumente normal"),
      i("Ruder dreht beidseitig voll durch"),
      i("Reihenfolge des Leinenlösens geplant, jeder kennt seine Aufgabe"),
      i("Ausfahrtskanal/Regeln der Marina vergegenwärtigt"),
      i("Letzter Wettercheck durchgeführt — auch Umkehren ist Seemannschaft", { tip: "Im Hafen bleiben zu können zeichnet die besten Skipper aus." }),
    ]),
  ],
};

const sahipSezonAcilis: Vessel = {
  id: "sahip-sezon",
  name: "Saisonstart",
  subtitle: "Zurück aufs Boot nach dem Winterlager",
  icon: "🔧",
  duration: "Halber bis ganzer Tag",
  group: "sahip",
  categories: [
    cat("sz-karina", "Unterwasserschiff", "🐚", [
      i("Zustand des Antifoulings geprüft/erneuert"),
      i("Opferanoden geprüft — bei mehr als 50 % Abzehrung ersetzen", { critical: true, tip: "Eine verbrauchte Anode bedeutet, dass Propeller und Welle korrodieren." }),
      i("Propeller, Welle und Lagerspiel geprüft"),
      i("Seeventil-Gitter sauber, Ventile lassen sich öffnen und schließen", { critical: true }),
      i("Ruderlager ohne Spiel"),
      i("Rumpf auf Osmoseblasen / Schlagstellen geprüft", { photo: true }),
      i("Wellendichtung (Stopfbuchse) geprüft; nach dem Kranen: Tropfrate normal?"),
    ]),
    cat("sz-motor", "Motorservice", "⚙️", [
      i("Motoröl und Filter gewechselt"),
      i("Impeller gewechselt (einmal pro Saison)", { critical: true }),
      i("Kraftstofffilter (Motor + Abscheider) gewechselt"),
      i("Frostschutz/Kühlwasser erneuert"),
      i("Keilriemen geprüft/gewechselt"),
      i("Schläuche und Schellen geprüft (Doppelschellen an Unterwasseranschlüssen)"),
      i("Auspuffkrümmer/Wassersammler geprüft"),
      i("Motorlager (Silentblöcke) ohne Risse"),
      i("Getriebeöl geprüft/gewechselt"),
      i("Beim ersten Start kam Wasser aus dem Auspuff, keine Lecks", { critical: true }),
    ]),
    cat("sz-elektrik", "Elektrik", "🔋", [
      i("Batterien geladen, Lasttest gemacht; verbrauchte ersetzt"),
      i("Batterieklemmen gereinigt und mit Polfett versehen"),
      i("Alle Positionslichter und die Decksbeleuchtung getestet"),
      i("Fehlerstrom / Sicherungspanel geprüft"),
      i("UKW, Plotter, Echolot, Windgeräte getestet"),
    ]),
    cat("sz-arma", "Rigg & Segel", "⛵", [
      i("Stehendes Gut per Auge und Hand geprüft (Drahtbruch, gerissene Terminals)", { critical: true }),
      i("Salingsbefestigungen und Mastfuß geprüft"),
      i("Fallen und Leinen auf Verschleiß durchgesehen; Enden neu getakelt"),
      i("Segel aus dem Service geholt / geprüft (Nähte, UV-Schutzstreifen)"),
      i("Winschen geöffnet, gereinigt und geschmiert"),
      i("Blöcke und Schlitten entsalzt, laufen geräuschlos"),
    ]),
    cat("sz-emniyet", "Sicherheitsausrüstung erneuern", "🛟", [
      i("Wartungsdatum der Rettungsinsel geprüft — falls abgelaufen, zum Service", { critical: true }),
      i("Haltbarkeitsdaten der Signalraketen geprüft", { critical: true }),
      i("Feuerlöscher gewogen/gewartet, Manometer im grünen Bereich", { critical: true }),
      i("Gaskartuschen und Auslöser der Automatikwesten geprüft"),
      i("Erste-Hilfe-Kasten aufgefrischt (abgelaufene Medikamente)"),
      i("EPIRB/PLB-Batteriedatum geprüft, Registrierung aktuell"),
      i("Batterien von Gasdetektor und Rauchmelder gewechselt"),
    ]),
    cat("sz-tesisat", "Wasser, Gas & WC", "🚿", [
      i("Frischwassertanks desinfiziert, sauberes Wasser durchs System gespült"),
      i("Wasserschläuche und Schellen geprüft"),
      i("WC gewartet (Jokerventil, Dichtungen); Pumpe läuft leichtgängig"),
      i("Ventile und Schläuche des Fäkalientanks geprüft"),
      i("Herstellungs-/Austauschdatum des Gasschlauchs geprüft", { critical: true, tip: "Gasschläuche haben eine begrenzte Lebensdauer; das Datum steht auf dem Schlauch." }),
      i("Druckwasserpumpe und Boiler in Betrieb genommen, keine Lecks"),
    ]),
    cat("sz-evrak", "Papiere & Versicherung", "📜", [
      i("Versicherungspolice erneuert", { critical: true }),
      i("Registrierung des Bootes verlängert"),
      i("Gültigkeit von Zulassung und Führerschein geprüft"),
      i("Funklizenz aktuell"),
      i("Marinavertrag und Kontaktdaten aktuell"),
    ]),
    cat("sz-icmekan", "Innenraum", "🛏️", [
      i("Auf Schimmel/Feuchtigkeit geprüft, Innenraum gelüftet"),
      i("Polster und Matratzen geprüft und gesonnt"),
      i("Bilgen gereinigt und getrocknet"),
      i("Dichtungen von Luken und Bullaugen geprüft (Leckspuren?)"),
      i("Winterabdeckungen entfernt, Deck gewaschen"),
    ]),
  ],
};

const sahipKapama: Vessel = {
  id: "sahip-kapama",
  name: "Boot verlassen",
  subtitle: "Abschlussroutine nach jedem Törn",
  icon: "🔒",
  duration: "15–20 Min.",
  group: "sahip",
  categories: [
    cat("kp-motor", "Motor & Ventile", "⚙️", [
      i("Seeventil der Motorkühlung geschlossen (je nach eigener Regel)", { tip: "Wenn du es schließt: Zettel 'SEEVENTIL ZU' ans Ruder — sonst vergisst du es beim nächsten Start." }),
      i("Gasflaschenventil geschlossen", { critical: true }),
      i("Seeventile von WC und Waschbecken geschlossen", { critical: true, tip: "Ursache Nummer 1 für sinkende Boote: offen vergessene Seeventile und geplatzte Schläuche." }),
      i("Kraftstoffhahn geschlossen (bei längerer Abwesenheit)"),
    ]),
    cat("kp-elektrik", "Elektrik", "🔋", [
      i("Batteriehauptschalter aus — AUSSER der Bilgenautomatik", { critical: true }),
      i("Landstrom angeschlossen, Ladegerät läuft (falls es angeschlossen bleibt)"),
      i("Kühlschrank geleert, Tür einen Spalt offen gelassen"),
      i("Alle Lichter und Geräte ausgeschaltet"),
    ]),
    cat("kp-guverte", "Deck & Vertäuung", "⚓", [
      i("Festmacherleinen doppelt und mit Scheuerschutz (für den Sturmfall)", { critical: true }),
      i("Fender auf richtiger Höhe und in ausreichender Zahl"),
      i("Segelpersenning/UV-Schutz geschlossen; Genua-Wickelung gesichert"),
      i("Fallen vom Mast weggebunden (verhindert Klappern + Verschleiß)"),
      i("Bimini/Sonnensegel eingeholt oder gesichert"),
      i("Dinghi und Außenborder abgeschlossen"),
      i("Keine Gegenstände an Deck, die wegfliegen könnten"),
    ]),
    cat("kp-icmekan", "Innenraum & Verschluss", "🔒", [
      i("Bilge trocken, automatische Pumpe eingeschaltet", { critical: true }),
      i("Lebensmittel und Müll von Bord gebracht"),
      i("Keine nasse Wäsche/Handtücher zurückgelassen (Schimmelgefahr)"),
      i("Belüftung sichergestellt (Pilzlüfter offen)"),
      i("Luken, Bullaugen und Niedergang abgeschlossen"),
      i("Erreichbare Telefonnummer im Marinabüro hinterlassen"),
      i("Beim Verlassen den letzten Zustand des Bootes fotografiert", { photo: true, tip: "Bei Sturmschäden/Versicherungsfällen ist das dein Beweis für den 'letzten intakten Zustand'." }),
    ]),
  ],
};

export const VESSELS: Vessel[] = [
  yelkenli,
  motoryat,
  katamaran,
  gulet,
  suratTeknesi,
  jetski,
  kanoSup,
  sahipYolaCikis,
  sahipSezonAcilis,
  sahipKapama,
];

export function totalItems(v: Vessel): number {
  return v.categories.reduce((sum, c) => sum + c.items.length, 0);
}

// ---------------------------------------------------------------------------
// FOTO- & KAUTIONS-RATGEBER
// Quellen: Schadens-/Streitfallstatistiken von ASA, RYA und Charteranbietern.
// ---------------------------------------------------------------------------

export const GUIDE: GuideContent = {
  lead:
    "Die meisten Streitigkeiten beim Bootscharter entstehen durch Schäden, die bei der Übernahme nicht dokumentiert wurden. " +
    "Dieser Ratgeber erklärt, was du fotografieren und welche Regeln du beachten solltest, um deine Kaution zu schützen.",
  photoSpots: [
    {
      title: "Außenborder-Propeller (Dinghi + Hauptmotor)",
      why: "Der bei der Rückgabe am häufigsten angelastete Posten. Ein ins Wasser gefallener Dinghi-Motor ist die Nummer 1 der Bareboat-Versicherungsfälle.",
    },
    {
      title: "Bug- und Heckpartien des Rumpfes",
      why: "Anlegekratzer entstehen am häufigsten hier; alte Kratzer sollen dir nicht in Rechnung gestellt werden.",
    },
    {
      title: "Dinghi-Schläuche und -Boden",
      why: "An den Strand gezogene Dinghis werden an der Unterseite zerkratzt; den Zustand vor der Übernahme dokumentieren.",
    },
    {
      title: "Tankanzeige, Wasseranzeige und Betriebsstundenzähler",
      why: "Das einzige Gegenmittel gegen die 'Du hast voll übernommen'-Diskussion ist ein Foto mit Datum.",
    },
    {
      title: "Kiel und Ruder (wenn möglich)",
      why: "Gegen Grundberührungs-Vorwürfe. Gibt es bei der Rückgabe eine Taucherkontrolle, verlange den Taucherbericht der Übernahme.",
    },
    {
      title: "Segel in gesetztem Zustand",
      why: "Vorhandene Risse, UV-Schäden und offene Nähte sollen nicht deinem Törn zugeschrieben werden.",
    },
    {
      title: "Polster, Kissen, Matratzen",
      why: "Flecken und Risse sind ein Standard-Kautionsabzug.",
    },
    {
      title: "Reling, Bugkorb und verbogene Ankerbeschläge",
      why: "Kleine Verbiegungen stammen meist vom Vorcharterer; dokumentieren.",
    },
    {
      title: "Luken und Bullaugenscheiben",
      why: "Gerissenes Acrylglas ist ein klassischer Abzugsposten.",
    },
    {
      title: "Toiletten (in Funktion)",
      why: "Ein verstopftes WC ist ein Standard-Gebührenabzug; halte fest, dass es bei der Übernahme funktionierte.",
    },
    {
      title: "Trampolin-Befestigungen (Katamaran)",
      why: "Sie sind teuer und ein häufiger Streitpunkt.",
    },
    {
      title: "Jetski: Rumpfunterseite, Ansauggitter, Sitzbank",
      why: "Stein-/Felsschäden und Risse in der Sitzbank sind die häufigsten Abzugsgründe.",
    },
  ],
  rules: [
    {
      title: "Mach einen Video-Rundgang",
      body: "Filme das gesamte Boot vor der Übernahme in einem Durchgang; Datum und Uhrzeit müssen sichtbar sein. Empfehlung der ASA: auch das technische Briefing filmen — besonders das Schaltpanel.",
    },
    {
      title: "Erst eintragen, dann unterschreiben",
      body: "Unterschreibe nicht, bevor jeder Bruch, jedes fehlende Teil und jeder Kratzer im Check-in-Protokoll steht. Nach der Unterschrift liegt alles in deiner Verantwortung.",
    },
    {
      title: "Zähl das Inventar selbst",
      body: "Sag nicht einfach 'passt' zur Liste; zähle Fender, Winschkurbeln, Besteck und alles andere einzeln. Jeder fehlende Posten wird von der Kaution abgezogen.",
    },
    {
      title: "Gepäck erst später an Bord",
      body: "Regel der großen Anbieter: Bring die Koffer erst aufs Boot, wenn die Inventarkontrolle abgeschlossen ist — du musst in die Schränke sehen können.",
    },
    {
      title: "Fotografiere die Ablaufdaten",
      body: "Fotografiere das Service-Etikett der Rettungsinsel sowie die Daten von Signalraketen und Feuerlöschern. Fahr nicht mit abgelaufener Ausrüstung hinaus.",
    },
    {
      title: "Treibstoffregelung schriftlich festhalten",
      body: "Die Standardregel lautet 'voll übernehmen, voll zurückgeben'. Fotografiere die Anzeige und erfrage die nächste Tankstelle samt Öffnungszeiten.",
    },
    {
      title: "Vorsicht bei Kautionsversicherungs-Extras",
      body: "Kautionsversicherungen decken meist weder Dinghi, Außenborder, Grundberührung noch Propeller ab — also gerade die riskantesten Posten. Lies den Deckungsumfang unbedingt.",
    },
  ],
  footer: "Im Notfall: Küstenwache 158 (Türkei) · UKW-Kanal 16",
};
