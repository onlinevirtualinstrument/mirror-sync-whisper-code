
import BaseTutorial from "./BaseTutorial";

interface ViolinTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const ViolinTutorial = ({ isOpen, onClose }: ViolinTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Violin"
      description="Learn how to play the violin with this interactive tutorial"
    />
  );
};

export default ViolinTutorial;
