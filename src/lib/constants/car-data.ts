export interface SubModelGroup {
  groupName: string;
  models: string[];
}

export interface MakeData {
  make: string;
  models: (string | SubModelGroup)[];
}

export const carData: { makes: MakeData[] } = {
  makes: [
  {
    "make": "212",
    "models": [
      "212"
    ]
  },
  {
    "make": "AION",
    "models": [
      "ES",
      "LX",
      "Y"
    ]
  },
  {
    "make": "AITO",
    "models": [
      "M5",
      "M7",
      "M9"
    ]
  },
  {
    "make": "Abarth",
    "models": [
      "124 Spider",
      "595",
      "695"
    ]
  },
  {
    "make": "Acura",
    "models": [
      "MDX",
      "RDX",
      "TLX"
    ]
  },
  {
    "make": "Alfa Romeo",
    "models": [
      "4C",
      "Giulia",
      "Giulietta",
      "Stelvio",
      "Tonale"
    ]
  },
  {
    "make": "Alpina",
    "models": [
      "B3",
      "B4",
      "B5",
      "B7",
      "XB7"
    ]
  },
  {
    "make": "Alpine",
    "models": [
      "A110"
    ]
  },
  {
    "make": "Arcfox",
    "models": [
      "Alpha S",
      "Alpha T",
      "Kaola"
    ]
  },
  {
    "make": "Ashok Leyland",
    "models": [
      "Dost",
      "Partner"
    ]
  },
  {
    "make": "Aston Martin",
    "models": [
      "DB11",
      "DB12",
      "DB7",
      "DB9",
      "DBS",
      "DBX",
      "V12 Vantage",
      "V8 Vantage",
      "Vanquish"
    ]
  },
  {
    "make": "Avatr",
    "models": [
      "07",
      "11",
      "12"
    ]
  },
  {
    "make": "BAIC",
    "models": [
      "BJ40",
      "BJ60",
      "X25",
      "X35",
      "X55",
      "X7"
    ]
  },
  {
    "make": "BAW",
    "models": [
      "Ace",
      "BJ212",
      "Pony"
    ]
  },
  {
    "make": "BMW",
    "models": [
      {
        "groupName": "1 Series",
        "models": [
          "116",
          "118",
          "120",
          "125",
          "135",
          "M135i",
          "M140i"
        ]
      },
      {
        "groupName": "2 Series",
        "models": [
          "218",
          "220",
          "228",
          "230",
          "235",
          "240",
          "M2",
          "M240i",
          "2 Series Gran Coupe"
        ]
      },
      {
        "groupName": "3 Series",
        "models": [
          "318",
          "320",
          "325",
          "328",
          "330",
          "335",
          "340",
          "M3",
          "M340i"
        ]
      },
      {
        "groupName": "4 Series",
        "models": [
          "420",
          "428",
          "430",
          "435",
          "440",
          "M4",
          "4 Series Gran Coupe"
        ]
      },
      {
        "groupName": "5 Series",
        "models": [
          "520",
          "523",
          "525",
          "528",
          "530",
          "535",
          "540",
          "550",
          "M5",
          "M550i"
        ]
      },
      {
        "groupName": "6 Series",
        "models": [
          "630",
          "640",
          "645",
          "650",
          "M6",
          "6 Series Gran Coupe",
          "6 Series GT"
        ]
      },
      {
        "groupName": "7 Series",
        "models": [
          "730",
          "735",
          "740",
          "745",
          "750",
          "760",
          "M760Li",
          "i7"
        ]
      },
      {
        "groupName": "8 Series",
        "models": [
          "840",
          "850",
          "M8",
          "8 Series Gran Coupe"
        ]
      },
      {
        "groupName": "X Series",
        "models": [
          "X1",
          "X2",
          "X3",
          "X3 M",
          "X4",
          "X4 M",
          "X5",
          "X5 M",
          "X6",
          "X6 M",
          "X7",
          "XM"
        ]
      },
      "Z4",
      "i3",
      "i4",
      "i5",
      "i8",
      "iX",
      "iX1",
      "iX2",
      "iX3"
    ]
  },
  {
    "make": "BMW Alpina",
    "models": [
      "B3",
      "B4",
      "B5",
      "B7",
      "XB7"
    ]
  },
  {
    "make": "BRABUS",
    "models": [
      "G-Class",
      "GLE",
      "GLS",
      "Smart"
    ]
  },
  {
    "make": "BYD",
    "models": [
      "Atto 3",
      "Destroyer 05",
      "Dolphin",
      "Han",
      "Qin Plus",
      "Seal",
      "Shark",
      "Song Plus",
      "Tang"
    ]
  },
  {
    "make": "Bentley",
    "models": [
      "Arnage",
      "Bentayga",
      "Continental GT",
      "Continental GTC",
      "Flying Spur",
      "Mulsanne"
    ]
  },
  {
    "make": "Bestune",
    "models": [
      "B30",
      "B50",
      "T77",
      "T99"
    ]
  },
  {
    "make": "Brilliance",
    "models": [
      "V3",
      "V5",
      "V6",
      "V7"
    ]
  },
  {
    "make": "Bugatti",
    "models": [
      "Chiron",
      "Veyron"
    ]
  },
  {
    "make": "Buick",
    "models": [
      "Enclave",
      "Encore",
      "Envision"
    ]
  },
  {
    "make": "CMC",
    "models": [
      "T20",
      "T30",
      "Veryca"
    ]
  },
  {
    "make": "Can-am",
    "models": [
      "Maverick",
      "Spyder"
    ]
  },
  {
    "make": "Caterham",
    "models": [
      "Seven"
    ]
  },
  {
    "make": "Changan",
    "models": [
      "Alsvin",
      "CS35",
      "CS55",
      "CS75",
      "CS85",
      "CS95",
      "Eado",
      "UNI-K",
      "UNI-T",
      "UNI-V"
    ]
  },
  {
    "make": "Chery",
    "models": [
      "Arrizo 3",
      "Arrizo 5",
      "Arrizo 6",
      "Tiggo 4",
      "Tiggo 7",
      "Tiggo 8",
      "Tiggo 9"
    ]
  },
  {
    "make": "Chevrolet",
    "models": [
      "Astro",
      "Aveo",
      "Blazer",
      "Bolt",
      "C10",
      "Camaro",
      "Caprice",
      "Captiva",
      "Colorado",
      "Corvette",
      "Cruze",
      "Epica",
      "Equinox",
      "Express",
      "Groove",
      "HHR",
      "Impala",
      "Malibu",
      "Silverado 1500",
      "Silverado 2500 HD",
      "Silverado 3500 HD",
      "Sonic",
      "Spark",
      "Suburban",
      "Tahoe",
      "Trailblazer",
      "Traverse",
      "Trax"
    ]
  },
  {
    "make": "Chrysler",
    "models": [
      "300",
      "Pacifica",
      "Voyager"
    ]
  },
  {
    "make": "Citroen",
    "models": [
      "C-Elysee",
      "C3",
      "C4",
      "C5 Aircross",
      "DS3"
    ]
  },
  {
    "make": "DFSK",
    "models": [
      "Glory 500",
      "Glory 560",
      "Glory 580",
      "iX5"
    ]
  },
  {
    "make": "Daihatsu",
    "models": [
      "Charade",
      "Mira",
      "Sirion",
      "Terios"
    ]
  },
  {
    "make": "Denza",
    "models": [
      "D9",
      "N7",
      "N8"
    ]
  },
  {
    "make": "Dodge",
    "models": [
      "Challenger",
      "Charger",
      "Durango",
      "Hornet",
      "Journey"
    ]
  },
  {
    "make": "DongFeng",
    "models": [
      "Aeolus",
      "Glory",
      "Huge",
      "T5 EVO",
      "T5L"
    ]
  },
  {
    "make": "Exeed",
    "models": [
      "LX",
      "RX",
      "TXL",
      "VX"
    ]
  },
  {
    "make": "Fengon",
    "models": [
      "580",
      "iX5",
      "iX7"
    ]
  },
  {
    "make": "Ferrari",
    "models": [
      "296",
      "488",
      "812",
      "California",
      "F12",
      "F8",
      "GTC4Lusso",
      "Portofino",
      "Purosangue",
      "Roma",
      "SF90"
    ]
  },
  {
    "make": "Fiat",
    "models": [
      "500",
      "500X",
      "Doblo",
      "Ducato",
      "Panda",
      "Tipo"
    ]
  },
  {
    "make": "Force",
    "models": [
      "Gurkha",
      "Traveller"
    ]
  },
  {
    "make": "Forthing",
    "models": [
      "Friday",
      "T5",
      "T5 EVO",
      "Yacht"
    ]
  },
  {
    "make": "Foton",
    "models": [
      "Toano",
      "Tunland",
      "View"
    ]
  },
  {
    "make": "Fuso",
    "models": [
      "Canter",
      "Rosa"
    ]
  },
  {
    "make": "GAC",
    "models": [
      "Empow",
      "GS3",
      "GS4",
      "GS5",
      "GS8",
      "M8"
    ]
  },
  {
    "make": "GMC",
    "models": [
      "Acadia",
      "Canyon",
      "Hummer EV",
      "Sierra",
      "Terrain",
      "Yukon"
    ]
  },
  {
    "make": "GWM",
    "models": [
      "Cannon",
      "Poer",
      "Wingle"
    ]
  },
  {
    "make": "Geely",
    "models": [
      "Coolray",
      "Emgrand",
      "Monjaro",
      "Okavango",
      "Preface",
      "Starray",
      "Tugella"
    ]
  },
  {
    "make": "Genesis",
    "models": [
      "G70",
      "G80",
      "G90",
      "GV60",
      "GV70",
      "GV80"
    ]
  },
  {
    "make": "Haval",
    "models": [
      "Dargo",
      "H2",
      "H6",
      "H9",
      "Jolion"
    ]
  },
  {
    "make": "Higer",
    "models": [
      "Bus"
    ]
  },
  {
    "make": "Hino",
    "models": [
      "300",
      "500",
      "700"
    ]
  },
  {
    "make": "Holden",
    "models": [
      "Caprice",
      "Commodore"
    ]
  },
  {
    "make": "Honda",
    "models": [
      "Accord",
      "CR-V",
      "City",
      "Civic",
      "Crosstour",
      "HR-V",
      "Jazz",
      "Odyssey",
      "Passport",
      "Pilot",
      "S2000",
      "ZR-V"
    ]
  },
  {
    "make": "Hongqi",
    "models": [
      "E-HS9",
      "H5",
      "H9",
      "HS5",
      "HS7"
    ]
  },
  {
    "make": "Hummer",
    "models": [
      "H2",
      "H3",
      "Hummer EV"
    ]
  },
  {
    "make": "Hyundai",
    "models": [
      "Accent",
      "Avante",
      "Azera",
      "Casper",
      "Centennial",
      "Creta",
      "Elantra",
      "Genesis",
      "Getz",
      "Grand Creta",
      "Grand Santa Fe",
      "Grand Starex",
      "Grand i10",
      "Grandeur",
      "H1",
      "H100",
      "HD 46",
      "Ioniq",
      "Ioniq 5",
      "Ioniq 6",
      "Kona",
      "Palisade",
      "Porter",
      "Santa Fe",
      "Sonata",
      "Stargazer",
      "Staria",
      "Tucson",
      "Veloster",
      "Venue",
      "Veracruz",
      "i10",
      "i20",
      "i30"
    ]
  },
  {
    "make": "INEOS",
    "models": [
      "Grenadier"
    ]
  },
  {
    "make": "Infiniti",
    "models": [
      "Q30",
      "Q50",
      "Q60",
      "Q70",
      "QX30",
      "QX50",
      "QX55",
      "QX60",
      "QX70",
      "QX80"
    ]
  },
  {
    "make": "Isuzu",
    "models": [
      "D-Max",
      "MU-X",
      "NPR",
      "NQR"
    ]
  },
  {
    "make": "Iveco",
    "models": [
      "Daily"
    ]
  },
  {
    "make": "JAC",
    "models": [
      "JS2",
      "JS3",
      "JS4",
      "JS6",
      "S3",
      "S4",
      "S7",
      "T8"
    ]
  },
  {
    "make": "JAECOO",
    "models": [
      "J5",
      "J7",
      "J8"
    ]
  },
  {
    "make": "JMC",
    "models": [
      "Carrying",
      "Grand Avenue",
      "Vigus"
    ]
  },
  {
    "make": "Jaguar",
    "models": [
      "E-Pace",
      "F-Pace",
      "F-Type",
      "I-Pace",
      "XE",
      "XF",
      "XJ"
    ]
  },
  {
    "make": "Jeep",
    "models": [
      "Cherokee",
      "Commander",
      "Compass",
      "Gladiator",
      "Grand Cherokee",
      "Grand Cherokee L",
      "Grand Wagoneer",
      "Patriot",
      "Renegade",
      "Wagoneer",
      "Wrangler"
    ]
  },
  {
    "make": "KTM",
    "models": [
      "X-Bow"
    ]
  },
  {
    "make": "Kaiyi",
    "models": [
      "E5",
      "X3",
      "X7"
    ]
  },
  {
    "make": "Karry",
    "models": [
      "Dolphin",
      "K50",
      "K60",
      "Q22",
      "Q26"
    ]
  },
  {
    "make": "Kia",
    "models": [
      "Carens",
      "Carnival",
      "Cerato",
      "EV9",
      "Forte",
      "K3",
      "K4",
      "K5",
      "K7",
      "K8",
      "K900",
      "Mohave",
      "Niro",
      "Optima",
      "Pegas",
      "Picanto",
      "Rio",
      "Sedona",
      "Seltos",
      "Sonet",
      "Sorento",
      "Soul",
      "Sportage",
      "Stinger",
      "Tasman",
      "Telluride"
    ]
  },
  {
    "make": "King Long",
    "models": [
      "Bus"
    ]
  },
  {
    "make": "Koenigsegg",
    "models": [
      "Agera",
      "Jesko",
      "Regera"
    ]
  },
  {
    "make": "Lada",
    "models": [
      "Granta",
      "Niva"
    ]
  },
  {
    "make": "Lamborghini",
    "models": [
      "Aventador",
      "Gallardo",
      "Huracan",
      "Murcielago",
      "Revuelto",
      "Urus"
    ]
  },
  {
    "make": "Lancia",
    "models": [
      "Delta",
      "Ypsilon"
    ]
  },
  {
    "make": "Land Rover",
    "models": [
      {
        "groupName": "Range Rover",
        "models": [
          "Range Rover Vogue",
          "Range Rover Autobiography",
          "Range Rover SV",
          "Range Rover Sport",
          "Range Rover Velar",
          "Range Rover Evoque"
        ]
      },
      {
        "groupName": "Defender",
        "models": [
          "Defender 90",
          "Defender 110",
          "Defender 130",
          "Defender V8"
        ]
      },
      {
        "groupName": "Discovery",
        "models": [
          "Discovery",
          "Discovery Sport"
        ]
      },
      "LR2",
      "LR3",
      "LR4"
    ]
  },
  {
    "make": "Leapmotor",
    "models": [
      "C10",
      "C11",
      "C16",
      "T03"
    ]
  },
  {
    "make": "Lexus",
    "models": [
      "ES Series",
      "GS Series",
      "GX Series",
      "IS Series",
      "LBX",
      "LC Series",
      "LM Series",
      "LS Series",
      "LX Series",
      "NX Series",
      "RC Series",
      "RX Series",
      "TX Series",
      "UX Series"
    ]
  },
  {
    "make": "Li Auto",
    "models": [
      "L6",
      "L7",
      "L8",
      "L9",
      "MEGA"
    ]
  },
  {
    "make": "Lincoln",
    "models": [
      "Aviator",
      "Corsair",
      "MKC",
      "MKS",
      "MKT",
      "MKX",
      "MKZ",
      "Nautilus",
      "Navigator"
    ]
  },
  {
    "make": "Livan",
    "models": [
      "X3 Pro",
      "X6 Pro"
    ]
  },
  {
    "make": "Lotus",
    "models": [
      "Eletre",
      "Elise",
      "Emira",
      "Evora",
      "Exige"
    ]
  },
  {
    "make": "Lucid",
    "models": [
      "Air",
      "Gravity"
    ]
  },
  {
    "make": "Luxeed",
    "models": [
      "R7",
      "S7"
    ]
  },
  {
    "make": "Lynk & Co",
    "models": [
      "01",
      "02",
      "03",
      "05",
      "06",
      "09"
    ]
  },
  {
    "make": "MG",
    "models": [
      "3",
      "5",
      "6",
      "7",
      "9",
      "Cyberster",
      "GT",
      "HS",
      "Marvel R",
      "RX5",
      "RX8",
      "ZS",
      "ZS EV"
    ]
  },
  {
    "make": "MHERO",
    "models": [
      "1"
    ]
  },
  {
    "make": "MINI",
    "models": [
      "Aceman",
      "Clubman",
      "Clubvan",
      "Convertible",
      "Cooper",
      "Countryman",
      "Paceman"
    ]
  },
  {
    "make": "Maextro",
    "models": [
      "S800"
    ]
  },
  {
    "make": "Mahindra",
    "models": [
      "Bolero",
      "Pik Up",
      "Scorpio",
      "Thar",
      "XUV500",
      "XUV700"
    ]
  },
  {
    "make": "Maserati",
    "models": [
      "Ghibli",
      "GranCabrio",
      "GranTurismo",
      "Grecale",
      "Levante",
      "MC20",
      "Quattroporte"
    ]
  },
  {
    "make": "Maxus",
    "models": [
      "D60",
      "D90",
      "G10",
      "G50",
      "T90",
      "V80"
    ]
  },
  {
    "make": "Maybach",
    "models": [
      "GLS",
      "S-Class"
    ]
  },
  {
    "make": "McLaren",
    "models": [
      "570S",
      "600LT",
      "650S",
      "675LT",
      "720S",
      "750S",
      "765LT",
      "Artura",
      "GT",
      "P1"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "models": [
      {
        "groupName": "A-Class / B-Class",
        "models": [
          "A 200",
          "A 250",
          "A 35 AMG",
          "A 45 AMG",
          "B 200"
        ]
      },
      {
        "groupName": "C-Class",
        "models": [
          "C 180",
          "C 200",
          "C 250",
          "C 300",
          "C 43 AMG",
          "C 63 AMG"
        ]
      },
      {
        "groupName": "E-Class",
        "models": [
          "E 200",
          "E 250",
          "E 300",
          "E 350",
          "E 400",
          "E 450",
          "E 53 AMG",
          "E 63 AMG"
        ]
      },
      {
        "groupName": "S-Class",
        "models": [
          "S 350",
          "S 400",
          "S 450",
          "S 500",
          "S 550",
          "S 560",
          "S 580",
          "S 63 AMG",
          "S 65 AMG",
          "Maybach S-Class"
        ]
      },
      {
        "groupName": "G-Class",
        "models": [
          "G 500",
          "G 55 AMG",
          "G 63 AMG",
          "G 65 AMG",
          "G 400d",
          "G 580 with EQ"
        ]
      },
      {
        "groupName": "GLA / GLB / GLC",
        "models": [
          "GLA 250",
          "GLA 45 AMG",
          "GLB 250",
          "GLC 200",
          "GLC 300",
          "GLC 43 AMG",
          "GLC 63 AMG",
          "GLC Coupe"
        ]
      },
      {
        "groupName": "GLE / GLS / ML",
        "models": [
          "ML 350",
          "ML 500",
          "ML 63 AMG",
          "GLE 350",
          "GLE 450",
          "GLE 53 AMG",
          "GLE 63 AMG",
          "GLE Coupe",
          "GLS 450",
          "GLS 580",
          "GLS 63 AMG",
          "Maybach GLS"
        ]
      },
      {
        "groupName": "Coupes & Roadsters",
        "models": [
          "CLA 250",
          "CLA 45 AMG",
          "CLS 350",
          "CLS 450",
          "CLS 53 AMG",
          "CLS 63 AMG",
          "CLE-Class",
          "SL 43 AMG",
          "SL 55 AMG",
          "SL 63 AMG",
          "SLK-Class",
          "SLC-Class",
          "SLS",
          "AMG GT"
        ]
      },
      "CLA-Class",
      "CLS-Class",
      "EQA",
      "EQB",
      "EQC",
      "EQE",
      "EQS",
      "GLA-Class",
      "GLB-Class",
      "GLC-Class",
      "GLE-Class",
      "GLS-Class",
      "SL-Class",
      "Sprinter",
      "V-Class",
      "Viano",
      "Vito",
      "X-Class"
    ]
  },
  {
    "make": "Mercedes-Maybach",
    "models": [
      "GLS",
      "S-Class"
    ]
  },
  {
    "make": "Mercury",
    "models": [
      "Grand Marquis",
      "Milan"
    ]
  },
  {
    "make": "Mitsubishi",
    "models": [
      "ASX",
      "Attrage",
      "Canter",
      "Eclipse Cross",
      "Galant",
      "L200",
      "Lancer",
      "Lancer EX",
      "Lancer Evolution",
      "Mirage",
      "Montero",
      "Montero Sport",
      "Nativa",
      "Outlander",
      "Outlander Sport",
      "Pajero",
      "Pajero Sport",
      "Rosa",
      "Xpander",
      "Xpander Cross"
    ]
  },
  {
    "make": "Morgan",
    "models": [
      "3 Wheeler",
      "Plus Four",
      "Plus Six"
    ]
  },
  {
    "make": "Nio",
    "models": [
      "ES6",
      "ES7",
      "ES8",
      "ET5",
      "ET7"
    ]
  },
  {
    "make": "Nissan",
    "models": [
      "300ZX",
      "370Z",
      "Altima",
      "Armada",
      "Frontier",
      "GT-R",
      "Juke",
      "Kicks",
      "Maxima",
      "Micra",
      "Murano",
      "Navara",
      "Pathfinder",
      "Patrol",
      "Patrol Safari",
      "Qashqai",
      "Rogue",
      "Rogue Sport",
      "Sentra",
      "Sunny",
      "Teana",
      "Tiida",
      "Titan",
      "Urvan",
      "Versa",
      "X-Trail",
      "Xterra",
      "Z"
    ]
  },
  {
    "make": "OMODA",
    "models": [
      "C5",
      "C7"
    ]
  },
  {
    "make": "Opel",
    "models": [
      "Astra",
      "Corsa",
      "Crossland",
      "Grandland",
      "Mokka",
      "Zafira"
    ]
  },
  {
    "make": "Peugeot",
    "models": [
      "2008",
      "208",
      "3008",
      "301",
      "308",
      "408",
      "5008",
      "508",
      "Partner",
      "Traveller"
    ]
  },
  {
    "make": "Polaris",
    "models": [
      "RZR",
      "Slingshot"
    ]
  },
  {
    "make": "Polestar",
    "models": [
      "2",
      "3",
      "4"
    ]
  },
  {
    "make": "Pontiac",
    "models": [
      "Firebird",
      "GTO",
      "Trans Am"
    ]
  },
  {
    "make": "Porsche",
    "models": [
      {
        "groupName": "911",
        "models": [
          "911 Carrera",
          "911 Carrera S",
          "911 Carrera 4S",
          "911 GTS",
          "911 Turbo",
          "911 Turbo S",
          "911 GT3",
          "911 GT3 RS"
        ]
      },
      {
        "groupName": "Cayenne",
        "models": [
          "Cayenne Base",
          "Cayenne S",
          "Cayenne GTS",
          "Cayenne Turbo",
          "Cayenne Turbo GT",
          "Cayenne E-Hybrid",
          "Cayenne Coupe"
        ]
      },
      {
        "groupName": "Macan",
        "models": [
          "Macan Base",
          "Macan T",
          "Macan S",
          "Macan GTS",
          "Macan EV"
        ]
      },
      {
        "groupName": "Panamera",
        "models": [
          "Panamera Base",
          "Panamera 4S",
          "Panamera GTS",
          "Panamera Turbo",
          "Panamera Turbo S"
        ]
      },
      {
        "groupName": "718 / Boxster / Cayman",
        "models": [
          "718 Boxster",
          "718 Cayman",
          "718 Cayman GTS",
          "718 GT4",
          "718 GT4 RS"
        ]
      },
      {
        "groupName": "Taycan",
        "models": [
          "Taycan Base",
          "Taycan 4S",
          "Taycan GTS",
          "Taycan Turbo",
          "Taycan Turbo S",
          "Taycan Cross Turismo"
        ]
      },
      "Carrera GT"
    ]
  },
  {
    "make": "RAM",
    "models": [
      "1500",
      "2500",
      "3500",
      "TRX"
    ]
  },
  {
    "make": "ROX",
    "models": [
      "01"
    ]
  },
  {
    "make": "Rabdan",
    "models": [
      "One",
      "Terra"
    ]
  },
  {
    "make": "Renault",
    "models": [
      "Arkana",
      "Captur",
      "Clio",
      "Duster",
      "Koleos",
      "Master",
      "Megane",
      "Symbol",
      "Talisman",
      "Trafic"
    ]
  },
  {
    "make": "Riddara",
    "models": [
      "RD6"
    ]
  },
  {
    "make": "Roewe",
    "models": [
      "RX5",
      "RX8",
      "i5",
      "i6"
    ]
  },
  {
    "make": "SAIC",
    "models": [
      "Maxus D60",
      "Maxus D90",
      "Maxus G10",
      "Maxus G50"
    ]
  },
  {
    "make": "Scion",
    "models": [
      "FR-S",
      "tC",
      "xB"
    ]
  },
  {
    "make": "Seres",
    "models": [
      "3",
      "5",
      "7"
    ]
  },
  {
    "make": "Shelby",
    "models": [
      "Cobra",
      "GT500",
      "Super Snake"
    ]
  },
  {
    "make": "Skoda",
    "models": [
      "Fabia",
      "Kamiq",
      "Karoq",
      "Kodiaq",
      "Octavia",
      "Scala",
      "Superb"
    ]
  },
  {
    "make": "Skywell",
    "models": [
      "BE11",
      "ET5"
    ]
  },
  {
    "make": "Smart",
    "models": [
      "#1",
      "#3",
      "Forfour",
      "Fortwo"
    ]
  },
  {
    "make": "Soueast",
    "models": [
      "DX3",
      "DX5",
      "DX7",
      "S09"
    ]
  },
  {
    "make": "Spruce",
    "models": [
      "S1",
      "S3"
    ]
  },
  {
    "make": "SsangYong",
    "models": [
      "Actyon",
      "Korando",
      "Musso",
      "Rexton",
      "Tivoli"
    ]
  },
  {
    "make": "Stelato",
    "models": [
      "S9"
    ]
  },
  {
    "make": "Subaru",
    "models": [
      "BRZ",
      "Forester",
      "Impreza",
      "Legacy",
      "Outback",
      "WRX",
      "XV"
    ]
  },
  {
    "make": "Suzuki",
    "models": [
      "Alto",
      "Baleno",
      "Celerio",
      "Ciaz",
      "Ertiga",
      "Fronx",
      "Grand Vitara",
      "Jimny",
      "Swift",
      "Vitara",
      "XL7"
    ]
  },
  {
    "make": "TANK",
    "models": [
      "300",
      "500",
      "700"
    ]
  },
  {
    "make": "TATA",
    "models": [
      "Altroz",
      "Harrier",
      "Nexon",
      "Punch",
      "Safari",
      "Tiago",
      "Tigor"
    ]
  },
  {
    "make": "Tesla",
    "models": [
      "Cybertruck",
      "Model 3",
      "Model S",
      "Model X",
      "Model Y"
    ]
  },
  {
    "make": "Toyota",
    "models": [
      "4Runner",
      "86",
      "Allion",
      "Alphard",
      "Aurion",
      "Avalon",
      "Avanza",
      "C-HR",
      "Camry",
      "Celica",
      "Century",
      "Coaster",
      "Corolla",
      "Corolla Cross",
      "Corona",
      "Cresta",
      "Crown",
      "Crown Kluger",
      "FJ Cruiser",
      "Fortuner",
      "GR86",
      "Grand Highlander",
      "Granvia",
      "Hiace",
      "Highlander",
      "Hilux",
      "Innova",
      "Land Cruiser",
      "Land Cruiser 70 Series",
      "Lite Ace",
      "MR2",
      "Mirai",
      "Prado",
      "Previa",
      "Prius",
      "RAV4",
      "Raize",
      "Rush",
      "Sequoia",
      "Sienna",
      "Supra",
      "Tacoma",
      "Tundra",
      "Urban Cruiser",
      "Veloz",
      "Vios",
      "Wish",
      "Yaris",
      "Zelas",
      "bZ3X",
      "bZ4X",
      "iQ"
    ]
  },
  {
    "make": "Victory",
    "models": [
      "V1",
      "V2",
      "V3",
      "V5"
    ]
  },
  {
    "make": "Volkswagen",
    "models": [
      "Amarok",
      "Atlas",
      "Beetle",
      "Bora",
      "CC",
      "Caddy",
      "Crafter",
      "Eos",
      "Golf",
      "Golf GTI",
      "Golf R",
      "ID.3",
      "ID.4",
      "ID.7",
      "Jetta",
      "Kombi",
      "Passat",
      "Polo",
      "Scirocco",
      "T-Roc",
      "Taigo",
      "Teramont",
      "Tiguan",
      "Touareg",
      "Transporter"
    ]
  },
  {
    "make": "Volvo",
    "models": [
      "EX30",
      "EX40",
      "EX90",
      "S60",
      "S90",
      "V40",
      "V60",
      "V90",
      "XC40",
      "XC60",
      "XC90"
    ]
  },
  {
    "make": "Voyah",
    "models": [
      "Dream",
      "Free",
      "Passion"
    ]
  },
  {
    "make": "WEY",
    "models": [
      "Coffee 01",
      "Coffee 02"
    ]
  },
  {
    "make": "XPeng",
    "models": [
      "G3",
      "G6",
      "G9",
      "P5",
      "P7"
    ]
  },
  {
    "make": "Xiaomi",
    "models": [
      "SU7",
      "YU7"
    ]
  },
  {
    "make": "Yamaha",
    "models": [
      "Raptor"
    ]
  },
  {
    "make": "YangWang",
    "models": [
      "U8",
      "U9"
    ]
  },
  {
    "make": "Yipai",
    "models": [
      "eπ007",
      "eπ008"
    ]
  },
  {
    "make": "ZXAUTO",
    "models": [
      "Grand Tiger",
      "Terralord"
    ]
  },
  {
    "make": "Zeekr",
    "models": [
      "001",
      "009",
      "7X",
      "X"
    ]
  },
  {
    "make": "Other",
    "models": [
      "Other"
    ]
  }
]
};

export const years = Array.from({ length: 35 }, (_, i) => new Date().getFullYear() + 1 - i);
