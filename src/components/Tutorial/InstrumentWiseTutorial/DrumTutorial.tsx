
import BaseTutorial from "./BaseTutorial";

interface DrumTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const DrumTutorial = ({ isOpen, onClose }: DrumTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Drum"
      description="Learn how to play the drums with this interactive tutorial"
    />
  );
};

export default DrumTutorial;
