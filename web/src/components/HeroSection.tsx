import { Activity, Globe, Shield } from 'lucide-react';

function HeroSection() {
  return (
    <section className="relative min-h-[65vh] flex flex-col items-center justify-center overflow-hidden pt-16 pb-40 bg-gradient-to-b from-slate-900 via-slate-900 to-primary-950">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full bg-primary-500/15 blur-[100px] animate-float-slow" />
      <div className="absolute bottom-1/4 -right-20 w-[350px] h-[350px] rounded-full bg-indigo-500/15 blur-[100px] animate-float-slower" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-400/5 blur-[120px] animate-pulse-soft" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="opacity-0 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-300">动态服务网关</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
              HelloCola
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Gateway
            </span>
          </h1>
        </div>

        <p className="opacity-0 animate-fade-in-up-delay mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
          一个轻量级的自托管动态网关，基于域名智能路由流量到各个服务。
          简洁优雅，开箱即用。
        </p>

        {/* Feature pills */}
        <div className="opacity-0 animate-fade-in-up-delay mt-10 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-white text-sm font-medium">
            <Globe className="w-4 h-4 text-primary-300" />
            <span>域名路由</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-white text-sm font-medium">
            <Activity className="w-4 h-4 text-emerald-300" />
            <span>心跳监控</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-white text-sm font-medium">
            <Shield className="w-4 h-4 text-violet-300" />
            <span>自动清理</span>
          </div>
        </div>
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;
