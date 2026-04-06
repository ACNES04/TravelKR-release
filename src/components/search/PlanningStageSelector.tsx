'use client';

import type { PlanningStage } from '@/types';
import { PLANNING_STAGES } from '@/types';
import {
  StageIcon,
  ExploreStageIcon,
  PlaceConfirmIcon,
  PlanningIcon,
  BookingIcon,
  FinalCheckIcon,
} from '@/components/icons/Icons';

const STAGE_ICONS: Record<PlanningStage, React.ReactNode> = {
  explore:   <ExploreStageIcon className="w-4 h-4" />,
  place:     <PlaceConfirmIcon className="w-4 h-4" />,
  itinerary: <PlanningIcon className="w-4 h-4" />,
  booking:   <BookingIcon className="w-4 h-4" />,
  final:     <FinalCheckIcon className="w-4 h-4" />,
};

interface PlanningStageSelectorProps {
  selected: PlanningStage | null;
  onChange: (stage: PlanningStage) => void;
}

export default function PlanningStageSelector({ selected, onChange }: PlanningStageSelectorProps) {
  const activeStage = PLANNING_STAGES.find((s) => s.id === selected);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
        <StageIcon className="w-4 h-4" /> 현재 어느 단계까지 준비하셨나요?
      </label>
      <div className="flex flex-wrap gap-2">
        {PLANNING_STAGES.map((stage) => {
          const isSelected = selected === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onChange(stage.id)}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold
                transition-all border
                ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }
              `}
              aria-pressed={isSelected}
            >
              <span>{STAGE_ICONS[stage.id]}</span>
              <span>{stage.label}</span>
            </button>
          );
        })}
      </div>

      {/* 선택된 단계에 대한 안내 메시지 */}
      {activeStage && (
        <div className="mt-3 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          <p className="text-sm text-indigo-700 font-medium">{activeStage.description}</p>
        </div>
      )}
    </div>
  );
}
