export interface CarMake {
  make: string;
  models: string[];
}

export const carData: { makes: CarMake[] } = {
  makes: [
    {
      make: 'Toyota',
      models: ['Land Cruiser', 'Land Cruiser 70 / 79', 'Prado', 'Hilux', 'Camry', 'Corolla', 'Corolla Cross', 'Yaris', 'RAV4', 'Fortuner', 'Highlander', 'FJ Cruiser', 'Supra', 'Crown', 'Innova', 'Avanza', 'Rush', 'Hiace', 'Other'],
    },
    {
      make: 'Nissan',
      models: ['Patrol', 'Patrol Safari / Super Safari', 'Altima', 'Sunny', 'X-Trail', 'Pathfinder', 'Maxima', 'Kicks', 'Navara', 'GT-R', 'Z', '370Z', 'Armada', 'Urvan', 'X-Terra', 'Other'],
    },
    {
      make: 'Mercedes-Benz',
      models: ['G-Class', 'G63 AMG', 'S-Class', 'E-Class', 'C-Class', 'A-Class', 'GLE', 'GLE Coupe', 'GLC', 'GLC Coupe', 'GLS', 'Maybach S-Class', 'Maybach GLS', 'CLA', 'CLS', 'AMG GT', 'AMG GT 4-Door', 'SL-Class', 'SLK / SLC', 'EQS', 'EQE', 'V-Class', 'Other'],
    },
    {
      make: 'Porsche',
      models: ['911', '911 Carrera', '911 Carrera S', '911 Turbo', '911 Turbo S', '911 GT3', '911 GT3 RS', 'Cayenne', 'Cayenne Coupe', 'Cayenne GTS', 'Cayenne Turbo', 'Macan', 'Macan GTS', 'Panamera', 'Taycan', '718 Cayman', '718 Cayman GT4', '718 Boxster', 'Other'],
    },
    {
      make: 'Land Rover',
      models: ['Range Rover', 'Range Rover Autobiography', 'Range Rover SV', 'Range Rover Sport', 'Range Rover Sport SVR', 'Defender 90', 'Defender 110', 'Defender 130', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery', 'Discovery Sport', 'Other'],
    },
    {
      make: 'BMW',
      models: ['X5', 'X5 M', 'X6', 'X6 M', 'X7', 'X3', 'X4', 'X1', 'X2', 'XM', '7 Series', '5 Series', '3 Series', '4 Series', '8 Series', 'M3', 'M4', 'M5', 'M8', 'M2', 'i4', 'i7', 'iX', 'Z4', 'Other'],
    },
    {
      make: 'Lexus',
      models: ['LX 600', 'LX 570', 'GX 550', 'GX 460', 'RX 350', 'RX 500h', 'NX 350', 'NX 300', 'ES 350', 'ES 300h', 'IS 350', 'IS 300', 'LS 500', 'LC 500', 'UX 200', 'TX', 'Other'],
    },
    {
      make: 'Ford',
      models: ['F-150', 'F-150 Raptor', 'F-150 Raptor R', 'Mustang', 'Mustang GT', 'Mustang Dark Horse', 'Shelby GT500', 'Explorer', 'Expedition', 'Bronco', 'Bronco Raptor', 'Ranger', 'Ranger Raptor', 'Edge', 'Territory', 'Everest', 'Taurus', 'Other'],
    },
    {
      make: 'Audi',
      models: ['RS Q8', 'Q8', 'Q7', 'Q5', 'Q3', 'RS6 Avant', 'RS7', 'RS5', 'RS3', 'A8', 'A7', 'A6', 'A5', 'A4', 'R8', 'e-tron GT', 'RS e-tron GT', 'Other'],
    },
    {
      make: 'Volkswagen',
      models: ['Golf R', 'Golf GTI', 'Golf', 'Touareg', 'Tiguan', 'Teramont', 'T-Roc', 'Passat', 'Arteon', 'ID.4', 'ID.6', 'Other'],
    },
    {
      make: 'Hyundai',
      models: ['Tucson', 'Santa Fe', 'Palisade', 'Elantra', 'Sonata', 'Accent', 'Creta', 'Kona', 'Staria', 'Azera', 'Ioniq 5', 'Ioniq 6', 'Other'],
    },
    {
      make: 'Kia',
      models: ['Sportage', 'Sorento', 'Telluride', 'K5', 'K8', 'Cerato', 'Pegas', 'Seltos', 'Carnival', 'EV6', 'EV9', 'Sonet', 'Other'],
    },
    {
      make: 'Chevrolet',
      models: ['Tahoe', 'Suburban', 'Corvette Stingray', 'Corvette Z06', 'Camaro', 'Silverado', 'Silverado ZR2', 'Traverse', 'Captiva', 'Groove', 'Blazer', 'Other'],
    },
    {
      make: 'GMC',
      models: ['Yukon', 'Yukon Denali', 'Sierra 1500', 'Sierra Denali', 'Sierra AT4', 'Acadia', 'Terrain', 'Hummer EV SUV', 'Hummer EV Pickup', 'Other'],
    },
    {
      make: 'Jeep',
      models: ['Wrangler', 'Wrangler Rubicon', 'Wrangler 392', 'Grand Cherokee', 'Grand Cherokee L', 'Gladiator', 'Gladiator Rubicon', 'Wagoneer', 'Grand Wagoneer', 'Compass', 'Other'],
    },
    {
      make: 'Mitsubishi',
      models: ['Pajero', 'Outlander', 'Montero Sport', 'Eclipse Cross', 'ASX', 'Attrage', 'Mirage', 'L200', 'Other'],
    },
    {
      make: 'Cadillac',
      models: ['Escalade', 'Escalade-V', 'CT5', 'CT5-V Blackwing', 'CT4', 'XT6', 'XT5', 'XT4', 'Lyriq', 'Other'],
    },
    {
      make: 'Dodge',
      models: ['Charger', 'Charger Hellcat', 'Challenger', 'Challenger Hellcat', 'Durango', 'Durango Hellcat', 'RAM 1500', 'RAM TRX', 'Other'],
    },
    {
      make: 'Ferrari',
      models: ['296 GTB', '296 GTS', 'SF90 Stradale', 'SF90 Spider', 'Purosangue', 'F8 Tributo', 'F8 Spider', 'Roma', 'Roma Spider', '812 Superfast', '812 GTS', '488 GTB', 'Portofino M', 'Other'],
    },
    {
      make: 'Lamborghini',
      models: ['Urus', 'Urus Performante', 'Urus S', 'Huracan Evo', 'Huracan STO', 'Huracan Tecnica', 'Revuelto', 'Aventador', 'Aventador SVJ', 'Other'],
    },
    {
      make: 'Rolls-Royce',
      models: ['Cullinan', 'Cullinan Black Badge', 'Ghost', 'Ghost Black Badge', 'Phantom', 'Spectre', 'Wraith', 'Dawn', 'Other'],
    },
    {
      make: 'Bentley',
      models: ['Continental GT', 'Continental GTC', 'Bentayga', 'Bentayga EWB', 'Flying Spur', 'Other'],
    },
    {
      make: 'Aston Martin',
      models: ['DBX', 'DBX 707', 'Vantage', 'DB12', 'DBS Superleggera', 'Other'],
    },
    {
      make: 'Maserati',
      models: ['Grecale', 'Levante', 'Ghibli', 'Quattroporte', 'MC20', 'GranTurismo', 'Other'],
    },
    {
      make: 'McLaren',
      models: ['720S', '750S', 'Artura', 'GT', '765LT', 'Other'],
    },
    {
      make: 'Genesis',
      models: ['GV80', 'GV70', 'G80', 'G70', 'G90', 'GV60', 'Other'],
    },
    {
      make: 'Infiniti',
      models: ['QX80', 'QX60', 'QX55', 'QX50', 'Q50', 'Q60', 'Other'],
    },
    {
      make: 'Jaguar',
      models: ['F-Pace', 'F-Pace SVR', 'F-Type', 'E-Pace', 'XE', 'XF', 'Other'],
    },
    {
      make: 'Volvo',
      models: ['XC90', 'XC60', 'XC40', 'S90', 'EX30', 'EX90', 'Other'],
    },
    {
      make: 'BYD',
      models: ['Atto 3', 'Seal', 'Han', 'Song Plus', 'Tang', 'Dolphin', 'Other'],
    },
    {
      make: 'Geely',
      models: ['Monjaro', 'Tugella', 'Coolray', 'Emgrand', 'Geometry C', 'Other'],
    },
    {
      make: 'Zeekr',
      models: ['001', 'X', '009', 'Other'],
    },
    {
      make: 'MG',
      models: ['MG RX8', 'MG RX5', 'MG Whale', 'MG One', 'MG GT', 'MG ZS', 'MG 4 EV', 'MG Cyberster', 'Other'],
    },
    {
      make: 'Haval / GWM',
      models: ['H6', 'Jolion', 'Dargo', 'Tank 300', 'Tank 500', 'Poer', 'Other'],
    },
    {
      make: 'Changan',
      models: ['CS95', 'CS85', 'CS75 Plus', 'CS35 Plus', 'UNI-K', 'UNI-T', 'UNI-V', 'Other'],
    },
    {
      make: 'Chery / Jetour',
      models: ['Jetour Dashing', 'Jetour T2', 'Jetour X70 Plus', 'Jetour X90 Plus', 'Tiggo 8 Pro', 'Tiggo 7 Pro', 'Other'],
    },
    {
      make: 'Other',
      models: ['Other'],
    },
  ],
};

const currentYear = new Date().getFullYear();
export const years = Array.from({ length: 40 }, (_, i) => currentYear + 1 - i);
