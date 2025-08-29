CREATE TABLE IF NOT EXISTS sensorpush_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  api_access_token TEXT,
  api_refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensorpush_gateways (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES sensorpush_integrations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  last_seen TIMESTAMPTZ,
  last_alert TIMESTAMPTZ,
  message TEXT,
  paired BOOLEAN DEFAULT false,
  version TEXT,
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensorpush_sensors (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES sensorpush_integrations(id) ON DELETE CASCADE,
  gateway_id TEXT REFERENCES sensorpush_gateways(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  device_id TEXT,
  address TEXT,
  type TEXT,
  active BOOLEAN DEFAULT true,
  battery_voltage NUMERIC,
  rssi INTEGER,
  calibration JSONB DEFAULT '{}',
  alerts JSONB DEFAULT '{}',
  tags JSONB DEFAULT '{}',
  location_name TEXT,
  station_assignment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensorpush_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL REFERENCES sensorpush_sensors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  temperature NUMERIC,
  humidity NUMERIC,
  dewpoint NUMERIC,
  barometric_pressure NUMERIC,
  altitude NUMERIC,
  vpd NUMERIC,
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS haccp_temperature_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  station TEXT,
  equipment_type TEXT NOT NULL, -- 'fridge', 'freezer', 'hot_holding', 'cold_holding'
  temperature NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  recorded_by UUID REFERENCES organization_team_members(id),
  sensor_id TEXT REFERENCES sensorpush_sensors(id),
  is_manual BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'normal', -- 'normal', 'warning', 'critical'
  notes TEXT,
  corrective_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensorpush_readings_sensor_observed ON sensorpush_readings(sensor_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensorpush_readings_org_observed ON sensorpush_readings(organization_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_haccp_logs_org_recorded ON haccp_temperature_logs(organization_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_haccp_logs_equipment_recorded ON haccp_temperature_logs(equipment_type, recorded_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sensorpush_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE haccp_temperature_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE sensorpush_sensors;
ALTER PUBLICATION supabase_realtime ADD TABLE sensorpush_gateways;
