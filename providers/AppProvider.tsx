import React from 'react';

/** Shell for future global providers (theme, query client, etc.). */
export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => (
  <>{children}</>
);

export default AppProvider;
