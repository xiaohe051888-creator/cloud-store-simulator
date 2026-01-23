// Cloudflare Worker - 代理到 Vercel 域名
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Vercel 域名
  const targetUrl = 'https://cloud-store-simulator.vercel.app' + url.pathname + url.search
  
  // 复制请求头，过滤掉某些不允许的头部
  const newHeaders = new Headers()
  for (const [key, value] of request.headers.entries()) {
    if (key.toLowerCase() !== 'host' && 
        key.toLowerCase() !== 'cf-ray' && 
        key.toLowerCase() !== 'cf-connecting-ip' &&
        key.toLowerCase() !== 'cf-visitor' &&
        key.toLowerCase() !== 'cf-ipcountry') {
      newHeaders.set(key, value)
    }
  }
  newHeaders.set('Host', 'cloud-store-simulator.vercel.app')
  newHeaders.set('X-Forwarded-Host', url.hostname)
  newHeaders.set('X-Real-IP', request.headers.get('cf-connecting-ip') || '')
  
  // 创建新请求
  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: newHeaders,
    body: request.body,
    redirect: 'follow'
  })
  
  try {
    const response = await fetch(newRequest)
    
    // 复制响应头
    const responseHeaders = new Headers(response.headers)
    
    // 修改 CORS 头
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', '*')
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    })
  } catch (error) {
    return new Response('Proxy error: ' + error.message, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}
