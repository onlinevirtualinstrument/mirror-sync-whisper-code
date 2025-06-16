
import BaseTutorial from "./BaseTutorial";

interface VeenaTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const VeenaTutorial = ({ isOpen, onClose }: VeenaTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Veena"
      description="Learn how to play the veena with this interactive tutorial"
    />
  );
};

export default VeenaTutorial;
