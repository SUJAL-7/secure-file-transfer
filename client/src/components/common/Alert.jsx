import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import clsx from 'clsx';

const Alert = ({ type = 'info', message, onClose, className }) => {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle size={20} />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <XCircle size={20} />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertCircle size={20} />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info size={20} />,
    },
  };

  const config = types[type];

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg border',
        config.bg,
        config.border,
        className
      )}
    >
      <div className={config.text}>{config.icon}</div>
      
      <div className="flex-1">
        <p className={clsx('text-sm', config.text)}>{message}</p>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className={clsx('hover:opacity-70 transition-opacity', config.text)}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;