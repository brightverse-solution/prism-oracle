import configJson from '../../config.example.json' with { type: 'json' };
import type { CompanyConfig } from './types';

export function loadConfig(): CompanyConfig {
  return configJson as CompanyConfig;
}
