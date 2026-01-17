        {/* 首页菜单 - 苹果官网风格 */}
        {currentView === 'shopSelection' && (
          <div className="w-full max-w-5xl mx-auto space-y-8 animate-apple-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight mb-4">
                云店模拟器
              </h2>
              <p className="text-xl sm:text-2xl text-gray-500 font-normal">
                专业的店铺经营管理模拟工具
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 进入平台 */}
              <div
                onClick={() => setCurrentView('platform')}
                className="group cursor-pointer"
              >
                <div className="h-full rounded-[24px] bg-white border border-gray-200/50 p-8 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-green-50 mb-6">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                    进入平台
                  </h3>
                  <p className="text-base text-gray-500">
                    登录缴费平台，下载APP
                  </p>
                </div>
              </div>

              {/* 模拟进货 */}
              <div
                onClick={() => setCurrentView('levelSelection')}
                className="group cursor-pointer"
              >
                <div className="h-full rounded-[24px] bg-white border border-gray-200/50 p-8 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-blue-50 mb-6">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                    模拟进货
                  </h3>
                  <p className="text-base text-gray-500">
                    选择店铺等级，设置进货额度
                  </p>
                </div>
              </div>

              {/* 智能推荐 */}
              <div
                onClick={() => setCurrentView('recommendation')}
                className="group cursor-pointer"
              >
                <div className="h-full rounded-[24px] bg-white border border-gray-200/50 p-8 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-purple-50 mb-6">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                    智能推荐
                  </h3>
                  <p className="text-base text-gray-500">
                    按预算或利润推荐最适合的店铺
                  </p>
                </div>
              </div>

              {/* 店铺等级 */}
              <div
                onClick={() => setCurrentView('shopLevels')}
                className="group cursor-pointer"
              >
                <div className="h-full rounded-[24px] bg-white border border-gray-200/50 p-8 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-orange-50 mb-6">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                    店铺等级
                  </h3>
                  <p className="text-base text-gray-500">
                    查看各等级说明、升级条件和权益
                  </p>
                </div>
              </div>

              {/* 分享给好友 */}
              <div
                onClick={async () => {
                  const url = window.location.href;
                  try {
                    await navigator.clipboard.writeText(url);
                    alert('链接已复制到剪贴板！');
                  } catch (err) {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: '云店模拟器',
                          text: '专业的店铺经营管理模拟工具，支持多种店铺等级，详细计算利润和结算周期。',
                          url: url
                        });
                      } catch (shareErr) {
                        alert('无法复制链接，请手动复制地址栏链接');
                      }
                    } else {
                      alert('无法复制链接，请手动复制地址栏链接');
                    }
                  }
                }}
                className="group cursor-pointer"
              >
                <div className="h-full rounded-[24px] bg-white border border-gray-200/50 p-8 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-pink-50 mb-6">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                    分享给好友
                  </h3>
                  <p className="text-base text-gray-500">
                    复制网站链接，分享给好友使用
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
