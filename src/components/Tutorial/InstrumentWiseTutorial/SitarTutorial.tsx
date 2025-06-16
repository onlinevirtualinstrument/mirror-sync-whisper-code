
import BaseTutorial from "./BaseTutorial";

interface SitarTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const SitarTutorial = ({ isOpen, onClose }: SitarTutorialProps) => {
  return (
    <BaseTutorial
      isOpen={isOpen}
      onClose={onClose}
      instrumentName="Sitar"
      description="Learn how to play the sitar with this interactive tutorial"
    />
  );
};

export default SitarTutorial;
