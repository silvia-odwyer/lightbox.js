import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const themes = {
  day: { background: 'white', iconColor: 'black' },
  night: { background: '#151515', iconColor: 'silver' },
  lightbox: { background: 'rgba(0, 0, 0, 0.4)', iconColor: 'silver' }
}

const defaultTheme = 'lightbox'

export const VideoLightbox = (props) => {
  const [isOverlayDisplayed, setIsOverlayDisplayed] = useState(false)
  const [iconColor, setIconColor] = useState(
    props.iconColor ? props.iconColor : themes[defaultTheme].iconColor
  )

  const [backgroundColor, setBackgroundColor] = React.useState(
    props.backgroundColor ? props.backgroundColor : themes['lightbox']
  )
  const [state, setState] = React.useState()
  const bodyRef = useRef(null)

  React.useEffect(() => {
    if (props.theme) {
      if (themes[props.theme]) {
        setBackgroundColor(themes[props.theme].background)
        setIconColor(themes[props.theme].iconColor)
      }
    }
  }, [state])

  return (
    <div className="lightboxjs">
      <AnimateSharedLayout type='crossfade'>
        <AnimatePresence>
          {isOverlayDisplayed !== false && (
            <motion.div
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key='videoOverlay'
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                backgroundColor: backgroundColor,
                width: '100vw',
                height: '100vh',
                zIndex: 999999
              }}
              className={`slideshowAnimContainer`}
              onClick={() => setIsOverlayDisplayed(false)}
            >
              <div className='lightboxContainer'>
                <section
                  className='iconsHeader imageModal'
                  style={{ color: iconColor }}
                >
                  {/* <FontAwesomeIcon icon={isFullScreen ? "compress" : "expand"} onClick={() => {isFullScreen ? exitFullScreen() : fullScreen()}} /> */}

                  <FontAwesomeIcon
                    icon='close'
                    size='lg'
                    onClick={() => {
                      setIsOverlayDisplayed(false)
                    }}
                  />
                </section>

                <motion.div
                  className='slideshowInnerContainer imageModal'
                  key={'image'}
                  onAnimationComplete={() => {
                    setIsAnimating(false)
                  }}
                  onAnimationStart={() => {
                    setIsAnimating(true)
                  }}
                >
                  <motion.video
                    //   onClick={() => setIsOverlayDisplayed(props.image.title)}
                    layoutId={'vidMotion-' + props.id}
                    //  style={{ height: "50vh", width: "50vw"}}
                    className={`cursor-pointer m-auto`}
                    key={props.id}
                    controls
                  >
                    <source src={props.videoSrc} type='video/mp4' />
                  </motion.video>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* {isOverlayDisplayed === false && (  */}

          <motion.video
            //   src={props.image.src}
            onClick={() => setIsOverlayDisplayed(props.id)}
            layoutId={'vidMotion-' + props.id}
            className={`cursor-pointer`}
            key={props.id}
            width={500}
            controls={false}
            poster={props.posterUrl}
          >
            <source src={props.videoSrc} type='video/mp4' />
          </motion.video>

          {/* )} */}
        </AnimatePresence>
      </AnimateSharedLayout>
    </div>
  )
}
