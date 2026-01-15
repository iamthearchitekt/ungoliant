import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    suffix?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, suffix, error, className = '', ...props }, ref) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label>{label}</label>}
            <div className="input-wrapper">
                <input ref={ref} {...props} className={error ? 'has-error' : ''} />
                {suffix && <span className="input-suffix">{suffix}</span>}
            </div>
            {error && <span className="input-error">{error}</span>}
        </div>
    );
});
