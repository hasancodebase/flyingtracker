export async function onRequest(context) {
  try {
    const res = await fetch('https://api.adsb.lol/v2/mil', {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=10, s-maxage=10'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ac: [], error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}