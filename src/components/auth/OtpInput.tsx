import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  hasError = false,
  autoFocus = true,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Array of digits based on value string
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Only accept numeric digits
    const cleanDigit = rawVal.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = cleanDigit;
    const newOtp = newDigits.join('');
    onChange(newOtp);

    // Auto-advance focus to next digit box
    if (cleanDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back to previous box and clear
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numericChars = pastedText.replace(/\D/g, '').slice(0, length);

    if (numericChars) {
      onChange(numericChars);
      const nextFocusIndex = Math.min(numericChars.length, length - 1);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-3">
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={digits[index]}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`w-11 h-14 sm:w-13 sm:h-16 text-xl sm:text-2xl font-mono font-extrabold text-center rounded-xl transition-all outline-hidden cursor-text select-none ${
              hasError
                ? 'border-2 border-red-500 text-red-500 bg-red-500/10 focus:ring-2 focus:ring-red-500/30'
                : isFilled
                ? 'border-2 border-[#159C63] dark:border-[#5ed29c] text-slate-900 dark:text-white bg-emerald-500/10 dark:bg-emerald-500/15 shadow-sm shadow-emerald-500/20'
                : 'border border-slate-300 dark:border-white/15 text-slate-800 dark:text-white bg-slate-50 dark:bg-white/5 hover:border-slate-400 dark:hover:border-white/30 focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/30 dark:focus:ring-[#5ed29c]/30'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          />
        );
      })}
    </div>
  );
};
