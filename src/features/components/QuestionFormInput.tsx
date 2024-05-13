//@ts-nocheck
import { TSurvey } from "@/types";
import { PencilIcon } from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";
import { getIndex, getLabelById, getPlaceHolderById, useSyncScroll } from "../utils";
import { Label } from "@/components/ui/label";
import { FormInput } from "./FormInput";

export const QuestionFormInput = ({
    id,
    value,
    localSurvey,
    questionIdx,
    updateQuestion,
    updateSurvey,
    updateChoice,
    updateMatrixLabel,
    label,
    selectedLanguageCode,
    maxLength,
    placeholder,
    onBlur,
    className,
  }: QuestionFormInputProps) => {
    const question: any = localSurvey?.questions?.[questionIdx];
    const questionId = question?.id;
    const isChoice = id.includes("choice");
    const isMatrixLabelRow = id.includes("row");
    const isMatrixLabelColumn = id.includes("column");
    const isThankYouCard = questionIdx === localSurvey.questions.length;
    const isWelcomeCard = questionIdx === -1;
    const index = getIndex(id, isChoice || isMatrixLabelColumn || isMatrixLabelRow);
  
  
  
  
  
  
    const [text, setText] = useState(() => value?.default ?? "");
    const [renderedText] = useState<JSX.Element[]>();

    const [showQuestionSelect] = useState(false);
    const [showFallbackInput, setShowFallbackInput] = useState(false);
  
    const highlightContainerRef = useRef<HTMLInputElement>(null);
    const fallbackInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
  
  
  
    // Hook to synchronize the horizontal scroll position of highlightContainerRef and inputRef.
    useSyncScroll(highlightContainerRef, inputRef);

  
    useEffect(() => {
      if (fallbackInputRef.current) {
        fallbackInputRef.current.focus();
      }
    }, [showFallbackInput]);

  
    const handleUpdate = (updatedText: string) => {
      const translatedText = createUpdatedText(updatedText);
  
      if (isChoice) {
        updateChoiceDetails(translatedText);
      } else if (isThankYouCard || isWelcomeCard) {
        updateSurveyDetails(translatedText);
      } else if (isMatrixLabelRow || isMatrixLabelColumn) {
        updateMatrixLabelDetails(translatedText);
      } else {
        updateQuestionDetails(translatedText);
      }
    };
  
    const createUpdatedText = (updatedText: string): any => {
      return {
        [selectedLanguageCode]: updatedText,
      };
    };
  
    const updateChoiceDetails = (translatedText: any) => {
      if (updateChoice && typeof index === "number") {
        updateChoice(index, { label: translatedText });
      }
    };
  
    const updateSurveyDetails = (translatedText: any) => {
      if (updateSurvey) {
        updateSurvey({ [id]: translatedText });
      }
    };
  
    const updateMatrixLabelDetails = (translatedText: any) => {
      if (updateMatrixLabel && typeof index === "number") {
        updateMatrixLabel(index, isMatrixLabelRow ? "row" : "column", translatedText);
      }
    };
  
    const updateQuestionDetails = (translatedText: any) => {
      if (updateQuestion) {
        updateQuestion(questionIdx, { [id]: translatedText });
      }
    };
  
  
  
  


    return (
      <div className="w-full">
        <div className="w-full">
          <div className="mt-3 mb-2">
            <Label htmlFor={id}>{label ?? getLabelById(id)}</Label>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center space-x-2">
              <div className="relative w-full group ">
                <div className="w-full h-10 "></div>
                <div
                  id="wrapper"
                  ref={highlightContainerRef}
                  className="no-scrollbar absolute top-0 z-0 mt-0.5 flex h-10 w-full overflow-scroll whitespace-nowrap px-3 py-2 text-center text-sm text-transparent ">
                  {renderedText}
                </div>
                <button
                  className="fixed right-14 hidden items-center rounded-b-lg bg-slate-100 px-2.5 py-1 text-xs hover:bg-slate-200 group-hover:flex"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowFallbackInput(true);
                  }}>
                  Edit Recall
                  <PencilIcon className="w-3 h-3 ml-2" />
                </button>
  
                <FormInput
                  key={`${questionId}-${id}-${selectedLanguageCode}`}
                  className={`absolute top-0 text-black caret-black ${className}`}
                  placeholder={placeholder ? placeholder : getPlaceHolderById(id)}
                  id={id}
                  name={id}
                  aria-label={label ? label : getLabelById(id)}
                  autoComplete={showQuestionSelect ? "off" : "on"}
                  value={text}
                  ref={inputRef}
                  onBlur={onBlur}
                  onChange={(e) => {
  
                    setText(e.target.value);
                    handleUpdate(
                      e.target.value
                      // headlineToRecall(e.target.value, recallQuestions, fallbacks, selectedLanguageCode)
                    );
                  }}
                  maxLength={maxLength ?? undefined}
                />
              </div>
              {/* {id === "headline" && (
                  <ImagePlusIcon
                    aria-label="Toggle image uploader"
                    className="w-4 h-4 ml-2 cursor-pointer text-slate-400 hover:text-slate-500"
                    // onClick={() => setShowImageUploader((prev) => !prev)}
                  />
                )} */}
            </div>
          </div>
        </div>
      </div>
    );
  };
  

  interface QuestionFormInputProps {
    id: string;
    value: any | undefined;
    localSurvey: TSurvey;
    questionIdx: number;
    updateQuestion?: (questionIdx: number, data: Partial<any>) => void;
    updateSurvey?: (data: Partial<any>) => void;
    updateChoice?: (choiceIdx: number, data: Partial<any>) => void;
    updateMatrixLabel?: (index: number, type: "row" | "column", data: Partial<any>) => void;
    isInvalid: boolean;
    selectedLanguageCode: string;
    setSelectedLanguageCode: (languageCode: string) => void;
    label?: string;
    maxLength?: number;
    placeholder?: string;
    ref?: RefObject<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    className?: string;
  }
