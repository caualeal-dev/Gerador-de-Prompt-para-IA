import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, CloseIcon } from './Icons';

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircleIcon />,
    bgClass: 'bg-green-500',
    textClass: 'text-green-100',
  },
  error: {
    icon: <ExclamationCircleIcon />,
    bgClass: 'bg-red-500',
    textClass: 'text-red-100',
  },
};

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  const { icon, bgClass, textClass } = toastConfig[type];

  return (
    <div
      className={`${bgClass} rounded-lg shadow-lg p-4 flex items-start gap-3 animate-fade-in-right`}
      role="alert"
    >
      <div className={`flex-shrink-0 ${textClass}`}>{icon}</div>
      <p className={`flex-grow text-sm font-medium ${textClass}`}>{message}</p>
      <button onClick={onClose} className={`ml-4 -mr-2 -my-2 p-1 rounded-md ${textClass} opacity-70 hover:opacity-100 transition-opacity`}>
        <CloseIcon />
      </button>
    </div>
  );
};

export default Toast;
