import { ExternalLink } from 'lucide-react';
import type { ServiceInfo } from '../types/index';

interface ServiceCardProps {
  service: ServiceInfo;
}

function ServiceCard({ service }: ServiceCardProps) {
  const initial = service.name?.charAt(0)?.toUpperCase() || service.domain.charAt(0).toUpperCase();

  const statusColor =
    service.status === 'active'
      ? 'bg-emerald-400'
      : 'bg-amber-400';

  const statusText =
    service.status === 'active' ? '运行中' : '待确认';

  return (
    <a
      href={`//${service.domain}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-gray-100 bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/5 hover:border-primary-200 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {service.icon ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <img
                src={service.icon}
                alt={service.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `
                    <span class="text-lg font-bold text-white">${initial}</span>
                  `;
                  (e.target as HTMLImageElement).parentElement!.className =
                    'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-indigo-600 shadow-md shadow-primary-500/10';
                }}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-indigo-600 shadow-md shadow-primary-500/10">
              <span className="text-lg font-bold text-white">{initial}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 truncate">{service.name}</h3>
            <ExternalLink className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
          </div>
          <p className="text-sm text-gray-400 truncate mb-1.5 font-mono">{service.domain}</p>
          {service.description && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {service.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
          <span className="text-xs text-gray-400">{statusText}</span>
        </div>
        <span className="text-xs text-gray-300 group-hover:text-primary-500 transition-colors duration-200">
          访问服务 →
        </span>
      </div>
    </a>
  );
}

export default ServiceCard;
