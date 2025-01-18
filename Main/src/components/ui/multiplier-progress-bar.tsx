import React from 'react';

interface Milestone {
  name: string;
  steps: number;
}

interface MultiplierProgressBarProps {
  milestone: Milestone;
  steps: number;
}

const MultiplierProgressBar: React.FC<MultiplierProgressBarProps> = ({
  milestone,
  steps,
}) => {
  // Calculate base progress percentage
  const baseProgress: number = (steps / milestone.steps) * 100;
  
  // Calculate multiplier based on progress
  const getMultiplier = (progress: number): string => {
    if (progress >= 400) return 'x4';
    if (progress >= 300) return 'x3';
    if (progress >= 200) return 'x2';
    if (progress >= 100) return 'x1';
    return '';
  };

  // Calculate the actual display progress that resets every 100%
  const getDisplayProgress = (progress: number): number => {
    if (progress <= 100) return progress;
    return progress % 100 || 100; // Use 100 instead of 0 when it's exactly divisible
  };

  const multiplier: string = getMultiplier(baseProgress);
  const displayProgress: number = getDisplayProgress(baseProgress);

  return (
    <div className="my-4 bg-white p-4 rounded-3xl ">
      <div className="flex justify-between items-center mb-2">
        <p className="font-bold">{milestone.name}</p>
        {multiplier && (
          <span className="text-orange-500 font-bold">{multiplier}</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
        <div
          className="bg-orange-500 h-4 rounded-full transition-all duration-300"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      <p className="text-sm text-center mt-2">
        {baseProgress.toFixed(2)}% complete
      </p>
    </div>
  );
};

export default MultiplierProgressBar;