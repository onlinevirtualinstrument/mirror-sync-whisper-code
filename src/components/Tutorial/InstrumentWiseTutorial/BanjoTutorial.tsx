
import BaseTutorial from "./BaseTutorial";

interface BanjoTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const BanjoTutorial = ({ isOpen, onClose }: BanjoTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Banjo"
      description="Learn how to play the banjo with this interactive tutorial"
    />
  );
};

export default BanjoTutorial;
