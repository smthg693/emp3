import { describe, it, expect } from 'vitest';
import { 
  calculateEarthMarsDistance, 
  calculateLightTimeDelay, 
  calculateCommunicationState,
  AU_TO_KM,
  SPEED_OF_LIGHT_KM_S
} from './orbitalPhysics';

describe('Orbital Physics Service Unit Tests', () => {

  it('should correctly calculate Earth-Mars distance over synodic period', () => {
    const m0 = calculateEarthMarsDistance(0);
    const m13 = calculateEarthMarsDistance(13);

    expect(m0.distanceAu).toBeCloseTo(0.524, 2);
    expect(m13.distanceAu).toBeCloseTo(2.524, 2);
    expect(m0.distanceKm).toBeCloseTo(0.524 * AU_TO_KM, -4);
  });

  it('should correctly calculate light-time delay based on speed of light c', () => {
    const distanceKm = 225000000;
    const delay = calculateLightTimeDelay(distanceKm);

    expect(delay.oneWaySec).toBeCloseTo(distanceKm / SPEED_OF_LIGHT_KM_S, 2);
    expect(delay.oneWayMin).toBeCloseTo(delay.oneWaySec / 60.0, 2);
    expect(delay.roundTripMin).toBeCloseTo(delay.oneWayMin * 2.0, 2);
  });

  it('should identify SOLAR_BLACKOUT when Sun-Earth-Mars angle is under 3 degrees', () => {
    const conjunctionState = calculateCommunicationState(13.0);
    expect(conjunctionState.communicationState).toBe('SOLAR_BLACKOUT');
    expect(conjunctionState.communicationAvailable).toBe(false);

    const normalState = calculateCommunicationState(0.0);
    expect(normalState.communicationState).toBe('NORMAL');
    expect(normalState.communicationAvailable).toBe(true);
  });

});
