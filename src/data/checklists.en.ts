import { Category, ChecklistItem, GuideContent, Vessel } from "./types";

// ---------------------------------------------------------------------------
// Item factory: for concise notation. ids are assigned when the category is built.
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
// Shared category blocks (for larger vessels)
// ---------------------------------------------------------------------------

const evrak = (id: string): Category =>
  cat(id, "Paperwork & Contract", "📜", [
    i("Read the charter contract line by line before signing", { critical: true }),
    i("Deposit amount, refund terms and insurance excess (deductible) are clear"),
    i("Vessel registration / flag documents are on board"),
    i("Insurance policy and coverage sighted (third party + hull)", { critical: true }),
    i("Skipper's licence / ICC accepted and recorded"),
    i("Inventory list counted item by item and signed", { photo: true, tip: "Anything found missing at check-out gets deducted from your deposit." }),
    i("Existing damage written on the check-in form and photographed", { critical: true, photo: true }),
    i("Fuel and water policy is clear (take full / return full?)"),
    i("Emergency phone numbers saved (operator, marina, coast guard 158)"),
    i("Return time, location and late-return penalty are clear"),
  ]);

const govde = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Hull & Exterior", "🛥️", [
    i("Walk the entire hull: photograph scratches, cracks, gelcoat damage", { critical: true, photo: true, tip: "Hull scratches are the number one source of disputes. A video walk-around is the safest proof." }),
    i("Check bow and stern for impact marks", { photo: true }),
    i("Lifelines taut and unbroken; pulpit and pushpit solid"),
    i("Check the non-skid deck surface and teak for damage", { photo: true }),
    i("Cleats and padeyes are secure"),
    i("Hatches and portlights open and close, no cracked glass", { photo: true, tip: "A cracked portlight is a classic deposit deduction." }),
    i("Navigation lights working (green/red/stern/steaming)", { critical: true }),
    i("Steering play checked, wheel turns freely"),
    i("Boarding ladder / platform mechanism works"),
    ...extra,
  ]);

const motorBlok = (id: string, opts?: { cift?: boolean }): Category =>
  cat(id, "Engine & Machinery", "⚙️", [
    i(`Photograph the engine hours and have them written on the form${opts?.cift ? " (both engines)" : ""}`, { photo: true }),
    i("Oil level checked with the dipstick", { critical: true }),
    i("Coolant / antifreeze level checked"),
    i("Belts taut, no cracks"),
    i("Raw water strainer clean, lid not leaking"),
    i("Engine started: check that water is coming out of the exhaust", { critical: true, tip: "No water means the impeller may be shot; the engine overheats quickly." }),
    i("No abnormal noise/vibration at idle or under throttle"),
    i("Fuel gauge photographed", { photo: true }),
    i("No traces of fuel/oil leaks under the engine cover"),
    i("Bilge dry; automatic and manual bilge pumps tested", { critical: true }),
    i("Gearbox shifts smoothly forward/reverse/neutral"),
    i("Instrument panel free of alarms (oil pressure, temperature, charge)"),
    i("Location of spares and tool kit learned (impeller, belt, fuses)"),
    i("Cruising RPM, hourly consumption and tank capacity noted", { tip: "For range: tank (L) ÷ consumption (L/h) × speed." }),
  ]);

// The most disputed section: the tender (dinghy) and its outboard.
// The number one bareboat insurance claim is loss of the dinghy/outboard and propeller damage.
const tender = (id: string): Category =>
  cat(id, "Tender & Outboard", "🚣", [
    i("Dinghy inflated and sound; tubes and floor photographed", { photo: true }),
    i("Outboard started, cooling water spraying out", { critical: true }),
    i("Outboard propeller photographed close-up", { critical: true, photo: true, tip: "Propeller damage is the item you're most often blamed for at check-out." }),
    i("Kill cord present in the dinghy and working", { critical: true }),
    i("Oars, pump, painter line and locking cable in the dinghy"),
    i("Outboard locked to the dinghy, safety lanyard attached", { tip: "An outboard dropped overboard is the most common bareboat insurance claim." }),
    i("Dinghy davits / lifting system demonstrated"),
  ]);

const elektrik = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Electrics & Navigation", "🧭", [
    i("Battery voltages checked (house + engine battery separate?)"),
    i("Batteries charging while engine runs (voltage rising)"),
    i("GPS / chartplotter powers up, up-to-date charts loaded", { critical: true }),
    i("Depth sounder working and reading a sensible value", { critical: true, tip: "Always ask whether it measures from the keel or the waterline." }),
    i("VHF radio check done (monitor Channel 16 + radio check)", { critical: true, tip: "In an emergency the VHF is your only reliable means of communication." }),
    i("Autopilot engages and holds a course"),
    i("Interior lighting and reading lamps working"),
    i("12V / USB outlets and inverter (220V), if fitted, working"),
    i("Shore power cable and battery charger on board"),
    i("Horn / fog signal working"),
    ...extra,
  ]);

const yelkenArma = (id: string): Category =>
  cat(id, "Sails & Rigging", "⛵", [
    i("Mainsail hoisted and dropped: no tears, blown stitching or UV damage", { photo: true }),
    i("Genoa/jib furling system turns freely", { tip: "A sticky furler turns dousing sail at sea into a nightmare." }),
    i("Halyards (main, genoa, spinnaker) sound and running in their sheaves"),
    i("Sheets and lines not chafed, ends in good shape"),
    i("Winches turn, pawls hold; winch handles counted (at least 2)"),
    i("Reefing system demonstrated and working", { critical: true, tip: "Not being able to reef in heavy weather is one of the biggest risks." }),
    i("Shrouds and stays taut; turnbuckles pinned and secured"),
    i("Boom, vang and padeyes solid; boom play normal"),
    i("Rope clutches (jammers) hold, labels legible"),
    i("Lazy-jack / lazy-bag zipper and stitching sound"),
  ]);

const guvenlik = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Safety Equipment", "🛟", [
    i("A life jacket for every person (child sizes for children)", { critical: true }),
    i("Life raft in place, certificate/service date valid", { critical: true, photo: true, tip: "An out-of-date life raft may not inflate at sea. Photograph the label." }),
    i("Lifebuoy + lighted buoy reachable from the cockpit", { critical: true }),
    i("Flares complete and within expiry date", { critical: true, photo: true }),
    i("Fire extinguishers: count, pressure gauge in the green, dates valid", { critical: true, photo: true }),
    i("Fire blanket in the galley"),
    i("First aid kit complete and up to date"),
    i("EPIRB / PLB, if fitted, checked with the test button"),
    i("Flashlight + spare batteries"),
    i("Safety harnesses and jacklines"),
    i("Emergency tiller location shown, fitted and tried", { critical: true }),
    i("Seacock locations and softwood plugs shown", { critical: true }),
    i("Gas detector / alarm working"),
    ...extra,
  ]);

const demirPalamar = (id: string): Category =>
  cat(id, "Anchor & Dock Lines", "⚓", [
    i("Main anchor and chain length learned (how many metres?)", { tip: "Anchoring requires scope of at least 3-5 times the depth." }),
    i("Windlass lowers and raises; remote control working", { critical: true }),
    i("Chain attachment and chain stopper checked"),
    i("Spare anchor and rode on board"),
    i("Fenders counted and in good condition (at least 6)", { photo: true }),
    i("Enough dock lines (4-6, not chafed)"),
    i("Long shore line (~50 m) on board for stern-to mooring", { tip: "Essential for mooring stern-to in Mediterranean coves." }),
    i("Boat hook on board"),
  ]);

const suTesisat = (id: string): Category =>
  cat(id, "Water & Plumbing", "🚿", [
    i("Fresh water tanks full; capacity learned", { photo: true }),
    i("Pressure pump working, steady water from the taps"),
    i("Hot water (calorifier) heats from the engine/shore power"),
    i("Toilets (heads) pump/vacuum tested", { critical: true, tip: "A blocked head ruins the holiday; test every cabin one by one." }),
    i("Waste (black water) tank empty; discharge valve shown"),
    i("Showers and shower drain pumps working"),
    i("Deck shower working"),
    i("Any signs of water leaks: locker bottoms and around tanks are dry"),
  ]);

const mutfakYasam = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Galley & Living Area", "🍳", [
    i("Stove/oven lit; gas bottle level and spare bottle checked", { critical: true }),
    i("Gas valve location shown; hose and clamps sound", { critical: true }),
    i("Fridge cooling (have it switched on early and wait before check-in)"),
    i("Pots, plates and cutlery match the inventory"),
    i("Bed linen, sheets and towels received for every person"),
    i("Cabins, upholstery, cushions: photograph stains/tears", { photo: true }),
    i("Door and locker latches and hinges working"),
    i("Bimini and sprayhood sound, zippers working", { photo: true }),
    i("Cockpit table and cushions complete"),
    i("Mosquito screens and door/hatch seals sound"),
    ...extra,
  ]);

const sonKontrol = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Final Steps Before Departure", "✅", [
    i("Record a video walk-through of the whole boat (with the date visible)", { critical: true, photo: true }),
    i("Fuel, water levels and engine hours written on the form", { photo: true }),
    i("Film the technical briefing on your phone (especially the electrical panel)", { tip: "ASA's number one tip: record the briefing — remembering it later is impossible." }),
    i("Briefing received: marina exit, restricted areas, weather"),
    i("Learned who to call and the process in case of a breakdown"),
    i("Asked for anchorage and route recommendations"),
    i("Check-out procedure is clear (is there a diver inspection?)"),
    i("You kept a copy of the check-in form", { critical: true }),
    ...extra,
  ]);

// ---------------------------------------------------------------------------
// VESSEL TYPES
// ---------------------------------------------------------------------------

const yelkenli: Vessel = {
  id: "yelkenli",
  name: "Sailing Yacht",
  subtitle: "Bareboat sailing charter",
  icon: "⛵",
  duration: "60–90 min",
  group: "kiralik",
  categories: [
    evrak("ye-evrak"),
    govde("ye-govde"),
    motorBlok("ye-motor"),
    elektrik("ye-elektrik", [i("Wind instrument (anemometer) working")]),
    yelkenArma("ye-yelken"),
    guvenlik("ye-guvenlik", [i("Radar reflector hoisted on the mast")]),
    demirPalamar("ye-demir"),
    tender("ye-tender"),
    suTesisat("ye-su"),
    mutfakYasam("ye-mutfak"),
    sonKontrol("ye-son"),
  ],
};

const motoryat: Vessel = {
  id: "motoryat",
  name: "Motor Yacht",
  subtitle: "Motor yacht / flybridge",
  icon: "🛥️",
  duration: "45–75 min",
  group: "kiralik",
  categories: [
    evrak("mo-evrak"),
    govde("mo-govde", [
      i("Flybridge ladder and rails solid"),
      i("Trim tabs working"),
      i("Hydraulic platform / passerelle working"),
    ]),
    motorBlok("mo-motor", { cift: true }),
    cat("mo-jenerator", "Generator & Comfort", "🔌", [
      i("Generator started, tested under load (with A/C + calorifier on)"),
      i("Air conditioning cools/heats in every cabin"),
      i("Bow/stern thruster tested", { critical: true }),
      i("Fuel/water separator (Racor) bowl clean, location learned"),
      i("Windscreen wipers and washer working"),
      i("Searchlight, if fitted, working"),
      i("Watermaker, if fitted, operation learned"),
    ]),
    elektrik("mo-elektrik", [i("Radar powers up and shows a picture")]),
    guvenlik("mo-guvenlik", [
      i("Engine room automatic fire suppression gauge in the green", { critical: true }),
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
  name: "Catamaran",
  subtitle: "Twin-hull sailing yacht",
  icon: "⛵",
  duration: "75–100 min",
  group: "kiralik",
  categories: [
    evrak("ka-evrak"),
    govde("ka-govde", [
      i("Walk each hull separately, photograph all four 'corners'", { photo: true, tip: "Catamarans pick up dock damage on the corners more than anywhere else." }),
      i("Trampoline netting and lashings sound, photographed", { critical: true, photo: true }),
      i("Check the bridgedeck underside for impact/slamming marks"),
      i("Hull escape hatches open and do not leak", { critical: true }),
    ]),
    motorBlok("ka-motor", { cift: true }),
    elektrik("ka-elektrik", [
      i("Battery banks in both hulls checked"),
      i("Solar panels are charging"),
    ]),
    yelkenArma("ka-yelken"),
    guvenlik("ka-guvenlik", [
      i("Bilge pumps in both hulls tested separately", { critical: true }),
      i("Asked where the life raft is stowed (under the trampoline or aft?)", { critical: true }),
    ]),
    demirPalamar("ka-demir"),
    cat("ka-bridle", "Catamaran Specific", "🪢", [
      i("Anchor bridle on board and its use demonstrated", { critical: true, tip: "Lying at anchor without a bridle on a catamaran damages the chain." }),
      i("Dinghy davits raise/lower demonstrated"),
      i("Electric winch operation and its manual backup learned"),
      i("Briefing received on twin-engine manoeuvring without the helm"),
      i("Reefing briefing received: a catamaran doesn't heel, rig loads increase", { critical: true, tip: "Because a catamaran doesn't heel, overload is hard to notice; reef early." }),
    ]),
    tender("ka-tender"),
    suTesisat("ka-su"),
    mutfakYasam("ka-mutfak"),
    sonKontrol("ka-son", [i("Asked about marina/passage height and beam restrictions (wide boat!)")]),
  ],
};

const gulet: Vessel = {
  id: "gulet",
  name: "Gulet",
  subtitle: "Crewed blue cruise",
  icon: "⚓",
  duration: "30–45 min",
  group: "kiralik",
  categories: [
    cat("gu-evrak", "Contract & Scope", "📜", [
      i("Route, number of nights and ports are written into the contract", { critical: true }),
      i("Meal plan (full board / half board) and drinks policy are clear"),
      i("Crew size and their duties learned"),
      i("Who pays fuel, port fees and transit log — clarified"),
      i("APA / extras advance terms understood"),
      i("Crew tipping custom learned (usually 5-10%)"),
      i("Insurance and passenger capacity certificate sighted", { critical: true }),
    ]),
    cat("gu-kamara", "Cabins & Comfort", "🛏️", [
      i("Cabins toured: beds, air conditioning and bathrooms working"),
      i("A/C and generator running hours received in writing", { tip: "Many gulets run the A/C only a few hours a day; don't rely on verbal promises." }),
      i("Water toys promised in the contract are actually on board", { photo: true }),
      i("Bed linen and towels clean, enough per person"),
      i("Hot water runs in every bathroom"),
      i("Sunbathing cushions and awnings complete", { photo: true }),
      i("Generator hours learned (does it run at night?)"),
    ]),
    cat("gu-guvenlik", "Safety", "🛟", [
      i("Life jackets shown (including child sizes)", { critical: true }),
      i("Life raft and muster point briefing received", { critical: true }),
      i("Fire extinguishers and escape routes shown", { critical: true }),
      i("First aid kit and the nearest medical facility learned"),
      i("Rules for going ashore by tender learned"),
    ]),
    cat("gu-son", "Before Setting Off", "✅", [
      i("Common areas photographed (existing damage)", { photo: true }),
      i("Route and weather discussed with the captain"),
      i("Water toys (SUP, snorkels) inventory taken"),
      i("Communication: phone/wifi on board, emergency numbers saved"),
    ]),
  ],
};

const suratTeknesi: Vessel = {
  id: "surat",
  name: "Speedboat",
  subtitle: "Day motorboat",
  icon: "🚤",
  duration: "15–25 min",
  group: "kiralik",
  categories: [
    cat("su-evrak", "Paperwork & Handover", "📜", [
      i("Contract and deposit terms read", { critical: true }),
      i("Licence requirement met (national licence/ICC)"),
      i("Existing scratches and damage photographed", { critical: true, photo: true }),
      i("Fuel policy clear (hourly or per tank?)"),
      i("Return time and area limits learned"),
    ]),
    cat("su-govde", "Hull & Engine", "⚙️", [
      i("Hull and bottom scratches photographed", { photo: true }),
      i("Propeller checked for damage (bent blades?)", { critical: true, photo: true }),
      i("Engine cold-started, spraying water (telltale)", { critical: true }),
      i("Kill switch lanyard attached and working", { critical: true, tip: "If you fall overboard, this is the only thing that stops the engine." }),
      i("Trim/tilt working"),
      i("Fuel level photographed", { photo: true }),
      i("Automatic bilge pump working, interior dry"),
      i("Stern drain plug is IN", { critical: true, tip: "If it's out, the boat takes on water slowly — a classic and dangerous oversight." }),
      i("Steering and throttle work without play"),
      i("Tears/stains on upholstery and cushions photographed", { photo: true }),
    ]),
    cat("su-guvenlik", "Safety", "🛟", [
      i("A life jacket per person (including child sizes)", { critical: true }),
      i("Fire extinguisher pressurised and in date", { critical: true }),
      i("Anchor + rode on board and secured to the boat"),
      i("Throwable lifebuoy / floating line on board"),
      i("Enough fenders"),
      i("Navigation lights working (for after sunset)"),
      i("Paddle / manual pump on board"),
      i("Waterproof phone case / VHF available"),
    ]),
    cat("su-son", "Before Departure", "✅", [
      i("Restricted/swimmer zones and speed limits learned", { critical: true }),
      i("Weather and wind forecast checked; asked in which wind to head back"),
      i("Asked whether beaching is prohibited", { tip: "Scraping the bottom is one of the top reasons deposits get kept." }),
      i("Shallows, rocks and ferry routes shown on the chart"),
      i("Emergency number saved (Coast Guard 158)"),
      i("Short test run done with the operator's representative"),
    ]),
  ],
};

const jetski: Vessel = {
  id: "jetski",
  name: "Jet Ski",
  subtitle: "Personal watercraft",
  icon: "🌊",
  duration: "10–15 min",
  group: "kiralik",
  categories: [
    cat("je-evrak", "Paperwork & Handover", "📜", [
      i("Contract, deposit and hourly rate clear", { critical: true }),
      i("All hull scratches recorded on video", { critical: true, photo: true }),
      i("Engine hours / fuel level photographed", { photo: true }),
      i("Riding area shown on a map"),
    ]),
    cat("je-teknik", "Technical Check", "⚙️", [
      i("Kill cord (safety lanyard) attached to the wrist, tested", { critical: true }),
      i("Starter engages, engine idles smoothly"),
      i("Jet nozzle, intake grate and ride plate photographed", { photo: true, tip: "Rock/stone damage underneath is the most common dispute." }),
      i("Steering has no play, turns fully to both sides"),
      i("Returns to idle on its own when throttle is released", { critical: true }),
      i("Reverse / brake (iBR-RiDE), if fitted, working"),
      i("Mirrors intact (may be mandatory for tow sports)"),
      i("Glovebox closes, registration inside in a waterproof pouch"),
    ]),
    cat("je-guvenlik", "Safety", "🛟", [
      i("Life jacket fits well and is in good condition", { critical: true }),
      i("Whistle or signalling device on the jacket"),
      i("Rule about keeping clear of swimming areas understood", { critical: true }),
      i("Righting direction after a capsize learned (check the sticker)", { tip: "Rolling it the wrong way lets water into the engine." }),
      i("Minimum age/licence requirements met"),
    ]),
  ],
};

const kanoSup: Vessel = {
  id: "kanosup",
  name: "Kayak / SUP",
  subtitle: "Paddle craft",
  icon: "🛶",
  duration: "5–10 min",
  group: "kiralik",
  categories: [
    cat("kn-teslim", "Handover", "📜", [
      i("Check the hull for cracks/holes", { photo: true }),
      i("If a SUP, air pressure is sufficient (check the stiffness)"),
      i("Paddle sound, adjustable lock working"),
      i("Leash in good condition", { critical: true }),
    ]),
    cat("kn-guvenlik", "Safety", "🛟", [
      i("Life jacket received and worn", { critical: true }),
      i("Asked about wind direction and current (beware of offshore wind!)", { critical: true, tip: "An offshore wind pushes you out to sea; getting back becomes very hard." }),
      i("Permitted area and return time are clear"),
      i("Phone with you in a waterproof pouch"),
    ]),
  ],
};

// ---------------------------------------------------------------------------
// BOAT OWNER LISTS — routine checks for your own boat
// ---------------------------------------------------------------------------

const sahipYolaCikis: Vessel = {
  id: "sahip-yolacikis",
  name: "Pre-Departure Check",
  subtitle: "Before every passage (pre-departure)",
  icon: "🧭",
  duration: "30–45 min",
  group: "sahip",
  categories: [
    cat("yc-plan", "Plan & Weather", "🌤️", [
      i("Forecast checked: wind, gusts, sea state, visibility", { critical: true, tip: "Don't trust a single source; check at least two forecasts." }),
      i("Notices to mariners / local warnings checked"),
      i("Route planned: distance, time and fuel requirement calculated"),
      i("Alternative ports/anchorages of refuge identified"),
      i("Float plan filed with someone ashore", { critical: true, tip: "Someone should know where you're going and when you're due back — and raise the alarm if you're late." }),
      i("Enough daylight — it won't be dark on arrival"),
      i("Tide/current information checked (where relevant)"),
    ]),
    cat("yc-evrak", "Paperwork", "📜", [
      i("Vessel registration / flag documents on board"),
      i("Insurance policy valid and on board"),
      i("Licence (national licence/ICC) with you"),
      i("Crew/passenger list ready (where required)"),
      i("Radio licence on board"),
    ]),
    cat("yc-motor", "Engine (WOBBLE Check)", "⚙️", [
      i("W — Water: coolant level + raw water strainer clean", { critical: true }),
      i("O — Oil: engine and gearbox oil levels checked with the dipstick", { critical: true }),
      i("B — Belts: tension ~1.5 cm of deflection, no cracks"),
      i("B — Bilge: dry; automatic pump switch working", { critical: true }),
      i("L — Leaks: no oil/fuel/water traces under the engine"),
      i("E — Exhaust: water flows from the exhaust when the engine runs", { critical: true }),
      i("S — Sound: no abnormal noise/vibration at idle"),
      i("Fuel sufficient by the rule of thirds (out + back + reserve)", { critical: true }),
      i("No water/sediment in the fuel/water separator (Racor) bowl"),
      i("Spare impeller, belt, oil and tool kit on board"),
      i("Engine cooling seacock is OPEN", { critical: true, tip: "Running the engine with a closed seacock burns the impeller within minutes." }),
    ]),
    cat("yc-elektrik", "Electrics & Instruments", "🔋", [
      i("Battery voltages full, switches in the correct positions"),
      i("VHF on, monitoring Channel 16; radio check done", { critical: true }),
      i("Plotter on, route loaded; backup navigation on the phone"),
      i("Navigation lights working (in case you return after dark)"),
      i("Autopilot tested"),
      i("Phones charging, power bank full"),
      i("Shore power cable DISCONNECTED", { critical: true, tip: "Motoring off with the cable still attached is a classic mishap in every marina." }),
    ]),
    cat("yc-guverte", "Deck & Rig", "⛵", [
      i("Sails ready to hoist, reefing gear rigged"),
      i("Lines flaked and clear, halyards not slapping the mast"),
      i("Anchor secured and windlass breaker on; anchor ready"),
      i("Hatches and portlights closed and dogged", { critical: true }),
      i("No loose gear on deck; everything lashed/stowed"),
      i("Fenders and dock lines arranged ready for departure"),
      i("Tender secured/safe on the davits; its outboard locked"),
    ]),
    cat("yc-emniyet", "Safety", "🛟", [
      i("Life jackets ready for everyone; children wearing theirs", { critical: true }),
      i("Life raft in place, hydrostatic release armed"),
      i("Flares and extinguishers in place, in date", { critical: true }),
      i("First aid kit and seasickness medication on board"),
      i("EPIRB/PLB in place; MOB button location known"),
      i("Gas bottle valve CLOSED when not in use"),
      i("Manual bilge pump handle in place"),
      i("Softwood plugs hung next to the seacocks"),
    ]),
    cat("yc-brifing", "Crew Briefing", "🗣️", [
      i("MOB (man overboard) procedure explained", { critical: true }),
      i("Life jacket and life raft locations shown"),
      i("How to make a MAYDAY call on VHF explained", { critical: true, tip: "If the skipper is incapacitated, someone in the crew must be able to call for help." }),
      i("Fire extinguisher locations and gas valve shown"),
      i("Boom-strike warning given; rules for leaving the cockpit"),
      i("Toilet use explained (the paper rule!)"),
    ]),
    cat("yc-son", "Just Before Casting Off", "✅", [
      i("Engine warmed up 5-10 min, gauges normal"),
      i("Rudder turns fully to both sides"),
      i("Line-slipping order planned, everyone knows their job"),
      i("Marina exit channel/rules recalled"),
      i("Final weather check done — calling it off is seamanship too", { tip: "Knowing when to stay in port is the mark of the best skippers." }),
    ]),
  ],
};

const sahipSezonAcilis: Vessel = {
  id: "sahip-sezon",
  name: "Season Commissioning",
  subtitle: "Back to the boat after winter lay-up",
  icon: "🔧",
  duration: "Half to full day",
  group: "sahip",
  categories: [
    cat("sz-karina", "Bottom & Underwater Gear", "🐚", [
      i("Antifouling condition checked/renewed"),
      i("Anodes checked — replace if more than 50% wasted", { critical: true, tip: "A spent anode means the propeller and shaft corrode instead." }),
      i("Propeller, shaft and bearing play checked"),
      i("Seacock strainers clean, valves open and close", { critical: true }),
      i("Rudder bearings free of play"),
      i("Hull checked for osmosis blisters / impact marks", { photo: true }),
      i("Shaft seal (stuffing box) checked; drip rate normal after launch"),
    ]),
    cat("sz-motor", "Engine Service", "⚙️", [
      i("Engine oil and filter changed"),
      i("Impeller replaced (once per season)", { critical: true }),
      i("Fuel filters (engine + separator) changed"),
      i("Antifreeze/coolant renewed"),
      i("Belts checked/replaced"),
      i("Hoses and clamps checked (double clamps on underwater connections)"),
      i("Exhaust elbow/water lock checked"),
      i("Engine mounts free of cracks"),
      i("Gearbox oil checked/changed"),
      i("On first start the engine pumped water from the exhaust, no leaks", { critical: true }),
    ]),
    cat("sz-elektrik", "Electrics", "🔋", [
      i("Batteries charged and load-tested; replace any at end of life"),
      i("Battery terminals cleaned and greased"),
      i("All navigation lights and deck lighting tested"),
      i("Residual current / breaker panel checked"),
      i("VHF, plotter, depth and wind instruments tested"),
    ]),
    cat("sz-arma", "Rig & Sails", "⛵", [
      i("Standing rigging inspected by eye and hand (broken strands, cracked terminals)", { critical: true }),
      i("Spreader fittings and mast step checked"),
      i("Halyards and lines gone over for chafe; ends whipped"),
      i("Sails back from the loft / inspected (stitching, UV strip)"),
      i("Winches opened, cleaned and greased"),
      i("Blocks and travellers rinsed of salt, running quietly"),
    ]),
    cat("sz-emniyet", "Safety Renewal", "🛟", [
      i("Life raft service date checked — send for service if overdue", { critical: true }),
      i("Flare expiry dates checked", { critical: true }),
      i("Fire extinguishers weighed/serviced, gauges in the green", { critical: true }),
      i("Inflatable life jacket gas cartridges and firing mechanisms checked"),
      i("First aid kit restocked (expired medication)"),
      i("EPIRB/PLB battery date checked, registration up to date"),
      i("Gas detector and smoke alarm batteries replaced"),
    ]),
    cat("sz-tesisat", "Water, Gas & Heads", "🚿", [
      i("Fresh water tanks disinfected, clean water flushed through the system"),
      i("Water hoses and clamps checked"),
      i("Heads serviced (joker valve, seals); pump works freely"),
      i("Waste tank valves and hoses checked"),
      i("Gas hose manufacture/replacement date checked", { critical: true, tip: "Gas hoses have a limited life; the date is printed on the hose." }),
      i("Pressure pump and calorifier run, no leaks"),
    ]),
    cat("sz-evrak", "Paperwork & Insurance", "📜", [
      i("Insurance policy renewed", { critical: true }),
      i("Registration endorsement completed"),
      i("Registration and licence validity checked"),
      i("Radio licence up to date"),
      i("Marina contract and contact details up to date"),
    ]),
    cat("sz-icmekan", "Interior", "🛏️", [
      i("Checked for mould/damp, interior aired out"),
      i("Upholstery and mattresses checked and sunned"),
      i("Bilges cleaned and dried"),
      i("Hatch and portlight seals checked (any leak marks?)"),
      i("Winter covers removed, deck washed"),
    ]),
  ],
};

const sahipKapama: Vessel = {
  id: "sahip-kapama",
  name: "Leaving the Boat",
  subtitle: "Shut-down routine after every trip",
  icon: "🔒",
  duration: "15–20 min",
  group: "sahip",
  categories: [
    cat("kp-motor", "Engine & Valves", "⚙️", [
      i("Engine cooling seacock closed (per your policy)", { tip: "If you close it, leave a 'SEACOCK CLOSED' note at the helm — so you don't forget on the next start." }),
      i("Gas bottle valve closed", { critical: true }),
      i("Heads and sink seacocks closed", { critical: true, tip: "The number one reason boats sink: a seacock left open and a burst hose." }),
      i("Fuel valve closed (for longer absences)"),
    ]),
    cat("kp-elektrik", "Electrics", "🔋", [
      i("Battery switches off — EXCEPT the automatic bilge pump", { critical: true }),
      i("Shore power connected, charger working (if staying plugged in)"),
      i("Fridge emptied, door left ajar"),
      i("All lights and devices switched off"),
    ]),
    cat("kp-guverte", "Deck & Mooring", "⚓", [
      i("Dock lines doubled up and chafe-protected (in case of a storm)", { critical: true }),
      i("Fenders at the right height, enough of them"),
      i("Sail cover/UV protection closed; genoa furl secured"),
      i("Halyards led away from the mast (prevents rattling + chafe)"),
      i("Bimini/awning folded or secured"),
      i("Tender and outboard locked"),
      i("Nothing left on deck that could blow away"),
    ]),
    cat("kp-icmekan", "Interior & Lock-Up", "🔒", [
      i("Bilge dry, automatic pump armed", { critical: true }),
      i("Food and rubbish taken off the boat"),
      i("No wet laundry/towels left behind (they cause mould)"),
      i("Ventilation provided (mushroom vents open)"),
      i("Hatches, portlights and companionway locked"),
      i("A reachable phone number left with the marina office"),
      i("Photographed the boat's final condition on leaving", { photo: true, tip: "In case of storm damage/insurance, it's your proof of its 'last known good' state." }),
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
// PHOTO & DEPOSIT GUIDE
// Sources: ASA, RYA and charter operators' damage/dispute statistics.
// ---------------------------------------------------------------------------

export const GUIDE: GuideContent = {
  lead:
    "Most boat charter disputes come from damage that wasn't documented at check-in. " +
    "This guide tells you what to photograph and which rules to follow to protect your deposit.",
  photoSpots: [
    {
      title: "Outboard propeller (tender + main engine)",
      why: "The item you're most often blamed for at check-out. A tender outboard dropped overboard is the number one bareboat insurance claim.",
    },
    {
      title: "Bow and stern quarters of the hull",
      why: "Docking scratches happen here most; don't get billed for old ones.",
    },
    {
      title: "Dinghy tubes and floor",
      why: "Dinghies dragged up beaches get scratched underneath; document the condition before check-in.",
    },
    {
      title: "Fuel gauge, water gauge and engine hours",
      why: "A dated photo is the only antidote to the 'you took it full' argument.",
    },
    {
      title: "Keel and rudder (if possible)",
      why: "Against grounding accusations. If check-out includes a diver inspection, ask for the departure diver report.",
    },
    {
      title: "Sails, hoisted",
      why: "Don't let existing tears, UV damage and blown stitching get blamed on your trip.",
    },
    {
      title: "Upholstery, cushions, mattresses",
      why: "Stains and tears are a standard deposit deduction.",
    },
    {
      title: "Lifelines, pulpit and bent metalwork",
      why: "Small bends are usually left by the previous charterer; document them.",
    },
    {
      title: "Hatches and portlight glass",
      why: "Cracked acrylic is a classic deduction item.",
    },
    {
      title: "Toilets (while working)",
      why: "A blocked head is a standard fee deduction; record that it worked when you took over.",
    },
    {
      title: "Trampoline lashings (catamaran)",
      why: "They're expensive and a frequent source of disputes.",
    },
    {
      title: "Jet ski: hull bottom, intake grate, seat",
      why: "Rock/stone damage and torn seats are the most common deduction reasons.",
    },
  ],
  rules: [
    {
      title: "Do a video walk-through",
      body: "Before taking over, film the whole boat in one take with the date and time visible. ASA's advice: film the technical briefing too — especially the electrical panel.",
    },
    {
      title: "Get it written down before you sign",
      body: "Don't sign until every breakage, missing item and scratch is written on the check-in form. After you sign, everything is your responsibility.",
    },
    {
      title: "Count the inventory yourself",
      body: "Don't just say 'fine' to the list; count everything one by one, including fenders, winch handles and cutlery. Every item found missing is deducted from your deposit.",
    },
    {
      title: "Load your bags later",
      body: "The big operators' rule: don't bring luggage aboard until the inventory check is done — you need to see inside the lockers.",
    },
    {
      title: "Photograph the expiry dates",
      body: "Photograph the life raft service label, flares and fire extinguisher dates. Don't go to sea with out-of-date equipment.",
    },
    {
      title: "Get the fuel policy in writing",
      body: "The standard rule is 'take full, return full'. Photograph the gauge and find out the nearest fuel dock and its opening hours.",
    },
    {
      title: "Watch out for damage waiver exclusions",
      body: "Deposit insurance usually excludes the dinghy, outboard, grounding and the propeller — i.e. the riskiest items. Always read the coverage.",
    },
  ],
  footer: "In an emergency: Coast Guard 158 (Türkiye) · VHF Channel 16",
};
