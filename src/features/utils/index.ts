//@ts-nocheck
import { RefObject, useEffect } from "react";

export const getLocalizedValue = (value: any | undefined, languageId: string): string => {
    if (!value) {
      return "";
    }
    if (isI18nObject(value)) {
      if (value[languageId]) {
        return value[languageId];
      }
      return "";
    }
    return "";
  };
  

 export function isI18nObject(obj: any): obj is any {
    return typeof obj === "object" && obj !== null && Object.keys(obj).includes("default");
  }

  export function isValidDateString(value: string) {
    const regex = /^(?:\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})$/;
  
    if (!regex.test(value)) {
      return false;
    }
  
    const date = new Date(value);
    return date;
  }
  

  export  const formatDateWithOrdinal = (date: Date): string => {
    const getOrdinalSuffix = (day: number) => {
      const suffixes = ["th", "st", "nd", "rd"];
      const relevantDigits = day < 30 ? day % 20 : day % 30;
      return suffixes[relevantDigits <= 3 ? relevantDigits : 0];
    };
  
    const dayOfWeekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
  
    const dayOfWeek = dayOfWeekNames[date.getDay()];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
  
    return `${dayOfWeek}, ${monthNames[monthIndex]} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };


  export const extractFallbackValue = (text: string): string => {
    const pattern = /fallback:(\S*)#/;
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    } else {
      return "";
    }
  };
  
  export const extractId = (text: string): string | null => {
    const pattern = /#recall:([A-Za-z0-9]+)/;
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    } else {
      return null;
    }
  };

  export const extractRecallInfo = (headline: string): string | null => {
    const pattern = /#recall:([A-Za-z0-9]+)\/fallback:(\S*)#/;
    const match = headline.match(pattern);
    return match ? match[0] : null;
  };
  
  export const useTtc = (
    questionId: string,
    ttc: any,
    setTtc: (ttc: any) => void,
    startTime: number,
    setStartTime: (time: number) => void
  ) => {
    useEffect(() => {
      setStartTime(performance.now());
    }, [questionId, setStartTime]);
  
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          // Restart the timer when the tab becomes visible again
          setStartTime(performance.now());
        } else {
          const updatedTtc = getUpdatedTtc(ttc, questionId, performance.now() - startTime);
          setTtc(updatedTtc);
        }
      };
  
      // Attach the event listener
      document.addEventListener("visibilitychange", handleVisibilityChange);
  
      return () => {
        // Clean up the event listener when the component is unmounted
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }, [questionId, setStartTime, setTtc, startTime, ttc]);
  };
  

  export const getUpdatedTtc = (ttc: any, questionId: string, time: number) => {
    // Check if the question ID already exists
    if (Object.prototype.hasOwnProperty.call(ttc, questionId)) {
      return {
        ...ttc,
        [questionId]: ttc[questionId] + time,
      };
    } else {
      // If the question ID does not exist, add it to the object
      return {
        ...ttc,
        [questionId]: time,
      };
    }
  };
  
  const shuffle = (array: any[]) => {
    for (let i = 0; i < array.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  export const shuffleQuestions = (array: any[], shuffleOption: string) => {
    const arrayCopy = [...array];
    const otherIndex = arrayCopy.findIndex((element) => element.id === "other");
    const otherElement = otherIndex !== -1 ? arrayCopy.splice(otherIndex, 1)[0] : null;
  
    if (shuffleOption === "all") {
      shuffle(arrayCopy);
    } else if (shuffleOption === "exceptLast") {
      const lastElement = arrayCopy.pop();
      shuffle(arrayCopy);
      arrayCopy.push(lastElement);
    }
  
    if (otherElement) {
      arrayCopy.push(otherElement);
    }
  
    return arrayCopy;
  };


  export const useSyncScroll = (
    highlightContainerRef: RefObject<HTMLElement>,
    inputRef: RefObject<HTMLElement>
  ): void => {
    useEffect(() => {
      const syncScrollPosition = () => {
        if (highlightContainerRef.current && inputRef.current) {
          highlightContainerRef.current.scrollLeft = inputRef.current.scrollLeft;
        }
      };
  
      const sourceElement = inputRef.current;
      if (sourceElement) {
        sourceElement.addEventListener("scroll", syncScrollPosition);
      }
  
      return () => {
        if (sourceElement) {
          sourceElement.removeEventListener("scroll", syncScrollPosition);
        }
      };
    }, [inputRef, highlightContainerRef]);
  };
  

  export const getIndex = (id: string, isChoice: boolean) => {
    if (!isChoice) return null;
  
    const parts = id.split("-");
    if (parts.length > 1) {
      return parseInt(parts[1], 10);
    }
    return null;
  };


  export const getLabelById = (id: string) => {
    switch (id) {
      case "headline":
        return "Question";
      case "subheader":
        return "Description";
      case "placeholder":
        return "Placeholder";
      case "buttonLabel":
        return `"Next" Button Label`;
      case "backButtonLabel":
        return `"Back" Button Label`;
      case "lowerLabel":
        return "Lower Label";
      case "upperLabel":
        return "Upper Label";
      default:
        return "";
    }
  };
  
  

  export const getPlaceHolderById = (id: string) => {
    switch (id) {
      case "headline":
        return "";
      case "subheader":
        return "";
      default:
        return "";
    }
  };

  
  