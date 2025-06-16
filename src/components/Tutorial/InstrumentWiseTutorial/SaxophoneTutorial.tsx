
import BaseTutorial from "./BaseTutorial";

interface SaxophoneTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaxophoneTutorial = ({ isOpen, onClose }: SaxophoneTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Saxophone"
      description="Learn how to play the saxophone with this interactive tutorial"
    />
  );
};

export default SaxophoneTutorial;
