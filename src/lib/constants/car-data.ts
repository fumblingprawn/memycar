export interface CarMake {
  make: string;
  models: string[];
}

export const carData: { makes: CarMake[] } = {
  makes: [
    {
      make: 'Toyota',
      models: ['Land Cruiser', 'Prado', 'Hilux', 'Camry', 'Corolla', 'Yaris', 'RAV4', 'Fortuner', 'Highlander', 'FJ Cruiser', 'Supra', 'Crown', 'Innova', 'Hiace'],
    },
    {
      make: 'Nissan',
      models: ['Patrol', 'Patrol Safari', 'Altima', 'Sunny', 'X-Trail', 'Pathfinder', 'Maxima', 'Kicks', 'Navara', 'GT-R', 'Z', 'Armada', 'Urvan'],
    },
    {
      make: 'Mercedes-Benz',
      models: ['G-Class', 'S-Class', 'E-Class', 'C-Class', 'A-Class', 'GLE', 'GLC', 'GLS', 'CLA', 'CLS', 'AMG GT', 'SL-Class', 'EQS', 'EQE', 'V-Class'],
    },
    {
      make: 'Porsche',
      models: ['911', '911 Carrera', '911 Turbo', '911 GT3', 'Cayenne', 'Cayenne Coupe', 'Macan', 'Panamera', 'Taycan', '718 Cayman', '718 Boxster'],
    },
    {
      make: 'Land Rover',
      models: ['Range Rover', 'Range Rover Sport', 'Defender', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery', 'Discovery Sport'],
    },
    {
      make: 'BMW',
      models: ['X5', 'X6', 'X7', 'X3', 'X4', 'X1', '7 Series', '5 Series', '3 Series', '4 Series', '8 Series', 'M3', 'M4', 'M5', 'M8', 'i4', 'i7', 'iX'],
    },
    {
      make: 'Lexus',
      models: ['LX 600', 'LX 570', 'GX 460', 'GX 550', 'RX 350', 'NX 300', 'ES 350', 'IS 300', 'LS 500', 'LC 500', 'UX 200'],
    },
    {
      make: 'Ford',
      models: ['F-150', 'F-150 Raptor', 'Mustang', 'Explorer', 'Expedition', 'Bronco', 'Ranger', 'Ranger Raptor', 'Edge', 'Territory', 'Everest'],
    },
    {
      make: 'Audi',
      models: ['RS Q8', 'Q8', 'Q7', 'Q5', 'Q3', 'RS6 Avant', 'RS7', 'RS3', 'A8', 'A6', 'A4', 'R8', 'e-tron GT'],
    },
    {
      make: 'Volkswagen',
      models: ['Golf R', 'Golf GTI', 'Golf', 'Touareg', 'Tiguan', 'Teramont', 'T-Roc', 'Passat', 'Arteon', 'ID.4'],
    },
    {
      make: 'Hyundai',
      models: ['Tucson', 'Santa Fe', 'Palisade', 'Elantra', 'Sonata', 'Accent', 'Creta', 'Kona', 'Staria', 'Ioniq 5'],
    },
    {
      make: 'Kia',
      models: ['Sportage', 'Sorento', 'Telluride', 'K5', 'Cerato', 'Pegas', 'Seltos', 'Carnival', 'EV6', 'EV9'],
    },
    {
      make: 'Chevrolet',
      models: ['Tahoe', 'Suburban', 'Corvette', 'Camaro', 'Silverado', 'Traverse', 'Captiva', 'Groove', 'Blazer'],
    },
    {
      make: 'GMC',
      models: ['Yukon', 'Yukon Denali', 'Sierra', 'Sierra Denali', 'Acadia', 'Terrain', 'Hummer EV'],
    },
    {
      make: 'Jeep',
      models: ['Wrangler', 'Wrangler Rubicon', 'Grand Cherokee', 'Gladiator', 'Compass', 'Renegade'],
    },
    {
      make: 'Mitsubishi',
      models: ['Pajero', 'Outlander', 'Montero Sport', 'ASX', 'Eclipse Cross', 'Attrage', 'L200'],
    },
    {
      make: 'Ferrari',
      models: ['296 GTB', 'SF90 Stradale', 'F8 Tributo', 'Roma', 'Purosangue', '812 Superfast', '488 GTB', 'Portofino'],
    },
    {
      make: 'Lamborghini',
      models: ['Urus', 'Urus Performante', 'Huracan', 'Revuelto', 'Aventador'],
    },
    {
      make: 'Rolls-Royce',
      models: ['Cullinan', 'Ghost', 'Phantom', 'Spectre', 'Wraith', 'Dawn'],
    },
    {
      make: 'Bentley',
      models: ['Continental GT', 'Bentayga', 'Flying Spur'],
    },
    {
      make: 'Aston Martin',
      models: ['DBX', 'Vantage', 'DB12', 'DBS Superleggera'],
    },
    {
      make: 'Dodge',
      models: ['Charger', 'Challenger', 'Durango', 'RAM 1500', 'RAM TRX'],
    },
  ],
};

const currentYear = new Date().getFullYear();
export const years = Array.from({ length: 35 }, (_, i) => currentYear + 1 - i);
