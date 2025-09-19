// Simple answer buttons for study flow
import React from "react";
import { Button } from '@matrus/ui';

interface AnswerButtonsProps {
  onAnswer: (result: "correct" | "incorrect" | "skip") => void;
  disabled?: boolean;
}

const AnswerButtons: React.FC<AnswerButtonsProps> = ({ onAnswer, disabled }) => (
  <div className="flex gap-4 justify-center mt-6">
    <Button
      variant="primary"
      onClick={() => onAnswer("correct")}
      disabled={disabled}
      aria-label="Mark as correct"
    >
      Correct
    </Button>
    <Button
      variant="danger"
      onClick={() => onAnswer("incorrect")}
      disabled={disabled}
      aria-label="Mark as incorrect"
    >
      Incorrect
    </Button>
    <Button
      variant="outline"
      onClick={() => onAnswer("skip")}
      disabled={disabled}
      aria-label="Skip card"
    >
      Skip
    </Button>
  </div>
);

export default AnswerButtons;
