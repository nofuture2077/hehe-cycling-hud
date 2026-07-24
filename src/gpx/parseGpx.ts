export interface GpxPoint {
  lat: number;
  lon: number;
  ele: number;
}

// parses raw GPX XML text into a flat list of track points - uses the browser's native
// DOMParser rather than pulling in a GPX/XML library
export function parseGpx(xmlText: string): GpxPoint[] {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const trkpts = Array.from(doc.getElementsByTagName('trkpt'));

  return trkpts.map((node) => {
    const lat = parseFloat(node.getAttribute('lat') ?? '');
    const lon = parseFloat(node.getAttribute('lon') ?? '');
    const eleText = node.getElementsByTagName('ele')[0]?.textContent;
    const ele = eleText ? parseFloat(eleText) : 0;
    return {
      lat: Number.isFinite(lat) ? lat : 0,
      lon: Number.isFinite(lon) ? lon : 0,
      ele: Number.isFinite(ele) ? ele : 0,
    };
  });
}
