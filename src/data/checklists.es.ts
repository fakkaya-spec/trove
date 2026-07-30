import { Category, ChecklistItem, GuideContent, Vessel } from "./types";

// ---------------------------------------------------------------------------
// Fábrica de ítems: para una escritura concisa. Los ids se asignan al construir la categoría.
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
// Bloques de categorías comunes (para embarcaciones grandes)
// ---------------------------------------------------------------------------

const evrak = (id: string): Category =>
  cat(id, "Documentación & Contrato", "📜", [
    i("Lee el contrato de chárter línea por línea antes de firmar", { critical: true }),
    i("Importe de la fianza, condiciones de devolución y franquicia claros"),
    i("Registro / matrícula de la embarcación a bordo"),
    i("Póliza de seguro y cobertura revisadas (responsabilidad civil + casco)", { critical: true }),
    i("Titulación del patrón / ICC aceptada y registrada"),
    i("Inventario contado ítem por ítem y firmado", { photo: true, tip: "Todo lo que falte en el check-out se descuenta de la fianza." }),
    i("Daños existentes anotados en el formulario de check-in y fotografiados", { critical: true, photo: true }),
    i("Política de combustible y agua clara (¿recibir lleno / devolver lleno?)"),
    i("Teléfonos de emergencia guardados (operador, marina, guardia costera 158)"),
    i("Hora y lugar de devolución y penalización por retraso claros"),
  ]);

const govde = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Casco & Exterior", "🛥️", [
    i("Recorre todo el casco: fotografía arañazos, grietas y daños en el gelcoat", { critical: true, photo: true, tip: "Los arañazos del casco son la primera causa de disputas. Un vídeo del recorrido es la prueba más segura." }),
    i("Revisa proa y popa en busca de marcas de impacto", { photo: true }),
    i("Guardamancebos tensos y sin roturas; candeleros, púlpito de proa y de popa firmes"),
    i("Revisa la superficie antideslizante de cubierta y la teca", { photo: true }),
    i("Cornamusas y cáncamos firmes"),
    i("Escotillas y portillos abren y cierran, sin cristales agrietados", { photo: true, tip: "Un portillo agrietado es un descuento clásico de la fianza." }),
    i("Luces de navegación funcionando (verde/roja/alcance/tope)", { critical: true }),
    i("Holgura del timón comprobada, la rueda gira con suavidad"),
    i("Escalera de baño / mecanismo de la plataforma funciona"),
    ...extra,
  ]);

const motorBlok = (id: string, opts?: { cift?: boolean }): Category =>
  cat(id, "Motor & Maquinaria", "⚙️", [
    i(`Fotografía las horas de motor y haz que las anoten en el formulario${opts?.cift ? " (ambos motores)" : ""}`, { photo: true }),
    i("Nivel de aceite comprobado con la varilla", { critical: true }),
    i("Nivel de refrigerante / anticongelante comprobado"),
    i("Correas tensas, sin grietas"),
    i("Filtro de agua de mar limpio, la tapa no pierde"),
    i("Motor arrancado: comprueba que sale agua por el escape", { critical: true, tip: "Si no sale agua, el impeller puede estar dañado; el motor se recalienta enseguida." }),
    i("Sin ruidos/vibraciones anormales al ralentí ni acelerando"),
    i("Indicador de combustible fotografiado", { photo: true }),
    i("Sin rastros de fugas de combustible/aceite bajo la tapa del motor"),
    i("Sentina seca; bombas de achique automática y manual probadas", { critical: true }),
    i("El inversor cambia con suavidad avante/atrás/punto muerto"),
    i("Panel de instrumentos sin alarmas (presión de aceite, temperatura, carga)"),
    i("Ubicación de repuestos y caja de herramientas conocida (impeller, correa, fusibles)"),
    i("Régimen de crucero, consumo por hora y capacidad del depósito anotados", { tip: "Para la autonomía: depósito (L) ÷ consumo (L/h) × velocidad." }),
  ]);

// La sección más disputada: el auxiliar (dinghy) y su fueraborda.
// La reclamación número uno al seguro en bareboat es la pérdida del auxiliar/fueraborda y el daño en la hélice.
const tender = (id: string): Category =>
  cat(id, "Auxiliar & Fueraborda", "🚣", [
    i("Auxiliar inflado y en buen estado; flotadores y suelo fotografiados", { photo: true }),
    i("Fueraborda arrancado, expulsa agua de refrigeración", { critical: true }),
    i("Hélice del fueraborda fotografiada en primer plano", { critical: true, photo: true, tip: "El daño en la hélice es el cargo más frecuente en el check-out." }),
    i("Cordón de parada (kill cord) presente en el auxiliar y funcionando", { critical: true }),
    i("Remos, inflador, boza y cable con candado en el auxiliar"),
    i("Fueraborda asegurado con candado al auxiliar, cabo de seguridad amarrado", { tip: "Un fueraborda caído al mar es la reclamación de seguro más común en bareboat." }),
    i("Pescantes / sistema de izado del auxiliar demostrados"),
  ]);

const elektrik = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Electricidad & Navegación", "🧭", [
    i("Voltajes de las baterías comprobados (¿batería de servicio y de motor separadas?)"),
    i("Las baterías cargan con el motor en marcha (el voltaje sube)"),
    i("GPS / plotter enciende, cartas actualizadas cargadas", { critical: true }),
    i("La sonda funciona y da un valor razonable", { critical: true, tip: "Pregunta siempre si mide desde la quilla o desde la línea de flotación." }),
    i("Prueba de radio VHF realizada (escucha en Canal 16 + radio check)", { critical: true, tip: "En una emergencia, la VHF es tu único medio de comunicación fiable." }),
    i("El piloto automático se activa y mantiene el rumbo"),
    i("Iluminación interior y lámparas de lectura funcionan"),
    i("Tomas de 12V / USB y, si lo hay, inversor (220V) funcionan"),
    i("Cable de conexión a puerto y cargador de baterías a bordo"),
    i("Bocina / señal de niebla funciona"),
    ...extra,
  ]);

const yelkenArma = (id: string): Category =>
  cat(id, "Velas & Jarcia", "⛵", [
    i("Mayor izada y arriada: sin rasgaduras, costuras saltadas ni daño UV", { photo: true }),
    i("El enrollador del génova/foque gira con suavidad", { tip: "Un enrollador que se atasca convierte recoger vela en la mar en una pesadilla." }),
    i("Drizas (mayor, génova, spi) en buen estado y pasando por sus roldanas"),
    i("Escotas y cabos sin rozaduras, chicotes en buen estado"),
    i("Los winches giran, los trinquetes retienen; manivelas contadas (mínimo 2)"),
    i("Sistema de rizos demostrado y funcionando", { critical: true, tip: "No poder rizar con mal tiempo es uno de los mayores riesgos." }),
    i("Obenques y estays tensos; tensores asegurados con pasadores"),
    i("Botavara, trapa y cáncamos firmes; holgura de la botavara normal"),
    i("Las mordazas (stoppers) retienen, etiquetas legibles"),
    i("Cremallera y costuras del lazy-jack / lazy-bag en buen estado"),
  ]);

const guvenlik = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Equipo de Seguridad", "🛟", [
    i("Un chaleco salvavidas por persona (tallas infantiles para niños)", { critical: true }),
    i("Balsa salvavidas en su sitio, certificado/fecha de revisión vigente", { critical: true, photo: true, tip: "Una balsa con la revisión caducada puede no inflarse en la mar. Fotografía la etiqueta." }),
    i("Aro salvavidas + baliza luminosa accesibles desde la bañera", { critical: true }),
    i("Bengalas completas y dentro de la fecha de caducidad", { critical: true, photo: true }),
    i("Extintores: cantidad, manómetro en verde, fechas vigentes", { critical: true, photo: true }),
    i("Manta ignífuga en la cocina"),
    i("Botiquín completo y al día"),
    i("EPIRB / PLB, si lo hay, comprobado con el botón de test"),
    i("Linterna + pilas de repuesto"),
    i("Arneses de seguridad y líneas de vida (jacklines)"),
    i("Ubicación de la caña de emergencia mostrada, montada y probada", { critical: true }),
    i("Ubicación de los grifos de fondo y espiches de madera mostrados", { critical: true }),
    i("Detector / alarma de gas funciona"),
    ...extra,
  ]);

const demirPalamar = (id: string): Category =>
  cat(id, "Ancla & Amarras", "⚓", [
    i("Longitud del ancla principal y la cadena conocida (¿cuántos metros?)", { tip: "Fondear requiere filar al menos 3-5 veces la profundidad." }),
    i("El molinete baja y sube; el mando a distancia funciona", { critical: true }),
    i("Conexión de la cadena y freno de cadena comprobados"),
    i("Ancla de respeto con su cabo a bordo"),
    i("Defensas contadas y en buen estado (mínimo 6)", { photo: true }),
    i("Amarras suficientes (4-6, sin rozaduras)"),
    i("Cabo largo (~50 m) a bordo para amarre de popa al muelle", { tip: "Imprescindible para amarrar de popa en las calas del Mediterráneo." }),
    i("Bichero a bordo"),
  ]);

const suTesisat = (id: string): Category =>
  cat(id, "Agua & Fontanería", "🚿", [
    i("Tanques de agua dulce llenos; capacidad conocida", { photo: true }),
    i("Grupo de presión funciona, sale agua con caudal constante de los grifos"),
    i("Agua caliente (calentador) calienta con el motor/corriente de puerto"),
    i("Baños (WC) probados con bomba/vacío", { critical: true, tip: "Un WC atascado arruina las vacaciones; prueba cada camarote uno por uno." }),
    i("Tanque de aguas negras vacío; válvula de descarga mostrada"),
    i("Duchas y bombas de desagüe de ducha funcionan"),
    i("Ducha de cubierta funciona"),
    i("¿Rastros de fugas de agua?: fondos de armarios y alrededores de los tanques secos"),
  ]);

const mutfakYasam = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Cocina & Zona de Estar", "🍳", [
    i("Fogón/horno encendidos; nivel de la bombona y bombona de repuesto comprobados", { critical: true }),
    i("Ubicación de la llave de gas mostrada; manguera y abrazaderas en buen estado", { critical: true }),
    i("La nevera enfría (pide que la enciendan antes de la entrega y espera)"),
    i("Ollas, platos y cubiertos coinciden con el inventario"),
    i("Ropa de cama, sábanas y toallas recibidas para cada persona"),
    i("Camarotes, tapicería, cojines: fotografía manchas/rasgaduras", { photo: true }),
    i("Cerraduras y bisagras de puertas y armarios funcionan"),
    i("Bimini y capota (sprayhood) en buen estado, cremalleras funcionan", { photo: true }),
    i("Mesa de bañera y cojines completos"),
    i("Mosquiteras y juntas de puertas/escotillas en buen estado"),
    ...extra,
  ]);

const sonKontrol = (id: string, extra: ItemDraft[] = []): Category =>
  cat(id, "Últimos Pasos Antes de la Entrega", "✅", [
    i("Graba un vídeo recorriendo todo el barco (con la fecha visible)", { critical: true, photo: true }),
    i("Combustible, niveles de agua y horas de motor anotados en el formulario", { photo: true }),
    i("Graba el briefing técnico con el móvil (sobre todo el panel eléctrico)", { tip: "El consejo número uno de la ASA: graba el briefing — recordarlo después es imposible." }),
    i("Briefing recibido: salida de la marina, zonas restringidas, meteorología"),
    i("Aprendido a quién llamar y el procedimiento en caso de avería"),
    i("Pedidas recomendaciones de fondeaderos y rutas"),
    i("Procedimiento de devolución claro (¿hay inspección con buzo?)"),
    i("Te has quedado con una copia del formulario de check-in", { critical: true }),
    ...extra,
  ]);

// ---------------------------------------------------------------------------
// TIPOS DE EMBARCACIÓN
// ---------------------------------------------------------------------------

const yelkenli: Vessel = {
  id: "yelkenli",
  name: "Velero",
  subtitle: "Chárter de velero sin patrón (bareboat)",
  icon: "⛵",
  duration: "60–90 min",
  group: "kiralik",
  categories: [
    evrak("ye-evrak"),
    govde("ye-govde"),
    motorBlok("ye-motor"),
    elektrik("ye-elektrik", [i("Instrumento de viento (anemómetro) funciona")]),
    yelkenArma("ye-yelken"),
    guvenlik("ye-guvenlik", [i("Reflector de radar izado en el mástil")]),
    demirPalamar("ye-demir"),
    tender("ye-tender"),
    suTesisat("ye-su"),
    mutfakYasam("ye-mutfak"),
    sonKontrol("ye-son"),
  ],
};

const motoryat: Vessel = {
  id: "motoryat",
  name: "Yate a motor",
  subtitle: "Yate a motor / flybridge",
  icon: "🛥️",
  duration: "45–75 min",
  group: "kiralik",
  categories: [
    evrak("mo-evrak"),
    govde("mo-govde", [
      i("Escalera y barandillas del flybridge firmes"),
      i("Flaps de trimado funcionan"),
      i("Plataforma hidráulica / pasarela funciona"),
    ]),
    motorBlok("mo-motor", { cift: true }),
    cat("mo-jenerator", "Generador & Confort", "🔌", [
      i("Generador arrancado, probado con carga (con aire acondicionado + calentador encendidos)"),
      i("El aire acondicionado enfría/calienta en cada camarote"),
      i("Hélice de proa/popa (bow thruster) probada", { critical: true }),
      i("Vaso del filtro separador de agua/combustible (Racor) limpio, ubicación conocida"),
      i("Limpiaparabrisas y agua de lavado funcionan"),
      i("Foco / luz de búsqueda, si lo hay, funciona"),
      i("Potabilizadora (watermaker), si la hay, uso aprendido"),
    ]),
    elektrik("mo-elektrik", [i("El radar enciende y muestra imagen")]),
    guvenlik("mo-guvenlik", [
      i("Manómetro del sistema automático de extinción de la sala de máquinas en verde", { critical: true }),
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
  name: "Catamarán",
  subtitle: "Velero de doble casco",
  icon: "⛵",
  duration: "75–100 min",
  group: "kiralik",
  categories: [
    evrak("ka-evrak"),
    govde("ka-govde", [
      i("Recorre cada casco por separado, fotografía las cuatro 'esquinas'", { photo: true, tip: "Los catamaranes sufren daños de pantalán sobre todo en las esquinas." }),
      i("Red del trampolín y sus amarres en buen estado, fotografiados", { critical: true, photo: true }),
      i("¿Marcas de impacto/pantocazos bajo la plataforma central (bridgedeck)?"),
      i("Las escotillas de escape de los cascos abren y no tienen fugas", { critical: true }),
    ]),
    motorBlok("ka-motor", { cift: true }),
    elektrik("ka-elektrik", [
      i("Bancos de baterías de ambos cascos comprobados"),
      i("Los paneles solares cargan"),
    ]),
    yelkenArma("ka-yelken"),
    guvenlik("ka-guvenlik", [
      i("Bombas de achique de ambos cascos probadas por separado", { critical: true }),
      i("Preguntada la ubicación de la balsa salvavidas (¿bajo el trampolín o a popa?)", { critical: true }),
    ]),
    demirPalamar("ka-demir"),
    cat("ka-bridle", "Específico del Catamarán", "🪢", [
      i("Bridle de fondeo (amarre en Y) a bordo y su uso demostrado", { critical: true, tip: "Fondear sin bridle en un catamarán daña la cadena." }),
      i("Subida/bajada de los pescantes del auxiliar demostrada"),
      i("Uso del winche eléctrico y su alternativa manual aprendidos"),
      i("Briefing recibido sobre maniobra con dos motores sin timón"),
      i("Briefing de rizos recibido: el catamarán no escora, la carga de la jarcia aumenta", { critical: true, tip: "Como el catamarán no escora, la sobrecarga es difícil de notar; hay que rizar pronto." }),
    ]),
    tender("ka-tender"),
    suTesisat("ka-su"),
    mutfakYasam("ka-mutfak"),
    sonKontrol("ka-son", [i("Preguntadas las restricciones de altura y manga de la marina/pasos (¡barco ancho!)")]),
  ],
};

const gulet: Vessel = {
  id: "gulet",
  name: "Goleta (Gulet)",
  subtitle: "Crucero azul con tripulación",
  icon: "⚓",
  duration: "30–45 min",
  group: "kiralik",
  categories: [
    cat("gu-evrak", "Contrato & Alcance", "📜", [
      i("La ruta, el número de noches y los puertos figuran en el contrato", { critical: true }),
      i("Plan de comidas (pensión completa / media) y política de bebidas claros"),
      i("Número de tripulantes y sus funciones conocidos"),
      i("Quién paga combustible, tasas portuarias y transit log — aclarado"),
      i("Condiciones del APA / anticipo de extras entendidas"),
      i("Costumbre de propina a la tripulación conocida (normalmente 5-10%)"),
      i("Seguro y certificado de capacidad de pasajeros revisados", { critical: true }),
    ]),
    cat("gu-kamara", "Camarotes & Confort", "🛏️", [
      i("Camarotes recorridos: camas, aire acondicionado y baños funcionan"),
      i("Horarios de aire acondicionado y generador recibidos por escrito", { tip: "Muchas goletas solo encienden el aire acondicionado unas horas al día; que no quede en promesas verbales." }),
      i("Los juguetes acuáticos prometidos en el contrato están realmente a bordo", { photo: true }),
      i("Ropa de cama y toallas limpias, suficientes por persona"),
      i("Sale agua caliente en todos los baños"),
      i("Colchonetas de solárium y toldos completos", { photo: true }),
      i("Horarios del generador conocidos (¿funciona de noche?)"),
    ]),
    cat("gu-guvenlik", "Seguridad", "🛟", [
      i("Chalecos salvavidas mostrados (incluidas tallas infantiles)", { critical: true }),
      i("Briefing de balsa salvavidas y punto de reunión recibido", { critical: true }),
      i("Extintores y vías de escape mostrados", { critical: true }),
      i("Botiquín y centro médico más cercano conocidos"),
      i("Normas para desembarcar con el auxiliar conocidas"),
    ]),
    cat("gu-son", "Antes de Zarpar", "✅", [
      i("Zonas comunes fotografiadas (daños existentes)", { photo: true }),
      i("Ruta y meteorología comentadas con el capitán"),
      i("Inventario de juguetes acuáticos (SUP, snorkel) tomado"),
      i("Comunicación: ¿hay teléfono/wifi a bordo?, números de emergencia guardados"),
    ]),
  ],
};

const suratTeknesi: Vessel = {
  id: "surat",
  name: "Lancha",
  subtitle: "Barco a motor de día",
  icon: "🚤",
  duration: "15–25 min",
  group: "kiralik",
  categories: [
    cat("su-evrak", "Documentación & Entrega", "📜", [
      i("Contrato y condiciones de la fianza leídos", { critical: true }),
      i("Requisito de titulación cumplido (título nacional/ICC)"),
      i("Arañazos y daños existentes fotografiados", { critical: true, photo: true }),
      i("Política de combustible clara (¿por hora o por depósito?)"),
      i("Hora de devolución y límites de la zona conocidos"),
    ]),
    cat("su-govde", "Casco & Motor", "⚙️", [
      i("Arañazos del casco y la obra viva fotografiados", { photo: true }),
      i("Hélice revisada por daños (¿palas dobladas?)", { critical: true, photo: true }),
      i("Motor arrancado en frío, expulsa agua (chorro testigo)", { critical: true }),
      i("Cordón del kill switch (parada de emergencia) puesto y funcionando", { critical: true, tip: "Si caes al agua, es lo único que detiene el motor." }),
      i("Trim/tilt funciona"),
      i("Nivel de combustible fotografiado", { photo: true }),
      i("Achique automático funciona, interior del barco seco"),
      i("Tapón de drenaje de popa PUESTO", { critical: true, tip: "Si no está puesto, el barco entra agua poco a poco — un olvido clásico y peligroso." }),
      i("Dirección y acelerador funcionan sin holgura"),
      i("Rasgaduras/manchas en tapicería y cojines fotografiadas", { photo: true }),
    ]),
    cat("su-guvenlik", "Seguridad", "🛟", [
      i("Un chaleco salvavidas por persona (incluidas tallas infantiles)", { critical: true }),
      i("Extintor con presión y en fecha", { critical: true }),
      i("Ancla + cabo a bordo y amarrados al barco"),
      i("Aro salvavidas lanzable / cabo flotante a bordo"),
      i("Defensas suficientes"),
      i("Luces de navegación funcionan (para después de la puesta de sol)"),
      i("Remo / bomba manual a bordo"),
      i("¿Funda estanca para el móvil / VHF disponible?"),
    ]),
    cat("su-son", "Antes de Salir", "✅", [
      i("Zonas prohibidas/de bañistas y límites de velocidad conocidos", { critical: true }),
      i("Previsión de tiempo y viento consultada; preguntado con qué viento hay que volver"),
      i("Preguntado si está prohibido varar en la playa (beaching)", { tip: "Rozar la obra viva es una de las primeras causas de pérdida de la fianza." }),
      i("Bajos, rocas y rutas de ferris mostrados en la carta"),
      i("Número de emergencia guardado (Guardia Costera 158)"),
      i("Breve vuelta de prueba hecha con el representante del operador"),
    ]),
  ],
};

const jetski: Vessel = {
  id: "jetski",
  name: "Moto de agua",
  subtitle: "Moto acuática personal",
  icon: "🌊",
  duration: "10–15 min",
  group: "kiralik",
  categories: [
    cat("je-evrak", "Documentación & Entrega", "📜", [
      i("Contrato, fianza y tarifa por hora claros", { critical: true }),
      i("Todos los arañazos del casco grabados en vídeo", { critical: true, photo: true }),
      i("Horas de motor / nivel de gasolina fotografiados", { photo: true }),
      i("Zona de uso mostrada en un mapa"),
    ]),
    cat("je-teknik", "Comprobación Técnica", "⚙️", [
      i("Kill cord (cordón de seguridad) puesto en la muñeca, probado", { critical: true }),
      i("El arranque engancha, el motor va suave al ralentí"),
      i("Tobera del jet, rejilla de admisión y ride plate fotografiados", { photo: true, tip: "El daño por piedras/rocas en la parte inferior es la disputa más frecuente." }),
      i("Dirección sin holgura, gira a tope hacia ambos lados"),
      i("Vuelve al ralentí por sí sola al soltar el acelerador", { critical: true }),
      i("Marcha atrás / freno (iBR-RiDE), si lo tiene, funciona"),
      i("Espejos intactos (pueden ser obligatorios para deportes de arrastre)"),
      i("La guantera cierra, la documentación dentro en funda estanca"),
    ]),
    cat("je-guvenlik", "Seguridad", "🛟", [
      i("Chaleco salvavidas de talla adecuada y en buen estado", { critical: true }),
      i("Silbato o dispositivo de señalización en el chaleco"),
      i("Norma de mantenerse alejado de las zonas de baño entendida", { critical: true }),
      i("Sentido de adrizado tras un vuelco aprendido (mira la pegatina)", { tip: "Girarla en el sentido equivocado mete agua en el motor." }),
      i("Requisitos de edad mínima/titulación cumplidos"),
    ]),
  ],
};

const kanoSup: Vessel = {
  id: "kanosup",
  name: "Kayak / SUP",
  subtitle: "Embarcaciones de remo",
  icon: "🛶",
  duration: "5–10 min",
  group: "kiralik",
  categories: [
    cat("kn-teslim", "Entrega", "📜", [
      i("Comprueba si el casco tiene grietas/agujeros", { photo: true }),
      i("Si es un SUP, la presión de aire es suficiente (comprueba la rigidez)"),
      i("Remo en buen estado, cierre ajustable funciona"),
      i("Leash (correa de sujeción) en buen estado", { critical: true }),
    ]),
    cat("kn-guvenlik", "Seguridad", "🛟", [
      i("Chaleco salvavidas recibido y puesto", { critical: true }),
      i("Preguntadas la dirección del viento y la corriente (¡cuidado con el viento terral!)", { critical: true, tip: "El viento terral te arrastra mar adentro; volver se vuelve muy difícil." }),
      i("Zona permitida y hora de regreso claras"),
      i("Móvil contigo en funda estanca"),
    ]),
  ],
};

// ---------------------------------------------------------------------------
// LISTAS PARA PROPIETARIOS — comprobaciones rutinarias de tu propio barco
// ---------------------------------------------------------------------------

const sahipYolaCikis: Vessel = {
  id: "sahip-yolacikis",
  name: "Antes de zarpar",
  subtitle: "Antes de cada travesía (pre-departure)",
  icon: "🧭",
  duration: "30–45 min",
  group: "sahip",
  categories: [
    cat("yc-plan", "Plan & Meteorología", "🌤️", [
      i("Previsión consultada: viento, rachas, estado del mar, visibilidad", { critical: true, tip: "No te fíes de una sola fuente; consulta al menos dos previsiones." }),
      i("Avisos a los navegantes / alertas locales consultados"),
      i("Ruta planificada: distancia, tiempo y combustible necesario calculados"),
      i("Puertos/calas de refugio alternativos identificados"),
      i("Plan de navegación comunicado a alguien en tierra (float plan)", { critical: true, tip: "Que alguien sepa adónde vas y cuándo vuelves — y dé la alarma si te retrasas." }),
      i("Luz de día suficiente — no habrá oscurecido a la llegada"),
      i("Información de marea/corriente consultada (si procede)"),
    ]),
    cat("yc-evrak", "Documentación", "📜", [
      i("Registro / matrícula de la embarcación a bordo"),
      i("Póliza de seguro vigente y a bordo"),
      i("Titulación (título nacional/ICC) contigo"),
      i("Lista de tripulantes/pasajeros lista (si se exige)"),
      i("Licencia de radio a bordo"),
    ]),
    cat("yc-motor", "Motor (Comprobación WOBBLE)", "⚙️", [
      i("W — Agua: nivel de refrigerante + filtro de agua de mar limpio", { critical: true }),
      i("O — Aceite: niveles de aceite de motor e inversor comprobados con la varilla", { critical: true }),
      i("B — Correas: tensión ~1,5 cm de flexión, sin grietas"),
      i("B — Sentina: seca; el automático de la bomba funciona", { critical: true }),
      i("L — Fugas: sin rastros de aceite/combustible/agua bajo el motor"),
      i("E — Escape: sale agua por el escape con el motor en marcha", { critical: true }),
      i("S — Sonido: sin ruidos/vibraciones anormales al ralentí"),
      i("Combustible suficiente según la regla de los tercios (ida + vuelta + reserva)", { critical: true }),
      i("Sin agua/sedimentos en el vaso del separador de combustible (Racor)"),
      i("Impeller, correa y aceite de repuesto y caja de herramientas a bordo"),
      i("Grifo de fondo de refrigeración del motor ABIERTO", { critical: true, tip: "Un motor funcionando con el grifo de fondo cerrado quema el impeller en pocos minutos." }),
    ]),
    cat("yc-elektrik", "Electricidad & Instrumentos", "🔋", [
      i("Voltajes de baterías completos, interruptores en la posición correcta"),
      i("VHF encendida, en Canal 16; radio check hecho", { critical: true }),
      i("Plotter encendido, ruta cargada; navegación de respaldo en el móvil"),
      i("Luces de navegación funcionan (por si se vuelve de noche)"),
      i("Piloto automático probado"),
      i("Móviles cargando, powerbank lleno"),
      i("Cable de corriente de puerto DESCONECTADO", { critical: true, tip: "Zarpar con el cable conectado es un accidente clásico en todas las marinas." }),
    ]),
    cat("yc-guverte", "Cubierta & Aparejo", "⛵", [
      i("Velas listas para izar, aparejo de rizos montado"),
      i("Cabos claros y adujados, las drizas no golpean el mástil"),
      i("Ancla trincada y magnetotérmico del molinete conectado; ancla lista"),
      i("Escotillas y portillos cerrados y trincados", { critical: true }),
      i("Nada suelto en cubierta; todo trincado/estibado"),
      i("Defensas y amarras dispuestas listas para la salida"),
      i("Auxiliar amarrado/seguro en los pescantes; su fueraborda con candado"),
    ]),
    cat("yc-emniyet", "Seguridad", "🛟", [
      i("Chalecos salvavidas listos por persona; los niños lo llevan puesto", { critical: true }),
      i("Balsa salvavidas en su sitio, zafa hidrostática armada"),
      i("Bengalas y extintores en su sitio, en fecha", { critical: true }),
      i("Botiquín y medicación contra el mareo a bordo"),
      i("EPIRB/PLB en su sitio; ubicación del botón MOB conocida"),
      i("Llave de la bombona de gas CERRADA fuera de uso"),
      i("Palanca de la bomba de achique manual en su sitio"),
      i("Espiches de madera colgados junto a los grifos de fondo"),
    ]),
    cat("yc-brifing", "Briefing a la Tripulación", "🗣️", [
      i("Procedimiento MOB (hombre al agua) explicado", { critical: true }),
      i("Ubicación de chalecos y balsa salvavidas mostrada"),
      i("Explicado cómo hacer una llamada MAYDAY por VHF", { critical: true, tip: "Si el patrón queda incapacitado, alguien de la tripulación debe poder pedir ayuda." }),
      i("Ubicación de extintores y llave de gas mostradas"),
      i("Aviso de golpe de botavara dado; normas para salir de la bañera"),
      i("Uso del WC explicado (¡la regla del papel!)"),
    ]),
    cat("yc-son", "Justo Antes de Largar Amarras", "✅", [
      i("Motor calentado 5-10 min, indicadores normales"),
      i("El timón gira a tope hacia ambos lados"),
      i("Orden de largar amarras planificado, cada uno conoce su tarea"),
      i("Canal/normas de salida de la marina repasados"),
      i("Última comprobación del tiempo hecha — renunciar también es buena marinería", { tip: "Saber quedarse en puerto es la marca de los mejores patrones." }),
    ]),
  ],
};

const sahipSezonAcilis: Vessel = {
  id: "sahip-sezon",
  name: "Inicio de temporada",
  subtitle: "Vuelta al barco tras la invernada",
  icon: "🔧",
  duration: "Medio día–1 día",
  group: "sahip",
  categories: [
    cat("sz-karina", "Obra Viva & Bajo el Agua", "🐚", [
      i("Estado de la patente (antifouling) comprobado/renovado"),
      i("Ánodos comprobados — sustituir si están consumidos más del 50%", { critical: true, tip: "Un ánodo agotado significa que se corroen la hélice y el eje." }),
      i("Holguras de hélice, eje y cojinetes comprobadas"),
      i("Rejillas de los grifos de fondo limpias, las válvulas abren y cierran", { critical: true }),
      i("Cojinetes del timón sin holgura"),
      i("Casco revisado por ampollas de ósmosis / marcas de impacto", { photo: true }),
      i("Prensaestopas del eje comprobado; goteo normal tras la botadura"),
    ]),
    cat("sz-motor", "Servicio del Motor", "⚙️", [
      i("Aceite y filtro del motor cambiados"),
      i("Impeller sustituido (una vez por temporada)", { critical: true }),
      i("Filtros de combustible (motor + separador) cambiados"),
      i("Anticongelante/refrigerante renovado"),
      i("Correas comprobadas/sustituidas"),
      i("Mangueras y abrazaderas comprobadas (doble abrazadera en las conexiones bajo el agua)"),
      i("Codo de escape/colector antisifón comprobado"),
      i("Tacos del motor sin grietas"),
      i("Aceite del inversor comprobado/cambiado"),
      i("En el primer arranque el motor expulsó agua por el escape, sin fugas", { critical: true }),
    ]),
    cat("sz-elektrik", "Electricidad", "🔋", [
      i("Baterías cargadas y probadas bajo carga; sustituir las agotadas"),
      i("Terminales de las baterías limpiados y engrasados"),
      i("Todas las luces de navegación e iluminación de cubierta probadas"),
      i("Diferencial / cuadro de fusibles comprobado"),
      i("VHF, plotter, sonda e instrumentos de viento probados"),
    ]),
    cat("sz-arma", "Jarcia & Velas", "⛵", [
      i("Jarcia firme inspeccionada a ojo y a mano (hilos rotos, terminales agrietados)", { critical: true }),
      i("Herrajes de las crucetas y base del mástil comprobados"),
      i("Drizas y cabos revisados por rozaduras; chicotes falcaceados"),
      i("Velas de vuelta de la velería / revisadas (costuras, banda UV)"),
      i("Winches abiertos, limpiados y engrasados"),
      i("Poleas y carros enjuagados de sal, funcionan en silencio"),
    ]),
    cat("sz-emniyet", "Renovación de Seguridad", "🛟", [
      i("Fecha de revisión de la balsa salvavidas comprobada — si venció, envíala a servicio", { critical: true }),
      i("Fechas de caducidad de las bengalas comprobadas", { critical: true }),
      i("Extintores pesados/revisados, manómetros en verde", { critical: true }),
      i("Cartuchos de gas y disparadores de los chalecos hinchables comprobados"),
      i("Botiquín repuesto (medicamentos caducados)"),
      i("Fecha de batería del EPIRB/PLB comprobada, registro al día"),
      i("Pilas del detector de gas y la alarma de humo cambiadas"),
    ]),
    cat("sz-tesisat", "Agua, Gas & WC", "🚿", [
      i("Tanques de agua dulce desinfectados, sistema purgado con agua limpia"),
      i("Mangueras de agua y abrazaderas comprobadas"),
      i("Mantenimiento del WC hecho (válvula joker, juntas); la bomba funciona con suavidad"),
      i("Válvulas y mangueras del tanque de aguas negras comprobadas"),
      i("Fecha de fabricación/sustitución de la manguera de gas comprobada", { critical: true, tip: "Las mangueras de gas tienen vida limitada; la fecha está impresa en la manguera." }),
      i("Grupo de presión y calentador puestos en marcha, sin fugas"),
    ]),
    cat("sz-evrak", "Documentación & Seguro", "📜", [
      i("Póliza de seguro renovada", { critical: true }),
      i("Visado del registro de amarre realizado"),
      i("Vigencia de matrícula y titulación comprobada"),
      i("Licencia de radio al día"),
      i("Contrato de la marina y datos de contacto actualizados"),
    ]),
    cat("sz-icmekan", "Interior", "🛏️", [
      i("Comprobado moho/humedad, interior ventilado"),
      i("Tapicería y colchones revisados y aireados al sol"),
      i("Sentinas limpiadas y secadas"),
      i("Juntas de escotillas y portillos comprobadas (¿marcas de filtraciones?)"),
      i("Fundas de invierno retiradas, cubierta baldeada"),
    ]),
  ],
};

const sahipKapama: Vessel = {
  id: "sahip-kapama",
  name: "Al dejar el barco",
  subtitle: "Rutina de cierre tras cada salida",
  icon: "🔒",
  duration: "15–20 min",
  group: "sahip",
  categories: [
    cat("kp-motor", "Motor & Válvulas", "⚙️", [
      i("Grifo de fondo de refrigeración del motor cerrado (según tu política)", { tip: "Si lo cierras, deja una nota 'GRIFO DE FONDO CERRADO' en el timón — para no olvidarlo en el próximo arranque." }),
      i("Llave de la bombona de gas cerrada", { critical: true }),
      i("Grifos de fondo del WC y el fregadero cerrados", { critical: true, tip: "La causa número uno de hundimientos: un grifo de fondo abierto y una manguera reventada." }),
      i("Llave de combustible cerrada (en ausencias largas)"),
    ]),
    cat("kp-elektrik", "Electricidad", "🔋", [
      i("Interruptores de baterías apagados — EXCEPTO el automático de achique", { critical: true }),
      i("Corriente de puerto conectada, cargador funcionando (si queda enchufado)"),
      i("Nevera vaciada, puerta entreabierta"),
      i("Todas las luces y aparatos apagados"),
    ]),
    cat("kp-guverte", "Cubierta & Amarre", "⚓", [
      i("Amarras dobladas y con protección antirroce (por si hay temporal)", { critical: true }),
      i("Defensas a la altura correcta, en número suficiente"),
      i("Funda de la vela/protección UV cerrada; enrollado del génova asegurado"),
      i("Drizas separadas del mástil (evita golpeteo + desgaste)"),
      i("Bimini/toldo recogidos o asegurados"),
      i("Auxiliar y fueraborda con candado"),
      i("Nada en cubierta que pueda salir volando"),
    ]),
    cat("kp-icmekan", "Interior & Cierre", "🔒", [
      i("Sentina seca, bomba automática armada", { critical: true }),
      i("Comida y basura sacadas del barco"),
      i("Sin ropa/toallas húmedas a bordo (provocan moho)"),
      i("Ventilación asegurada (ventiladores de hongo abiertos)"),
      i("Escotillas, portillos y tambucho de entrada cerrados con llave"),
      i("Teléfono de contacto dejado en la oficina de la marina"),
      i("Estado final del barco fotografiado al marcharte", { photo: true, tip: "En caso de daños por temporal/seguro, es tu prueba de su 'último estado en buenas condiciones'." }),
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
// GUÍA DE FOTOS & FIANZA
// Fuentes: estadísticas de daños/disputas de la ASA, la RYA y operadores de chárter.
// ---------------------------------------------------------------------------

export const GUIDE: GuideContent = {
  lead:
    "La mayoría de las disputas en el chárter náutico surgen de daños no documentados en el check-in. " +
    "Esta guía te dice qué fotografiar y qué reglas seguir para proteger tu fianza.",
  photoSpots: [
    {
      title: "Hélice del fueraborda (auxiliar + motor principal)",
      why: "El cargo más frecuente en el check-out. Un fueraborda del auxiliar caído al mar es la reclamación de seguro número uno en bareboat.",
    },
    {
      title: "Amuras y aletas del casco",
      why: "Los arañazos de atraque se producen aquí sobre todo; que no te facturen los antiguos.",
    },
    {
      title: "Flotadores y suelo del auxiliar (dinghy)",
      why: "Los auxiliares arrastrados por la playa se rayan por debajo; documenta su estado antes del check-in.",
    },
    {
      title: "Indicador de combustible, indicador de agua y horas de motor",
      why: "Una foto con fecha es el único antídoto contra el argumento de 'lo recibiste lleno'.",
    },
    {
      title: "Quilla y timón (si es posible)",
      why: "Contra acusaciones de varada. Si el check-out incluye inspección con buzo, pide el informe del buzo a la salida.",
    },
    {
      title: "Velas izadas",
      why: "Que las rasgaduras, el daño UV y las costuras saltadas existentes no se atribuyan a tu periodo.",
    },
    {
      title: "Tapicería, cojines, colchones",
      why: "Manchas y rasgaduras son un descuento estándar de la fianza.",
    },
    {
      title: "Guardamancebos, púlpito y herrajes doblados",
      why: "Las pequeñas dobladuras suelen ser del arrendatario anterior; documéntalas.",
    },
    {
      title: "Escotillas y cristales de los portillos",
      why: "El acrílico agrietado es una partida de descuento clásica.",
    },
    {
      title: "Baños (funcionando)",
      why: "Un WC atascado es un cargo estándar; deja constancia de que funcionaba al recibirlo.",
    },
    {
      title: "Amarres del trampolín (catamarán)",
      why: "Son caros y una fuente frecuente de disputas.",
    },
    {
      title: "Moto de agua: fondo del casco, rejilla de admisión, asiento",
      why: "El daño por piedras/rocas y el asiento rasgado son las causas de descuento más comunes.",
    },
  ],
  rules: [
    {
      title: "Haz un recorrido en vídeo",
      body: "Antes de recibir el barco, grábalo entero en una sola toma con la fecha y la hora visibles. El consejo de la ASA: graba también el briefing técnico — sobre todo el panel eléctrico.",
    },
    {
      title: "Que lo anoten antes de firmar",
      body: "No firmes hasta que cada rotura, falta o arañazo esté escrito en el formulario de check-in. Después de firmar, todo es responsabilidad tuya.",
    },
    {
      title: "Cuenta el inventario tú mismo",
      body: "No des el 'visto bueno' a la lista sin más; cuenta todo uno por uno, incluidas defensas, manivelas de winche y cubiertos. Cada ítem que falte se descuenta de tu fianza.",
    },
    {
      title: "Carga el equipaje después",
      body: "La regla de los grandes operadores: no subas las maletas a bordo hasta terminar la revisión del inventario — necesitas ver el interior de los armarios.",
    },
    {
      title: "Fotografía las fechas de caducidad",
      body: "Fotografía la etiqueta de revisión de la balsa salvavidas y las fechas de las bengalas y los extintores. No salgas a la mar con equipo caducado.",
    },
    {
      title: "Pide la política de combustible por escrito",
      body: "La regla estándar es 'recibir lleno, devolver lleno'. Fotografía el indicador y averigua la estación de combustible más cercana y su horario.",
    },
    {
      title: "Cuidado con las exclusiones del seguro de fianza",
      body: "Los seguros de fianza suelen excluir el auxiliar, el fueraborda, la varada y la hélice — es decir, las partidas de mayor riesgo. Lee siempre la cobertura.",
    },
  ],
  footer: "En caso de emergencia: Guardia Costera 158 (Turquía) · Canal VHF 16",
};
