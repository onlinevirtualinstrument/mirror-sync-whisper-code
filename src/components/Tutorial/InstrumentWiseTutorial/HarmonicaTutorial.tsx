
import BaseTutorial from "./BaseTutorial";

interface HarmonicaTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const HarmonicaTutorial = ({ isOpen, onClose }: HarmonicaTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Harmonica"
      description="Learn how to play the harmonica with this interactive tutorial"
    />
  );
};

export default HarmonicaTutorial;
