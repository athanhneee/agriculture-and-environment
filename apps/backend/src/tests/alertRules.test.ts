import { evaluateReadingForAlerts } from '../modules/alerts/alertRules';
import { ALERT_THRESHOLDS } from '../constants/thresholds';

describe('Alert Rules Evaluation', () => {
  it('should generate HIGH_TEMPERATURE alert when temperature exceeds critical threshold', () => {
    const alerts = evaluateReadingForAlerts({
      temperature: ALERT_THRESHOLDS.TEMPERATURE.CRITICAL_HIGH + 1,
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('HIGH_TEMPERATURE');
    expect(alerts[0].severity).toBe('CRITICAL');
  });

  it('should generate LOW_SOIL_MOISTURE alert when soil moisture is below critical threshold', () => {
    const alerts = evaluateReadingForAlerts({
      soilMoisture: ALERT_THRESHOLDS.SOIL_MOISTURE.CRITICAL_LOW - 1,
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('LOW_SOIL_MOISTURE');
    expect(alerts[0].severity).toBe('CRITICAL');
  });

  it('should not generate any alerts for normal readings', () => {
    const alerts = evaluateReadingForAlerts({
      temperature: 25,
      airHumidity: 50,
      soilMoisture: 60,
      lightIntensity: 5000,
    });

    expect(alerts).toHaveLength(0);
  });
});
