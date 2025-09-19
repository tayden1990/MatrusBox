// Reusable flashcard component for study UI
import React from "react";

interface StudyCardProps {
  front: string;
  back: string;
  showBack: boolean;
  onFlip: () => void;
}

const StudyCard: React.FC<StudyCardProps> = ({ front, back, showBack, onFlip }) => {
  return (
    <div className="relative w-full h-64 cursor-pointer select-none" onClick={onFlip}>
      <div className={`absolute inset-0 flex items-center justify-center rounded-lg shadow-md transition-transform duration-300 bg-white dark:bg-gray-800 text-2xl font-semibold p-6 ${showBack ? 'rotate-y-180' : ''}`}
        style={{ perspective: 1000 }}>
        {showBack ? back : front}
      </div>
      <div className="absolute bottom-2 right-4 text-xs text-gray-400">Tap to flip</div>
    </div>
  );
};

export default StudyCard;
