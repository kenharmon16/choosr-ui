import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Decision = {
    title: string,
    description: string
}

interface AppContextType {
    decision?: Decision | null;
    setDecisionData: (d: Decision | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);

    console.log("decision: " + JSON.stringify(currentDecision));
    

    const setDecisionData = useCallback((des: Decision | null) => {
        setCurrentDecision(des);
    }, []);

    const contextValue = useMemo(() => ({
        decision: currentDecision,
        setDecisionData
    }), [currentDecision, setDecisionData]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = (): AppContextType => {
    const ctx = useContext(AppContext);
    if (!ctx) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return ctx;
}

export default AppProvider;