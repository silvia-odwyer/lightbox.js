import { useState, useCallback, useEffect, useRef } from "react";

export const wrapNums = (minNum, maxNum, v) => {
      if (minNum == maxNum) {
        return minNum;
      }
      let rangeSize = maxNum - minNum;
      return ((((v - minNum) % rangeSize) + rangeSize) % rangeSize) + minNum;
};

export const shouldAutoplay = (elem) => {
  // Autoplay for HTML5 Video elems set to true by default
  // Autoplay is off by default for YouTube embeds

  if (elem.type == 'yt' && elem.autoPlay != true && elem.autoPlay != 'true') {
    return false
  } else if (elem.autoPlay == false || elem.autoPlay == 'false') {
    return false
  }
  return true
}

export const getVideoHeight = (elem) => {
  if (elem.videoHeight) {
    return elem.videoHeight
  }
  return "200"
}

export const getVideoWidth = (elem) => {
  if (elem.videoWidth) {
    return elem.videoWidth
  }
  return "900"
}

export const useInterval = (callback, timeDelay) => {
      const savedCallbackRef = useRef();
    
      useEffect(() => {
        savedCallbackRef.current = callback;
      }, [callback]);
    
      useEffect(() => {
        function tick() {
          savedCallbackRef.current();
        }
        if (timeDelay !== null) {
          // Set the interval
          let intervalID = setInterval(tick, timeDelay);

          // Remove the interval
          return () => clearInterval(intervalID);
        }
      }, [timeDelay]);
}

export const openFullScreen = (lightbox_elem) => {
  if (lightbox_elem.requestFullscreen) {
    lightbox_elem.requestFullscreen();
  } 

  /* Safari */
  else if (lightbox_elem.webkitRequestFullscreen) { 
    lightbox_elem.webkitRequestFullscreen();
  } 
  
  /* Internet Explorer */
  else if (lightbox_elem.msRequestFullscreen) { 
    lightbox_elem.msRequestFullscreen();
  }
}

export const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
};

export const getScale = (num, maxScale) => {
  if (num < 1) {
    return 1
  }
  else if (num > maxScale) {
    return maxScale;
  }
  
  return num;
  
}

export const closeFullScreen = (document) => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }

  /* Safari */
  else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }

  /* Internet Explorer */
  else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}


export const createCustomThumbnailBorder = (thumbnailBorder) => {
  if (thumbnailBorder) {
    return `solid ${thumbnailBorder} 2px`
  }
}


export const areObjectsEqual = (object1, object2) =>
typeof object1 === 'object' && object1 != null && typeof object2 === 'object' && object2 != null
  && Object.keys(object1).length > 0
  ? Object.keys(object1).length === Object.keys(object2).length
  && Object.keys(object1).every(p => areObjectsEqual(object1[p], object2[p]))
  : object1 === object2;