// Convert between measurement systems
export const convertMeasurement = (
  value: number,
  fromUnit: 'cm' | 'ft' | 'in',
  toUnit: 'cm' | 'ft' | 'in'
): number => {
  // Convert to cm first
  let valueInCm = value;
  if (fromUnit === 'ft') {
    valueInCm = value * 30.48;
  } else if (fromUnit === 'in') {
    valueInCm = value * 2.54;
  }
  
  // Convert from cm to target unit
  if (toUnit === 'cm') {
    return valueInCm;
  } else if (toUnit === 'ft') {
    return valueInCm / 30.48;
  } else { // inches
    return valueInCm / 2.54;
  }
};

// Format measurement for display
export const formatMeasurement = (
  value: number,
  unit: 'metric' | 'imperial'
): string => {
  if (unit === 'metric') {
    return `${Math.round(value)} cm`;
  } else {
    // Convert to feet and inches
    const valueInInches = convertMeasurement(value, 'cm', 'in');
    const feet = Math.floor(valueInInches / 12);
    const inches = Math.round(valueInInches % 12);
    return `${feet}'${inches}"`;
  }
};