import React from 'react';
import { LoadingSpinner, LightbulbIcon } from './Icons';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  onInspire?: () => void;
  loading?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ label, children, onInspire, loading = false }) => {
  return (
    <div>
      <label className="block mb-2 text-slate-300 font-semibold">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-grow">{children}</div>
        {onInspire && (
          <button
            type="button"
            onClick={onInspire}
            disabled={loading}
            className="p-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 rounded-md transition-colors"
            title="Sugerir com IA"
          >
            {loading ? <LoadingSpinner /> : <LightbulbIcon />}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormField;
