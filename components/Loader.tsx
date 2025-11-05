
import React from 'react';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col justify-center items-center p-10 h-full">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1e528c] rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 font-semibold">{message}</p>
    </div>
  );
};

export default Loader;
