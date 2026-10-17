export async function onRequest(){
  const upstream = 'https://nat-tracks.aogden41.workers.dev/api/tracks'
  try {
    const r = await fetch(upstream, { cf: { cacheTtl: 300 } })
    const data = await r.text()
    return new Response(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
        'X-Upstream': 'nat-tracks API'
      }
    })
  } catch (e){
    return new Response(JSON.stringify([]), { headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'} })
  }
}
