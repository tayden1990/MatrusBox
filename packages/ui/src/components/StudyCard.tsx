import React from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';
import { Card } from './Card';

interface StudyCardProps {
  front: string;
  back: string;
  showBack: boolean;
  onShowBack: () => void;
  onAnswer: (isCorrect: boolean) => void;
  className?: string;
}

export const StudyCard: React.FC<StudyCardProps> = ({ 
  front, 
  back, 
  showBack, 
  onShowBack, 
  onAnswer,
  className 
}) => {
  return (
    <Card className={cn("max-w-md mx-auto", className)}>
      <div className="text-center">
        <h3 className="text-lg font-medium mb-4">
          {showBack ? back : front}
        </h3>
        
        {!showBack ? (
          <Button onClick={onShowBack} className="w-full">
            Show Answer
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-4">How did you do?</p>
            <div className="flex gap-2">
              <Button 
                onClick={() => onAnswer(false)}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Incorrect
              </Button>
              <Button 
                onClick={() => onAnswer(true)}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                Correct
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudyCard;