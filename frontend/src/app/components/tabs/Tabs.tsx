'use client'

/**
 * Props interface for the Tabs component
 */
interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: string[];
}

/**
 * Tabs component for creating a horizontal tab navigation interface
 * Renders a set of clickable tabs with active state styling and hover effects
 * 
 * @param props - The component props containing tab state and configuration
 * @returns JSX element containing the tab navigation bar
 */
export default function Tabs({ activeTab, setActiveTab, tabs }: TabsProps) {
	return (
        <div className={"flex justify-center mb-8"}>
            <div className={"bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg"}>
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${
                            activeTab === tab
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 cursor-pointer'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
}
