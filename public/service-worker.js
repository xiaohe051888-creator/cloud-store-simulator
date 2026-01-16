const CACHE_NAME = '20260116.V3'; // 更新版本号触发更新

// 只缓存静态资源（图标、图片），不缓存HTML和JS
// 这样用户刷新页面就能立即看到最新内容
const urlsToCache = [
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192.svg',
  '/icon-512.svg'
];

// 动态资源（HTML、JS、CSS）不缓存，每次都从网络获取
// 这样修改代码后，用户刷新即可看到最新版本

// 安装 Service Worker
self.addEventListener('install', (event) => {
  // 立即跳过等待，让新的 Service Worker 立即激活
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 删除旧版本的缓存
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 确保立即控制所有页面
      return self.clients.claim();
    })
  );
});

// 监听消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CHECK_UPDATE') {
    // 检查更新
    event.waitUntil(
      self.update()
    );
  }
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 只缓存静态图片资源，其他资源直接从网络获取
  // 这样用户刷新页面就能立即看到最新内容
  const shouldCache = url.pathname.endsWith('.png') ||
                     url.pathname.endsWith('.svg') ||
                     url.pathname.endsWith('.jpg') ||
                     url.pathname.endsWith('.jpeg') ||
                     url.pathname.endsWith('.webp');

  if (shouldCache) {
    // 静态资源：优先使用缓存，但后台更新
    event.respondWith(
      caches.match(request)
        .then((response) => {
          // 缓存命中，返回缓存的资源
          if (response) {
            // 在后台更新缓存
            fetch(request).then((fetchResponse) => {
              if (fetchResponse && fetchResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, fetchResponse);
                });
              }
            }).catch(() => {
              // 后台更新失败不影响当前请求
            });
            return response;
          }
          // 缓存未命中，发起网络请求
          return fetch(request).then(
            (response) => {
              // 检查是否为有效响应
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // 克隆响应，因为响应是流，只能使用一次
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });

              return response;
            }
          );
        })
    );
  } else {
    // 动态资源（HTML、JS、CSS等）：直接从网络获取，不缓存
    // 这样用户刷新页面就能立即看到最新版本
    event.respondWith(fetch(request));
  }
});
