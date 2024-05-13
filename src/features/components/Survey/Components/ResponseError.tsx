//@ts-nocheck
import { useCallback } from "react";

export const ResponseErrorComponent = ({ questions, responseData, onRetry }: ResponseErrorComponentProps) => {
    return (
      <div className={"flex flex-col bg-white"}>
        <span className={"mb-1.5 text-base font-bold leading-6 text-slate-900"}>
          {"Your feedback is stuck :("}
        </span>
        <p className={"max-w-md text-sm font-normal leading-6 text-slate-600"}>
          The servers cannot be reached at the moment.
          <br />
          Please retry now or try again later.
        </p>
        <div className={"mt-4 rounded-lg border border-slate-200 bg-slate-100 px-4 py-5"}>
          <div className={"flex max-h-36 flex-1 flex-col space-y-3 overflow-y-scroll"}>
            {questions.map((question, index) => {
              const response = responseData[question.id];
              if (!response) return;
              return (
                <div className={"flex flex-col"}>
                  <span className={"text-sm leading-6 text-slate-900"}>{`Question ${index + 1}`}</span>
                  <span className={"mt-1 text-sm font-semibold leading-6 text-slate-900"}>
                    {processResponseData(response)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className={"mt-4 flex flex-1 flex-row items-center justify-end space-x-2"}>
          <SubmitButton tabIndex={2} buttonLabel="Retry" isLastQuestion={false} onClick={() => onRetry()} />
        </div>
      </div>
    );
  };
  

  export const processResponseData = (
    responseData: string | number | string[] | Record<string, string>
  ): string => {
    if (!responseData) return "";
  
    switch (typeof responseData) {
      case "string":
        return responseData;
  
      case "number":
        return responseData.toString();
  
      case "object":
        if (Array.isArray(responseData)) {
          return responseData.join("; ");
        } else {
          const formattedString = Object.entries(responseData)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");
          return formattedString;
        }
  
      default:
        return "";
    }
  };
  


interface SubmitButtonProps {
  buttonLabel: string | undefined;
  isLastQuestion: boolean;
  onClick?: () => void;
  focus?: boolean;
  tabIndex?: number;
  type?: "submit" | "button";
}

function SubmitButton({
  buttonLabel,
  isLastQuestion,
  onClick = () => {},
  tabIndex = 1,
  focus = false,
  type = "submit",
}: SubmitButtonProps) {
  const buttonRef = useCallback(
    (currentButton: HTMLButtonElement | null) => {
      if (currentButton && focus) {
        setTimeout(() => {
          currentButton.focus();
        }, 200);
      }
    },
    [focus]
  );

  return (
    <button
      ref={buttonRef}
      type={type}
      tabIndex={tabIndex}
      autoFocus={focus}
      className="flex items-center px-3 py-3 text-base font-medium leading-4 border shadow-sm bg-brand border-submit-button-border text-on-brand focus:ring-focus rounded-custom hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
      onClick={onClick}>
      {buttonLabel || (isLastQuestion ? "Finish" : "Next")}
    </button>
  );
}
export default SubmitButton;
