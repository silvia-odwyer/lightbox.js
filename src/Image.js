import React , {useEffect, useState} from 'react'
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import {useInterval, wrapNums, openFullScreen, closeFullScreen} from "./utility";
import { MapInteractionCSS } from 'react-map-interaction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const themes = {"day": {background: "white", iconColor: "black"}, "night": {background: "#151515", iconColor: "silver"}, 
                "lightbox": {background: "rgba(0, 0, 0, 0.4)", iconColor: "silver"}};
                
const defaultTheme = "lightbox";
const maxScale = 2.6;
const minScale = 1;
const defaultMapInteractionValue = {scale: 1, translation: { x: 0, y: 0 }};

export const Image = ({children, ...props}) => {
  const [isOverlayDisplayed, setIsOverlayDisplayed] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomImg, setZoomImg] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState(props.backgroundColor ? props.backgroundColor : themes[defaultTheme].background);
  const [iconColor, setIconColor] = useState(props.iconColor ? props.iconColor : themes[defaultTheme].iconColor);
  const [state, setState] = React.useState();
  const [panImage, setPanImage] = useState(true);
  const [mapInteractionValue, setMapInteractionValue] = useState(defaultMapInteractionValue);
  const [isAnimating, setIsAnimating] = useState(false);

  const changeCursor = (cursor_name) => {
    let elem = document.getElementById("img");
    let container = elem.parentElement.parentElement;
    container.style.cursor = `${cursor_name}`;
  }

  const checkModalClick = (e) => {
    console.log("modal click")
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

  useEffect(() => {
      // if (props.theme) {
      //   if (themes[props.theme]) {
      //     setBackgroundColor(themes[props.theme].background);
      //     setIconColor(themes[props.theme].iconColor);

      //   }
      // }

      console.log("icon color ", iconColor)

  }, [state]);

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

    reinitZoomSettings(value)

    setMapInteractionValue(value)

    if (value.scale == defaultMapInteractionValue.scale) {
      setPanImage(true);
      setMapInteractionValue({scale: 1, translation: { x: 0, y: 0 }});

      smoothZoomTimeout();
    }

    else if (value.scale > defaultMapInteractionValue.scale && !isAnimating) {
      changeCursor("all-scroll")
    }
    
  }
    return (
      <AnimateSharedLayout type="crossfade">
        <AnimatePresence>

        <motion.div key="imgMotionElem">

          <motion.img
            {...props}
            src={props.image.src}
            id="img"
            onClick={() => setIsOverlayDisplayed(props.image.title)}
            layoutId={"imgMotion-" + props.image.title}
            style={props.style}
            className={`cursor-pointer`}
            key={props.image.title}
          />

        </motion.div>


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
                backgroundColor: "black", 
                width: "100vw", 
                height: "100vh",
                zIndex: 999999,
              }}
              className = {`flex h-screen slideshowAnimContainer`}
              onClick={(event) => checkModalClick(event)}
            >
              <div className="lightboxContainer">
              <section className="iconsHeader imageModal" style={{color: iconColor}}>

                <FontAwesomeIcon icon="plus" onClick={() => zoomIn()}  />
                <FontAwesomeIcon icon="minus"  onClick={() => zoomOut()}  />
                {/* <FontAwesomeIcon icon={isFullScreen ? "compress" : "expand"} onClick={() => {isFullScreen ? exitFullScreen() : fullScreen()}} /> */}

                <FontAwesomeIcon icon="close" size="lg" onClick={() => {setIsOverlayDisplayed(false) }}  />
                </section>
                <motion.div className="slideshowInnerContainer imageModal"
            key={"image"}
            onAnimationComplete={() => {setIsAnimating(false)}}
            onAnimationStart={() => {setIsAnimating(true)}}

            >
              <MapInteractionCSS maxScale={maxScale} minScale={minScale} disablePan={panImage} value={mapInteractionValue}
              onChange={(value) => {mapInteractionChange(value)}} zoomIn={zoomImg} >
                    <motion.img
                      src={props.image.src}
                      className="m-auto"
                      style={{width: 426, height: 500}}

                      layoutId={"imgMotion-" + isOverlayDisplayed}
                    />
                    </MapInteractionCSS>
                </motion.div>
              </div>
              


            </motion.div>
          )}


          
        </AnimatePresence>
      </AnimateSharedLayout>

  );

}