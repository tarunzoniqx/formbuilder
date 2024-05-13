//@ts-nocheck
import { QuestionCardProps, TProduct, TSurvey, TSurveyQuestionTypeZ } from "../types/index";
import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { extractRecallInfo, getLocalizedValue } from "./utils";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon, ChevronRightIcon, ListIcon, MessageSquareIcon, PlusIcon, RowsIcon, TrashIcon } from "lucide-react";
import { QuestionFormInput } from "./components/QuestionFormInput";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AddQuestionButton, MultipleChoiceMultiForm, MultipleChoiceSingleForm } from "./components/AddQuestionButton";
import PreviewSurvey from "./components/preview";


const dummyform = {
    id: 'cuid2-generated-id', // replace with cuid2 generated id
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Survey Name',
    type: { // replace with ZSurveyType values
      id: 'type-id',
      name: 'Type Name',
    },
    environmentId: 'environment-id',
    createdBy: null, // or 'user-id'
    status: { // replace with ZSurveyStatus values
      id: 'status-id',
      name: 'Status Name',
    },
    displayOption: { // replace with ZSurveyDisplayOption values
      id: 'display-option-id',
      name: 'Display Option Name',
    },
    autoClose: null, // or number value
    triggers: ['trigger1', 'trigger2'], // replace with actual triggers
    inlineTriggers: null, // or ZSurveyInlineTriggers values
    redirectUrl: null, // or 'https://example.com'
    recontactDays: null, // or number value
    welcomeCard: { // replace with ZSurveyWelcomeCard values
      title: 'Welcome Card Title',
      description: 'Welcome Card Description',
    },
    questions: [ // replace with ZSurveyQuestions values
    ],
    thankYouCard: { // replace with ZSurveyThankYouCard values
      title: 'Thank You Card Title',
      description: 'Thank You Card Description',
    },
    hiddenFields: [ // replace with ZSurveyHiddenFields values
      {
        id: 'hidden-field-id',
        name: 'Hidden Field Name',
        value: 'Hidden Field Value',
      },
    ],
    delay: 0, // or number value
    autoComplete: null, // or number value
    closeOnDate: null, // or new Date()
    productOverwrites: null, // or ZSurveyProductOverwrites values
    styling: null, // or ZSurveyStyling values
    surveyClosedMessage: null, // or ZSurveyClosedMessage values
    segment: null, // or ZSegment values
    singleUse: null, // or ZSurveySingleUse values
    verifyEmail: null, // or ZSurveyVerifyEmail values
    pin: null, // or 'generated-pin'
    resultShareKey: null, // or 'generated-key'
    displayPercentage: null, // or number value between 1 and 100
    languages: [ // replace with ZSurveyLanguage values
      {
        id: 'language-id',
        name: 'Language Name',
      },
    ],
};

const FormBuilder = () => {
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
    const [localSurvey, setLocalSurvey] = useState<TSurvey | null>(dummyform);
    const [invalidQuestions, setInvalidQuestions] = useState<string[] | null>(null);
    const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>("default");
    const [localProduct] = useState<any>(null);
  
    return(
        <QuestionsView  
        localSurvey={localSurvey}
        setLocalSurvey={setLocalSurvey}
        activeQuestionId={activeQuestionId}
        setActiveQuestionId={setActiveQuestionId}
        product={localProduct}
        invalidQuestions={invalidQuestions}
        setInvalidQuestions={setInvalidQuestions}
        selectedLanguageCode={selectedLanguageCode ? selectedLanguageCode : "default"}
        setSelectedLanguageCode={setSelectedLanguageCode}
      />
    )
  
}


  interface QuestionsViewProps {
    localSurvey: TSurvey;
    setLocalSurvey: (survey: TSurvey) => void;
    activeQuestionId: string | null;
    setActiveQuestionId: (questionId: string | null) => void;
    product: TProduct;
    invalidQuestions: string[] | null;
    setInvalidQuestions: (invalidQuestions: string[] | null) => void;
    selectedLanguageCode: string;
    setSelectedLanguageCode: (languageCode: string) => void;
    isMultiLanguageAllowed?: boolean;
    isCloud: boolean;
  }
  
  
  interface QuestionIdMap {
    [key: string]: string;
  }
  
  export function QuestionsView({ activeQuestionId,
    setActiveQuestionId,
    localSurvey,
    setLocalSurvey,
    product,
    invalidQuestions,
    setSelectedLanguageCode,
    selectedLanguageCode,
  }: QuestionsViewProps) {
  
    const internalQuestionIdMap = useMemo(() => {
      const questionIdMap: QuestionIdMap = {};
      localSurvey?.questions?.forEach((question) => {
        questionIdMap[question.id] = nanoid();
      });
      return questionIdMap;
    }, [localSurvey?.questions]);
  
  
  
    const [backButtonLabel, setbackButtonLabel] = useState(null);
  
    const addQuestion = (question: any) => {
      const updatedSurvey = { ...localSurvey };
      if (backButtonLabel) {
        question.backButtonLabel = backButtonLabel;
      }
  
  
  
      updatedSurvey.questions.push({ ...question, isDraft: true });
  
  
      setLocalSurvey(updatedSurvey);
      setActiveQuestionId(question.id);
      internalQuestionIdMap[question.id] = nanoid();
    };
  
    const moveQuestion = (questionIndex: number, up: boolean) => {
      const newQuestions = Array.from(localSurvey.questions);
      const [reorderedQuestion] = newQuestions.splice(questionIndex, 1);
      const destinationIndex = up ? questionIndex - 1 : questionIndex + 1;
      newQuestions.splice(destinationIndex, 0, reorderedQuestion);
      const updatedSurvey = { ...localSurvey, questions: newQuestions };
      setLocalSurvey(updatedSurvey);
    };
  
    const handleQuestionLogicChange = (survey: TSurvey, compareId: string, updatedId: string): TSurvey => {
  
      survey.questions.forEach((question) => {
        if (question.headline.default.includes(`recall:${compareId}`)) {
          question.headline.default = question.headline.default.replaceAll(
            `recall:${compareId}`,
            `recall:${updatedId}`
          );
        }
        if (!question.logic) return;
        question.logic.forEach((rule) => {
          if (rule.destination === compareId) {
            rule.destination = updatedId;
          }
        });
      });
      return survey;
    };
  
    const updateQuestion = (questionIdx: number, updatedAttributes: { label: string, backButtonLabel: { default: string; } }) => {
      const updatedSurvey = { ...localSurvey };
      
      //! mismatch of the types 
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      updatedSurvey.questions[questionIdx] = {
        ...updatedSurvey.questions[questionIdx],
        ...updatedAttributes
      };
  
    
      setLocalSurvey(updatedSurvey);
    };
  
    const deleteQuestion = (questionIdx: number) => {
      const questionId = localSurvey.questions[questionIdx].id;
      const activeQuestionIdTemp = activeQuestionId ?? localSurvey.questions[0].id;
      let updatedSurvey = { ...localSurvey };
  
      // check if we are recalling from this question
      updatedSurvey.questions.forEach((question) => {
        console.log(question.headline, "headline");
  
        if (question.headline.default.includes(`recall:${questionId}`)) {
          const recallInfo = extractRecallInfo(getLocalizedValue(question.headline, selectedLanguageCode));
          if (recallInfo) {
            question.headline.default = question.headline.default.replace(
              recallInfo,
              ""
            );
          }
        }
      });
      updatedSurvey.questions.splice(questionIdx, 1);
      updatedSurvey = handleQuestionLogicChange(updatedSurvey, questionId, "end");
      setLocalSurvey(updatedSurvey);
      delete internalQuestionIdMap[questionId];
      if (questionId === activeQuestionIdTemp) {
        if (questionIdx <= localSurvey.questions.length && localSurvey.questions.length > 0) {
          setActiveQuestionId(localSurvey.questions[questionIdx % localSurvey.questions.length].id);
        }
      }
      // toast.success("Question deleted.");
    };
  
  
    return (
      <div className="grid w-full grid-cols-2" >
        <div className="px-5 py-4 mt-16 ">
          <div className="flex flex-col gap-5 mb-5 ">
            {localSurvey?.questions?.map((question, questionIdx) => (
              // display a question form
              <QuestionCard
                key={internalQuestionIdMap[question.id]}
                localSurvey={localSurvey}
                product={product}
                questionIdx={questionIdx}
                moveQuestion={moveQuestion}
                updateQuestion={updateQuestion}
                selectedLanguageCode={selectedLanguageCode}
                setSelectedLanguageCode={setSelectedLanguageCode}
                deleteQuestion={deleteQuestion}
                activeQuestionId={activeQuestionId}
                setActiveQuestionId={setActiveQuestionId}
                lastQuestion={questionIdx === localSurvey.questions.length - 1}
                isInvalid={invalidQuestions ? invalidQuestions.includes(question.id) : false}
              />
            ))}
            <AddQuestionButton addQuestion={addQuestion} />
          </div>
  
  
        </div>
        <aside className="items-center justify-center flex-1 flex-shrink-0 hidden py-6 overflow-hidden border-l group border-slate-100 bg-slate-50 md:flex md:flex-col h-[90vh] ">
  
          <PreviewSurvey
            survey={localSurvey}
            setActiveQuestionId={setActiveQuestionId}
            activeQuestionId={activeQuestionId}
            product={product}
            environment={{}}
            previewType={"fullwidth"}
            languageCode={selectedLanguageCode}
            onFileUpload={async (file) => file.name}
          />
        </aside>
      </div>
  
    )
  }


  const QuestionCard = ({
    localSurvey,
    questionIdx,
    updateQuestion,
    deleteQuestion,
    activeQuestionId,
    setActiveQuestionId,
    lastQuestion,
    selectedLanguageCode,
    setSelectedLanguageCode,
    isInvalid,
  }: QuestionCardProps) => {
    const question = localSurvey.questions[questionIdx];
  
    const open = activeQuestionId === question.id;
    const [openAdvanced, setOpenAdvanced] = useState(false);
  
  
  
    const updateEmptyNextButtonLabels = (labelValue: { default ?: string | undefined }) => {
      localSurvey.questions.forEach((q, index) => {
        if (index === localSurvey.questions.length - 1) return;
        if (!q.buttonLabel || q.buttonLabel.default?.trim() === "") {
          updateQuestion(index, { buttonLabel: labelValue });
        }
      });
    };
  
  
  
    return (
      <>
        <div
          className={cn(
            open ? "scale-100 shadow-lg" : "scale-97 shadow-md",
            "flex flex-row rounded-lg bg-white transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              open ? "bg-slate-700" : "bg-slate-400",
              "top-0 w-10 rounded-l-lg p-2 text-center text-sm text-white hover:cursor-grab hover:bg-slate-600",
              isInvalid && "bg-red-400  hover:bg-red-600"
            )}
          >
            {questionIdx + 1}
          </div>
          <Collapsible
            open={open}
            onOpenChange={() => {
              if (activeQuestionId !== question.id) {
                setActiveQuestionId(question.id);
              } else {
                setActiveQuestionId(question.id);
              }
            }}
            className="flex-1 border rounded-r-lg border-slate-200"
          >
            <CollapsibleTrigger
              asChild
              className={cn(open ? "" : "  ", "flex cursor-pointer  p-4 relative  hover:bg-slate-50 w-full ")}
            >
              <div className="inline-flex">
                <div className="-ml-0.5 mr-3 h-6 min-w-[1.5rem] text-slate-400">
                  {question.type === TSurveyQuestionTypeZ.OpenText ? (
                    <MessageSquareIcon className="w-5 h-5" />
                  ) : question.type === TSurveyQuestionTypeZ.MultipleChoiceSingle ? (
                    <RowsIcon className="w-5 h-5" />
                  ) : question.type === TSurveyQuestionTypeZ.MultipleChoiceMulti ? (
                    <ListIcon className="w-5 h-5" />
                  ) : null}
                </div>
                <div>
                  <div className="flex justify-between w-full " >
                    <p className="text-sm font-semibold ">
                      {question?.headline?.default}
                    </p>
                    <TrashIcon className="absolute right-3" size={18} onClick={() => deleteQuestion(questionIdx)} />
                  </div>
                  {!open && question?.required && (
                    <p className="mt-1 text-xs truncate text-slate-500">
                      {question?.required && "Required"}
                    </p>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              {question.type === TSurveyQuestionTypeZ.OpenText ? (
                <OpenQuestionForm
                  localSurvey={localSurvey}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  lastQuestion={lastQuestion}
                  selectedLanguageCode={selectedLanguageCode}
                  setSelectedLanguageCode={setSelectedLanguageCode}
                  isInvalid={isInvalid}
                />
              ) : question.type === TSurveyQuestionTypeZ.MultipleChoiceSingle ? (
                <MultipleChoiceSingleForm
                  localSurvey={localSurvey}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  lastQuestion={lastQuestion}
                  selectedLanguageCode={selectedLanguageCode}
                  setSelectedLanguageCode={setSelectedLanguageCode}
                  isInvalid={isInvalid}
                />
              ) : question.type === TSurveyQuestionTypeZ.MultipleChoiceMulti ? (
                <MultipleChoiceMultiForm
                  localSurvey={localSurvey}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  lastQuestion={lastQuestion}
                  selectedLanguageCode={selectedLanguageCode}
                  setSelectedLanguageCode={setSelectedLanguageCode}
                  isInvalid={isInvalid}
                />
              ) : null}
              {/* PAP */}
              <div className="mt-4">
                <Collapsible onOpenChange={setOpenAdvanced} className="mt-5">
                  <CollapsibleTrigger className="flex items-center text-sm text-slate-700">
                    {openAdvanced ? (
                      <ChevronDownIcon className="w-3 h-4 mr-1" />
                    ) : (
                      <ChevronRightIcon className="w-3 h-4 mr-2" />
                    )}
                    {openAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
                  </CollapsibleTrigger>
  
                  <CollapsibleContent className="space-y-4">
                    <div className="flex mt-2 space-x-2">
                      <div className="w-full">
                        <QuestionFormInput
                          id="buttonLabel"
                          value={question.buttonLabel}
                          localSurvey={localSurvey}
                          questionIdx={questionIdx}
                          maxLength={48}
                          placeholder={lastQuestion ? "Finish" : "Next"}
                          isInvalid={isInvalid}
                          updateQuestion={updateQuestion}
                          selectedLanguageCode={selectedLanguageCode}
                          setSelectedLanguageCode={setSelectedLanguageCode}
                          onBlur={(e) => {
                            if (!question.buttonLabel) return;
                            const translatedNextButtonLabel = {
                              ...question.buttonLabel,
                              [selectedLanguageCode]: e.target.value,
                            };
  
                            if (questionIdx === localSurvey.questions.length - 1) return;
                            updateEmptyNextButtonLabels(translatedNextButtonLabel);
                          }}
                        />
                      </div>
                      {questionIdx !== 0 && (
                        <QuestionFormInput
                          id="backButtonLabel"
                          value={question.backButtonLabel}
                          localSurvey={localSurvey}
                          questionIdx={questionIdx}
                          maxLength={48}
                          placeholder={"Back"}
                          isInvalid={isInvalid}
                          updateQuestion={updateQuestion}
                          selectedLanguageCode={selectedLanguageCode}
                          setSelectedLanguageCode={setSelectedLanguageCode}
                        />
                      )}
                    </div>
                    {questionIdx !== 0 && (
                      <div className="mt-4">
                        <QuestionFormInput
                          id="backButtonLabel"
                          value={question.backButtonLabel}
                          localSurvey={localSurvey}
                          questionIdx={questionIdx}
                          maxLength={48}
                          placeholder={"Back"}
                          isInvalid={isInvalid}
                          updateQuestion={updateQuestion}
                          selectedLanguageCode={selectedLanguageCode}
                          setSelectedLanguageCode={setSelectedLanguageCode}
                        />
                      </div>
                    )}
                    <div>
                      {question.type === TSurveyQuestionTypeZ.MultipleChoiceMulti && (
                        <>
                          <div className="mt-3 mb-2">
                            <Label > chose mandatory option to go ahead </Label>
                          </div>
                          <Select
                            value={localSurvey?.questions?.[questionIdx]?.mulitiselectvalidation ?? "0"}
                            onValueChange={(value) => {
                              updateQuestion(questionIdx, { mulitiselectvalidation: value });
                            }}
                          >
                            <SelectTrigger className="w-full h-8 ">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent side="top">
                              {question.choices.map((_pageSize, i) => (
                                <SelectItem key={i} value={String(i)}>
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>
                    {/* <AdvancedSettings
                        question={question}
                        questionIdx={questionIdx}
                        localSurvey={localSurvey}
                        updateQuestion={updateQuestion}
                      /> */}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </>
    );
  };
  
  function getPlaceholderByInputType(inputType: any) {
    switch (inputType) {
      case "email":
        return "example@email.com";
      case "url":
        return "http://...";
      case "number":
        return "42";
      case "phone":
        return "+1 123 456 789";
      default:
        return "Type your answer here...";
    }
  }
  

  export function OpenQuestionForm({
    question,
    questionIdx,
    updateQuestion,
    isInvalid,
    localSurvey,
    selectedLanguageCode,
    setSelectedLanguageCode,
  }: any): JSX.Element {
    console.log(question.headline, "questionp");
  
    const [showSubheader, setShowSubheader] = useState(!!question.subheader);
    const defaultPlaceholder = getPlaceholderByInputType(question.inputType ?? "text");
  
    return (
      <form>
        <QuestionFormInput
          id="headline"
          value={question?.headline}
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
          {/* {!showSubheader && (
            <Button
              size="sm"
              variant="default"
              className="mt-3"
              type="button"
              onClick={() => {
                updateQuestion(questionIdx);
                setShowSubheader(true);
              }}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Description
            </Button>
          )} */}
  
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
        <div className="mt-2">
          <QuestionFormInput
            id="placeholder"
            value={
              question.placeholder
                ? question.placeholder
                : defaultPlaceholder
            }
            localSurvey={localSurvey}
            questionIdx={questionIdx}
            isInvalid={isInvalid}
            updateQuestion={updateQuestion}
            selectedLanguageCode={selectedLanguageCode}
            setSelectedLanguageCode={setSelectedLanguageCode}
          />
        </div>
      </form>
    );
  }

  export default FormBuilder