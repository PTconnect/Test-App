
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';

  return (
    <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4 w-full max-w-sm p-4 rounded-lg shadow-lg text-white ${bgColor} z-50 animate-fade-in-up`}>
      <i className={`fa-solid ${icon} text-xl`}></i>
      <p className="flex-grow">{message}</p>
      <button onClick={onClose} className="text-xl leading-none">&times;</button>
    </div>
  );
};

export default Toast;
