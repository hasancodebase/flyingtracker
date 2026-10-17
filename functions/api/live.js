export async function onRequest(context){
  const { request } = context
  const url = new URL(request.url)
  const lat = url.searchParams.get('lat') || '50'
  const lon = url.searchParams.get('lon') || '-25'
  const dist = url.searchParams.get('dist') || '500'
  const upstream = `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`
  try {
    const res = await fetch(upstream, { cf: { cacheTtl: 10 } })
    const body = await res.text()
    return new Response(body, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20',
        'Access-Control-Allow-Origin': '*',
        'X-Upstream': 'adsb.lol'
      }
    })
  } catch (e){
    return new Response(JSON.stringify({error: String(e), hint: 'ADSB.lol may be down, try again'}), { status: 502, headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}})
  }
}
