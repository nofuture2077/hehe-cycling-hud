import type { HudContext } from '../context';

export function LogoWidget({ ctx }: { ctx: HudContext }) {
  if (!ctx.visibility.showLogo || !ctx.logo) return null;
  return (
    <div>
      <img
        src={`data:${ctx.logo.mimeType};base64,${ctx.logo.content}`}
        style={{ height: 'var(--hud-logo-height, 100px)', marginRight: 20 }}
      />
    </div>
  );
}
