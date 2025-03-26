import { createContext, useContext, ReactNode } from "react";
import { DataSource } from "@shared/types";

type DataSourceContextType = {
  dataSource: DataSource;
};

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

export const useDataSource = () => {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error("useDataSource must be used within a DataSourceProvider");
  }
  return context;
};

export const DataSourceProvider = ({ children }: { children: ReactNode }) => {
  // Always use Supabase data - no more switching
  const dataSource: DataSource = "supabase";
  
  return (
    <DataSourceContext.Provider
      value={{
        dataSource,
      }}
    >
      {children}
    </DataSourceContext.Provider>
  );
};
