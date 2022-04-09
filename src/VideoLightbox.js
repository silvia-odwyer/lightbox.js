import React , {useEffect, useState, useRef} from 'react'
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const themes = {"day": {background: "white", iconColor: "black"}, "night": {background: "#151515", iconColor: "silver"}, 
                "lightbox": {background: "rgba(0, 0, 0, 0.4)", iconColor: "silver"}};
                
const defaultTheme = "lightbox";

export const VideoLightbox = (props) => {
    const [isOverlayDisplayed, setIsOverlayDisplayed] = useState(false);
    const [iconColor, setIconColor] = useState(props.iconColor ? props.iconColor : themes[defaultTheme].iconColor);

    const [backgroundColor, setBackgroundColor] = React.useState(props.backgroundColor ? props.backgroundColor : themes["lightbox"]);
    const [state, setState] = React.useState();
    const bodyRef = useRef(null);
    
    React.useEffect(() => {
        if (props.theme) {
          if (themes[props.theme]) {
            setBackgroundColor(themes[props.theme].background);
            setIconColor(themes[props.theme].iconColor);

          }
        }

      }, [state]);

    return (
      <AnimateSharedLayout type="crossfade">
        <AnimatePresence>
          {isOverlayDisplayed !== false && (
            <motion.div
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 } }
              animate={{ opacity: 1,}}
              key="videoOverlay"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                backgroundColor: backgroundColor, 
                width: "100vw", 
                height: "100vh",
                zIndex: 999999,
              }}
              className = {`slideshowAnimContainer`}
              onClick={() => setIsOverlayDisplayed(false)}

            >
              <motion.div className="lightboxContainer">
              <section className="iconsHeader imageModal" style={{color: iconColor}}>

                {/* <FontAwesomeIcon icon={isFullScreen ? "compress" : "expand"} onClick={() => {isFullScreen ? exitFullScreen() : fullScreen()}} /> */}

                <FontAwesomeIcon icon="close" size="lg" onClick={() => {setIsOverlayDisplayed(false) }}  />
                </section>

                <motion.div className="slideshowInnerContainer imageModal"
                    key={"image"}
                    onAnimationComplete={() => {setIsAnimating(false)}}
                    onAnimationStart={() => {setIsAnimating(true)}}

              >
                  <motion.img
                  //   onClick={() => setIsOverlayDisplayed(props.image.title)}
                    layoutId={"vidMotion-" + props.id}
                    className={``}
                    key={props.id}
                   width={500}
                   src={props.videoSrc}
                    
                  >


                  </motion.img>
                </motion.div>
              </motion.div>

            </motion.div>
          )}

            {/* {isOverlayDisplayed === false && (  */}



                <motion.img
                   src={props.videoSrc}
                  onClick={() => setIsOverlayDisplayed(true)}
                  layoutId={"vidMotion-" + props.id}
                  className={`cursor-pointer`}
                  key={props.id}
                  width={500}
                  controls={false}
                  poster={props.posterUrl} 
                >
 
                </motion.img>
            
            {/* )} */}
        </AnimatePresence>
      </AnimateSharedLayout>

  );

}