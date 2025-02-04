"use client";

import { createContext, useContext, useState } from "react";

interface FileContextValue {
  file: UploadFile | null;
  setFile: (file: UploadFile | null) => void;
}

const initialFileContextValue: FileContextValue = {
  file: null,
  setFile: () => {},
};

export const FileContext = createContext<FileContextValue>(
  initialFileContextValue
);

export const useFileContext = () => useContext(FileContext);

export type UploadFile = {
  id: string | null;
  name: string;
  size: number;
  content: string | null;
  url: string;
  hash: string;
};

export const FileProvider = ({ children }) => {
  const [file, setFile] = useState<UploadFile | null>(null);

  return (
    <FileContext.Provider value={{ file, setFile }}>
      {children}
    </FileContext.Provider>
  );
};
