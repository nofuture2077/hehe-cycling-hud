import type { HudContext } from '../context';

export function LogoWidget({ ctx }: { ctx: HudContext }) {
  if (!ctx.visibility.showLogo || !ctx.logo) return null;
  return (
    <div>
      <img
        src={`data:${ctx.logo.mimeType};base64,${ctx.logo.content}`}
        height={100}
        style={{ marginRight: 20 }}
      />
    </div>
  );
}
