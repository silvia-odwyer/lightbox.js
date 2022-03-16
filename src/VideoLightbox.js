import React , {useEffect, useState} from 'react'
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';

const themes = {"day": "white", "night": "rgb(0, 0, 0)", "lightbox": "rgba(0, 0, 0, 0.4)"};

export const VideoLightbox = (props) => {
    const [isOverlayDisplayed, setIsOverlayDisplayed] = useState(false);
    
    const [backgroundColor, setBackgroundColor] = React.useState(props.backgroundColor ? props.backgroundColor : themes["lightbox"]);
    const [state, setState] = React.useState();
    const bodyRef = useRef(null);
    
    React.useEffect(() => {
        if (props.theme) {
          if (themes[props.theme]) {
            setBackgroundColor(themes[props.theme]);
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
              className = {`flex h-screen w-${props.width * 1.5} h-${props.height * 1.5}`}
              onClick={() => setIsOverlayDisplayed(false)}

            >
               
                <motion.video
                //   onClick={() => setIsOverlayDisplayed(props.image.title)}
                  layoutId={"vidMotion-" + props.id}
                //   style={{ height: "50vh", width: "50vw"}}
                  className={`cursor-pointer m-auto`}
                  key={props.id}
                  controls 
                  width={900}
                  autoPlay
                >
                <source
                    src={props.videoSrc}
                    type="video/mp4" />

                </motion.video>

            </motion.div>
          )}

            {/* {isOverlayDisplayed === false && (  */}

            <motion.span
              key="vidMotionElem"
              className="mt-16 w-2/4">

                <motion.video
                //   src={props.image.src}
                  onClick={() => setIsOverlayDisplayed(props.id)}
                  layoutId={"vidMotion-" + props.id}
                  className={`cursor-pointer`}
                  key={props.id}
                  width={500}
                  controls={false}
                  poster={props.posterUrl} 
                >
                <source
                    src={props.videoSrc}
                    type="video/mp4" />
                </motion.video>
            
            </motion.span>
            {/* )} */}
        </AnimatePresence>
      </AnimateSharedLayout>

  );

}