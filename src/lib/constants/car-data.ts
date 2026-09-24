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
      make: 'BMW',
      models: [
        {
          groupName: '1 Series',
          models: ['116', '118', '120', '125', '135', 'M135i', 'M140i']
        },
        {
          groupName: '2 Series',
          models: ['218', '220', '228', '230', '235', '240', 'M2', 'M240i', '2 Series Gran Coupe']
        },
        {
          groupName: '3 Series',
          models: ['318', '320', '325', '328', '330', '335', '340', 'M3', 'M340i']
        },
        {
          groupName: '4 Series',
          models: ['420', '428', '430', '435', '440', 'M4', '4 Series Gran Coupe']
        },
        {
          groupName: '5 Series',
          models: ['520', '523', '525', '528', '530', '535', '540', '550', 'M5', 'M550i']
        },
        {
          groupName: '6 Series',
          models: ['630', '640', '645', '650', 'M6', '6 Series Gran Coupe', '6 Series GT']
        },
        {
          groupName: '7 Series',
          models: ['730', '735', '740', '745', '750', '760', 'M760Li', 'i7']
        },
        {
          groupName: '8 Series',
          models: ['840', '850', 'M8', '8 Series Gran Coupe']
        },
        {
          groupName: 'X Series (SUV)',
          models: ['X1', 'X2', 'X3', 'X3 M', 'X4', 'X4 M', 'X5', 'X5 M', 'X6', 'X6 M', 'X7', 'XM']
        },
        {
          groupName: 'Z Series / i Series',
          models: ['Z4', 'i4', 'iX', 'iX3', 'i8']
        }
      ]
    },
    {
      make: 'Mercedes-Benz',
      models: [
        {
          groupName: 'A-Class / B-Class',
          models: ['A 200', 'A 250', 'A 35 AMG', 'A 45 AMG', 'B 200']
        },
        {
          groupName: 'C-Class',
          models: ['C 180', 'C 200', 'C 250', 'C 300', 'C 43 AMG', 'C 63 AMG']
        },
        {
          groupName: 'E-Class',
          models: ['E 200', 'E 250', 'E 300', 'E 350', 'E 400', 'E 450', 'E 53 AMG', 'E 63 AMG']
        },
        {
          groupName: 'S-Class',
          models: ['S 350', 'S 400', 'S 450', 'S 500', 'S 550', 'S 560', 'S 580', 'S 63 AMG', 'S 65 AMG', 'Maybach S-Class']
        },
        {
          groupName: 'G-Class (Geländewagen)',
          models: ['G 500', 'G 55 AMG', 'G 63 AMG', 'G 65 AMG', 'G 400d', 'G 580 with EQ']
        },
        {
          groupName: 'GLA / GLB / GLC',
          models: ['GLA 250', 'GLA 45 AMG', 'GLB 250', 'GLC 200', 'GLC 300', 'GLC 43 AMG', 'GLC 63 AMG']
        },
        {
          groupName: 'GLE / GLS / ML',
          models: ['ML 350', 'ML 500', 'ML 63 AMG', 'GLE 350', 'GLE 450', 'GLE 53 AMG', 'GLE 63 AMG', 'GLS 450', 'GLS 580', 'GLS 63 AMG', 'Maybach GLS']
        },
        {
          groupName: 'Coupes / Roadsters (AMG GT, SL, CLS, CLA)',
          models: ['CLA 250', 'CLA 45 AMG', 'CLS 350', 'CLS 450', 'CLS 53 AMG', 'CLS 63 AMG', 'SL 43 AMG', 'SL 55 AMG', 'SL 63 AMG', 'AMG GT', 'AMG GT 4-Door']
        }
      ]
    },
    {
      make: 'Porsche',
      models: [
        {
          groupName: '911',
          models: ['911 Carrera', '911 Carrera S', '911 Carrera 4S', '911 GTS', '911 Turbo', '911 Turbo S', '911 GT3', '911 GT3 RS']
        },
        {
          groupName: 'Cayenne',
          models: ['Cayenne Base', 'Cayenne S', 'Cayenne GTS', 'Cayenne Turbo', 'Cayenne Turbo GT', 'Cayenne E-Hybrid', 'Cayenne Coupe']
        },
        {
          groupName: 'Macan',
          models: ['Macan Base', 'Macan T', 'Macan S', 'Macan GTS', 'Macan EV']
        },
        {
          groupName: 'Panamera',
          models: ['Panamera Base', 'Panamera 4S', 'Panamera GTS', 'Panamera Turbo', 'Panamera Turbo S']
        },
        {
          groupName: '718 / Boxster / Cayman',
          models: ['718 Boxster', '718 Cayman', '718 Cayman GTS', '718 GT4', '718 GT4 RS']
        },
        {
          groupName: 'Taycan',
          models: ['Taycan Base', 'Taycan 4S', 'Taycan GTS', 'Taycan Turbo', 'Taycan Turbo S', 'Taycan Cross Turismo']
        }
      ]
    },
    {
      make: 'Toyota',
      models: [
        {
          groupName: 'Land Cruiser / SUV',
          models: ['Land Cruiser 300', 'Land Cruiser 200', 'Land Cruiser 70 Series', 'Land Cruiser Prado', 'Fortuner', 'RAV4', 'Highlander', 'Rush']
        },
        {
          groupName: 'Sedans',
          models: ['Camry', 'Corolla', 'Yaris', 'Crown', 'Avalon']
        },
        {
          groupName: 'Trucks & Vans',
          models: ['Hilux', 'Tundra', 'Hiace', 'Granvia']
        },
        {
          groupName: 'Sports',
          models: ['GR Supra', 'GR Yaris', 'GR86']
        }
      ]
    },
    {
      make: 'Nissan',
      models: [
        {
          groupName: 'Patrol / SUV',
          models: ['Patrol Y63', 'Patrol Y62', 'Patrol Safari (Super Safari)', 'Patrol Nismo', 'Pathfinder', 'X-Trail', 'Kicks']
        },
        {
          groupName: 'Sedans',
          models: ['Altima', 'Maxima', 'Sunny', 'Sentra']
        },
        {
          groupName: 'Sports & Trucks',
          models: ['GT-R (R35)', 'Nissan Z', 'Navara']
        }
      ]
    },
    {
      make: 'Land Rover',
      models: [
        {
          groupName: 'Range Rover',
          models: ['Range Rover Vogue', 'Range Rover Autobiography', 'Range Rover SV', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque']
        },
        {
          groupName: 'Defender',
          models: ['Defender 90', 'Defender 110', 'Defender 130', 'Defender V8']
        },
        {
          groupName: 'Discovery',
          models: ['Discovery', 'Discovery Sport']
        }
      ]
    },
    {
      make: 'Audi',
      models: [
        {
          groupName: 'A Series',
          models: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8']
        },
        {
          groupName: 'Q Series (SUV)',
          models: ['Q3', 'Q5', 'Q7', 'Q8', 'e-tron']
        },
        {
          groupName: 'S / RS Performance',
          models: ['RS3', 'RS4', 'RS5', 'RS6 Avant', 'RS7', 'RS Q8', 'R8']
        }
      ]
    },
    {
      make: 'Lexus',
      models: [
        {
          groupName: 'LX / GX / RX (SUVs)',
          models: ['LX 600', 'LX 570', 'GX 550', 'GX 460', 'RX 350', 'RX 500h', 'NX 350']
        },
        {
          groupName: 'ES / LS / IS (Sedans)',
          models: ['ES 350', 'LS 500', 'IS 300', 'IS 350', 'IS 500']
        },
        {
          groupName: 'Coupes',
          models: ['LC 500', 'RC F']
        }
      ]
    },
    {
      make: 'Ford',
      models: [
        {
          groupName: 'Trucks / Raptor',
          models: ['F-150', 'F-150 Raptor', 'Ranger', 'Ranger Raptor', 'Super Duty']
        },
        {
          groupName: 'SUVs',
          models: ['Bronco', 'Bronco Raptor', 'Explorer', 'Expedition', 'Edge', 'Territory']
        },
        {
          groupName: 'Performance',
          models: ['Mustang GT', 'Mustang Dark Horse', 'Shelby GT500']
        }
      ]
    },
    {
      make: 'Volkswagen',
      models: [
        'Golf R', 'Golf GTI', 'Touareg', 'Tiguan', 'Teramont', 'T-Roc', 'Passat', 'Arteon', 'ID.4'
      ]
    },
    {
      make: 'Ferrari',
      models: [
        '296 GTB', 'SF90 Stradale', 'Purosangue', 'F8 Tributo', '812 Superfast', 'Roma', 'Portofino M', '488 GTB', '458 Italia'
      ]
    },
    {
      make: 'Lamborghini',
      models: [
        'Urus', 'Urus Performante', 'Urus S', 'Revuelto', 'Huracan EVO', 'Huracan STO', 'Huracan Tecnica', 'Aventador'
      ]
    },
    {
      make: 'Rolls-Royce',
      models: [
        'Cullinan', 'Ghost', 'Phantom', 'Spectre', 'Wraith', 'Dawn'
      ]
    },
    {
      make: 'Bentley',
      models: [
        'Continental GT', 'Bentayga', 'Flying Spur'
      ]
    },
    {
      make: 'Aston Martin',
      models: [
        'DBX', 'DB12', 'Vantage', 'DBS'
      ]
    },
    {
      make: 'McLaren',
      models: [
        '750S', '720S', 'Artura', 'GT', '600LT'
      ]
    },
    {
      make: 'Other',
      models: ['Other']
    }
  ]
};

export const years = Array.from({ length: 35 }, (_, i) => new Date().getFullYear() + 1 - i);
