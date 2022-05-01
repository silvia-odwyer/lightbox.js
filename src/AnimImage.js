import React , {useEffect, useState, useRef} from 'react'
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import {useInterval, wrapNums, openFullScreen, closeFullScreen} from "./utility";
import { MapInteractionCSS } from 'react-map-interaction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {cover, contain} from 'intrinsic-scale';
import { ArrowRight, ZoomIn, ZoomOut, PlayFill, Fullscreen, PlayCircleFill, Search, PauseCircleFill, FullscreenExit, XLg, GridFill, PauseFill } from 'react-bootstrap-icons';
import { isBrowser } from './utility'; 
import {Portal} from "react-portal";

const themes = {"day": {background: "white", iconColor: "black"}, "night": {background: "#151515", iconColor: "silver"}, 
                "lightbox": {background: "rgba(0, 0, 0, 0.4)", iconColor: "silver"}};
                
const defaultTheme = "lightbox";
const maxScale = 2.6;
const minScale = 1;
const defaultMapInteractionValue = {scale: 1, translation: { x: 0, y: 0 }};

export const AnimImage = ({children, ...props}) => {
  const [isOverlayDisplayed, setIsOverlayDisplayed] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomImg, setZoomImg] = useState(0);
  const [isFullScreenImage, setIsFullScreenImage] = useState(props.fullScreenImage ? props.fullScreenImage : false);
  const [roundedImage, setRoundedImage] = useState(props.roundedImage ? props.roundedImage : true);

  const [imgContainHeight, setImgContainHeight] = useState(500);
  const [imgContainWidth, setImgContainWidth] = useState(426);
  const [imgLayoutID, setImgLayoutID] = useState(props.imgAnimation ? props.imgAnimation : "imgMotion-");
  const [backgroundColor, setBackgroundColor] = useState(props.backgroundColor ? props.backgroundColor : themes[defaultTheme].background);
  const [iconColor, setIconColor] = useState(props.iconColor ? props.iconColor : themes[defaultTheme].iconColor);
  const [state, setState] = React.useState();
  const [panImage, setPanImage] = useState(true);
  const [mapInteractionValue, setMapInteractionValue] = useState(defaultMapInteractionValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const imgElem = useRef(null);

  const changeCursor = (cursor_name) => {
    let container = imgElem.current.parentElement.parentElement;
    container.style.cursor = `${cursor_name}`;
  }

  const checkModalClick = (e) => {

    const modals = document.getElementsByClassName('imageModal');
    let arr_modals = Array.from(modals);
    console.log("modals", modals)

    for (let i =0; i < arr_modals.length; i++) {
      let elem = arr_modals[i];
      let clickInside = elem.contains(e.target)
    
      if (clickInside) {
         return;
      }
    }
    
    setIsOverlayDisplayed(false);

  }

  // get image dimensions required to contain image in 
  // lightbox container
  function getImageDimensions(url){   

  }

  const loadImage = (imageUrl) => {
    const img = new Image();
    img.src = imageUrl;
  
    img.onload = () => {
      let { width, height, x, y } = contain(screen.width * 0.92, screen.height * 0.8, img.naturalWidth, img.naturalHeight);
      setImgContainHeight(height);
      setImgContainWidth(width);
    };
    img.onerror = (err) => {
      console.log("img error");
      console.error(err);
    };
  };

  useEffect(() => {

    loadImage(props.image.src);

      if (props.theme) {
        if (themes[props.theme]) {
          setBackgroundColor(themes[props.theme].background);
          setIconColor(themes[props.theme].iconColor);

        }
      }

      let reducedMotionMediaQuery = checkAndInitReducedMotion();

      return () => {
        reducedMotionMediaQuery.removeEventListener("change", reducedMotionMediaQuery)
      };

      console.log("icon color ", iconColor)

  }, [state]);

 
  const initSmoothZoom = () => {
    let container = imgElem.current.parentElement;
    container.style.transition = "transform 0.2s";
  }

  const removeSmoothZoom = () => {
    let container = imgElem.current.parentElement;
    container.style.transition = "";
  }

  const smoothZoomTimeout = () => {
    setTimeout(() => {
      initSmoothZoom();
    }, 300)
  }

    
  const zoomIn = () => {
    changeCursor("zoom-out");
    setIsZoomed(true);
    setZoomImg(zoomImg + 1);
  }
  
  const zoomOut = () => {
    changeCursor("zoom-in");
    setIsZoomed(false);
    setZoomImg(zoomImg - 1);
  }

  const closeLightbox = () => {
    resetMapInteractionValue();

    setIsOverlayDisplayed(false);
  }

  const resetMapInteractionValue = () => {
    setMapInteractionValue({scale: 1, translation: { x: 0, y: 0 }});
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

  const setReducedMotion = (mediaQuery) => {
    if (mediaQuery.matches) {
      setImgLayoutID(null);
    }
  }                                            

  // Check if the user has a preference for reduced motion
  // If so, the image animation transitions between slides in the slideshow will be adjusted 
  // to account for this
  const checkAndInitReducedMotion = () => {
    let reducedMotionMediaQuery;
    if (isBrowser) {
      reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

      if (!reducedMotionMediaQuery || reducedMotionMediaQuery.matches) {
        setImgLayoutID(null)
      }
  
      reducedMotionMediaQuery.addEventListener("change", setReducedMotion(reducedMotionMediaQuery));
    }

    return reducedMotionMediaQuery;
  }

  const mapInteractionChange = (value) => {
    setPanImage(false); 

    reinitZoomSettings(value)

    setMapInteractionValue(value)

    if (value.scale == defaultMapInteractionValue.scale) {
      setPanImage(true);
      resetMapInteractionValue();

      smoothZoomTimeout();
    }

    else if (value.scale > defaultMapInteractionValue.scale && !isAnimating) {
      changeCursor("all-scroll")
    }
    
  }
    return (
      <div>
        <AnimatePresence>

          <motion.img
            {...props}
            src={props.image.src}
            onClick={() => setIsOverlayDisplayed(props.image.title)}
            // layoutId={"imgMotion-" + props.image.title}
            whileTap={{scale: 0.97}}
            style={props.style}
            className="cursor-pointer"
            key={props.image.title}
          />

        <Portal>
          <AnimatePresence>

            {isOverlayDisplayed !== false && (

              <motion.div
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 } }
                animate={{ opacity: 1,}}
                key="imgOverlay"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  backgroundColor: backgroundColor, 
                  width: "100vw", 
                  height: "100vh",
                  zIndex: 999999,
                }}
                className = {`flex h-screen slideshowAnimContainer`}
                onClick={(event) => checkModalClick(event)}
              >
                <motion.div className="lightboxContainer">
                  <section className="iconsHeader imageModal" style={{color: iconColor}}>

                    <FontAwesomeIcon icon="plus" onClick={() => zoomIn()}  />
                    <FontAwesomeIcon icon="minus"  onClick={() => zoomOut()}  />
                    {/* <FontAwesomeIcon icon={isFullScreen ? "compress" : "expand"} onClick={() => {isFullScreen ? exitFullScreen() : fullScreen()}} /> */}

                    <FontAwesomeIcon icon="close" size="lg" onClick={() => {closeLightbox()}}  />
                  </section>

                  <motion.div className="imageInnerContainer">

                    {/* <MapInteractionCSS maxScale={maxScale} minScale={minScale} disablePan={panImage} value={mapInteractionValue}
                    onChange={(value) => {mapInteractionChange(value)}} zoomIn={zoomImg} > */}
                        <motion.img
                          src={props.image.src}
                          key={"image"}
                          // layoutId={"imgMotion-" + isOverlayDisplayed}
                          // initial={{ scale: 0.7 }}
                          // exit={{ scale: 0.7, opacity: 0 } }
                          // animate={{scale: 1}}
                          onAnimationComplete={() => {setIsAnimating(false)}}
                          onAnimationStart={() => {setIsAnimating(true)}}
                          className="m-auto"
                          style={{width: imgContainWidth, height: imgContainHeight}}
                          ref={imgElem}
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
                    {/* </MapInteractionCSS> */}

                  </motion.div>


                </motion.div>

              </motion.div>

            )}
            </AnimatePresence>

          </Portal>



        </AnimatePresence>


      </div>
      


  );

}