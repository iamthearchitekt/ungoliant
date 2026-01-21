import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    suffix?: string;
    error?: string;
    hideSpinners?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, suffix, error, hideSpinners, className = '', onChange, ...props }, ref) => {

    const handleStep = (direction: 1 | -1) => {
        // Safe parsing of current value
        let currentValue = parseFloat(props.value?.toString() || '0');
        if (isNaN(currentValue)) currentValue = 0;

        const step = parseFloat(props.step?.toString() || '1');
        const newValue = currentValue + (step * direction);

        // Min/Max Check
        if (props.min !== undefined && newValue < parseFloat(props.min.toString())) return;
        if (props.max !== undefined && newValue > parseFloat(props.max.toString())) return;

        // Create a synthetic event to make it compatible with parent handlers
        if (onChange) {
            const syntheticEvent = {
                target: {
                    value: newValue.toString(),
                    name: props.name,
                    type: props.type
                },
                currentTarget: {
                    value: newValue.toString(),
                    name: props.name,
                    type: props.type
                }
            } as React.ChangeEvent<HTMLInputElement>;

            onChange(syntheticEvent);
        }
    };

    const showSpinners = props.type === 'number' && !hideSpinners;

    return (
        <div className={`input-group ${className}`}>
            {label && <label>{label}</label>}
            <div className="input-wrapper">
                <input
                    ref={ref}
                    onChange={onChange}
                    {...props}
                    className={`${error ? 'has-error' : ''} no-native-spin`}
                />

                {suffix && <span className="input-suffix">{suffix}</span>}

                {showSpinners && (
                    <div className="custom-spinners">
                        <button
                            type="button"
                            className="spin-btn up"
                            onClick={() => handleStep(1)}
                            tabIndex={-1}
                        >
                            <ChevronUp size={10} strokeWidth={3} />
                        </button>
                        <button
                            type="button"
                            className="spin-btn down"
                            onClick={() => handleStep(-1)}
                            tabIndex={-1}
                        >
                            <ChevronDown size={10} strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>
            {error && <span className="input-error">{error}</span>}
        </div>
    );
});
