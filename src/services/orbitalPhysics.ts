export const SPEED_OF_LIGHT_KM_S = 299792.458;
export const AU_TO_KM = 149597870.7;

export const EARTH_RADIUS_AU = 1.0;
export const MARS_RADIUS_AU = 1.524;

export interface PlanetPositions {
  earthAngleRad: number;
  marsAngleRad: number;
  earthX: number;
  earthY: number;
  marsX: number;
  marsY: number;
}

export interface PhysicsState {
  synodicMonth: number;
  distanceKm: number;
  distanceAu: number;
  oneWayLatencySec: number;
  oneWayLatencyMin: number;
  roundTripLatencyMin: number;
  sunAngleDeg: number;
  communicationState: 'NORMAL' | 'DEGRADED' | 'SOLAR_BLACKOUT';
  communicationAvailable: boolean;
  blackoutReason?: string;
  positions: PlanetPositions;
}

export function calculatePlanetPositions(synodicMonth: number): PlanetPositions {
  const month = Math.max(0, Math.min(26, synodicMonth));
  const earthAngleRad = -Math.PI / 2;
  const deltaAngleRad = (month / 26.0) * (2 * Math.PI);
  const marsAngleRad = earthAngleRad + deltaAngleRad;

  return {
    earthAngleRad,
    marsAngleRad,
    earthX: EARTH_RADIUS_AU * Math.cos(earthAngleRad),
    earthY: EARTH_RADIUS_AU * Math.sin(earthAngleRad),
    marsX: MARS_RADIUS_AU * Math.cos(marsAngleRad),
    marsY: MARS_RADIUS_AU * Math.sin(marsAngleRad),
  };
}

export function calculateEarthMarsDistance(synodicMonth: number): { distanceAu: number; distanceKm: number } {
  const deltaTheta = ((synodicMonth % 26) / 26.0) * (2 * Math.PI);
  const rE = EARTH_RADIUS_AU;
  const rM = MARS_RADIUS_AU;

  const dSquared = rE * rE + rM * rM - 2 * rE * rM * Math.cos(deltaTheta);
  const distanceAu = Math.sqrt(Math.max(0.25, dSquared));
  const distanceKm = distanceAu * AU_TO_KM;

  return { distanceAu, distanceKm };
}

export function calculateLightTimeDelay(distanceKm: number): { oneWaySec: number; oneWayMin: number; roundTripMin: number } {
  const oneWaySec = distanceKm / SPEED_OF_LIGHT_KM_S;
  const oneWayMin = oneWaySec / 60.0;
  const roundTripMin = oneWayMin * 2.0;

  return { oneWaySec, oneWayMin, roundTripMin };
}

export function calculateCommunicationState(synodicMonth: number, manualMode?: 'NORMAL' | 'CONJUNCTION' | 'EMERGENCY'): {
  sunAngleDeg: number;
  communicationState: 'NORMAL' | 'DEGRADED' | 'SOLAR_BLACKOUT';
  communicationAvailable: boolean;
  blackoutReason?: string;
} {
  if (manualMode === 'CONJUNCTION') {
    return {
      sunAngleDeg: 1.2,
      communicationState: 'SOLAR_BLACKOUT',
      communicationAvailable: false,
      blackoutReason: 'Sun-Earth-Mars alignment < 3.0° causing complete RF blackout (~13 days).',
    };
  }

  const normalizedMonth = synodicMonth % 26;
  const distFromConjunctionMonths = Math.abs(normalizedMonth - 13.0);
  const sunAngleDeg = Math.min(180, distFromConjunctionMonths * 13.84 + 1.5);

  if (sunAngleDeg < 3.0) {
    return {
      sunAngleDeg,
      communicationState: 'SOLAR_BLACKOUT',
      communicationAvailable: false,
      blackoutReason: `Sun-Earth-Mars angle ${sunAngleDeg.toFixed(1)}° < 3.0° (Solar Conjunction Blackout).`,
    };
  } else if (sunAngleDeg < 7.5) {
    return {
      sunAngleDeg,
      communicationState: 'DEGRADED',
      communicationAvailable: true,
      blackoutReason: `Sun-Earth-Mars angle ${sunAngleDeg.toFixed(1)}° (Solar Plasma Noise).`,
    };
  }

  return {
    sunAngleDeg,
    communicationState: 'NORMAL',
    communicationAvailable: true,
  };
}

export function getPhysicsState(synodicMonth: number, manualMode?: 'NORMAL' | 'CONJUNCTION' | 'EMERGENCY'): PhysicsState {
  const positions = calculatePlanetPositions(synodicMonth);
  const { distanceAu, distanceKm } = calculateEarthMarsDistance(synodicMonth);
  const { oneWaySec, oneWayMin, roundTripMin } = calculateLightTimeDelay(distanceKm);
  const comm = calculateCommunicationState(synodicMonth, manualMode);

  return {
    synodicMonth,
    distanceKm,
    distanceAu,
    oneWayLatencySec: oneWaySec,
    oneWayLatencyMin: oneWayMin,
    roundTripLatencyMin: roundTripMin,
    sunAngleDeg: comm.sunAngleDeg,
    communicationState: comm.communicationState,
    communicationAvailable: comm.communicationAvailable,
    blackoutReason: comm.blackoutReason,
    positions,
  };
}
