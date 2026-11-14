import { BookOpen, CalendarDays, Settings } from 'lucide-react';
import type { TabId } from '../types/study';
import { triggerHaptic } from '../utils/haptics';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

const NAV_ITEMS: { id: TabId; label: string; Icon: typeof BookOpen }[] = [
  { id: 'log', label: 'Log', Icon: BookOpen },
  { id: 'history', label: 'History', Icon: CalendarDays },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#000000] border-t border-[#26262A] pb-safe"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-3 h-[72px] items-center px-2">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (activeTab !== id) {
                  triggerHaptic();
                  onSelectTab(id);
                }
              }}
              aria-current={isActive ? 'page' : undefined}
              className="h-full w-full min-h-[48px] flex flex-col items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2] rounded-2xl"
            >
              <span
                className={`w-16 h-8 rounded-full flex items-center justify-center transition-colors duration-150 ${
                  isActive ? 'bg-[#F5B0C2] text-[#121215]' : 'bg-transparent text-[#8E8E93]'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 2} />
              </span>
              <span
                className={`text-xs leading-none whitespace-nowrap shrink-0 ${
                  isActive ? 'font-semibold text-[#F5F5F7]' : 'font-medium text-[#8E8E93]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
