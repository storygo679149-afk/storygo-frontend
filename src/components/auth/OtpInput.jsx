import React, { useState, useRef, useEffect } from 'react';
import './OtpInput.css';

const OtpInput = ({ length = 6, onComplete, isLoading = false }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (inputsRef.current[0]) inputsRef.current[0].focus();
  }, []);

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    if (newOtp.every(val => val !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
    const digits = pastedData.split('');
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      if (idx < length && !isNaN(digit)) newOtp[idx] = digit;
    });
    setOtp(newOtp);
    if (newOtp.every(val => val !== '')) {
      onComplete(newOtp.join(''));
    }
    // focus last filled or first empty
    const lastFilledIndex = newOtp.findIndex(val => val === '');
    const focusIndex = lastFilledIndex === -1 ? length - 1 : lastFilledIndex;
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="otp-input-group" onPaste={handlePaste}>
      {otp.map((data, idx) => (
        <input
          key={idx}
          type="text"
          maxLength="1"
          className="otp-digit"
          value={data}
          onChange={(e) => handleChange(e.target, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          ref={(ref) => (inputsRef.current[idx] = ref)}
          disabled={isLoading}
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default OtpInput;