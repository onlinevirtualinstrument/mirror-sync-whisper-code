
import BaseTutorial from "./BaseTutorial";

interface GuitarTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuitarTutorial = ({ isOpen, onClose }: GuitarTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Guitar"
      description="Learn how to play the guitar with this interactive tutorial"
    />
  );
};

export default GuitarTutorial;
