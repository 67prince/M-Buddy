import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface SettingsTabProps {
  remainingTargetDays: number;
  hapticEnabled: boolean;
  onUpdateTargetDays: (newTargetDays: number) => void;
  onToggleHaptic: (nextEnabled: boolean) => void;
}

export function SettingsTab({
  remainingTargetDays,
  hapticEnabled,
  onUpdateTargetDays,
  onToggleHaptic,
}: SettingsTabProps) {
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [targetInput, setTargetInput] = useState<string>(String(remainingTargetDays));

  const parsedTarget = Number.parseInt(targetInput, 10);
  const isTargetValid = Number.isFinite(parsedTarget) && parsedTarget >= 1;

  const handleOpenTargetModal = () => {
    triggerHaptic();
    setTargetInput(String(remainingTargetDays));
    setIsEditingTarget(true);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTargetValid) {
      return;
    }
    triggerHaptic();
    onUpdateTargetDays(parsedTarget);
    setIsEditingTarget(false);
  };

  const handleToggleSwitch = () => {
    const nextEnabled = !hapticEnabled;
    if (nextEnabled) {
      triggerHaptic(true);
    }
    onToggleHaptic(nextEnabled);
  };

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      <h1 className="text-xl font-bold text-[#F5F5F7] px-1 mb-1">Settings</h1>

      {/* Target days setting card */}
      <button
        type="button"
        onClick={handleOpenTargetModal}
        className="bg-[#141417] rounded-[24px] border border-[#26262A] px-5 py-4 min-h-[68px] w-full flex items-center justify-between gap-4 text-left transition-colors duration-150 hover:border-[#3A3A42] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2]"
      >
        <span className="text-base font-semibold text-[#F5F5F7]">Target days</span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="text-base font-bold tabular-nums text-[#F5B0C2]">
            {remainingTargetDays}
          </span>
          <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
        </span>
      </button>

      {/* Haptic feedback toggle card */}
      <div className="bg-[#141417] rounded-[24px] border border-[#26262A] px-5 py-4 min-h-[68px] w-full flex items-center justify-between gap-4">
        <span className="text-base font-semibold text-[#F5F5F7]">Haptic feedback</span>
        <button
          type="button"
          role="switch"
          aria-checked={hapticEnabled}
          aria-label="Haptic feedback"
          onClick={handleToggleSwitch}
          className={`w-14 h-8 rounded-full p-1 transition-colors duration-150 flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2] ${
            hapticEnabled ? 'bg-[#F5B0C2] justify-end' : 'bg-[#222228] justify-start'
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full transition-transform duration-150 ${
              hapticEnabled ? 'bg-[#121215]' : 'bg-[#F5F5F7]'
            }`}
          />
        </button>
      </div>

      {/* Edit Target days Modal */}
      {isEditingTarget && (
        <div
          className="fixed inset-0 z-50 bg-[#000000]/85 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-target-title"
          onClick={() => {
            triggerHaptic();
            setIsEditingTarget(false);
          }}
        >
          <form
            onSubmit={handleSaveTarget}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#141417] rounded-t-[24px] sm:rounded-[24px] border border-[#26262A] p-6 pb-8 sm:pb-6 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="edit-target-title" className="text-xl font-bold text-[#F5F5F7]">
                Target days
              </h2>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setIsEditingTarget(false);
                }}
                aria-label="Close"
                className="w-11 h-11 rounded-full bg-[#222228] text-[#F5F5F7] flex items-center justify-center shrink-0 hover:bg-[#2E2E36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={3650}
              autoFocus
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="0"
              aria-label="Target days"
              className="w-full min-h-[52px] rounded-[16px] bg-[#222228] px-4 text-xl font-semibold tabular-nums text-[#F5F5F7] placeholder:text-[#6E6E77] focus:outline-none focus:ring-2 focus:ring-[#F5B0C2]"
            />

            <button
              type="submit"
              disabled={!isTargetValid}
              className={`w-full min-h-[52px] rounded-[20px] font-bold text-base transition-colors duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2] ${
                isTargetValid
                  ? 'bg-[#F5B0C2] text-[#121215]'
                  : 'bg-[#222228] text-[#6E6E77] cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
