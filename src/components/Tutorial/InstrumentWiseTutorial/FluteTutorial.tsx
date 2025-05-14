
import BaseTutorial from "./BaseTutorial";

interface FluteTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const FluteTutorial = ({ isOpen, onClose }: FluteTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Flute"
      description="Learn how to play the flute with this interactive tutorial"
    />
  );
};

export default FluteTutorial;
