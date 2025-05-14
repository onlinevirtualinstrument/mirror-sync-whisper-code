
import { ReactNode, useState } from 'react';
import { Folder, FolderOpen } from 'lucide-react';

interface FolderContentProps {
  children: ReactNode;
}

const FolderContent = ({ children }: FolderContentProps) => {
  return (
    <div className="folder-content">
      {children}
    </div>
  );
};

interface FolderTabProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const FolderTab = ({ name, isActive, onClick }: FolderTabProps) => {
  return (
    <div 
      className={`folder-tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {isActive ? <FolderOpen size={16} /> : <Folder size={16} />}
        {name}
      </div>
    </div>
  );
};

interface FolderTabsProps {
  tabs: string[];
  activeTab: number;
  setActiveTab: (index: number) => void;
}

const FolderTabs = ({ tabs, activeTab, setActiveTab }: FolderTabsProps) => {
  return (
    <div className="flex">
      {tabs.map((tab, index) => (
        <FolderTab 
          key={tab}
          name={tab}
          isActive={activeTab === index}
          onClick={() => setActiveTab(index)}
        />
      ))}
    </div>
  );
};

interface FolderViewProps {
  tabs: string[];
  children: ReactNode[];
}

const FolderView = ({ tabs, children }: FolderViewProps) => {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div className="w-full">
      <FolderTabs 
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <FolderContent>
        {Array.isArray(children) 
          ? children[activeTab] 
          : children}
      </FolderContent>
    </div>
  );
};

export default FolderView;
