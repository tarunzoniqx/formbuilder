//@ts-nocheck
import { useCallback, useMemo } from "react";


export const calculateElementIdx = (survey: any, currentQustionIdx: number): number => {
    const currentQuestion = survey.questions[currentQustionIdx];
    const surveyLength = survey.questions.length;
    const middleIdx = Math.floor(surveyLength / 2);
    const possibleNextQuestions = currentQuestion?.logic?.map((l) => l.destination) || [];
  
    const getLastQuestionIndex = () => {
      const lastQuestion = survey.questions
        .filter((q) => possibleNextQuestions.includes(q.id))
        .sort((a, b) => survey.questions.indexOf(a) - survey.questions.indexOf(b))
        .pop();
      return survey.questions.findIndex((e) => e.id === lastQuestion?.id);
    };
  
    let elementIdx = currentQustionIdx || 0.5;
    const lastprevQuestionIdx = getLastQuestionIndex();
  
    if (lastprevQuestionIdx > 0) elementIdx = Math.min(middleIdx, lastprevQuestionIdx - 1);
    if (possibleNextQuestions.includes("end")) elementIdx = middleIdx;
    return elementIdx;
  };

  interface ProgressBarProps {
    survey: any;
    questionId: string;
  }

export  function ProgressBar({ survey, questionId }: ProgressBarProps) {
    const currentQuestionIdx = useMemo(
      () => survey.questions.findIndex((e) => e.id === questionId),
      [survey, questionId]
    );
  
    const calculateProgress = useCallback((questionId: string, survey: TSurvey, progress: number) => {
      if (survey.questions.length === 0) return 0;
      let currentQustionIdx = survey.questions.findIndex((e) => e.id === questionId);
      if (currentQustionIdx === -1) currentQustionIdx = 0;
      const elementIdx = calculateElementIdx(survey, currentQustionIdx);
  
      const newProgress = elementIdx / survey.questions.length;
      let updatedProgress = progress;
      if (newProgress > progress) {
        updatedProgress = newProgress;
      } else if (newProgress <= progress && progress + 0.1 <= 1) {
        updatedProgress = progress + 0.1;
      }
      return updatedProgress;
    }, []);
  
    const progressArray = useMemo(() => {
      let progress = 0;
      const progressArrayTemp: number[] = [];
      survey.questions.forEach((question: { id: string; }) => {
        progress = calculateProgress(question.id, survey, progress);
        progressArrayTemp.push(progress);
      });
      return progressArrayTemp;
    }, [calculateProgress, survey]);
  
    return <Progress progress={questionId === "end" ? 1 : progressArray[currentQuestionIdx]} />;
  }
  
  export  function Progress({ progress }: { progress: number }) {
    return (
      <div className="w-full h-2 overflow-hidden rounded-full bg-accent-bg">
        <div
          className="z-20 h-2 duration-500 rounded-full transition-width bg-brand"
          style={{ width: `${Math.floor(progress * 100)}%` }}></div>
      </div>
    );
  }
  