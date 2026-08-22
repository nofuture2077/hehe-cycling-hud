import { LocationChip } from '../LocationChip';
import type { HudContext } from '../context';

export function LocationChipWidget({ ctx }: { ctx: HudContext }) {
  const { visible } = ctx.config;
  if (!visible.location) return null;
  return (
    <LocationChip
      city={ctx.data.city}
      region={ctx.data.region}
      country={ctx.data.country}
      countryFlag={ctx.data.countryFlag}
      temperatureC={ctx.data.temperatureC}
      localTime={ctx.data.localTime}
      showCity={visible.locationCity}
      showRegion={visible.locationRegion}
      showCountry={visible.locationCountry}
      showFlag={visible.locationFlag}
      showTemperature={visible.locationTemperature}
      showLocalTime={visible.locationLocalTime}
    />
  );
}
