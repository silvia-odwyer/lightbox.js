const openFullScreen = (lightbox_elem) => {
  if (lightbox_elem.requestFullscreen) {
    lightbox_elem.requestFullscreen();
  } else if (lightbox_elem.webkitRequestFullscreen) {

  /* Safari */
    lightbox_elem.webkitRequestFullscreen();
  } else if (lightbox_elem.msRequestFullscreen) {

  /* Internet Explorer */
    lightbox_elem.msRequestFullscreen();
  }
};

export const themes = {
  day: {
    background: "white",
    iconColor: "black",
    thumbnailBorder: "solid transparent 2px",
    textColor: "black",
    metadataTextColor: "black",
  },
  night: {
    background: "#151515",
    iconColor: "#626b77",
    thumbnailBorder: "solid rgb(107, 133, 206)  2px",
    textColor: "silver",
    metadataTextColor: "white",
  },
  lightbox: {
    background: "rgba(12, 12, 12, 0.93)",
    iconColor: "#626b77",
    thumbnailBorder: "solid rgb(107, 133, 206) 2px",
    textColor: "silver",
    metadataTextColor: "white",
  },
};

export const variants = {
  active: {
    opacity: 1,
  },
  inactive: {
    opacity: 0,
  },
};

export const fullScreen = (fullScreenHandler) => {
  let lightbox = document.getElementById("slideshowAnim");
  openFullScreen(lightbox);
  // setIsBrowserFullScreen(true)
  initFullScreenChangeEventListeners(fullScreenHandler);
};

export const initFullScreenChangeEventListeners = (fullScreenHandler) => {
  document.addEventListener("fullscreenchange", fullScreenHandler);
  document.addEventListener("webkitfullscreenchange", fullScreenHandler);
  document.addEventListener("MSFullscreenChange", fullScreenHandler);
  document.addEventListener("mozfullscreenchange", fullScreenHandler);
};

export const removeFullScreenChangeEventListeners = (fullScreenHandler) => {
  document.removeEventListener("fullscreenchange", fullScreenHandler);
  document.removeEventListener("webkitfullscreenchange", fullScreenHandler);
  document.removeEventListener("MSFullscreenChange", fullScreenHandler);
  document.removeEventListener("mozfullscreenchange", fullScreenHandler);
};

export const checkOutsideClick = (e, selector, onOutsideClick) => {
  const elements = document.querySelectorAll(selector);

  for (const element of elements) {
    if (element.contains(e.target)) {
      return;
    }
  }

  onOutsideClick();
};

export const getContainerHeight = (lightboxHeight, isBrowserFullScreen) => {
  if (lightboxHeight && isBrowserFullScreen) {
    return "100vh";
  } else if (lightboxHeight && !isBrowserFullScreen) {
    return lightboxHeight;
  }
  return "";
};

export const getContainerWidth = (lightboxWidth, isBrowserFullScreen) => {
  if (lightboxWidth && !isBrowserFullScreen) {
    return lightboxWidth;
  } else if (lightboxWidth && isBrowserFullScreen) {
    return "";
  }
  return "";
};
