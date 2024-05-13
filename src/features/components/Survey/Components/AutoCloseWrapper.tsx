import { useEffect, useRef, useState } from "react";

interface AutoCloseProps {
    survey: any;
    onClose: () => void;
    children: React.ReactNode;
  }
  
  export function AutoCloseWrapper({ survey, onClose, children }: AutoCloseProps) {
    const [countDownActive, setCountDownActive] = useState(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const showAutoCloseProgressBar = countDownActive && survey.type === "web";
  
    const startCountdown = () => {
      if (!survey.autoClose) return;
  
      if (timeoutRef.current) {
        stopCountdown();
      }
      setCountDownActive(true);
      timeoutRef.current = setTimeout(() => {
        onClose();
        setCountDownActive(false);
      }, survey.autoClose * 1000);
    };
  
    const stopCountdown = () => {
      setCountDownActive(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  
    useEffect(() => {
      startCountdown();
      return stopCountdown;
    }, [survey.autoClose]);
  
    return (
      <div>
        {survey.autoClose && showAutoCloseProgressBar && (
          <AutoCloseProgressBar autoCloseTimeout={survey.autoClose} />
        )}
        <div onClick={stopCountdown} onMouseOver={stopCountdown} className="w-full h-full">
          {children}
        </div>
      </div>
    );
  }
  
  interface AutoCloseProgressBarProps {
    autoCloseTimeout: number;
  }
  
  export function AutoCloseProgressBar({ autoCloseTimeout }: AutoCloseProgressBarProps) {
    return (
      <div className="w-full h-2 overflow-hidden rounded-full bg-accent-bg">
        <div
          key={autoCloseTimeout}
          className="z-20 h-2 rounded-full bg-brand"
          style={{
            animation: `shrink-width-to-zero ${autoCloseTimeout}s linear forwards`,
          }}></div>
      </div>
    );
  }