
import BaseTutorial from "./BaseTutorial";

interface TrumpetTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrumpetTutorial = ({ isOpen, onClose }: TrumpetTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Trumpet"
      description="Learn how to play the trumpet with this interactive tutorial"
    />
  );
};

export default TrumpetTutorial;
