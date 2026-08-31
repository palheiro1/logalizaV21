import seedrandom from "seedrandom";

/**
 * Concelhos de cada comarca segundo o documento fornecido para o jogo.
 * As grafias preservam a forma usada nessa fonte, com apenas ajustes de
 * espaços e pontuação para as apresentar de maneira consistente.
 */
export const municipalitiesByComarcaCode: Record<
  string,
  readonly string[]
> = {
  ANC: [
    "Baralha",
    "Bezerreá",
    "Cervantes",
    "Návia de Suarna",
    "Nogais",
    "Pedra Fita do Zebreiro",
  ],
  ARC: ["Arçua", "Boimorto", "Pinho", "Touro"],
  ARN: [
    "Alhariz",
    "Banhos de Molga",
    "Junqueira de Ambia",
    "Junqueira de Espadaneda",
    "Maceda",
    "Paderne de Alhariz",
  ],
  BAL: ["Bande", "Entrimo", "Lobeira", "Lóvios", "Moinhos"],
  BAM: ["Guarda", "Oia", "Rosal", "Tominho", "Tui"],
  BAR: ["Boiro", "Porto d´Ozom", "Póvoa do Caraminhal", "Rianjo", "Ribeira"],
  BER: [
    "Cabana",
    "Carvalho",
    "Coristanco",
    "Laje",
    "Laracha",
    "Malpica",
    "Ponte-Cesso",
  ],
  BEZ: [
    "Argança",
    "Bembibre",
    "Berlanga",
    "Borreis",
    "Cabanas Raras",
    "Cacabelos",
    "Campo Naraia",
    "Candim",
    "Carrazedelo",
    "Carucedo",
    "Castro Podame",
    "Corulhom",
    "Congosto",
    "Cubilhos do Sil",
    "Faveiro",
    "Folgoso de Ribeira",
    "Fontes Novas",
    "Igüenha",
    "Molinha Seca",
    "Nozeda",
    "Oência",
    "Palácios do Sil",
    "Páramo do Sil",
    "Perançaes",
    "Ponferrada",
    "Priarança",
    "Sancedo",
    "Sobrado",
    "Toreno",
    "Torre do Berzo",
    "Travadelo",
    "Val-Boa",
    "Varjas",
    "Veiga de Espinhareda",
    "Veiga de Valcarce",
    "Vila de Cais",
    "Vila Franca",
  ],
  BUR: ["Fonsagrada", "Negueira de Moniz", "Ribeira de Piquim", "Valeira"],
  CAB: ["Benuça", "Castrilho", "Enzinedo", "Ponte de Domingos Flórez"],
  CAL: [
    "Caldas de Reis",
    "Catoira",
    "Cúntis",
    "Moranha",
    "Ponte Cesures",
    "Portas",
    "Valga",
  ],
  CAR: [
    "Boborás",
    "Carvalhinho",
    "Irijo",
    "Maside",
    "Pinhor",
    "Pungim",
    "Sam Cristovo de Ceia",
    "Santo Amaro",
    "Veariz",
  ],
  CEL: [
    "Bola",
    "Cartelhe",
    "Cela Nova",
    "Gomesende",
    "Merca",
    "Padrenda",
    "Ponte Deva",
    "Quintela de Leirado",
    "Ramirós",
    "Vereia",
  ],
  CHA: ["Carvalhedo", "Chantada", "Tabuada"],
  COM: [
    "Ames",
    "Boqueixom",
    "Briom",
    "Santiago de Compostela",
    "Teio",
    "Val do Duvra",
    "Vedra",
    "Avanha",
    "Negreira",
    "Dodro",
    "Padrom",
    "Rois",
  ],
  CND: [
    "Mondariz",
    "Mondariz Balneário",
    "Neves",
    "Ponte Areias",
    "Salvaterra",
    "Salzeda de Caselas",
  ],
  COR: [
    "Arteijo",
    "Avegondo",
    "Bergondo",
    "Cambre",
    "Carral",
    "Corunha",
    "Culheredo",
    "Oleiros",
    "Sada",
  ],
  COS: [
    "Camarinhas",
    "Carnota",
    "Cee",
    "Corcubiom",
    "Dumbria",
    "Fisterra",
    "Maçaricos",
    "Mogia",
    "Santa Comba",
    "Sas",
  ],
  COU: ["Folgoso do Courel", "Quiroga", "Ribas de Sil"],
  DEC: ["Agolada", "Cruzes", "Doçom", "Lalim", "Rodeiro", "Silheda"],
  EUM: ["Cabanas", "Capela", "Monfero", "Ponted´Eume", "Pontes"],
  LIM: [
    "Baltar",
    "Brancos",
    "Calvos de Randim",
    "Ginzo",
    "Porqueira",
    "Rairiz de Vega",
    "Sandiás",
    "Sarreaus",
    "Trasmiras",
    "Vilar de Bairro",
    "Vilar de Santos",
  ],
  LUG: [
    "Castro Verde",
    "Corgo",
    "Friol",
    "Gontim",
    "Lugo",
    "Outeiro de Rei",
    "Porto Marim",
    "Rábade",
  ],
  MAR: [
    "Alfoz",
    "Barreiros",
    "Burela",
    "Cervo",
    "Foz",
    "Jove",
    "Lourença",
    "Mondonhedo",
    "Ourol",
    "Ponte Nova",
    "Ribad´Eu",
    "Rio Torto",
    "Travada",
    "Valadouro",
    "Vicedo",
    "Viveiro",
  ],
  MAS: [
    "Aranga",
    "Betanços",
    "Cesuras",
    "Coirós",
    "Cúrtis",
    "Irijoa",
    "Minho",
    "Oça dos Rios",
    "Paderne",
    "Vilar Maior",
    "Vila Santar",
  ],
  MON: [
    "Castrelo do Val",
    "Horriós",
    "Laça",
    "Monte Rei",
    "Oimbra",
    "Qualedro",
    "Verim",
    "Vilar d´Avós",
  ],
  MOR: ["Bueu", "Cangas", "Marim", "Moanha", "Vila Boa"],
  MUR: ["Lousame", "Muros", "Noia", "Outes"],
  ORD: ["Cerzeda", "Frades", "Messia", "Ordes", "Oroso", "Tordoia", "Traço"],
  ORT: ["Carinho", "Cedeira", "Cerdido", "Manhom", "Ortigueira"],
  OUR: [
    "Amoeiro",
    "Barbadás",
    "Coles",
    "Esgos",
    "Nogueira de Ramuim",
    "Ourense",
    "Pereiro de Aguiar",
    "Peroja",
    "Sam Cibrao das Vinhas",
    "Tabuadela",
    "Toém",
    "Vila Marim",
  ],
  PAR: ["Arvo", "Caniça", "Covelo", "Crescente"],
  PON: ["Barro", "Poio", "Ponte Vedra"],
  RIB: [
    "Arnoia",
    "Aviom",
    "Beade",
    "Carbalheda de Ávia",
    "Castrelo de Minho",
    "Cenlhe",
    "Cortegada",
    "Leiro",
    "Melom",
    "Ribad´Ávia",
  ],
  SAL: [
    "Cambados",
    "Ilha de Arouça",
    "Meanho",
    "Méis",
    "Ogrove",
    "Ribad´Úmia",
    "Sam Genjo",
    "Vila Garcia de Arouça",
    "Vila Nova de Arouça",
  ],
  SAR: ["Láncara", "Oíncio", "Paradela", "Páramo", "Samos", "Sárria", "Triacastela"],
  SEA: [
    "Cobreiros",
    "Ermisende",
    "Galende",
    "Luviám",
    "Palácios de Seabra",
    "Pedralva da Pradaria",
    "Pias",
    "Porto",
    "Póvoa de Seabra",
    "Requeixo",
  ],
  TAV: ["Cerdedo", "Estrada", "Forcarei"],
  TCA: ["Castro Caldelas", "Monte de Ramo", "Parada de Sil", "Teixeira"],
  TCH: [
    "Abadim",
    "Begonte",
    "Castro do Rei",
    "Cospeito",
    "Germade",
    "Guitiriz",
    "Meira",
    "Muras",
    "Pastoriça",
    "Pol",
    "Vilalba",
  ],
  TLE: ["Bóveda", "Monforte de Lemos", "Pantom", "Póvoa de Brolhom", "Savinhao", "Sober"],
  TME: ["Melide", "Sam Tisso", "Sobrado de Monges", "Toques"],
  TMO: ["Campo Lameiro", "Cotobade", "Fornelos de Montes", "Lama", "Ponte Caldelas"],
  TNA: [
    "Alhande",
    "Boal",
    "Castro Pol",
    "Coanha",
    "Eilao",
    "Franco",
    "Grandas de Salime",
    "Návia",
    "Pezós",
    "Sam Martim de Oscos",
    "Sam Tisso de Avres",
    "Santalha",
    "Taramúndi",
    "Tápia de Casariego",
    "Veiga de Riba d´Eume",
    "Verduzedo",
    "Vila Nova de Oscos",
    "Vilha Aiom",
  ],
  TTR: ["Chandreja de Queixa", "Maceda de Trives", "Póvoa de Trives", "Sam Joám do Rio"],
  TRA: [
    "Ares",
    "Fene",
    "Ferrol",
    "Moeche",
    "Mugardos",
    "Narom",
    "Neda",
    "Sam Sadurninho",
    "Somoças",
    "Valdovinho",
  ],
  ULH: ["Antas de Ulha", "Monterroso", "Palas de Rei"],
  VDI: ["Íbias", "Deganho"],
  VDO: ["Barco", "Bolo", "Carvalheda", "Larouco", "Petim", "Rua", "Ruviá", "Veiga", "Vila Martim"],
  VIA: ["Godinha", "Mesquita", "Viana do Bolo", "Vilarinho de Conso"],
  VIG: [
    "Baiona",
    "Gondomar",
    "Mós",
    "Nigrám",
    "Paços de Borvém",
    "Porrinho",
    "Redondela",
    "Souto Maior",
    "Vigo",
  ],
};

export const allMunicipalities = Array.from(
  new Set(
    Object.keys(municipalitiesByComarcaCode).reduce<string[]>(
      (municipalities, code) => [
        ...municipalities,
        ...municipalitiesByComarcaCode[code],
      ],
      []
    )
  )
);

export function getMunicipalitiesForComarca(code: string): readonly string[] {
  return municipalitiesByComarcaCode[code] ?? [];
}

export function normalizeMunicipalityName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

export function isMunicipalitySelectionCorrect(
  comarcaCode: string,
  selection: readonly string[]
): boolean {
  const expected = getMunicipalitiesForComarca(comarcaCode);
  if (selection.length !== expected.length) {
    return false;
  }

  const selectedNames = new Set(selection.map(normalizeMunicipalityName));
  return (
    selectedNames.size === expected.length &&
    expected.every((name) => selectedNames.has(normalizeMunicipalityName(name)))
  );
}

export function getMunicipalityBonusOptions(
  comarcaCode: string,
  dayString: string,
  distractorCount = 4
): string[] {
  const correctMunicipalities = [...getMunicipalitiesForComarca(comarcaCode)];
  const correctNames = new Set(
    correctMunicipalities.map(normalizeMunicipalityName)
  );
  const random = seedrandom(`${dayString}:municipalities:${comarcaCode}`);
  const distractors = shuffleArray(
    allMunicipalities.filter(
      (name) => !correctNames.has(normalizeMunicipalityName(name))
    ),
    random
  ).slice(0, distractorCount);

  return shuffleArray([...correctMunicipalities, ...distractors], random);
}

function shuffleArray(values: string[], random: () => number): string[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}
