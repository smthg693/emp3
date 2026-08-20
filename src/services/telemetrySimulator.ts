import type { TelemetryReading } from './anomalyDetector';

export type TelemetryScenario = 'NORMAL' | 'THERMAL_ANOMALY' | 'VOLTAGE_ANOMALY' | 'RF_ANOMALY' | 'ANTENNA_ANOMALY' | 'COMBINED_ANOMALY';

export function generateTelemetry(scenario: TelemetryScenario): TelemetryReading {
  switch (scenario) {
    case 'THERMAL_ANOMALY':
      return { temperatureC: 68.5, busVoltageV: 28.0, rfSignalDb: 22.0, antennaAngleDeg: 1.0 };
    case 'VOLTAGE_ANOMALY':
      return { temperatureC: 34.0, busVoltageV: 24.1, rfSignalDb: 22.0, antennaAngleDeg: 1.0 };
    case 'RF_ANOMALY':
      return { temperatureC: 33.0, busVoltageV: 28.0, rfSignalDb: 4.2, antennaAngleDeg: 1.0 };
    case 'ANTENNA_ANOMALY':
      return { temperatureC: 33.0, busVoltageV: 28.0, rfSignalDb: 22.0, antennaAngleDeg: 3.8 };
    case 'COMBINED_ANOMALY':
      return { temperatureC: 68.5, busVoltageV: 24.1, rfSignalDb: 4.2, antennaAngleDeg: 3.8 };
    case 'NORMAL':
    default:
      return { temperatureC: 34.2, busVoltageV: 28.1, rfSignalDb: 23.5, antennaAngleDeg: 0.4 };
  }
}
