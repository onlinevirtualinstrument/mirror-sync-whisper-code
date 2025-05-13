
import BaseTutorial from "./BaseTutorial";

interface XylophoneTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const XylophoneTutorial = ({ isOpen, onClose }: XylophoneTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Xylophone"
      description="Learn how to play the xylophone with this interactive tutorial"
    />
  );
};

export default XylophoneTutorial;
