'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Radio } from 'lucide-react';

const NAV_LINKS = [
  {
    href: '/',
    label: 'Historical Map',
    icon: Globe,
    description: '1800–2026',
  },
  {
    href: '/monitor',
    label: 'Conflict Monitor',
    icon: Radio,
    description: 'Live',
    badge: 'LIVE',
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {NAV_LINKS.map(({ href, label, icon: Icon, description, badge }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
              isActive
                ? 'bg-[#21262d] text-white border border-[#30363d]'
                : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]/60'
            }`}
          >
            <Icon size={15} className={isActive ? 'text-[#e05252]' : 'text-current'} />
            <span className="hidden sm:inline font-medium">{label}</span>
            {badge && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-[#e05252]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e05252] animate-pulse" />
                {badge}
              </span>
            )}
            {!badge && (
              <span className="hidden md:inline text-[10px] text-[#8b949e]">
                {description}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
