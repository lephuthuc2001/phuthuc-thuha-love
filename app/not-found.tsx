'use client';

import Link from 'next/link';
import './error-page.css';

export default function NotFound() {
  return (
    <div className="gradient-bg min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 heartbeat">
            <i className="fas fa-heart-broken text-red-400 mr-2"></i>
            Oops!
            <i className="fas fa-heart-broken text-red-400 ml-2"></i>
          </h1>
          <p className="text-lg md:text-xl opacity-90">Có lỗi xảy ra rồi</p>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          {/* Error Message */}
          <div className="text-center mb-8">
            <div className="glass-effect rounded-3xl p-8 max-w-2xl mx-auto">
              <div className="text-8xl md:text-9xl font-bold text-red-300 mb-6 bounce">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                <i className="fas fa-sad-tear text-yellow-400 mr-2"></i>
                Trang này không tồn tại
              </h2>
              
              <p className="text-lg md:text-xl opacity-90 mb-6">
                Có vẻ như trang bạn đang tìm kiếm đã biến mất vào không gian tình yêu
              </p>
              
              <div className="flex justify-center items-center space-x-4 text-sm md:text-base opacity-80 mb-6">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-300">404</div>
                  <div>Lỗi</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center mb-8">
            <div className="glass-effect rounded-2xl p-6 max-w-lg mx-auto">
              <p className="text-lg md:text-xl mb-4">
                Nhưng đừng lo lắng! Tình yêu vẫn còn đó
              </p>
              <Link 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <i className="fas fa-home mr-2"></i>
                Quay về trang chủ
              </Link>
            </div>
          </div>

          {/* Love Message */}
          <div className="text-center">
            <div className="glass-effect rounded-2xl p-6 max-w-lg mx-auto">
              <p className="text-lg md:text-xl italic">
                &quot;Ngay cả khi có lỗi xảy ra, tình yêu của chúng ta vẫn luôn hoàn hảo.&quot;
              </p>
              <div className="flex justify-center mt-4 space-x-2">
                <i className="fas fa-heart text-red-400 text-xl float"></i>
                <i className="fas fa-heart text-pink-400 text-xl float" style={{ animationDelay: '0.5s' }}></i>
                <i className="fas fa-heart text-red-400 text-xl float" style={{ animationDelay: '1s' }}></i>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 opacity-70">
          <p className="text-sm">
            Được tạo với <i className="fas fa-heart text-red-400"></i> cho câu chuyện tình yêu của chúng ta
          </p>
        </footer>
      </div>
    </div>
  );
}
