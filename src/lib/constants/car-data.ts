// GCC automotive brands and models
export const carData = {
  makes: [
    {
      make: 'Toyota',
      models: ['Camry', 'Corolla', 'Land Cruiser', 'Prado', 'Yaris', 'Hilux', 'Fortuner', 'RAV4']
    },
    {
      make: 'Nissan',
      models: ['Altima', 'Maxima', 'Patrol', 'Terra', 'X-Trail', 'Juke', 'Sentra', 'Navara']
    },
    {
      make: 'Porsche',
      models: ['911', 'Boxster', 'Cayman', 'Cayenne', 'Macan', 'Panamera', 'Taycan']
    },
    {
      make: 'Mercedes-Benz',
      models: ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class']
    },
    {
      make: 'BMW',
      models: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7']
    },
    {
      make: 'Land Rover',
      models: ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Velar']
    },
    {
      make: 'Audi',
      models: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron']
    },
    {
      make: 'Ford',
      models: ['Focus', 'Fusion', 'Mustang', 'Escape', 'Explorer', 'Edge', 'Ranger', 'Everest']
    },
    {
      make: 'Lexus',
      models: ['CT', 'ES', 'IS', 'GS', 'LS', 'NX', 'RX', 'GX', 'LX', 'UX', 'LC', 'RC']
    }
  ]
};

// Years range: current year down to 1990
export const years = (() => {
  const currentYear = new Date().getFullYear();
  const yearsArray: number[] = [];
  for (let year = currentYear; year >= 1990; year--) {
    yearsArray.push(year);
  }
  return yearsArray;
})();

// Mileage intervals: up to 300,000 km in 10,000 km increments
export const mileageIntervals = (() => {
  const intervals: number[] = [];
  for (let mileage = 0; mileage <= 300000; mileage += 10000) {
    intervals.push(mileage);
  }
  return intervals;
})();

// Helper function to get models for a given make
export const getModelsByMake = (make: string): string[] => {
  const makeData = carData.makes.find((m) => m.make === make);
  return makeData ? makeData.models : [];
};