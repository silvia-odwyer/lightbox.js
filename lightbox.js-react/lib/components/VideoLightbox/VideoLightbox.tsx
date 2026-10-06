import React, { ReactNode, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { EscKeyHandlers, IconButton } from "../shared-components";

import {
  checkOutsideClick,
  fullScreen,
  getContainerHeight,
  getContainerWidth,
  removeFullScreenChangeEventListeners,
  singleItemThemes as themes,
  useScrollLock,
  variants,
} from "../shared-utility.js";

import styles from "../SlideshowLightbox/SlideshowLightbox.module.css";

import { Fullscreen, FullscreenExit, XLg } from "react-bootstrap-icons";
import { Portal } from "react-portal";

import {
  closeFullScreen,
  getVideoHeight,
  getVideoWidth,
  shouldAutoplay,
} from "../SlideshowLightbox/utility";
// import { saveAs } from 'file-saver-es'
import Div100vh from "react-div-100vh";
import YouTube from "react-youtube";
//import exifr from 'exifr'
import { use100vh } from "react-div-100vh";

const defaultTheme = "lightbox";

export interface VideoLightboxProps {
  children?: ReactNode;
  ref?: any;
  fullScreen?: boolean;
  backgroundColor?: string;
  theme?: string;
  iconColor?: any;
  modalClose?: string;
  captionPlacement?: string;
  showFullScreenIcon?: boolean;
  mediaItem?: any;
  onOpen?: any;
  onClose?: any;

  open?: boolean;
  showControls?: boolean;
  downloadImages?: boolean;
  width?: number | null;
  height?: number | null;
  framework?: string;
  lightboxImgClass?: string;
  wrapperClassName?: string;
  className?: string;
  captionStyle?: any;
  lightboxHeight?: string;
  lightboxWidth?: string;
  showLoader?: boolean;
  onSelect?: any;
  controlComponent?: any;
  closeComponent?: any;

  onError?: any;
  iconStyle?: any;
  closeIconBtnStyle?: any;
  showControlsBar?: boolean;
  lightboxFooterComponent?: any;
  imgWrapperClassName?: string;

}

export const VideoLightbox: React.FC<VideoLightboxProps> = (props) => {
  const [backgroundColor, setBackgroundColor] = useState(
    props.backgroundColor
      ? props.backgroundColor
      : themes[defaultTheme].background,
  );
  const videoReferences = useRef({});

  const [iconColor, setIconColor] = useState(
    props.iconColor ? props.iconColor : themes[defaultTheme].iconColor,
  );

  const [isFullScreenProp, setIsFullScreenProp] = useState(
    props.fullScreen ? props.fullScreen : false,
  );

  const [modalCloseOption, setModalCloseOption] = useState(
    props.modalClose ? props.modalClose : "default",
  );

  const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false);

  const [lightboxModalHeight, setLightboxModalHeight] = useState(
    props.lightboxHeight ? props.lightboxHeight : "100vh",
  );

  const [customIconStyle, setCustomIconStyle] = useState(
    props.iconStyle ? props.iconStyle : null,
  );

  const [displayFullScreenIcon, setDisplayFullScreenIcon] = useState(
    props.showFullScreenIcon ? props.showFullScreenIcon : true,
  );

  const [className, setClassName] = useState(
    props.className ? props.className : "",
  );

  const [imgCaptionPlacement, setImgCaptionPlacement] = useState(
    props.captionPlacement ? props.captionPlacement : "below",
  );

  const [controlsPlacement, setControlsPlacement] = useState("default");

  // const [showControlsBar, setShowControlsBar] = useState(
  //   props.showControlsBar ? props.showControlsBar : true,
  // );

  const [imgWrapperClass, setImgWrapperClass] = useState(
    props.wrapperClassName ? props.wrapperClassName : "",
  );

  const [width, setWidth] = useState(props.width ? props.width : null);

  const [height, setHeight] = useState(props.height ? props.height : null);

  const [lightboxImgClassName, setLightboxImgClassName] = useState(
    props.lightboxImgClass ? props.lightboxImgClass : "",
  );

  const [imgClass, setImgClass] = useState(
    props.className ? props.className : "",
  );

  const [YTVideoCurrentlyPlaying, setYTVideoCurrentlyPlaying] = useState(false);
  const [lightboxModalWidth, setLightboxModalWidth] = useState(
    props.lightboxWidth ? props.lightboxWidth : "100vw",
  );

  const [displayControls, setDisplayControls] = useState<boolean>(
    props.showControls ? props.showControls : true,
  );

  // const [lightboxIdentifier, setLightboxIdentifier] = useState(
  //   props.lightboxIdentifier ? props.lightboxIdentifier : "",
  // );

  const [frameworkID, setFrameworkID] = useState(
    props.framework ? props.framework : "",
  );

  const [images, setImages] = useState<any>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [carouselReady, setCarouselReady] = useState(false);

  const [displayLoader, setDisplayLoader] = useState(
    props.showLoader ? props.showLoader : false,
  );

  // const [textColor, setTextColor] = useState(
  //   props.textColor ? props.textColor : themes[defaultTheme].textColor
  // )

  const fullScreenHandler = () => {
    //in full screen mode
    if (
      document["webkitIsFullScreen"] ||
      document["mozFullScreen"] ||
      document["msFullscreenElement"]
    ) {
      setIsBrowserFullScreen(true);
      setLightboxModalHeight("100vh");
    } else {
      if (isBrowserFullScreen) {
        closeFullScreen(document);
      }
      removeFullScreenChangeEventListeners(fullScreenHandler);
      setIsBrowserFullScreen(false);
      setLightboxModalHeight(
        props.lightboxHeight ? props.lightboxHeight : "100vh",
      );
    }
  };

  useEffect(() => {
    if (props.open == true) {
      if (props.mediaItem) {
        let imgs = [];
        imgs.push(props.mediaItem);
        // setImages(imgs)
      }
      openModal();
    } else if (props.open == false) {
      closeModal();
    }
  }, [props.open, images]);

  const openModal = () => {
    setShowModal(true);
    setIsOpen(true);
  };

  const dispatchCloseEvent = () => {
    if (props.onClose) {
      props.onClose();
    }
  };

  const dispatchOpenEvent = () => {
    if (props.onOpen) {
      props.onOpen();
    }
    if (props.onSelect) {
      props.onSelect();
    }
  };

  useEffect(() => {
    if (isOpen == true) {
      dispatchOpenEvent();
    } else {
      dispatchCloseEvent();
    }
  }, [isOpen]);

  const closeModal = () => {
    if (isBrowserFullScreen) {
      exitFullScreen();
    }

    setShowModal(false);
    setIsOpen(false);
    setCarouselReady(false);
    if (prevFocusedElem) prevFocusedElem?.focus({ preventScroll: true });
  };

  const [state, setState] = React.useState();

  const getIconClasses = (): string | undefined => {
    if (props.theme == "dark") {
      return styles.darkHeaderIcon;
    } else if (props.theme == "light") {
      return styles.lightHeaderIcon;
    }
  };

  const exitFullScreen = () => {
    closeFullScreen(document);
    removeFullScreenChangeEventListeners(fullScreenHandler);
    // setIsBrowserFullScreen(false)
  };

  const setItemLoaded = (index: Number) => {
    setDisplayLoader(false);
  };

  const initProps = () => {
    if (props.showControls != undefined) {
      setDisplayControls(props.showControls);

   
    }
  };

  const getCloseIconBtnStyle = () => {
    let style_object = {};
    if (iconColor) {
      style_object = { color: iconColor };
    }
    if (props.closeIconBtnStyle) {
      let closeIconBtnStyleKeys = Object.keys(props.closeIconBtnStyle);
      for (let i = 0; i < closeIconBtnStyleKeys.length; i++) {
        let keyName = closeIconBtnStyleKeys[i];
        let style_obj = props.closeIconBtnStyle[keyName];
        style_object[keyName] = style_obj;
      }
    }
    if (customIconStyle) {
      style_object = customIconStyle;
    }
    return style_object;
  };

  const handleError = (event: any, index: Number) => {
    if (props.onError) {
      props.onError(
        event,
        "An error occurred, please see event for more details",
      );
    }
  };

  useEffect(() => {
    if (props.theme) {
      if (themes[props.theme]) {
        setBackgroundColor(themes[props.theme].background);
        setIconColor(themes[props.theme].iconColor);
      }
    }

    return () => {};
  }, [state]);

  const getContainerStyles = () => {
    if (props.showControlsBar == false || props.fullScreen) {
      return { height: lboxHeight };
    } else if (isBrowserFullScreen) {
      // return {height: "100vh"}
    } else {
      return {};
    }
  };

  const getIconStyle = () => {
    if (iconColor) {
      return { color: iconColor };
    } else if (customIconStyle) {
      return customIconStyle;
    } else {
      return {};
    }
  };

  const [videoElements, setVideoElements] = useState({});

  const videoSlideElement = () => {
    let elem = props.mediaItem;
    let videoElem;

    let index = 0;

    if (elem.type == "yt") {
      videoElem = (
        <div className={`${styles.videoOuterContainer} imageModal`}>
          <YouTube
            videoId={elem.videoID}
            ref={(el) => (videoReferences.current[index] = el)}
            iframeClassName={`${styles.ytVideo}`}
            title="YouTube video player"
            opts={{
              height: getVideoHeight(elem),
              width: getVideoWidth(elem),
              playerVars: {
                // https://developers.google.com/youtube/player_parameters
                autoplay: shouldAutoplay(elem) ? 1 : 0,
              },
            }}
            onReady={(event) => {
              let videoElems = videoElements;
              videoElems[index] = event;
              setVideoElements(videoElems);
              setDisplayLoader(false);
              setItemLoaded(index);
            }}
            onPlay={(event) => {
              setYTVideoCurrentlyPlaying(true);
            }}
            onPause={(event) => {
              setYTVideoCurrentlyPlaying(false);
            }}
            onEnd={(event) => {
              setYTVideoCurrentlyPlaying(false);
            }}
            onError={(event) => {
              handleError(event, index);
            }}
            onStateChange={(event) => {}}
            onPlaybackRateChange={(event) => {}}
            onPlaybackQualityChange={(event) => {}}
          />
        </div>
      );
    } else if (elem.type == "htmlVideo") {
      videoElem = (
        <div
          className={`${styles.htmlVideo} ${styles.htmlVideoOuterContainer} imageModal`}
        >
          <video
            className={`${styles.cursorPointer} ${styles.lightboxVideo}`}
            width={getVideoWidth(elem)}
            ref={(el) => (videoReferences.current[index] = el)}
            onPlay={() => {}}
            onError={(event) => {
              handleError(event, index);
            }}
            height={getVideoHeight(elem)}
            autoPlay={shouldAutoplay(elem)}
            controls
          >
            <source
              src={elem.videoSrc}
              type="video/mp4"
              onLoad={() => {
                setItemLoaded(index);
              }}
            />
          </video>
        </div>
      );
    } else if (elem.type == "customVideoEmbed") {
      videoElem = (
        <div className={`${styles.customVideoContainer} imageModal`}>
          {elem.embed}
        </div>
      );
    }

    return videoElem;
  };

  const isImageCaption = (placement: String) => {
    if (placement != imgCaptionPlacement) {
      return false;
    }
    if (props.mediaItem) {
      if (props.mediaItem?.caption) {
        return true;
      }
    }
    return false;
  };

  const getInnerContainerStyles = () => {
    if (isImageCaption("above")) {
      return styles.innerContainerWithTopCaption;
    }

    return styles.slideshowInnerContainerThumbnails;
  };

  const mediaNode = () => {
    return (
      <div
        key={"index_1"}
        className={`${props.fullScreen ? styles.fullScreenContainer : null}`}
        style={{ height: lboxHeight }}
      >
        <div className={styles.emblaSlide}>
          {/* Same wrapper structure/styles SlideshowLightbox gets from
              TransformWrapper/TransformComponent, without the zoom functionality */}
          <div
            className={styles.reactTransformWrapper}
            style={{
              maxWidth: "100vw",
              height: "100vh",
              margin: "auto",
            }}
          >
            <div
              className={styles.reactTransformComponent}
              style={{
                maxWidth: "100vw",
                height: "100vh",
                margin: "auto",
                display: "grid",
              }}
            >
              <div
                className={`${styles.slideshowImg}
                        ${props.fullScreen ? styles.fullScreenSlideshowImg : ""}
                        ${props.lightboxImgClass ? props.lightboxImgClass : ""}
                      ${isImageCaption(imgCaptionPlacement) ? styles.slideshowImgWithCaption : ""}
                      `}
                style={{
                  width: getContainerWidth(
                    props.lightboxWidth,
                    isBrowserFullScreen,
                  ),
                  height: getContainerHeight(
                    props.lightboxHeight,
                    isBrowserFullScreen,
                  ),
                }}
              >
                {videoSlideElement()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) initProps();

    return () => {
      isMounted = false;
    };
  }, []);

  const initWrapperClassname = () => {
    let classNameStr = "";
    if (props.className) {
      classNameStr += `${props.className} `;
    }

    if (props.imgWrapperClassName) {
      classNameStr += `${props.imgWrapperClassName} `;
    }

    classNameStr += `${styles.lightboxjs}`;

    return classNameStr;
  };

  const div100vhHeight = use100vh();

  const lboxHeight =
    lightboxModalHeight == "100vh" ? div100vhHeight : lightboxModalHeight;
  const lightboxRef = useRef();
  const videoRef = useRef();
  const [showModal, setShowModal] = useState(false);
  useScrollLock(showModal);

  const [animationEntered, setAnimationEntered] = useState(false);
  const [prevFocusedElem, setPrevFocusedElem] = useState<HTMLElement | null>(
    null,
  );

  return (
    <div className={`${initWrapperClassname()}`}>
      <AnimatePresence
        initial={false}
        mode={"wait"}
        onExitComplete={() => {
          //   unlockScroll();
          prevFocusedElem?.focus({ preventScroll: true });
        }}
      >
        {showModal !== false && (
          <Portal key="lightboxjs">
            <Div100vh>
              <div
                style={{ height: lboxHeight }}
                ref={lightboxRef}
                tabIndex={-1} // allow focus via JS
                className="lightboxContainer"
                id="lightboxContainer"
                aria-modal="true"
                role="dialog"
              >
                <motion.div
                  className={`${styles.modalContainer}`}
                  //style={{ height: lboxHeight }}
                  initial={"inactive"}
                  variants={variants}
                  style={{ height: lboxHeight }}
                  // Do not remove: forces JS animation; avoids Framer WAAPI end-of-animation flicker
                  onUpdate={() => {}}
                  animate={showModal ? "active" : "inactive"}
                  exit={"inactive"}
                  transition={{ duration: 0.3 }}
                  onAnimationComplete={(definition) => {
                    // ignore the exit animation
                    if (definition !== "active") return;
                    let prevFocusedElement: any = document.activeElement;
                    setPrevFocusedElem(prevFocusedElement);

                    const firstButton: HTMLElement = document.querySelector(
                      ".lightboxContainer button, .lightboxContainer [tabindex='0']",
                    );
                    if (firstButton) {
                      firstButton.focus({ preventScroll: true });
                    }

                    document
                      .getElementById("lightboxContainer")
                      ?.focus({ preventScroll: true });
                  }}
                >
                  <motion.div
                    className={`${styles.slideshowAnimContainer} `}
                    key="slideshowAnimContainer"
                    id="slideshowAnim"
                    style={{
                      backgroundColor: backgroundColor,
                      width: lightboxModalWidth,
                      height: lboxHeight,
                    }}
                  >
                    <div
                      className={`${styles.lightboxContainer} `}
                      id="lightboxContent"
                      tabIndex={-1}
                      role="dialog"
                      onClick={(e) => {
                        if (modalCloseOption == "clickOutside") {
                          checkOutsideClick(e, ".imageModal", closeModal);
                        }
                      }}
                    >
                      <section
                        className={` ${styles.iconsHeader} 
                      ${controlsPlacement == "default" ? styles.iconHeaderDefault : styles.iconHeaderCenter} 
                      
                      ${iconColor ? "" : getIconClasses()} imageModal`}
                        style={{ color: iconColor }}
                      >
                        <EscKeyHandlers
                          isBrowserFullScreen={isBrowserFullScreen}
                          onCloseModal={closeModal}
                        />

                        {displayControls == true && (
                          <div className={`${styles.controls}`}>
                            {displayFullScreenIcon ? (
                              isBrowserFullScreen ? (
                                <motion.div>
                                  <IconButton
                                    label="Exit full screen"
                                    onClick={() => {
                                      isBrowserFullScreen
                                        ? exitFullScreen()
                                        : fullScreen(fullScreenHandler);
                                    }}
                                  >
                                    <FullscreenExit
                                      size={24}
                                      className={`${styles.lightboxjsIcon} ${
                                        iconColor ? "" : getIconClasses()
                                      }`}
                                      style={getIconStyle()}
                                      color={iconColor ? iconColor : undefined}
                                    />
                                  </IconButton>
                                </motion.div>
                              ) : (
                                <motion.div>
                                  <IconButton
                                    label="Make lightbox full screen"
                                    onClick={() => {
                                      isBrowserFullScreen
                                        ? exitFullScreen()
                                        : fullScreen(fullScreenHandler);
                                    }}
                                  >
                                    <Fullscreen
                                      size={24}
                                      className={`${styles.lightboxjsIcon} ${
                                        iconColor ? "" : getIconClasses()
                                      }`}
                                      style={getIconStyle()}
                                      color={iconColor ? iconColor : undefined}
                                    />
                                  </IconButton>
                                </motion.div>
                              )
                            ) : null}

                            {props.controlComponent ? (
                              <motion.div>
                                <IconButton>
                                  {props.controlComponent}
                                </IconButton>
                              </motion.div>
                            ) : null}
                          </div>
                        )}

                        {props.closeComponent ? (
                          <div
                            onClick={() => {
                              closeModal();
                            }}
                          >
                            <IconButton
                              label="Close"
                              id="closeBtn"
                              onClick={() => {
                                closeModal();
                              }}
                            >
                              {props.closeComponent}
                            </IconButton>
                          </div>
                        ) : (
                          <motion.div
                            className={`${styles.closeIcon} ${props.showControls == false ? styles.mlAuto : ""}`}
                          >
                            <IconButton
                              label="Close"
                              id="closeBtn"
                              className={`${
                                props.showControlsBar == false &&
                                props.showControls == false
                                  ? styles.closeButtonRounded
                                  : styles.closeButton
                              }`}
                              onClick={() => {
                                closeModal();
                              }}
                            >
                              <XLg
                                id="closeIcon"
                                size={24}
                                className={`${styles.lightboxjsIcon} ${
                                  iconColor ? "" : getIconClasses()
                                }`}
                                color={iconColor ? iconColor : undefined}
                                style={getCloseIconBtnStyle()}
                              />
                            </IconButton>
                          </motion.div>
                        )}
                      </section>

                      <AnimatePresence initial={false}>
                        <div
                          className={`${getInnerContainerStyles()} ${styles.embla} 
                        ${
                          isImageCaption("below") && props.showControlsBar == true
                            ? styles.slideImageAndCaption
                            : ""
                        } 
                          ${props.fullScreen ? "" : styles.slideshowInnerContainer} 
                          ${
                            props.showControlsBar == false || props.fullScreen
                              ? styles.hideControlsBar
                              : ""
                          } `}
                          style={getContainerStyles()}
                        >
                          {/* {isImageCaption("above") ? (
                            <div
                              className={`${styles.imgTitleContainer} imageModal`}
                            >
                              <p
                                className={`${styles.imgTitle}`}
                                key={"imgCaption" + slideIndex}
                                style={
                                  props.captionStyle
                                    ? props.captionStyle
                                    : { color: textColor }
                                }
                              >
                                {getImageCaption()}
                              </p>
                            </div>
                          ) : null} */}

                          <div
                            className={`${styles.emblaViewport} 
                           
                            `}
                            style={
                              props.fullScreen == true
                                ? { height: lightboxModalHeight }
                                : {}
                            }
                            // ref={showModal ? emblaRef : null}
                          >
                            <div
                              className={`${styles.emblaContainer}
                            
                            `}
                            >
                              {mediaNode()}
                            </div>
                          </div>
                        </div>
                      </AnimatePresence>

                      {/* <div
                        className={`${styles.thumbnailsOuterContainer} ${isImageCaption("below") ? styles.thumbnailsAndCaption : ""}
                      ${displayImgMetadata ? styles.thumbnailsOuterContainerMetadata : ""} `}
                        style={getThumbnailsOuterContainerStyle()}
                      >
                        {isImageCaption("below") ? (
                          <div
                            className={`${styles.imgTitleContainer} imageModal`}
                          >
                            <p
                              className={`${styles.imgTitle}`}
                              key={"imgCaption" + slideIndex}
                              style={
                                props.captionStyle
                                  ? props.captionStyle
                                  : { color: textColor }
                              }
                            >
                              {getImageCaption()}
                            </p>
                          </div>
                        ) : null}
                      </div> */}
                    </div>
                  </motion.div>
                </motion.div>

                {props.lightboxFooterComponent
                  ? props.lightboxFooterComponent
                  : null}
              </div>
            </Div100vh>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
};
