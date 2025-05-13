
import BaseTutorial from "./BaseTutorial";

interface HarpTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const HarpTutorial = ({ isOpen, onClose }: HarpTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Harp"
      description="Learn how to play the harp with this interactive tutorial"
    />
  );
};

export default HarpTutorial;
