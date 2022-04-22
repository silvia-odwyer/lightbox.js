import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, AnimateSharedLayout } from "framer-motion";
import {swipePower} from "./mobile-support";
import {useInterval, wrapNums, openFullScreen, closeFullScreen} from "./utility";
import { MapInteractionCSS } from 'react-map-interaction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ArrowRight, ZoomIn, ZoomOut, PlayFill, Fullscreen, PlayCircleFill, Search, PauseCircleFill, FullscreenExit, XLg, GridFill, PauseFill } from 'react-bootstrap-icons';

import {
  GlassMagnifier,
  MOUSE_ACTIVATION,
  TOUCH_ACTIVATION
} from "react-image-magnifiers";
import Magnifier from "react-magnifier";

const variants = {
  "imgDrag": {
    enterImg: (direction) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    centerImg: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exitImg: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    },
  },
  "fade" : {
    enterImg: (direction) => {
      return {
        opacity: 0
      };
    },
    centerImg: {
      zIndex: 1,
      opacity: 1
    },
    exitImg: (direction) => {
      return {
        zIndex: 0,
        opacity: 0
      };
    },
  }

};

let thumbnailVariants = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0 , y: 100},
};

const defaultMapInteractionValue = {scale: 1, translation: { x: 0, y: 0 }};
const themes = {"day": {background: "white", iconColor: "black"}, "night": {background: "#151515", iconColor: "silver"}, 
                "lightbox": {background: "rgba(12, 12, 12, 0.93)", iconColor: "silver"}};

const arrowStyles = {"light": {background: "white", color: "black"}, "dark" : {background: "#151515", color: "silver"}}

const swipeConfidenceThreshold = 10000;
const opacityDuration = 0.2;
const maxScale = 2.6;
const minScale = 1;
const imgSwipeDirection = "x";
const defaultTheme = "night";
const mobileWidth = 768;
const animTransitionDefault =   {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: opacityDuration }
};
const slideshowAnimTransition =   {
  opacity: { duration: opacityDuration }
};

export const SlideshowLightbox = (props) => {
  const [[imgSlideIndex, direction], setImgSlideIndex] = useState([0, 0]);
  const [showModal, setShowModal] = useState(true);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [images, setImages] = useState(props.children ? props.children.map(obj => obj.props) : []);
  const imageIndex = wrapNums(0, images.length, imgSlideIndex);
  const [slideshowInterval, setSlideshowInterval] = useState(props.slideshowInterval ? props.slideshowInterval : 1100);

  const [isZoomed, setIsZoomed] = useState(false);
  const [animTransition, setAnimTransition] = useState(animTransitionDefault);
  const [panImage, setPanImage] = useState(true);
  const [zoomImg, setZoomImg] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);
  const [mapInteractionValue, setMapInteractionValue] = useState(defaultMapInteractionValue);
  const [imgSwipeMotion, setImgSwipeMotion] = useState(imgSwipeDirection);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [enableMagnifyingGlass, setMagnifyingGlass] = useState(false);

  // Refs
  // const imgElemRef = useRef(null);
  // const [imgElem, setImgElem] = useState(null);

  // Styling/theming
  const [backgroundColor, setBackgroundColor] = useState(props.backgroundColor ? props.backgroundColor : themes[defaultTheme].background);
  const [iconColor, setIconColor] = useState(props.iconColor ? props.iconColor : themes[defaultTheme].iconColor);
  const [showThumbnails, setShowThumbnails] = useState(props.showThumbnails ? props.showThumbnails : false);
  const [animatedThumbnails, setAnimatedThumbnails] = useState(props.animateThumbnails ? props.animateThumbnails : true);
  const [imgAnimation, setImgAnimation] = useState(props.imgAnimation ? props.imgAnimation : "imgDrag");
  // const [slideshowVariants, setSlideshowVariants] = useState(variants[imgAnimation] ? variants[imgAnimation]  : variants["imgDrag"]);
  const [arrowStyle, setArrowStyle] = useState(props.arrowStyle ? props.arrowStyle : "dark");

  const isMobile = width <= mobileWidth;

  const keyPressHandler = (event) => {
    let key = event.key;
  
    if (key == "ArrowLeft") {
      updateCurrentSlide(-1);
    }
  
    else if (key == "ArrowRight") {
      updateCurrentSlide(1);
      
    }
    else if (key == "Escape" && !isFullScreen) {
      closeModal()
    }

  };

  function handleWindowResize() {
    setWidth(window.innerWidth);
  }

  const fullScreen = () => {
    let lightbox = document.getElementById("slideshowAnim");
    openFullScreen(lightbox);
    setIsFullScreen(true);
    console.log("full screen set to ", isFullScreen)
    initFullScreenChangeEventListeners();

  }

  const exitFullScreen = () => {
    console.log("EXIT FULL SCREEN", isFullScreen)
    if (isFullScreen) {
      console.log("CLOSE FULL SCREEN")
      closeFullScreen(document);
      setIsFullScreen(false);
      removeFullScreenChangeEventListeners();
    }

  }

  const updateCurrentSlide = (newDirection) => {

    resetMapInteraction();
    setImgSlideIndex([imgSlideIndex + newDirection, newDirection]);

  };

  const resetMapInteraction = () => {
    setPanImage(true);
    setMapInteractionValue({scale: 1, translation: { x: 0, y: 0 }})
    setIsZoomed(false);
  }

  const setCurrentSlide = (newIndex) => {
    let newDirection;
    if (newIndex > imgSlideIndex) {
      newDirection = 1;
    }
    else {
      newDirection = -1
    }

    setAnimTransition(slideshowAnimTransition)
    resetMapInteraction();
    setImgSlideIndex([newIndex, newDirection]);

  };

  const closeModal = () => {

    if (isFullScreen) {
      exitFullScreen();
    }

    // ensure slideshow is paused
    if (isSlideshowPlaying) {
      setIsSlideshowPlaying(false);
    }

    setIsZoomed(false);
    setShowModal(false);
  }

  const openModal = (num) => {
    setImgSlideIndex([num, 1]);
    setShowModal(true);
  }

  const playSlideshow = () => {
    setAnimTransition(slideshowAnimTransition)
    updateCurrentSlide(1);
    setIsSlideshowPlaying(true);
  }

  const stopSlideshow = () => {
    setAnimTransition(animTransitionDefault);
    setIsSlideshowPlaying(false);
  }

  const zoomIn = () => {
    changeCursor("all-scroll");
    setIsZoomed(true);
    setZoomImg(zoomImg + 1);
  }

  const zoomOut = () => {
    changeCursor("zoom-in");
    setIsZoomed(false);
    setZoomImg(zoomImg - 1);
  }

  const checkAndUpdateSlide = (offset, velocity) => {

    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold || swipe > swipeConfidenceThreshold) {
      setMapInteractionValue({scale: 1, translation: { x: 0, y: 0 }});
      setPanImage(true);
      if (swipe < -swipeConfidenceThreshold) {
        updateCurrentSlide(1);
      } else if (swipe > swipeConfidenceThreshold) {
        updateCurrentSlide(-1);
      }
    }
    else {
      removeSmoothZoom();
    }
  }

  const reinitZoomSettings = (value) => {

    // if user zoomed in
    if (value.scale > mapInteractionValue.scale) {
      setIsZoomed(true)  
      initSmoothZoom();
    }
    // if user zoomed out
    else if (value.scale < mapInteractionValue.scale) {
      setIsZoomed(false);
      initSmoothZoom();
    }

    // user panned image, did not zoom
    else {
      removeSmoothZoom();
    }
  }

  const mapInteractionChange = (value) => {
    setPanImage(false); 
    updateImgSwipeMotion(false);

    reinitZoomSettings(value)

    setMapInteractionValue(value)

    if (value.scale == defaultMapInteractionValue.scale) {
      setPanImage(true);
      setMapInteractionValue({scale: 1, translation: { x: 0, y: 0 }});

      updateImgSwipeMotion(imgSwipeDirection);
      smoothZoomTimeout();
    }

    else if (value.scale > defaultMapInteractionValue.scale && !isAnimating) {
      changeCursor("all-scroll")
    }
    
  }

  const updateImgSwipeMotion = (swipeDirection) => {
    setImgSwipeMotion(swipeDirection);
  }

  const initStyling = () => {
    if (props.theme) {
      if (themes[props.theme]) {
        setBackgroundColor(themes[props.theme].background);
        setIconColor(themes[props.theme].iconColor)
      }
    }

  }

  const changeCursor = (cursor_name) => {
    if (!enableMagnifyingGlass) {
      let imgElem = document.getElementById("img")
      let container = imgElem.parentElement.parentElement;
      container.style.cursor = `${cursor_name}`;
    }

  }

  const initSmoothZoom = () => {
    if (!enableMagnifyingGlass) {
      let imgElem = document.getElementById("img")

      let container = imgElem.parentElement;
      container.style.transition = "transform 0.2s";
    }

  }

  const removeSmoothZoom = () => {
    if (!enableMagnifyingGlass) {
      let imgElem = document.getElementById("img")

      let container = imgElem.parentElement;
      container.style.transition = "";
    }

  }

  const initFullScreenChangeEventListeners = () => {
    document.addEventListener('fullscreenchange', exitFullScreen);
    document.addEventListener('webkitfullscreenchange', exitFullScreen);
    document.addEventListener('MSFullscreenChange', exitFullScreen);
    document.addEventListener('mozfullscreenchange', exitFullScreen);

  }

  const removeFullScreenChangeEventListeners = () => {
    document.removeEventListener('fullscreenchange', exitFullScreen);
    document.removeEventListener('webkitfullscreenchange', exitFullScreen);
    document.removeEventListener('MSFullscreenChange', exitFullScreen);
    document.removeEventListener('mozfullscreenchange', exitFullScreen);

  }

  const initKeyboardEventListeners = () => {
    document.addEventListener('keydown', keyPressHandler);
    window.addEventListener('resize', handleWindowResize);
  }

  const removeKeyboardEventListeners = () => {
    window.removeEventListener('resize', handleWindowResize);
    document.removeEventListener('keydown', keyPressHandler);
  }

  const smoothZoomTimeout = () => {
    setTimeout(() => {
      initSmoothZoom();
    }, 300)
  }

  const setReducedMotion = (mediaQuery) => {
    if (mediaQuery.matches) {
      setImgAnimation("fade");
    }
  }

  // Check if the user has a preference for reduced motion
  // If so, the image animation transitions between slides in the slideshow will be adjusted 
  // to account for this
  const checkAndInitReducedMotion = () => {
    let reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!reducedMotionMediaQuery || reducedMotionMediaQuery.matches) {
      setImgAnimation("fade")
    }

    reducedMotionMediaQuery.addEventListener("change", setReducedMotion(reducedMotionMediaQuery));
    return reducedMotionMediaQuery;
  }
  
  // Slideshow feature; if isSlideshowPlaying set to true, then slideshow cycles through images
  useInterval(
    () => {
      updateCurrentSlide(1);
    },
    isSlideshowPlaying ? slideshowInterval : null
  );

  useEffect(() => {


    // setImgElem(imgElemRef.current)
    initKeyboardEventListeners();
    console.log("imgs ", props.children[0].type)
    let reducedMotionMediaQuery = checkAndInitReducedMotion();

    let img_gallery = document.querySelectorAll('[data-lightboxjs]');
    console.log("lightbox_js ", img_gallery);

    initStyling();
    return () => {
      removeKeyboardEventListeners();
      reducedMotionMediaQuery.removeEventListener("change", reducedMotionMediaQuery)
    };
  }, [keyPressHandler]);

  return (
    <AnimateSharedLayout type="crossfade">

      <AnimatePresence initial={false}>


          {/* Gallery images */}
          {props.children.filter(elem => elem.type == "img").map((elem, index) => ( 
            <img {...elem.props} class={elem.props.className + " cursor-pointer"} onClick={() => openModal(index) } key={index} />
          ))}

          
          { showModal !== false && (
            <motion.div 
            className="slideshowAnimContainer"    
            key="slideshowAnimContainer"   
            id="slideshowAnim"                        
            initial={{ opacity: 0 }}
            exit={{ opacity: 0, } }
            animate={{ opacity: 1,  }}
            transition={{
                type: "spring", 
                duration: 0.45 ,
            }}>
            <div className="lightboxContainer"             
              style={{
                backgroundColor: backgroundColor
              }}>

                <section className={"iconsHeader " + arrowStyle + "_header_icon"} style={{color: iconColor}}>
                <ZoomIn onClick={() => zoomIn()} />
                <ZoomOut onClick={() => zoomOut()} />
                {isFullScreen ? <FullscreenExit onClick={() => {isFullScreen ? exitFullScreen() : fullScreen()}}  /> : 
                <Fullscreen  onClick={() => {isFullScreen ? exitFullScreen() : fullScreen()}} />}


                <GridFill onClick={() => {setShowThumbnails(!showThumbnails) }}  />
                <Search onClick={() => setMagnifyingGlass(!enableMagnifyingGlass)} />

                {isSlideshowPlaying ? <PauseCircleFill onClick={() => {isSlideshowPlaying ? stopSlideshow() : playSlideshow()}}  /> : 
                <PlayCircleFill onClick={() => {isSlideshowPlaying ? stopSlideshow() : playSlideshow()}} />}

                <XLg onClick={() => {closeModal() }} />
{/* 
                  <FontAwesomeIcon icon="plus"  />
                  <FontAwesomeIcon icon="minus"    />
                  <FontAwesomeIcon icon={isFullScreen ? "compress" : "expand"} onClick={() => {isFullScreen ? exitFullScreen() : fullScreen()}} />

                  <FontAwesomeIcon icon="border-all"    />
                  <FontAwesomeIcon icon={isSlideshowPlaying ? "pause" : "play"} />

                  <FontAwesomeIcon icon="close" size="lg"   /> */}


                </section>
                
                <div className={"next1 " + arrowStyle + "_icon"} onClick={() => updateCurrentSlide(1)}>
                    <span>&#10095;</span>
                </div>
                <div className={"prev1 " + arrowStyle + "_icon"} onClick={() => updateCurrentSlide(-1)}>
                   <span>&#10094;</span>
                </div>

                <AnimatePresence initial={false} custom={direction}>

                  <motion.div className={`slideshowInnerContainer ${showThumbnails ? "slideshowInnerContainerThumbnails": ""}`}
                  custom={direction}
                  variants={variants[imgAnimation]}
                  initial="enterImg"
                  key={imgSlideIndex}
                  animate={"centerImg"}
                  exit="exitImg"
                  transition={animTransition}
                  drag={(imgAnimation == "imgDrag") ? imgSwipeMotion : false}
                  dragElastic={1}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {checkAndUpdateSlide(offset, velocity)}}
                  onAnimationComplete={() => {setIsAnimating(false)}}
                  onAnimationStart={() => {setIsAnimating(true)}}>
                    <MapInteractionCSS maxScale={maxScale} minScale={minScale} disablePan={panImage} value={mapInteractionValue}
                     onChange={(value) => {mapInteractionChange(value)}} zoomIn={zoomImg}>

                        { enableMagnifyingGlass == true ? 
                        <Magnifier src={images[imageIndex].src} className="object-contain" /> :                         
                           <img 
                           className="object-contain"
                           src={images[imageIndex].src}
                           id="img"
                           onClick={(e) => {
                              if (!e.defaultPrevented) {
                                if (!isZoomed && !isAnimating) {
                                  zoomIn()
                                }
                                else {
                                 zoomOut();
                                }
                               }
                            }}
                            />
                        }

                    </MapInteractionCSS>

                  </motion.div>
                </AnimatePresence>
                <div className="thumbnailsOuterContainer">
                  <AnimatePresence initial={animatedThumbnails}>
                  { showThumbnails !== false && (

                    <motion.div
                    initial={"hidden"}
                    exit={"hidden" }
                    animate={"visible"}
                    transition={{
                        type: "spring", 
                        duration: 0.75 ,
                    }}  
                    variants={thumbnailVariants}
                    className="thumbnails flex justify-centre align-centre gap-2 mx-auto">
                      {images.map((img, index) => (
                        <img className={"thumbnail " + (imageIndex === index ? 'active' : '')} src={img.src} onClick={() => {setCurrentSlide(index) }} alt={img.caption}/>        
                        // <span style={{color: "white"}}>{index}</span>
                      ))} 
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>


            </div>

      </motion.div>
    )}

    </AnimatePresence>
    </AnimateSharedLayout>
  );
};