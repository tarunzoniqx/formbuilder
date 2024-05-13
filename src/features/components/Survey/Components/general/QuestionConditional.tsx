//@ts-nocheck
import { getLocalizedValue, getUpdatedTtc, shuffleQuestions, useTtc } from "@/features/utils";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";


export enum QuestionId {
  FileUpload = "fileUpload",
  OpenText = "openText",
  MultipleChoiceSingle = "multipleChoiceSingle",
  MultipleChoiceMulti = "multipleChoiceMulti",
  NPS = "nps",
  CTA = "cta",
  Rating = "rating",
  Consent = "consent",
  PictureSelection = "pictureSelection",
  Cal = "cal",
  Date = "date",
  Matrix = "matrix",
}

export default function QuestionConditional({
    question,
    value,
    onChange,
    onSubmit,
    onBack,
    isFirstQuestion,
    isLastQuestion,
    languageCode,
    ttc,
    setTtc,

    isInIframe,
}: any) {
    return  question.type === QuestionId.OpenText ? (
      <OpenTextQuestion
      key={question.id}
      question={question}
      value={typeof value === "string" ? value : ""}
      onChange={onChange}
      onSubmit={onSubmit}
      onBack={onBack}
      isFirstQuestion={isFirstQuestion}
      isLastQuestion={isLastQuestion}
      languageCode={languageCode}
      ttc={ttc}
      setTtc={setTtc}
      isInIframe={isInIframe}
  />
    ):  question.type === QuestionId.MultipleChoiceSingle ? (
       <MultipleChoiceSingleQuestion
       key={question.id}
       question={question}
       value={typeof value === "string" ? value : ""}
       onChange={onChange}
       onSubmit={onSubmit}
       onBack={onBack}
       isFirstQuestion={isFirstQuestion}
       isLastQuestion={isLastQuestion}
       languageCode={languageCode}
       ttc={ttc}
       setTtc={setTtc}
       isInIframe={isInIframe}
       />
    ) : question.type === QuestionId.MultipleChoiceMulti ? (
      <MultipleChoiceMultiQuestion
      key={question.id}
      value={value}
      question={question}
      onChange={onChange}
      onSubmit={onSubmit}
      onBack={onBack}
      isFirstQuestion={isFirstQuestion}
      isLastQuestion={isLastQuestion}
      languageCode={languageCode}
      ttc={ttc}
      setTtc={setTtc}
      isInIframe={isInIframe}
      
      />
    ) : null}

    



export const OpenTextQuestion = ({
    question,
    value,
    onChange,
    onSubmit,
    onBack,
    isFirstQuestion,
    isLastQuestion,
    languageCode,
    ttc,
    setTtc,
    isInIframe,
  }: any) => {
    const [startTime, setStartTime] = useState(performance.now());
  
    useTtc(question.id, ttc, setTtc, startTime, setStartTime);
  
    const handleInputChange = (inputValue: string) => {
      onChange({ [question.id]: inputValue });
    };
  
    const handleInputResize = (event: { target: any }) => {
      const maxHeight = 160; // 8 lines
      const textarea = event.target;
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflow = newHeight >= maxHeight ? "auto" : "hidden";
    };
  
    const openTextRef = useCallback(
      (currentElement: HTMLInputElement | HTMLTextAreaElement | null) => {
        if (question.id && currentElement && !isInIframe) {
          currentElement.focus();
        }
      },
      [question.id, isInIframe]
    );
    console.log(question , "ammas" , question.placeholder.default  , getLocalizedValue(question.placeholder, languageCode) )
    return (
      <form
        key={question.id}
        onSubmit={(e) => {
          e.preventDefault();
          const updatedttc = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
          setTtc(updatedttc);
          onSubmit({ [question.id]: value, inputType: question.inputType }, updatedttc);
        }}
        className="w-full">
        {question.imageUrl && <QuestionImage imgUrl={question.imageUrl} />}
        <Headline
          headline={question?.headline?.default}
          questionId={question.id}
          required={question.required}
        />
        <Subheader
          subheader={question.subheader.default}
          questionId={question.id}
        />
        <div className="mt-4">
          {question.longAnswer === false ? (
            <input
              ref={openTextRef}
              tabIndex={1}
              name={question.id}
              id={question.id}
              placeholder={question.placeholder.default}
              step={"any"}
              required={question.required}
              value={value ? (value as string) : ""}
              type={question.inputType}
              onInput={(e) => handleInputChange(e.currentTarget.value)}
              autoFocus={!isInIframe}
              className="block w-full p-2 border rounded-md shadow-sm border-border placeholder:text-placeholder text-subheading focus:border-border-highlight bg-input-bg focus:outline-none focus:ring-0 sm:text-sm"
              pattern={question.inputType === "phone" ? "[0-9+ ]+" : ".*"}
              title={question.inputType === "phone" ? "Enter a valid phone number" : undefined}
            />
          ) : (
            <textarea
              ref={openTextRef}
              rows={3}
              name={question.id}
              tabIndex={1}
              id={question.id}
              placeholder={getLocalizedValue(question.placeholder, languageCode)  }
              required={question.required}
              value={value as string}
            //   type={question.inputType}
              onInput={(e) => {
                handleInputChange(e.currentTarget.value);
                handleInputResize(e);
              }}
              autoFocus={!isInIframe}
              className="block w-full p-2 border shadow-sm border-border placeholder:text-placeholder bg-input-bg text-subheading focus:border-border-highlight rounded-custom focus:ring-0 sm:text-sm"
              pattern={question.inputType === "phone" ? "[+][0-9 ]+" : ".*"}
              title={question.inputType === "phone" ? "Please enter a valid phone number" : undefined}
            />
          )}
        </div>
        <div className="flex justify-between w-full mt-4">
          {!isFirstQuestion && (
            <BackButton
              backButtonLabel={getLocalizedValue(question.backButtonLabel, languageCode)}
              onClick={() => {
                const updatedttc = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
                setTtc(updatedttc);
                onBack();
              }}
            />
          )}
          <div></div>
          <SubmitButton
            buttonLabel={getLocalizedValue(question.buttonLabel, languageCode)}
            isLastQuestion={isLastQuestion}
            onClick={() => { } }           />
        </div>
      </form>
    );
  };

  interface QuestionImageProps {
    imgUrl: string;
    altText?: string;
  }
  
  export  function QuestionImage({ imgUrl, altText = "Image" }: QuestionImageProps) {
    return (
      <div className="relative block mb-4 rounded-md group/image">
        <img src={imgUrl} alt={altText} className="rounded-md" />
        <a
          href={imgUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-2 right-2 flex items-center gap-2 rounded-md bg-gray-800 bg-opacity-40 p-1.5 text-white opacity-0 backdrop-blur-lg transition duration-300 ease-in-out hover:bg-opacity-65 group-hover/image:opacity-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-expand">
            <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8" />
            <path d="M3 16.2V21m0 0h4.8M3 21l6-6" />
            <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6" />
            <path d="M3 7.8V3m0 0h4.8M3 3l6 6" />
          </svg>
        </a>
      </div>
    );
  }

  
  interface HeadlineProps {
    headline?:  string;
    questionId: string;
    required?: boolean;
    alignTextCenter?: boolean;
  }
  
  export  function Headline({
    headline,
    questionId,
    required = true,
    alignTextCenter = false,
  }: HeadlineProps) {
     
    return (
      <label htmlFor={questionId} className="text-heading mb-1.5 block text-base font-semibold leading-6">
        <div className={`flex items-center  ${alignTextCenter ? "justify-center" : "justify-between"}`}>
          {headline}
          {!required && (
            <span className="self-start ml-2 text-sm font-normal leading-7 text-info-text" tabIndex={-1}>
              Optional
            </span>
          )}
        </div>
      </label>
    );
  }
  

  export function Subheader({ subheader, questionId }: { subheader?: string; questionId: string }) {
    return (
      <label htmlFor={questionId} className="block text-sm font-normal leading-6 text-subheading">
        {subheader}
      </label>
    );
  }
  
  interface BackButtonProps {
    onClick: () => void;
    backButtonLabel?: string;
    tabIndex?: number;
  }
  
  export function BackButton({ onClick, backButtonLabel, tabIndex = 2 }: BackButtonProps) {
    return (
      <button
        tabIndex={tabIndex}
        type={"button"}
        className={cn(
          "border-back-button-border text-heading focus:ring-focus rounded-custom flex items-center border px-3 py-3 text-base font-medium leading-4 shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
        )}
        onClick={onClick}>
        {backButtonLabel || "Back"}
      </button>
    );
  }
  


interface SubmitButtonProps {
  buttonLabel: string | undefined;
  isLastQuestion: boolean;
  onClick?: () => void;
  focus?: boolean;
  tabIndex?: number;
  type?: "submit" | "button";
  disabled ?: boolean;
}

function SubmitButton({
  buttonLabel,
  isLastQuestion,
  onClick = () => {},
  tabIndex = 1,
  focus = false,
  type = "submit",
  disabled = false
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
      onClick={onClick}
      disabled={disabled}
      >
      {buttonLabel || (isLastQuestion ? "Finish" : "Next")}
    </button>
  );
}


// interface MultipleChoiceSingleProps {
//   question: TSurveyMultipleChoiceSingleQuestion;
//   value: string;
//   onChange: (responseData: TResponseData) => void;
//   onSubmit: (data: TResponseData, ttc: TResponseTtc) => void;
//   onBack: () => void;
//   isFirstQuestion: boolean;
//   isLastQuestion: boolean;
//   languageCode: string;
//   ttc: TResponseTtc;
//   setTtc: (ttc: TResponseTtc) => void;
//   isInIframe: boolean;
// }

export const MultipleChoiceSingleQuestion = ({
  question,
  value,
  onChange,
  onSubmit,
  onBack,
  isFirstQuestion,
  isLastQuestion,
  languageCode,
  ttc,
  setTtc,
  isInIframe,
}: any) => {
  console.log(value , "pap");
  
  const [startTime, setStartTime] = useState(performance.now());
  const [otherSelected, setOtherSelected] = useState(false);
  const otherSpecify = useRef<HTMLInputElement | null>(null);
  const choicesContainerRef = useRef<HTMLDivElement | null>(null);
  
  useTtc(question.id, ttc, setTtc, startTime, setStartTime);

  const questionChoices = useMemo(() => {
    if (!question.choices) {
      return [];
    }
    const choicesWithoutOther = question.choices.filter((choice) => choice.id !== "other");
    if (question.shuffleOption) {
      return shuffleQuestions(choicesWithoutOther, question.shuffleOption);
    }
    return choicesWithoutOther;
  }, [question.choices, question.shuffleOption]);

  const otherOption = useMemo(
    () => question.choices.find((choice) => choice.id === "other"),
    [question.choices]
  );

  useEffect(() => {
    if (isFirstQuestion && !value) {
      const prefillAnswer = new URLSearchParams(window.location.search).get(question.id);
      if (prefillAnswer) {
        if (otherOption && prefillAnswer === getLocalizedValue(otherOption.label, languageCode)) {
          setOtherSelected(true);
          return;
        }
      }
    }

    const isOtherSelected =
      value !== undefined && !questionChoices.some((choice) => choice.label[languageCode] === value);
    setOtherSelected(isOtherSelected);
  }, [isFirstQuestion, languageCode, otherOption, question.id, questionChoices, value]);

  useEffect(() => {
    // Scroll to the bottom of choices container and focus on 'otherSpecify' input when 'otherSelected' is true
    if (otherSelected && choicesContainerRef.current && otherSpecify.current) {
      choicesContainerRef.current.scrollTop = choicesContainerRef.current.scrollHeight;
      otherSpecify.current.focus();
    }
  }, [otherSelected]);
  console.log("bini didi");
  
  return (
    <form
      key={question.id}
      onSubmit={(e) => {
        e.preventDefault();
        const updatedTtcObj = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
        setTtc(updatedTtcObj);
        onSubmit({ [question.id]: value }, updatedTtcObj);
      }}
      className="w-full">
      {question.imageUrl && <QuestionImage imgUrl={question.imageUrl} />}
      <Headline
        headline={getLocalizedValue(question.headline, languageCode)}
        questionId={question.id}
        required={question.required}
      />
      <Subheader
        subheader={question.subheader ? getLocalizedValue(question.subheader, languageCode) : ""}
        questionId={question.id}
      />{" "}
      <div className="mt-4">
        <fieldset>
          <legend className="sr-only">Options</legend>

          <div
            className="bg-survey-bg relative max-h-[33vh] space-y-2 overflow-y-auto py-0.5 pr-2"
            role="radiogroup"
            ref={choicesContainerRef}>
            {questionChoices.map((choice, idx) => (
              <label
                tabIndex={idx + 1}
                key={choice.id}
                className={cn(
                  value === choice.label ? "border-brand z-10" : "border-border",
                  "text-heading bg-input-bg focus-within:border-brand focus-within:bg-input-bg-selected hover:bg-input-bg-selected rounded-custom relative flex cursor-pointer flex-col border p-4 focus:outline-none"
                )}
                onKeyDown={(e) => {
                  // Accessibility: if spacebar was pressed pass this down to the input
                  if (e.key === " ") {
                    e.preventDefault();
                    document.getElementById(choice.id)?.click();
                    document.getElementById(choice.id)?.focus();
                  }
                }}
                autoFocus={idx === 0 && !isInIframe}>
                <span className="flex items-center text-sm">
                  <input
                    tabIndex={-1}
                    type="radio"
                    id={choice.id}
                    name={question.id}
                    value={choice.label}
                    className="w-4 h-4 border border-brand text-brand focus:ring-0 focus:ring-offset-0"
                    aria-labelledby={`${choice.id}-label`}
                    onChange={() => {
                      setOtherSelected(false);
                      onChange({ [question.id]: getLocalizedValue(choice.label, languageCode) });
                    }}
                    checked={value === getLocalizedValue(choice.label, languageCode)}
                    required={question.required && idx === 0}
                  />
                  <span id={`${choice.id}-label`} className="ml-3 font-medium">
                    {getLocalizedValue(choice.label, languageCode)}
                  </span>
                </span>
              </label>
            ))}
            {otherOption && (
              <label
                tabIndex={questionChoices.length + 1}
                className={cn(
                  value === getLocalizedValue(otherOption.label, languageCode)
                    ? "border-border bg-input-bg-selected z-10"
                    : "border-border",
                  "text-heading focus-within:border-brand bg-input-bg focus-within:bg-input-bg-selected hover:bg-input-bg-selected rounded-custom relative flex cursor-pointer flex-col border p-4 focus:outline-none"
                )}
                onKeyDown={(e) => {
                  // Accessibility: if spacebar was pressed pass this down to the input
                  if (e.key === " ") {
                    e.preventDefault();
                    document.getElementById(otherOption.id)?.click();
                    document.getElementById(otherOption.id)?.focus();
                  }
                }}>
                <span className="flex items-center text-sm">
                  <input
                    type="radio"
                    id={otherOption.id}
                    tabIndex={-1}
                    name={question.id}
                    value={getLocalizedValue(otherOption.label, languageCode)}
                    className="w-4 h-4 border border-brand text-brand focus:ring-0 focus:ring-offset-0"
                    aria-labelledby={`${otherOption.id}-label`}
                    onChange={() => {
                      setOtherSelected(!otherSelected);
                      onChange({ [question.id]: "" });
                    }}
                    checked={otherSelected}
                  />
                  <span id={`${otherOption.id}-label`} className="ml-3 font-medium">
                    {getLocalizedValue(otherOption.label, languageCode)}
                  </span>
                </span>
                {otherSelected && (
                  <input
                    ref={otherSpecify}
                    tabIndex={questionChoices.length + 1}
                    id={`${otherOption.id}-label`}
                    name={question.id}
                    value={value}
                    onChange={(e) => {
                      onChange({ [question.id]: e.currentTarget.value });
                    }}
                    className="flex w-full h-10 px-3 py-2 mt-3 text-sm border placeholder:text-placeholder border-border bg-survey-bg text-heading focus:ring-focus rounded-custom focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={
                      getLocalizedValue(question.otherOptionPlaceholder, languageCode) ?? "Please specify"
                    }
                    required={question.required}
                    aria-labelledby={`${otherOption.id}-label`}
                  />
                )}
              </label>
            )}
          </div>
        </fieldset>
      </div>
      <div className="flex justify-between w-full mt-4">
        {!isFirstQuestion && (
          <BackButton
            backButtonLabel={getLocalizedValue(question.backButtonLabel, languageCode)}
            tabIndex={questionChoices.length + 3}
            onClick={() => {
              const updatedTtcObj = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
              setTtc(updatedTtcObj);
              onBack();
            }}
          />
        )}
        <div></div>
        <SubmitButton
          tabIndex={questionChoices.length + 2}
          buttonLabel={getLocalizedValue(question.buttonLabel, languageCode)}
          isLastQuestion={isLastQuestion}
        />
      </div>
    </form>
  );
};


interface MultipleChoiceMultiProps {
  question: any;
  onSubmit: (data: { [x: string]: any }) => void;
  lastQuestion: boolean;
  brandColor: string;
}

export const MultipleChoiceMultiQuestion = ({
  question,
  value,
  onChange,
  onSubmit,
  onBack,
  isFirstQuestion,
  isLastQuestion,
  languageCode,
  ttc,
  setTtc,
  isInIframe,
}: any) => {
  const [startTime, setStartTime] = useState(performance.now());
  console.log(question , "amaa question");
   
  useTtc(question.id, ttc, setTtc, startTime, setStartTime);
  console.log(value , "value");
  
  const getChoicesWithoutOtherLabels = useCallback(
    () =>
      question.choices
        .filter((choice) => choice.id !== "other")
        .map((item) => getLocalizedValue(item.label, languageCode)),
    [question, languageCode]
  );
  const [otherSelected, setOtherSelected] = useState<boolean>(false);
  const [otherValue, setOtherValue] = useState("");

  useEffect(() => {
    setOtherSelected(
      !!value &&
        ((Array.isArray(value) ? value : [value]) as string[]).some((item) => {
          return getChoicesWithoutOtherLabels().includes(item) === false;
        })
    );
    // setOtherValue(
    //   (Array.isArray(value) &&
    //     value.filter((v) => !question.choices.find((c) => c.label[languageCode] === v))[0]) ||
    //     ""
    // );
  }, [question.id, getChoicesWithoutOtherLabels, question.choices, value, languageCode]);

  const questionChoices = useMemo(() => {
    if (!question.choices) {
      return [];
    }
    const choicesWithoutOther = question.choices.filter((choice) => choice.id !== "other");
    if (question.shuffleOption) {
      return shuffleQuestions(choicesWithoutOther, question.shuffleOption);
    }
    return choicesWithoutOther;
  }, [question.choices, question.shuffleOption]);

  const questionChoiceLabels = questionChoices.map((questionChoice) => {
    return questionChoice.label[languageCode];
  });

  const otherOption = useMemo(
    () => question.choices.find((choice) => choice.id === "other"),
    [question.choices]
  );

  const otherSpecify = useRef<HTMLInputElement | null>(null);
  const choicesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to the bottom of choices container and focus on 'otherSpecify' input when 'otherSelected' is true
    if (otherSelected && choicesContainerRef.current && otherSpecify.current) {
      choicesContainerRef.current.scrollTop = choicesContainerRef.current.scrollHeight;
      otherSpecify.current.focus();
    }
  }, [otherSelected]);

  const addItem = (item: string) => {
    console.log(item , "item");
    
    const isOtherValue = !questionChoiceLabels.includes(item);
    if (Array.isArray(value)) {
      if (isOtherValue) {
        const newValue = value.filter((v) => {
          return questionChoiceLabels.includes(v);
        });
        return onChange({ [question.id]: [...newValue, item] });
      } else {
        return onChange({ [question.id]: [...value, item] });
      }
    }
    return onChange({ [question.id]: [item] }); // if not array, make it an array
  };

  const removeItem = (item: string) => {
    if (Array.isArray(value)) {
      return onChange({ [question.id]: value.filter((i) => i !== item) });
    }
    return onChange({ [question.id]: [] }); // if not array, make it an array
  };
  const isDisabled = question?.mulitiselectvalidation  + 1  ?  (question?.mulitiselectvalidation + 1)  <= value?.length ? false : true  : false ;
  console.log( isDisabled  ,  Boolean(question?.mulitiselectvalidation  + 1) ,  value?.length , "value.length"   );

  return (
    <form
      key={question.id}
      onSubmit={(e) => {
        e.preventDefault();
        const newValue = (value as string[])?.filter((item) => {
          return getChoicesWithoutOtherLabels().includes(item) || item === otherValue;
        }); // filter out all those values which are either in getChoicesWithoutOtherLabels() (i.e. selected by checkbox) or the latest entered otherValue
        onChange({ [question.id]: newValue });
        const updatedTtcObj = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
        setTtc(updatedTtcObj);
        onSubmit({ [question.id]: value }, updatedTtcObj);
      }}
      className="w-full">
      {question.imageUrl && <QuestionImage imgUrl={question.imageUrl} />}
      <Headline
        headline={getLocalizedValue(question.headline, languageCode)}
        questionId={question.id}
        required={question.required}
      />
      <Subheader
        subheader={question.subheader ? getLocalizedValue(question.subheader, languageCode) : ""}
        questionId={question.id}
      />
      <div className="mt-4">
        <fieldset>
          <legend className="sr-only">Options</legend>
          <div
            className="bg-survey-bg relative max-h-[33vh] space-y-2 overflow-y-auto py-0.5 pr-2"
            ref={choicesContainerRef}>
            {questionChoices.map((choice, idx) => (
              <label
                key={choice.id}
                tabIndex={idx + 1}
                className={cn(
                  value === choice.label ? "border-border bg-input-selected-bg z-10" : "border-border",
                  "text-heading bg-input-bg focus-within:border-brand hover:bg-input-bg-selected focus:bg-input-bg-selected rounded-custom relative flex cursor-pointer flex-col border p-4 focus:outline-none"
                )}
                onKeyDown={(e) => {
                  // Accessibility: if spacebar was pressed pass this down to the input
                  if (e.key === " ") {
                    e.preventDefault();
                    document.getElementById(choice.id)?.click();
                    document.getElementById(choice.id)?.focus();
                  }
                }}
                autoFocus={idx === 0 && !isInIframe}>
                <span className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    id={choice.id}
                    name={question.id}
                    tabIndex={-1}
                    value={choice.label.default}
                    className="w-4 h-4 border border-brand text-brand focus:ring-0 focus:ring-offset-0"
                    aria-labelledby={`${choice.id}-label`}
                    onChange={(e) => {
                      if ((e.target as HTMLInputElement)?.checked) {
                        addItem(choice.label.default)
                      } else {
                        removeItem(choice.label.default);
                      }
                    }}
                    checked={
                      Array.isArray(value) && value.includes(choice.label.default )
                    }
                    required={
                      question.required && Array.isArray(value) && value.length ? false : question.required
                    }
                  />
                  <span id={`${choice.id}-label`} className="ml-3 font-medium">
                    {getLocalizedValue(choice.label, languageCode)}
                  </span>
                </span>
              </label>
            ))}
            {otherOption && (
              <label
                tabIndex={questionChoices.length + 1}
                className={cn(
                  value.includes(getLocalizedValue(otherOption.label, languageCode))
                    ? "border-border bg-input-selected-bg z-10"
                    : "border-border",
                  "text-heading focus-within:border-brand bg-input-bg focus-within:bg-input-bg-selected hover:bg-input-bg-selected rounded-custom relative flex cursor-pointer flex-col border p-4 focus:outline-none"
                )}
                onKeyDown={(e) => {
                  // Accessibility: if spacebar was pressed pass this down to the input
                  if (e.key === " ") {
                    e.preventDefault();
                    document.getElementById(otherOption.id)?.click();
                    document.getElementById(otherOption.id)?.focus();
                  }
                }}>
                <span className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    tabIndex={-1}
                    id={otherOption.id}
                    name={question.id}
                    value={getLocalizedValue(otherOption.label, languageCode)}
                    className="w-4 h-4 border border-brand text-brand focus:ring-0 focus:ring-offset-0"
                    aria-labelledby={`${otherOption.id}-label`}
                    onChange={(e) => {
                      setOtherSelected(!otherSelected);
                      if ((e.target as HTMLInputElement)?.checked) {
                        if (!otherValue) return;
                        addItem(otherValue);
                      } else {
                        removeItem(otherValue);
                      }
                    }}
                    checked={otherSelected}
                  />
                  <span id={`${otherOption.id}-label`} className="ml-3 font-medium">
                    {getLocalizedValue(otherOption.label, languageCode)}
                  </span>
                </span>
                {otherSelected && (
                  <input
                    ref={otherSpecify}
                    id={`${otherOption.id}-label`}
                    name={question.id}
                    tabIndex={questionChoices.length + 1}
                    value={otherValue}
                    onChange={(e) => {
                      setOtherValue(e.currentTarget.value);
                      addItem(e.currentTarget.value);
                    }}
                    className="flex w-full h-10 px-3 py-2 mt-3 text-sm border placeholder:text-placeholder border-border bg-survey-bg text-heading focus:ring-focus rounded-custom focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={
                      getLocalizedValue(question.otherOptionPlaceholder, languageCode) ?? "Please specify"
                    }
                    required={question.required}
                    aria-labelledby={`${otherOption.id}-label`}
                  />
                )}
              </label>
            )}
          </div>  
        </fieldset>
      </div>
      <div className="flex justify-between w-full mt-4">
        {!isFirstQuestion && (
          <BackButton
            tabIndex={questionChoices.length + 3}
            backButtonLabel={getLocalizedValue(question.backButtonLabel, languageCode)}
            onClick={() => {
              const updatedTtcObj = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
              setTtc(updatedTtcObj);
              onBack();
            }}
          />
        )}
        <div></div>
        <SubmitButton 
         disabled = {isDisabled}
          tabIndex={questionChoices.length + 2}
          buttonLabel={getLocalizedValue(question.buttonLabel, languageCode)}
          isLastQuestion={isLastQuestion}
        />
      </div>
    </form>
  );
};
