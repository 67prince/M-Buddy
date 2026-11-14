import { useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { EditionId } from '../types/study';
import { triggerHaptic } from '../utils/haptics';

interface SetupScreenProps {
  onComplete: (edition: EditionId, targetDays: number) => void;
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
  const [selectedEdition, setSelectedEdition] = useState<EditionId | null>(null);
  const [targetDaysInput, setTargetDaysInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const parsedTargetDays = Number.parseInt(targetDaysInput, 10);
  const isTargetValid = Number.isFinite(parsedTargetDays) && parsedTargetDays >= 1;
  const isReady = selectedEdition !== null && isTargetValid;

  const handleSelectEdition = (edition: EditionId) => {
    triggerHaptic();
    setSelectedEdition(edition);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    if (!selectedEdition) {
      return;
    }
    if (!isTargetValid) {
      inputRef.current?.focus();
      return;
    }
    onComplete(selectedEdition, parsedTargetDays);
  };

  return (
    <main className="min-h-[100dvh] bg-[#000000] text-[#F5F5F7] flex flex-col justify-center pt-safe pb-safe">
      <form
        onSubmit={handleStart}
        className="w-full max-w-md mx-auto px-5 py-10 flex flex-col gap-8"
        noValidate
      >
        <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F7]">M Buddy</h1>

        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Edition">
          {(['6', '8'] as const).map((edition) => {
            const isSelected = selectedEdition === edition;
            return (
              <button
                key={edition}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectEdition(edition)}
                className={`min-h-[84px] rounded-[24px] px-5 py-4 flex items-center justify-between text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2] ${
                  isSelected
                    ? 'bg-[#141417] border-2 border-[#F5B0C2]'
                    : 'bg-[#141417] border border-[#26262A] hover:border-[#3A3A42]'
                }`}
              >
                <span className="text-lg font-semibold text-[#F5F5F7]">Edition {edition}</span>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-[#F5B0C2] text-[#121215]'
                      : 'bg-[#222228] text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="bg-[#141417] rounded-[24px] border border-[#26262A] p-5 flex flex-col gap-3">
          <label htmlFor="setup-target-days" className="text-base font-semibold text-[#F5F5F7]">
            Target Days
          </label>
          <input
            ref={inputRef}
            id="setup-target-days"
            type="number"
            inputMode="numeric"
            min={1}
            max={3650}
            value={targetDaysInput}
            onChange={(e) => setTargetDaysInput(e.target.value)}
            placeholder="0"
            className="w-full min-h-[52px] rounded-[16px] bg-[#222228] px-4 text-xl font-semibold tabular-nums text-[#F5F5F7] placeholder:text-[#6E6E77] focus:outline-none focus:ring-2 focus:ring-[#F5B0C2]"
          />
        </div>

        <button
          type="submit"
          className={`w-full min-h-[54px] rounded-[24px] font-bold text-base transition-colors duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2] ${
            isReady
              ? 'bg-[#F5B0C2] text-[#121215]'
              : 'bg-[#222228] text-[#8E8E93]'
          }`}
        >
          Start
        </button>
      </form>
    </main>
  );
}
