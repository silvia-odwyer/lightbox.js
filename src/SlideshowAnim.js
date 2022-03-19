import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, AnimateSharedLayout } from "framer-motion";
import {swipePower} from "./mobile-support";
import {useInterval, wrapNums, openFullScreen, closeFullScreen} from "./utility";
import { MapInteractionCSS } from 'react-map-interaction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
                "lightbox": {background: "rgba(0, 0, 0, 0.4)", iconColor: "silver"}};

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

export const SlideshowAnim = (props) => {
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

  // Styling/theming
  const [backgroundColor, setBackgroundColor] = useState(props.backgroundColor ? props.backgroundColor : themes[defaultTheme].background);
  const [iconColor, setIconColor] = useState(props.iconColor ? props.iconColor : themes[defaultTheme].iconColor);
  const [showThumbnails, setShowThumbnails] = useState(props.showThumbnails ? props.showThumbnails : false);
  const [animatedThumbnails, setAnimatedThumbnails] = useState(props.animateThumbnails ? props.animateThumbnails : true);
  const [imgAnimation, setImgAnimation] = useState(props.imgAnimation ? props.imgAnimation : "imgDrag");
  const [slideshowVariants, setSlideshowVariants] = useState(variants[imgAnimation] ? variants[imgAnimation]  : variants["imgDrag"]);

  const isMobile = width <= mobileWidth;

  const keyPressHandler = (event) => {
    console.log("KEY PRESS")
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
    let elem = document.getElementById("img");
    let container = elem.parentElement.parentElement;
    container.style.cursor = `${cursor_name}`;
  }

  const initSmoothZoom = () => {
    let elem = document.getElementById("img");
    let container = elem.parentElement;
    container.style.transition = "transform 0.2s";
  }

  const removeSmoothZoom = () => {
    let elem = document.getElementById("img");
    let container = elem.parentElement;
    container.style.transition = "";
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
  
  // Slideshow feature; if isSlideshowPlaying set to true, then slideshow cycles through images
  useInterval(
    () => {
      updateCurrentSlide(1);
    },
    isSlideshowPlaying ? slideshowInterval : null
  );

  useEffect(() => {
    initKeyboardEventListeners();

    initStyling();
    return () => {
      removeKeyboardEventListeners();
    };
  }, [keyPressHandler]);

  return (
    <AnimateSharedLayout type="crossfade">

      <AnimatePresence initial={false}>
          {/* Gallery images */}
          {props.children.map((elem, index) => (
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

                <section className="iconsHeader" style={{color: iconColor}}>

                  <FontAwesomeIcon icon="plus" onClick={() => zoomIn()}  />
                  <FontAwesomeIcon icon="minus"  onClick={() => zoomOut()}  />
                  <FontAwesomeIcon icon={isFullScreen ? "compress" : "expand"} onClick={() => {isFullScreen ? exitFullScreen() : fullScreen()}} />

                  <FontAwesomeIcon icon="border-all"  onClick={() => {setShowThumbnails(!showThumbnails) }}  />
                  <FontAwesomeIcon icon={isSlideshowPlaying ? "pause" : "play"} onClick={() => {isSlideshowPlaying ? stopSlideshow() : playSlideshow()}} />

                  <FontAwesomeIcon icon="close" size="lg" onClick={() => {closeModal() }}  />
                </section>
                
                <div className="next1" style={{background: "white"}} onClick={() => updateCurrentSlide(1)}>
                    <span>&#10095;</span>
                </div>
                <div className="prev1" style={{background: "white"}} onClick={() => updateCurrentSlide(-1)}>
                   <span>&#10094;</span>
                </div>

                <AnimatePresence initial={false} custom={direction}>

                  <motion.div className="slideshowInnerContainer"
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
                        <img 
                          className="object-contain"
                          src={images[imageIndex].src}
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
                          id="img" />

                    </MapInteractionCSS>

                  </motion.div>
                </AnimatePresence>
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
                  className="thumbnails flex justify-centre align-centre gap-4 mx-auto">
                    {images.map((img, index) => (
                      <img className={"thumbnail " + (imageIndex === index ? 'active' : '')} src={img.src} onClick={() => {setCurrentSlide(index) }} alt={img.caption}/>        
                    ))} 
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

      </motion.div>
    )}

    </AnimatePresence>
    </AnimateSharedLayout>
  );
};