//@ts-nocheck
import { useEffect, useMemo, useRef, useState } from "react";



import { AutoCloseWrapper, ProgressBar , ResponseErrorComponent } from "./Components";
import { evaluateCondition } from "./lib/logicEvaluator";
import { extractFallbackValue, extractId, extractRecallInfo, formatDateWithOrdinal, getLocalizedValue, isValidDateString } from "../../utils";
import QuestionConditional from "./Components/general/QuestionConditional";
import { cn } from "@/lib/utils";

export default function Survey({
  survey,
  styling,
  activeQuestionId,
  onDisplay = () => {},
  onActiveQuestionChange = () => {},
  onResponse = () => {},
  onClose = () => {},
  onFinished = () => {},
  onRetry = () => {},
  prefillResponseData,
  languageCode,
  getSetIsError,
  getSetIsResponseSendingFinished,
  onFileUpload,
  isCardBorderVisible = true,
}: any) {
  const isInIframe = window.self !== window.top;
  const [questionId, setQuestionId] = useState(
    activeQuestionId || (survey?.welcomeCard?.enabled ? "start" : survey?.questions[0]?.id)
  );
  const [showError, setShowError] = useState(false);
  const [isResponseSendingFinished, setIsResponseSendingFinished] = useState(
    getSetIsResponseSendingFinished ? false : true
  );

  const [loadingElement, setLoadingElement] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [responseData, setResponseData] = useState<any>({});
  const [ttc, setTtc] = useState<any>({});

  const currentQuestionIndex = survey.questions.findIndex((q) => q.id === questionId);
  const currentQuestion = useMemo(() => {
    if (questionId === "end" && !survey?.thankYouCard?.enabled) {
      const newHistory = [...history];
      const prevQuestionId = newHistory.pop();
      return survey.questions.find((q) => q.id === prevQuestionId);
    } else {
      return survey.questions.find((q) => q.id === questionId);
    }
  }, [questionId, survey, history]);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const showProgressBar = !styling?.hideProgressBar;

  useEffect(() => {
    if (activeQuestionId === "hidden" || activeQuestionId === "multiLanguage") return;
    if (activeQuestionId === "start" && !survey?.welcomeCard?.enabled) {
      setQuestionId(survey?.questions[0]?.id);
      return;
    }
    setQuestionId(activeQuestionId || (survey?.welcomeCard?.enabled ? "start" : survey?.questions[0]?.id));
  }, [activeQuestionId, survey.questions, survey?.welcomeCard?.enabled]);

  useEffect(() => {
    // scroll to top when question changes
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [questionId]);

  useEffect(() => {
    // call onDisplay when component is mounted
    onDisplay();
    if (prefillResponseData) {
      onSubmit(prefillResponseData, {}, true);
    }
  }, []);

  useEffect(() => {
    if (getSetIsError) {
      getSetIsError((value: boolean) => {
        setShowError(value);
      });
    }
  }, [getSetIsError]);

  useEffect(() => {
    if (getSetIsResponseSendingFinished) {
      getSetIsResponseSendingFinished((value: boolean) => {
        setIsResponseSendingFinished(value);
      });
    }
  }, [getSetIsResponseSendingFinished]);

  let currIdxTemp = currentQuestionIndex;
  let currQuesTemp = currentQuestion;

  function getNextQuestionId(data: any, isFromPrefilling: boolean = false): string {
    const questions = survey.questions;
    const responseValue = data[questionId];

    if (questionId === "start") {
      if (!isFromPrefilling) {
        return questions[0]?.id || "end";
      } else {
        currIdxTemp = 0;
        currQuesTemp = questions[0];
      }
    }
    if (currIdxTemp === -1) throw new Error("Question not found");
    if (currQuesTemp?.logic && currQuesTemp?.logic.length > 0 && currentQuestion) {
      for (const logic of currQuesTemp.logic) {
        if (!logic.destination) continue;
        // Check if the current question is of type 'multipleChoiceSingle' or 'multipleChoiceMulti'
        if (
          currentQuestion.type === "multipleChoiceSingle" ||
          currentQuestion.type === "multipleChoiceMulti"
        ) {
          let choice;

          // Check if the response is a string (applies to single choice questions)
          // Sonne -> sun
          if (typeof responseValue === "string") {
            // Find the choice in currentQuestion.choices that matches the responseValue after localization
            choice = currentQuestion.choices.find((choice) => {
              return getLocalizedValue(choice.label, languageCode) === responseValue;
            })?.label;

            // If a matching choice is found, get its default localized value
            if (choice) {
              choice = getLocalizedValue(choice, "default");
            }
          }
          // Check if the response is an array (applies to multiple choices questions)
          // ["Sonne","Mond"]->["sun","moon"]
          else if (Array.isArray(responseValue)) {
            // Filter and map the choices in currentQuestion.choices that are included in responseValue after localization
            choice = currentQuestion.choices
              .filter((choice) => {
                return responseValue.includes(getLocalizedValue(choice.label, languageCode));
              })
              .map((choice) => getLocalizedValue(choice.label, "default"));
          }

          // If a choice is determined (either single or multiple), evaluate the logic condition with that choice
          if (choice) {
            if (evaluateCondition(logic, choice)) {
              return logic.destination;
            }
          }
          // If choice is undefined, it implies an "other" option is selected. Evaluate the logic condition for "Other"
          else {
            if (evaluateCondition(logic, "Other")) {
              return logic.destination;
            }
          }
        }
        if (evaluateCondition(logic, responseValue)) {
          return logic.destination;
        }
      }
    }
    return questions[currIdxTemp + 1]?.id || "end";
  }

  const onChange = (responseDataUpdate: any) => {
    const updatedResponseData = { ...responseData, ...responseDataUpdate };
    setResponseData(updatedResponseData);
  };

  const onSubmit = (responseData: any, ttc: any, any: boolean = false , isFromPrefilling : boolean = false ) => {
    const questionId = Object.keys(responseData)[0];
    setLoadingElement(true);
    const nextQuestionId = getNextQuestionId(responseData, isFromPrefilling);
    const finished = nextQuestionId === "end";
    onResponse({ data: responseData, ttc, finished });
    if (finished) {
      // Post a message to the parent window indicating that the survey is completed.
      window.parent.postMessage("formbricksSurveyCompleted", "*");
      onFinished();
    }
    setQuestionId(nextQuestionId);
    // add to history
    setHistory([...history, questionId]);
    setLoadingElement(false);
    onActiveQuestionChange(nextQuestionId);
  };

  const replaceRecallInfo = (text: string): string => {
    while (text.includes("recall:")) {
      const recallInfo = extractRecallInfo(text);
      if (recallInfo) {
        const questionId = extractId(recallInfo);
        const fallback = extractFallbackValue(recallInfo).replaceAll("nbsp", " ");
        let value = questionId && responseData[questionId] ? (responseData[questionId] as string) : fallback;

        if (isValidDateString(value)) {
          value = formatDateWithOrdinal(new Date(value));
        }
        if (Array.isArray(value)) {
          value = value.join(", ");
        }
        text = text.replace(recallInfo, value);
      }
    }
    return text;
  };

  const parseRecallInformation = (question: any) => {
    const modifiedQuestion = structuredClone(question);
    if (question.headline && question.headline[languageCode]?.includes("recall:")) {
      modifiedQuestion.headline[languageCode] = replaceRecallInfo(
        getLocalizedValue(modifiedQuestion.headline, languageCode)
      );
    }
    if (
      question.subheader &&
      question.subheader[languageCode]?.includes("recall:") &&
      modifiedQuestion.subheader
    ) {
      modifiedQuestion.subheader[languageCode] = replaceRecallInfo(
        getLocalizedValue(modifiedQuestion.subheader, languageCode)
      );
    }
    return modifiedQuestion;
  };

  const onBack = (): void => {
    let prevQuestionId;
    // use history if available
    if (history?.length > 0) {
      const newHistory = [...history];
      prevQuestionId = newHistory.pop();
      if (prefillResponseData && prevQuestionId === survey.questions[0].id) return;
      setHistory(newHistory);
    } else {
      // otherwise go back to previous question in array
      prevQuestionId = survey.questions[currIdxTemp - 1]?.id;
    }
    if (!prevQuestionId) throw new Error("Question not found");
    setQuestionId(prevQuestionId);
    onActiveQuestionChange(prevQuestionId);
  };

  function getCardContent() {
    if (showError) {
      return (
        <ResponseErrorComponent  responseData={responseData} questions={survey.questions} onRetry={onRetry} />
      );
    }
    if (questionId === "start" && survey.welcomeCard.enabled) {
    // Future scope
    } else if (questionId === "end" && survey.thankYouCard.enabled) {
    // Future scope
    } else {
      return (
        currentQuestion && (
          <QuestionConditional
            surveyId={survey.id}
            question={parseRecallInformation(currentQuestion)}
            value={responseData[currentQuestion.id]}
            onChange={onChange}
            onSubmit={onSubmit}
            onBack={onBack}
            ttc={ttc}
            setTtc={setTtc}
            onFileUpload={onFileUpload}
            isFirstQuestion={
              history && prefillResponseData
                ? history[history.length - 1] === survey.questions[0].id
                : currentQuestion.id === survey?.questions[0]?.id
            }
            isLastQuestion={currentQuestion.id === survey.questions[survey.questions.length - 1].id}
            languageCode={languageCode}
            isInIframe={isInIframe}
          />
        )
      );
    }
  }

  return (
    <>
      <AutoCloseWrapper survey={survey} onClose={onClose}>
        <div
          className={cn(
            "no-scrollbar rounded-custom bg-survey-bg flex h-full w-full flex-col justify-between px-6 pb-3 pt-6",
            isCardBorderVisible ? "border-survey-border border" : "",
            survey.type === "link" ? "fb-survey-shadow" : ""
          )}>
          <div ref={contentRef} className={cn(loadingElement ? "animate-pulse opacity-60" : "", "my-auto")}>
            {survey.questions.length === 0 && !survey?.welcomeCard?.enabled && !survey?.thankYouCard?.enabled ? (
              // Handle the case when there are no questions and both welcome and thank you cards are disabled
              <div>No questions available.</div>
            ) : (
              getCardContent()
            )}
          </div>
          <div className="mt-8">
            {showProgressBar && <ProgressBar survey={survey} questionId={questionId} />}
          </div>
        </div>
      </AutoCloseWrapper>
    </>
  );
}
