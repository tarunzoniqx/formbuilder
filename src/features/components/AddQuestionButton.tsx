//@ts-nocheck
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GridIcon, ListIcon, MessageSquareIcon, PlusCircleIcon, PlusIcon, TrashIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { getLocalizedValue } from "../utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuestionFormInput } from "./QuestionFormInput";
import { Label } from "@radix-ui/react-label";


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
  

export const questionTypes = [
    {
      id: QuestionId.OpenText,
      label: "Free text",
      description: "Ask for a text-based answer",
      icon: MessageSquareIcon,
      preset: {
        headline: { default: "What is your name " },
        subheader: { default: "please type your name " },
        placeholder: { default: "Type your answer here..." },
        longAnswer: true,
        inputType: "text",
      },
    },
    {
      id: QuestionId.MultipleChoiceSingle,
      label: "Single-Select",
      description: "A single choice from a list of options (radio buttons)",
      icon: GridIcon,
      preset: {
        headline: { default: "What do you do?" },
        subheader: { default: "Can't do both." },
        choices: [
          { id: nanoid(), label: { default: "Eat the cake 🍰" } },
          { id: nanoid(), label: { default: "Have the cake 🎂" } },
        ],
        shuffleOption: "none",
      },
    },
    {
      id: QuestionId.MultipleChoiceMulti,
      label: "Multi-Select",
      description: "Number of choices from a list of options (checkboxes)",
      icon: ListIcon,
      preset: {
        headline: { default: "What's important on vacay?" },
        choices: [
          { id: nanoid(), label: { default: "Sun ☀️" } },
          { id: nanoid(), label: { default: "Ocean 🌊" } },
          { id: nanoid(), label: { default: "Palms 🌴" } },
        ],
        shuffleOption: "none",
      },
    },
  ];
  

interface AddQuestionButtonProps {
    addQuestion: (question: any) => void;
  }
  
 export  function AddQuestionButton({ addQuestion }: AddQuestionButtonProps) {
    const [open, setOpen] = useState(false);
  
    return (
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className={cn(
          open ? "scale-100 shadow-lg" : "scale-97 shadow-md",
          "group w-full space-y-2 rounded-lg border  border-slate-300 bg-white transition-all duration-300 ease-in-out hover:scale-100 hover:cursor-pointer hover:bg-slate-50"
        )}>
        <CollapsibleTrigger asChild className="w-full h-full group">
          <div className="inline-flex">
            <div className="flex items-center justify-center w-10 rounded-l-lg bg-foreground group-aria-expanded:rounded-bl-none group-aria-expanded:rounded-br">
              <PlusCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="px-4 py-3">
              <p className="font-semibold">Add Question</p>
              <p className="mt-1 text-sm text-slate-500">Add a new question to your Form</p>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col justify-left ">
          {/* <hr className="py-1 text-slate-600" /> */}
          {questionTypes.map((questionType) => (
            <button
              type="button"
              key={questionType.id}
              className="mx-2 inline-flex items-center rounded p-0.5 px-4 py-2 font-medium text-slate-700 last:mb-2 hover:bg-slate-100 hover:text-slate-800"
              onClick={() => {
                addQuestion({
                  ...getQuestionDefaults(questionType.id),
                  id: nanoid(),
                  required: true,
                  type: questionType.id,
                });
                setOpen(false);
              }}>
              <questionType.icon className="text-brand-dark -ml-0.5 mr-2 h-5 w-5" aria-hidden="true" />
              {questionType.label}
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const getQuestionDefaults = (id: string) => {
    const questionType = questionTypes.find((questionType) => questionType.id === id);
    return replaceQuestionPresetPlaceholders(questionType?.preset);
  };


  const replaceQuestionPresetPlaceholders = (
  question: any,
): any => {
  // if (!product) return question;
  const newQuestion = structuredClone(question);
  const defaultLanguageCode = "default";
  if (newQuestion.headline) {
    newQuestion.headline[defaultLanguageCode] = getLocalizedValue(
      newQuestion.headline,
      defaultLanguageCode
    ).replace("{{productName}}", "bini");
  }
  if (newQuestion.subheader) {
    newQuestion.subheader[defaultLanguageCode] = getLocalizedValue(
      newQuestion.subheader,
      defaultLanguageCode
    )?.replace("{{productName}}", "bini");
  }
  return newQuestion;
};


// 

export function MultipleChoiceSingleForm({
  question,
  questionIdx,
  updateQuestion,
  isInvalid,
  localSurvey,
  selectedLanguageCode,
  setSelectedLanguageCode
}: any) {
  const lastChoiceRef = useRef<HTMLInputElement>(null);
  const [isNew, setIsNew] = useState(true);
  const [showSubheader, setShowSubheader] = useState(!!question.subheader);
  const [isInvalidValue, setisInvalidValue] = useState<string | null>(null);
  const questionRef = useRef<HTMLInputElement>(null);




  const findDuplicateLabel = () => {
    for (let i = 0; i < question.choices.length; i++) {
      for (let j = i + 1; j < question.choices.length; j++) {
        if (
          getLocalizedValue(question.choices[i].label, selectedLanguageCode).trim() ===
          getLocalizedValue(question.choices[j].label, selectedLanguageCode).trim()
        ) {
          return getLocalizedValue(question.choices[i].label, selectedLanguageCode).trim(); // Return the duplicate label
        }
      }
    }
    return null;
  };



  interface UpdateChoiceData {
    label?: any;
    // Add other properties if needed
  }



  const updateChoice = (choiceIdx: number, updatedAttributes: UpdateChoiceData) => {
    const newLabel = updatedAttributes.label;
    const oldLabel = question.choices[choiceIdx].label;
    let newChoices: any[] = [];
    if (question.choices) {
      newChoices = question.choices.map((choice, idx) => {
        if (idx !== choiceIdx) return choice;
        return { ...choice, ...updatedAttributes };
      });
    }

    const newLogic: any[] = [];
    question.logic?.forEach((logic) => {
      let newL: string | string[] | undefined = logic.value;
      if (Array.isArray(logic.value)) {
        newL = logic.value.map((value) => (value === oldLabel.default ? newLabel : value));
      } else {
        newL = logic.value === getLocalizedValue(oldLabel, selectedLanguageCode) ? newLabel : logic.value;
      }
      newLogic.push({ ...logic, value: newL });
    });
    updateQuestion(questionIdx, { choices: newChoices, logic: newLogic });
  };


  const addChoice = (choiceIdx?: number) => {
    setIsNew(false); // This question is no longer new.
    let newChoices = !question.choices ? [] : question.choices;
    const otherChoice = newChoices.find((choice) => choice.id === "other");
    if (otherChoice) {
      newChoices = newChoices.filter((choice) => choice.id !== "other");
    }
    const newChoice = {
      id: nanoid(),
      label: {
        default: ""
      },
    };
    if (choiceIdx !== undefined) {
      newChoices.splice(choiceIdx + 1, 0, newChoice);
    } else {
      newChoices.push(newChoice);
    }
    if (otherChoice) {
      newChoices.push(otherChoice);
    }
    updateQuestion(questionIdx, { choices: newChoices });
  };




  const deleteChoice = (choiceIdx: number) => {
    const newChoices = !question.choices ? [] : question.choices.filter((_, idx) => idx !== choiceIdx);
    const choiceValue = question.choices[choiceIdx].label.default;
    if (isInvalidValue === choiceValue) {
      setisInvalidValue(null);
    }
    const newLogic: any[] = [];
    question.logic?.forEach((logic) => {
      let newL: string | string[] | undefined = logic.value;
      if (Array.isArray(logic.value)) {
        newL = logic.value.filter((value) => value !== choiceValue);
      } else {
        newL = logic.value !== choiceValue ? logic.value : undefined;
      }
      newLogic.push({ ...logic, value: newL });
    });

    updateQuestion(questionIdx, { choices: newChoices, logic: newLogic });
  };

  useEffect(() => {
    if (lastChoiceRef.current) {
      lastChoiceRef.current?.focus();
    }
  }, [question.choices?.length]);


  useEffect(() => {
    if (isNew && questionRef.current) {
      questionRef.current.focus();
    }
  }, [isNew]);

  return (
    <>
      <QuestionFormInput
        id="headline"
        value={question.headline}

        localSurvey={localSurvey}
        questionIdx={questionIdx}
        isInvalid={isInvalid}
        updateQuestion={updateQuestion}
        selectedLanguageCode={selectedLanguageCode}
        setSelectedLanguageCode={setSelectedLanguageCode}
      />
      <div>
        {showSubheader && (
          <div className="inline-flex items-center w-full">
            <div className="w-full">
              <QuestionFormInput
                id="subheader"
                value={question.subheader}
                localSurvey={localSurvey}
                questionIdx={questionIdx}
                isInvalid={isInvalid}
                updateQuestion={updateQuestion}
                selectedLanguageCode={selectedLanguageCode}
                setSelectedLanguageCode={setSelectedLanguageCode}
              />
            </div>

            <TrashIcon
              className="w-4 h-4 mt-10 ml-2 cursor-pointer text-slate-400 hover:text-slate-500"
              onClick={() => {
                setShowSubheader(false);
                updateQuestion(questionIdx, { subheader: undefined });
              }}
            />
          </div>
        )}
        {!showSubheader && (
          <Button
            size="sm"
            className="mt-3"
            type="button"
            onClick={() => {
              updateQuestion(questionIdx, {
                subheader: "",
              });
              setShowSubheader(true);
            }}>
            {" "}
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Descriptions
          </Button>
        )}
      </div>

      <div className="mt-3">
        <Label htmlFor="choices">Options</Label>
        <div className="mt-2 -space-y-2" id="choices">
          {question.choices &&
            question.choices.map((choice, choiceIdx) => (
              <div className="inline-flex items-center w-full">
                <div className="flex w-full space-x-2">
                  <QuestionFormInput
                    key={choice.id}
                    id={`choice-${choiceIdx}`}
                    placeholder={choice.id === "other" ? "Other" : `Option ${choiceIdx + 1}`}
                    localSurvey={localSurvey}
                    questionIdx={questionIdx}
                    value={choice.label}
                    onBlur={() => {
                      const duplicateLabel = findDuplicateLabel();
                      if (duplicateLabel) {
                        setisInvalidValue(duplicateLabel);
                      } else {
                        setisInvalidValue(null);
                      }
                    }}
                    updateChoice={updateChoice}
                    selectedLanguageCode={selectedLanguageCode}
                    setSelectedLanguageCode={setSelectedLanguageCode}
                    isInvalid={isInvalid}
                    className={`${choice.id === "other" ? "border border-dashed" : ""}`}
                  />
                  {choice.id === "other" && (
                    <QuestionFormInput
                      isInvalid={false}
                      id="otherOptionPlaceholder"
                      localSurvey={localSurvey}
                      placeholder={"Please specify"}
                      questionIdx={questionIdx}
                      value={
                        question.otherOptionPlaceholder
                          ? question.otherOptionPlaceholder : null}
                      updateQuestion={updateQuestion}
                      selectedLanguageCode={selectedLanguageCode}
                      setSelectedLanguageCode={setSelectedLanguageCode}
                      className="border border-dashed"
                    />
                  )}
                </div>
                {question.choices && question.choices.length > 2 && (
                  <TrashIcon
                    className="w-4 h-4 ml-2 cursor-pointer text-slate-400 hover:text-slate-500"
                    onClick={() => deleteChoice(choiceIdx)}
                  />
                )}
                <div className="w-4 h-4 ml-2">
                  {choice.id !== "other" && (
                    <PlusIcon
                      className="w-full h-full cursor-pointer text-slate-400 hover:text-slate-500"
                      onClick={() => addChoice(choiceIdx)}
                    />
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

    </>
  )
}


export function MultipleChoiceMultiForm({
  question,
  questionIdx,
  updateQuestion,
  isInvalid,
  localSurvey,
  selectedLanguageCode,
  setSelectedLanguageCode,
}: any): JSX.Element {
  console.log(question, "questionamamamamma");

  const lastChoiceRef = useRef<HTMLInputElement>(null);
  const [isNew, setIsNew] = useState(true);
  const [showSubheader, setShowSubheader] = useState(!!question.subheader);
  const questionRef = useRef<HTMLInputElement>(null);
  const [isInvalidValue, setisInvalidValue] = useState<string | null>(null);


  
  interface UpdateChoiceData {
    label?: any;
  }

  
 
  const updateChoice = (choiceIdx: number, updatedAttributes: UpdateChoiceData) => {
    console.log(updatedAttributes, "updatedAttributes");

    const newLabel = updatedAttributes.label;
    const oldLabel = question.choices[choiceIdx].label;
    console.log(newLabel, oldLabel, "oldLabel oldLabel");

    let newChoices: any[] = [];
    if (question.choices) {
      newChoices = question.choices.map((choice, idx) => {
        if (idx !== choiceIdx) return choice;
        return { ...choice, ...updatedAttributes };
      });
    }

    const newLogic: any[] = [];
    question.logic?.forEach((logic) => {
      let newL: string | string[] | undefined = logic.value;
      if (Array.isArray(logic.value)) {
        newL = logic.value.map((value) =>
          newLabel && value === oldLabel.default ? newLabel : value
        );
      } else {
        newL = logic.value === oldLabel.default ? newLabel : logic.value;
      }
      newLogic.push({ ...logic, value: newL });
    });
    updateQuestion(questionIdx, { choices: newChoices, logic: newLogic });
  };

  const findDuplicateLabel = () => {
    for (let i = 0; i < question.choices.length; i++) {
      for (let j = i + 1; j < question.choices.length; j++) {
        if (
          getLocalizedValue(question.choices[i].label, selectedLanguageCode).trim() ===
          getLocalizedValue(question.choices[j].label, selectedLanguageCode).trim()
        ) {
          return getLocalizedValue(question.choices[i].label, selectedLanguageCode).trim(); // Return the duplicate label
        }
      }
    }
    return null;
  };

  const addChoice = (choiceIdx?: number) => {
    setIsNew(false); // This question is no longer new.
    let newChoices = !question.choices ? [] : question.choices;
    const otherChoice = newChoices.find((choice) => choice.id === "other");
    if (otherChoice) {
      newChoices = newChoices.filter((choice) => choice.id !== "other");
    }
    const newChoice = {
      id: nanoid(),
      label: {
        default: "",
      },
    };
    if (choiceIdx !== undefined) {
      newChoices.splice(choiceIdx + 1, 0, newChoice);
    } else {
      newChoices.push(newChoice);
    }
    if (otherChoice) {
      newChoices.push(otherChoice);
    }
    updateQuestion(questionIdx, { choices: newChoices });
  };



  const deleteChoice = (choiceIdx: number) => {
    const newChoices = !question.choices ? [] : question.choices.filter((_, idx) => idx !== choiceIdx);

    const choiceValue = question.choices[choiceIdx].label.default;
    if (isInvalidValue === choiceValue) {
      setisInvalidValue(null);
    }
    const newLogic: any[] = [];
    question.logic?.forEach((logic) => {
      let newL: string | string[] | undefined = logic.value;
      if (Array.isArray(logic.value)) {
        newL = logic.value.filter((value) => value !== choiceValue);
      } else {
        newL = logic.value !== choiceValue ? logic.value : undefined;
      }
      newLogic.push({ ...logic, value: newL });
    });

    updateQuestion(questionIdx, { choices: newChoices, logic: newLogic });
  };

  useEffect(() => {
    if (lastChoiceRef.current) {
      lastChoiceRef.current?.focus();
    }
  }, [question.choices?.length]);

  // This effect will run once on initial render, setting focus to the question input.
  useEffect(() => {
    if (isNew && questionRef.current) {
      questionRef.current.focus();
    }
  }, [isNew]);

  return (
    <form>
      <QuestionFormInput
        id="headline"
        value={question.headline}
        localSurvey={localSurvey}
        questionIdx={questionIdx}
        isInvalid={isInvalid}
        updateQuestion={updateQuestion}
        selectedLanguageCode={selectedLanguageCode}
        setSelectedLanguageCode={setSelectedLanguageCode}
      />

      <div>
        {showSubheader && (
          <div className="inline-flex items-center w-full">
            <div className="w-full">
              <QuestionFormInput
                id="subheader"
                value={question.subheader}
                localSurvey={localSurvey}
                questionIdx={questionIdx}
                isInvalid={isInvalid}
                updateQuestion={updateQuestion}
                selectedLanguageCode={selectedLanguageCode}
                setSelectedLanguageCode={setSelectedLanguageCode}
              />
            </div>

            <TrashIcon
              className="w-4 h-4 mt-10 ml-2 cursor-pointer text-slate-400 hover:text-slate-500"
              onClick={() => {
                setShowSubheader(false);
                updateQuestion(questionIdx, { subheader: undefined });
              }}
            />
          </div>
        )}
        {!showSubheader && (
          <Button
            size="sm"
            className="mt-3"
            type="button"
            onClick={() => {
              updateQuestion(questionIdx, {
                subheader: "",
              });
              setShowSubheader(true);
            }}>
            {" "}
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Descriptions
          </Button>
        )}
      </div>

      <div className="mt-3">
        <Label htmlFor="choices">Options</Label>
        <div className="mt-2 -space-y-2" id="choices">
          {question.choices &&
            question.choices.map((choice, choiceIdx) => (
              <div key={choiceIdx} className="inline-flex items-center w-full">
                <div className="flex w-full space-x-2">
                  <QuestionFormInput
                    key={choice.id}
                    id={`choice-${choiceIdx}`}
                    localSurvey={localSurvey}
                    placeholder={choice.id === "other" ? "Other" : `Option ${choiceIdx + 1}`}
                    questionIdx={questionIdx}
                    value={choice.label}
                    onBlur={() => {
                      const duplicateLabel = findDuplicateLabel();
                      if (duplicateLabel) {
                        setisInvalidValue(duplicateLabel);
                      } else {
                        setisInvalidValue(null);
                      }
                    }}
                    updateChoice={updateChoice}
                    selectedLanguageCode={selectedLanguageCode}
                    setSelectedLanguageCode={setSelectedLanguageCode}
                    isInvalid={isInvalid}
                    className={`${choice.id === "other" ? "border border-dashed" : ""}`}
                  />
                  {choice.id === "other" && (
                    <QuestionFormInput
                      id="otherOptionPlaceholder"
                      localSurvey={localSurvey}
                      placeholder={"Please specify"}
                      questionIdx={questionIdx}
                      value={
                        question.otherOptionPlaceholder
                          ? question.otherOptionPlaceholder
                          : "Please specify"
                      }
                      updateQuestion={updateQuestion}
                      selectedLanguageCode={selectedLanguageCode}
                      setSelectedLanguageCode={setSelectedLanguageCode}
                      isInvalid={isInvalid}
                      className="border border-dashed"
                    />
                  )}
                </div>
                {question.choices && question.choices.length > 2 && (
                  <TrashIcon
                    className="w-4 h-4 ml-2 cursor-pointer text-slate-400 hover:text-slate-500"
                    onClick={() => deleteChoice(choiceIdx)}
                  />
                )}
                <div className="w-4 h-4 ml-2">
                  {choice.id !== "other" && (
                    <PlusIcon
                      className="w-full h-full cursor-pointer text-slate-400 hover:text-slate-500"
                      onClick={() => addChoice(choiceIdx)}
                    />
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </form>
  );
}