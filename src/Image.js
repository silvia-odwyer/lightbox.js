import React , {useEffect, useState} from 'react'
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';

const themes = {"day": "white", "night": "rgb(0, 0, 0)", "lightbox": "rgba(0, 0, 0, 0.4)"};

export const Image = ({children, ...props}) => {
    const [isOverlayDisplayed, setIsOverlayDisplayed] = useState(false);
    
    const [backgroundColor, setBackgroundColor] = React.useState(props.backgroundColor ? props.backgroundColor : themes["lightbox"]);
    const [state, setState] = React.useState();
    
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
              className = {`flex h-screen`}
              onClick={() => setIsOverlayDisplayed(false)}

            >
              <motion.img
                {...props}
                style={{ height: "50%", width: "50%"}}
                src={props.image.src}
                className="m-auto cursor-pointer"
                layoutId={"imgMotion-" + isOverlayDisplayed}
              />

            </motion.div>
          )}

            <motion.div key="imgMotionElem">
 
                <motion.img
                  {...props}
                  src={props.image.src}
                  onClick={() => setIsOverlayDisplayed(props.image.title)}
                  layoutId={"imgMotion-" + props.image.title}
                  height={500}
                  style={props.style}
                  className={`cursor-pointer w-${props.width} h-${props.height}`}
                  key={props.image.title}
                />

            </motion.div>
          
        </AnimatePresence>
      </AnimateSharedLayout>

  );

}