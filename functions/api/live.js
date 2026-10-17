export async function onRequest() {
  const res = await fetch('https://api.adsb.lol/v2/mil', {
    headers: { 'User-Agent': 'flyingtracker.pages.dev' }
  });
  const data = await res.text();
  return new Response(data, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=5'
    }
  });
}