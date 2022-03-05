import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {swipePower} from "./mobile-support";
import {useInterval, wrapNums} from "./utility";
import { MapInteractionCSS } from 'react-map-interaction';

const variants = {
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
  }
};

const defaultMapInteractionValue = {scale: 1, translation: { x: 0, y: 0 }};
const themes = {"day": {background: "white", iconColor: "black"}, "night": {background: "#151515", iconColor: "white"}, 
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
  const [isZoomed, setIsZoomed] = useState(false);
  const [animTransition, setAnimTransition] = useState(slideshowAnimTransition);
  const [panImage, setPanImage] = useState(true);
  const [zoomImg, setZoomImg] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);
  const [mapInteractionValue, setMapInteractionValue] = useState(defaultMapInteractionValue);
  const [imgSwipeMotion, setImgSwipeMotion] = useState(imgSwipeDirection);

  // Styling/theming
  const [backgroundColor, setBackgroundColor] = useState(props.backgroundColor ? props.backgroundColor : themes[defaultTheme].background);
  const [iconColor, setIconColor] = useState(props.iconColor ? props.iconColor : themes[defaultTheme].iconColor);
  const isMobile = width <= mobileWidth;

  const keyPressHandler = (event) => {
    let key = event.key;
  
    if (key == "ArrowLeft") {
      updateCurrentSlide(-1);
    }
  
    else if (key == "ArrowRight") {
      updateCurrentSlide(1);
      
    }
    else if (key == "Escape") {
      closeModal(1)
    }
  };


  function handleWindowResize() {
      setWidth(window.innerWidth);
  }


  const updateCurrentSlide = (newDirection) => {
    setPanImage(true);
    setMapInteractionValue({scale: 1, translation: { x: 0, y: 0 }})
    setIsZoomed(false);
    setImgSlideIndex([imgSlideIndex + newDirection, newDirection]);
    initSmoothZoom();

  };

  const closeModal = (num) => {
    setIsZoomed(false)
    setShowModal(false)
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
    setZoomImg(zoomImg + 1);
  }

  const zoomOut = () => {
    setZoomImg(zoomImg - 1);
  }

  const handleImgClick = (e) => {
    if (isZoomed) {
      zoomOut()
    }
    else {
      console.log("event y ", e.clientY);
      zoomIn();
    }

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
    
  }

  const updateImgSwipeMotion = (swipeDirection) => {
    console.log("set img swipe motion to ", swipeDirection)
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
    isSlideshowPlaying ? 1100 : null
  );

  // Keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', keyPressHandler);
    window.addEventListener('resize', handleWindowResize);
    initStyling();

    return () => {
      window.removeEventListener('resize', handleWindowResize);

      document.removeEventListener('keydown', keyPressHandler);
    };
  }, [keyPressHandler]);

  return (
      <AnimatePresence initial={false}>
          {/* Gallery images */}
          {props.children.map((elem, index) => (
            <img {...elem.props} class={elem.props.className + " cursor-pointer"} onClick={() => openModal(index) } key={index} />
          ))}

          { showModal !== false && (
            <motion.div 
            className="slideshowAnimContainer"    
            key="slideshowAnimContainer"                           
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

                <section className="iconsHeader flex flex-row items-centre justify-centre cursor-pointer text-3xl" style={{color: iconColor}}>
                  <div onClick={() => zoomIn()}>+</div>
                  <div onClick={() => zoomOut()}>-</div>
                  <div className="slideshowBtn" onClick={() => {isSlideshowPlaying ? stopSlideshow() : playSlideshow()}}>
                    {isSlideshowPlaying ? "⏸" : "▶"}
                  </div>
                  <div className="closeIconBtn text-5xl" onClick={() => {closeModal(1) }}>&times;</div>

                </section>
                
                <div className="next1" style={{background: "white"}} onClick={() => updateCurrentSlide(1)}>
                    &#10095;
                </div>
                <div className="prev1" style={{background: "white"}} onClick={() => updateCurrentSlide(-1)}>
                    &#10094;
                </div>

                <AnimatePresence initial={false} custom={direction}>

                  <motion.div className="slideshowInnerContainer mx-auto text-center flex flex-col justify-center align-center"
                  custom={direction}
                  variants={variants}
                  initial="enterImg"
                  key={imgSlideIndex}
                  animate={"centerImg"}
                  exit="exitImg"
                  transition={animTransition}
                  drag={imgSwipeMotion}
                  dragElastic={1}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {checkAndUpdateSlide(offset, velocity)}}>
                    <MapInteractionCSS maxScale={maxScale} minScale={minScale} disablePan={panImage} value={mapInteractionValue}
                     onChange={(value) => {mapInteractionChange(value)}} zoomIn={zoomImg}>
                        <img 
                          className="object-contain"
                          src={images[imageIndex].src}
                          onClick={(e) => {
                             if (!e.defaultPrevented) {
                               console.log("is zoomed ", isZoomed)
                              //  zoomIn();
                              // removeSmoothZoom();
                              console.log("x", e.clientX);
                              console.log("y ", e.clientY)
                              } 
                              else {
                                removeSmoothZoom();
                              }
                           }}
                          id="img" />

                    </MapInteractionCSS>

                  </motion.div>
                </AnimatePresence>

            </div>
      </motion.div>
    )}
    </AnimatePresence>
  );
};
