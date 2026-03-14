import { useServices } from '../hooks/useServices';
import ServiceCard from './ServiceCard';
import LoadingSpinner from './LoadingSpinner';
import { Inbox } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-100 rounded-md w-2/3" />
          <div className="h-3 bg-gray-50 rounded-md w-1/2" />
          <div className="h-3 bg-gray-50 rounded-md w-full" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-50">
        <div className="h-3 bg-gray-50 rounded-md w-1/4" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
        <Inbox className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无已注册的服务</h3>
      <p className="text-sm text-gray-400 text-center max-w-md leading-relaxed">
        服务注册到网关后会自动显示在这里。
        通过 REST API 注册你的第一个服务吧。
      </p>
      <div className="mt-6 px-5 py-3 rounded-xl bg-gray-50 border border-gray-100">
        <code className="text-xs text-gray-500 font-mono">
          POST /api/services &#123; domain, target, name &#125;
        </code>
      </div>
    </div>
  );
}

function ServiceGrid() {
  const { services, loading } = useServices();

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            已注册服务
          </h2>
          <div className="w-12 h-1 rounded-full bg-gradient-to-r from-primary-500 to-indigo-500 mx-auto mb-4" />
          <p className="text-gray-400 max-w-lg mx-auto">
            以下为动态注册到网关的所有服务，点击卡片即可访问对应服务。
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : services.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.domain} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ServiceGrid;
