'use client';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  children?: React.ReactNode; // For select options
  textarea?: boolean;
  rows?: number;
}

export default function FormField({
  label, name, type = 'text', value, onChange,
  required, placeholder, error, children, textarea, rows = 3,
}: FormFieldProps) {
  const id = `field-${name}`;
  const inputClass = `input-field ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''}`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children ? (
        <select id={id} name={name} value={value} onChange={onChange} className={inputClass} required={required} aria-describedby={error ? `${id}-error` : undefined}>
          {children}
        </select>
      ) : textarea ? (
        <textarea id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} className={inputClass} required={required} rows={rows} aria-describedby={error ? `${id}-error` : undefined} />
      ) : (
        <input id={id} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className={inputClass} required={required} aria-describedby={error ? `${id}-error` : undefined} />
      )}
      {error && <p id={`${id}-error`} className="text-xs text-rose-500 mt-1" role="alert">{error}</p>}
    </div>
  );
}
