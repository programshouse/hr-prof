export default function SystemSettingsTabs({ activeTab, onTabChange, tabs = [] }) {
  return (
    <div className="flex flex-wrap gap-6 border-b">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`cursor-pointer pb-2 text-sm font-medium ${
              isActive
                ? 'border-primary text-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
