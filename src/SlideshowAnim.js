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
  zoom: {
    zIndex: 1,
    x: -500,
    opacity: 1,
    scale: 2,
  },
  exitImg: (direction) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    };
  }
};

const swipeConfidenceThreshold = 10000;
const opacityDuration = 0.2;
const dragAnim = { type: "spring", stiffness: 300, damping: 30 };
const animTransitionDefault =   {
  x: {dragAnim},
  opacity: { duration: opacityDuration }
}

export const SlideshowAnim = (props) => {
  const [[imgSlideIndex, direction], setImgSlideIndex] = useState([0, 0]);
  const [showModal, setShowModal] = useState(true);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [images, setImages] = useState(props.children ? props.children.map(obj => obj.props) : []);
  const imageIndex = wrapNums(0, images.length, imgSlideIndex);
  const [isZoomed, setIsZoomed] = useState(false);


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

  const updateCurrentSlide = (newDirection) => {
    setIsZoomed(false);
    setImgSlideIndex([imgSlideIndex + newDirection, newDirection]);
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
    updateCurrentSlide(1);
    setIsSlideshowPlaying(true);
  }

  const stopSlideshow = () => {
    setIsSlideshowPlaying(false);
  }

  const zoomIn = () => {
    setIsZoomed(true);
  }

  const zoomOut = () => {
    setIsZoomed(false);
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

    if (swipe < -swipeConfidenceThreshold) {
      updateCurrentSlide(1);
    } else if (swipe > swipeConfidenceThreshold) {
      updateCurrentSlide(-1);
    }
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

    return () => {
      document.removeEventListener('keydown', keyPressHandler);
    };
  }, [keyPressHandler]);

  return (
      <AnimatePresence initial={false}>
          {/* Gallery images */}
          {props.children.map((elem, index) => (
            <img {...elem.props} class={...elem.props + " cursor-pointer"} onClick={() => openModal(index) } key={index} />
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
            }}
            >
            <div className="lightboxContainer">

                <section className="iconsHeader flex flex-row items-centre justify-centre cursor-pointer text-3xl">
                  <div onClick={() => zoomIn()}>+</div>
                  <div onClick={() => zoomOut()}>-</div>
                  <div className="slideshowBtn" onClick={() => {isSlideshowPlaying ? stopSlideshow() : playSlideshow()}}>
                    {isSlideshowPlaying ? "⏸" : "▶"}
                  </div>
                  <div className="closeIconBtn text-5xl" onClick={() => {closeModal(1) }}>&times;</div>

                </section>
                
                <div className="next1" onClick={() => updateCurrentSlide(1)}>
                    &#10095;
                </div>
                <div className="prev1" onClick={() => updateCurrentSlide(-1)}>
                    &#10094;
                </div>
                <AnimatePresence initial={false} custom={direction}>

                <motion.div className="slideshowInnerContainer"
                custom={direction}
                variants={variants}
                initial="enterImg"
                key={imgSlideIndex}
                animate={"centerImg"}
                exit="exitImg"
                transition={ {
                    x: {type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: opacityDuration }
                }}
                drag="x"
                dragElastic={1}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset, velocity }) => {checkAndUpdateSlide(offset, velocity)}}>
                  <MapInteractionCSS maxScale={2.6} minScale={1} disablePan={true}>
                      <img
                        className={""}
                        src={images[imageIndex].src}
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
