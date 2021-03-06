import * as React from 'react'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion'
import {
  useInterval,
  wrapNums,
  openFullScreen,
  closeFullScreen,
  swipePower
} from './utility'
import { MapInteractionCSS } from '@silvia-odwyer/react-map-interaction-fork'
import {
  ZoomIn,
  ZoomOut,
  Fullscreen,
  PlayCircleFill,
  Search,
  PauseCircleFill,
  FullscreenExit,
  XLg,
  GridFill,
} from 'react-bootstrap-icons'
import ScrollContainer from 'react-indiana-drag-scroll'
import Magnifier from 'react-magnifier'
import { cover, contain } from 'intrinsic-scale'
import { isBrowser } from './utility'
import { Portal } from 'react-portal'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

const variants = {
  imgDrag: {
    enterImg: (direction) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      }
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
      }
    }
  },
  fade: {
    enterImg: (direction) => {
      return {
        opacity: 0
      }
    },
    centerImg: {
      zIndex: 1,
      opacity: 1
    },
    exitImg: (direction) => {
      return {
        zIndex: 0,
        opacity: 0
      }
    }
  }
}

let thumbnailVariants = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 100 }
}

const defaultMapInteractionValue = { scale: 1, translation: { x: 0, y: 0 } }
const themes = {
  day: {
    background: 'white',
    iconColor: 'black',
    thumbnailBorder: 'solid transparent 2px'
  },
  night: {
    background: '#151515',
    iconColor: 'silver',
    thumbnailBorder: 'solid rgb(138, 138, 138) 2px'
  },
  lightbox: {
    background: 'rgba(12, 12, 12, 0.93)',
    iconColor: 'silver',
    thumbnailBorder: 'solid rgb(138, 138, 138) 2px'
  }
}
const activeThumbnailBorder = 'solid rgba(107, 133, 206, 0.6) 2px'
const arrowStyles = {
  light: { background: 'white', color: 'black' },
  dark: { background: '#151515', color: 'silver' }
}

const swipeConfidenceThreshold = 10000
const opacityDuration = 0.2
const maxScale = 2.6
const minScale = 1
const imgSwipeDirection = 'x'
const defaultTheme = 'night'
const mobileWidth = 768
const animTransitionDefault = {
  x: { type: 'spring', stiffness: 300, damping: 30 },
  opacity: { duration: opacityDuration }
}
const slideshowAnimTransition = {
  opacity: { duration: opacityDuration }
}

export const SlideshowLightbox = (props) => {
  const [[imgSlideIndex, direction], setImgSlideIndex] = useState([0, 0])
  const [showModal, setShowModal] = useState(false)
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false)
  const [images, setImages] = useState(
    props.children ? props.children.map((obj) => obj.props) : []
  )
  const imageIndex = wrapNums(0, images.length, imgSlideIndex)
  const [slideshowInterval, setSlideshowInterval] = useState(
    props.slideshowInterval ? props.slideshowInterval : 1100
  )
  const [roundedImages, setRoundedImages] = useState(
    props.roundedImages ? props.roundedImages : true
  )
  const [lightboxIdentifier, setLightboxIdentifier] = useState(
    props.lightboxIdentifier ? props.lightboxIdentifier : false
  )
  const [imageFullScreen, setImageFullScreen] = useState(
    props.fullScreen ? props.fullScreen : false
  )
  const [licenseKey, setLicenseKey] = useState(
    props.licenseKey ? props.licenseKey : ''
  )
  const [lockAxisY, setLockAxisY] = useState(false)

  const [isZoomed, setIsZoomed] = useState(false)
  const [animTransition, setAnimTransition] = useState(animTransitionDefault)
  const [panImage, setPanImage] = useState(true)
  const [zoomImg, setZoomImg] = useState(0)
  const [width, setWidth] = useState(0)
  const [mapInteractionValue, setMapInteractionValue] = useState(
    defaultMapInteractionValue
  )
  const [imgSwipeMotion, setImgSwipeMotion] = useState(imgSwipeDirection)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false)
  const [enableMagnifyingGlass, setMagnifyingGlass] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [imgContainHeight, setImgContainHeight] = useState(500)
  const [imgContainWidth, setImgContainWidth] = useState(426)
  const [isInit, setIsInit] = useState(false)
  const [imgElems, setImgElems] = useState(false)

  const [usesDataAttr, setUsesDataAttr] = useState(false)

  // Thumbnails slider
  const [mouseDown, setMouseDown] = useState(false)
  const [startX, setStartX] = useState(false)
  const [scrollLeft, setScrollLeft] = useState(false)

  // Refs
  // const imgElemRef = useRef(null);
  // const [imgElem, setImgElem] = useState(null);
  const zoomRef = useRef(null);
  const [zoomBtnRef, setZoomBtnRef] = useState(null);

  const initZoomRef = (ref) => {
    if (ref) setZoomBtnRef(ref);
    else setZoomBtnRef(null)
  };

  // Styling/theming
  const [backgroundColor, setBackgroundColor] = useState(
    props.backgroundColor
      ? props.backgroundColor
      : themes[defaultTheme].background
  )
  const [iconColor, setIconColor] = useState(
    props.iconColor ? props.iconColor : themes[defaultTheme].iconColor
  )
  const [thumbnailBorder, setThumbnailBorder] = useState(
    props.thumbnailBorder
      ? props.thumbnailBorder
      : themes[defaultTheme].thumbnailBorder
  )

  const [showThumbnails, setShowThumbnails] = useState(
    props.showThumbnails ? props.showThumbnails : false
  )
  const [animatedThumbnails, setAnimatedThumbnails] = useState(
    props.animateThumbnails ? props.animateThumbnails : true
  )
  const [imgAnimation, setImgAnimation] = useState(
    props.imgAnimation ? props.imgAnimation : 'imgDrag'
  )
  // const [slideshowVariants, setSlideshowVariants] = useState(variants[imgAnimation] ? variants[imgAnimation]  : variants["imgDrag"]);
  const [arrowStyle, setArrowStyle] = useState(
    props.arrowStyle ? props.arrowStyle : 'dark'
  )

  const isMobile = width <= mobileWidth

  const keyPressHandler = (event) => {
    let key = event.key

    if (key == 'ArrowLeft') {
      updateCurrentSlide(-1)
    } else if (key == 'ArrowRight') {
      updateCurrentSlide(1)
    } else if (key == 'Escape' && !isBrowserFullScreen) {
      closeModal()
    }
  }

  function handleWindowResize() {
    setWidth(window.innerWidth)
  }

  const checkModalClick = (e) => {
    const modals = document.getElementsByClassName('imageModal')
    let arr_modals = Array.from(modals)

    for (let i = 0; i < arr_modals.length; i++) {
      let elem = arr_modals[i]
      let clickInside = elem.contains(e.target)

      if (clickInside) {
        return
      }
    }

    setShowModal(false)
  }

  const fullScreen = () => {
    let lightbox = document.getElementById('slideshowAnim')
    openFullScreen(lightbox)
    setIsBrowserFullScreen(true)
    initFullScreenChangeEventListeners()
  }

  const exitFullScreen = () => {
    if (isBrowserFullScreen) {
      closeFullScreen(document)
      setIsBrowserFullScreen(false)
      removeFullScreenChangeEventListeners()
    }
  }

  const updateCurrentSlide = (newDirection) => {
    resetSlideAnim()
    setMagnifyingGlass(false)
    resetMapInteraction()
    setImgSlideIndex([imgSlideIndex + newDirection, newDirection]);
    if (isMobile) {
      setZoomBtnRef(zoomRef);
    }
  }

  const updateImageSlideshow = (newDirection) => {
    resetMapInteraction()
    setImgSlideIndex([imgSlideIndex + newDirection, newDirection])
  }

  const resetSlideAnim = () => {
    setAnimTransition(animTransitionDefault)
  }

  const resetMapInteraction = () => {
    setPanImage(true)
    setMapInteractionValue({ scale: 1, translation: { x: 0, y: 0 } })
    setIsZoomed(false)
  }

  const setCurrentSlide = (newIndex) => {
    let newDirection
    if (newIndex > imgSlideIndex) {
      newDirection = 1
    } else {
      newDirection = -1
    }

    setAnimTransition(slideshowAnimTransition)
    resetMapInteraction()
    setImgSlideIndex([newIndex, newDirection])
  }

  const closeModal = () => {
    if (isBrowserFullScreen) {
      exitFullScreen()
    }

    // ensure slideshow is paused
    if (isSlideshowPlaying) {
      setIsSlideshowPlaying(false)
    }

    resetMapInteraction()
    setIsZoomed(false)
    setShowModal(false)
  }

  const openModal = (num) => {
    setImgSlideIndex([num, 1])
    setShowModal(true)
  }

  const playSlideshow = () => {
    setMagnifyingGlass(false)
    setAnimTransition(slideshowAnimTransition)
    updateImageSlideshow(1)
    setIsSlideshowPlaying(true)
  }

  const stopSlideshow = () => {
    setAnimTransition(animTransitionDefault)
    setIsSlideshowPlaying(false)
  }

  const zoomIn = () => {

    if (!isMobile) {
      changeCursor('all-scroll')
      setIsZoomed(true)
      setZoomImg(zoomImg + 1)
    }
    if (zoomBtnRef) {
      zoomBtnRef.zoomIn();
    }
  }

  const zoomOut = () => {
    if (!isMobile) {
      changeCursor('zoom-in')
      setIsZoomed(false)
      setZoomImg(zoomImg - 1)
  
      if (zoomImg == 1) {
        resetMapInteraction()
      }
    }

    if (zoomBtnRef) {
      zoomBtnRef.zoomOut();
    }

  }

  const checkAndUpdateSlide = (offset, velocity) => {
    const swipe = swipePower(offset.x, velocity.x)

    if (swipe < -swipeConfidenceThreshold || swipe > swipeConfidenceThreshold) {
      setMapInteractionValue({ scale: 1, translation: { x: 0, y: 0 } })
      setPanImage(true)
      if (swipe < -swipeConfidenceThreshold) {
        updateCurrentSlide(1)
      } else if (swipe > swipeConfidenceThreshold) {
        updateCurrentSlide(-1)
      }
    } else {
      removeSmoothZoom()
    }
  }

  const reinitZoomSettings = (value) => {
    // if user zoomed in
    if (value.scale > mapInteractionValue.scale) {
      setIsZoomed(true)
      initSmoothZoom()
    }
    // if user zoomed out
    else if (value.scale < mapInteractionValue.scale) {
      setIsZoomed(false)
      initSmoothZoom()
    }

    // user panned image, did not zoom
    else {
      removeSmoothZoom()
    }
  }

  const mapInteractionChange = (value) => {
    setPanImage(false)
    updateImgSwipeMotion(false)

    reinitZoomSettings(value)

    setMapInteractionValue(value)

    if (value.scale == defaultMapInteractionValue.scale) {
      setPanImage(true)
      setMapInteractionValue({ scale: 1, translation: { x: 0, y: 0 } })

      updateImgSwipeMotion(imgSwipeDirection)
      smoothZoomTimeout()
    } else if (value.scale > defaultMapInteractionValue.scale && !isAnimating) {
      changeCursor('all-scroll')
    }
  }

  const updateImgSwipeMotion = (swipeDirection) => {
    setImgSwipeMotion(swipeDirection)
  }

  const initStyling = () => {
    if (props.theme) {
      if (themes[props.theme]) {
        setBackgroundColor(themes[props.theme].background)
        setIconColor(themes[props.theme].iconColor)
        setThumbnailBorder(themes[props.theme].thumbnailBorder)
      }
    }

    if (props.fullScreen) {
      if (props.fullScreen == true) {
        setImgAnimation('fade')
        setRoundedImages(false)
      }
    }
  }

  const initMagnifyingGlass = () => {
    if (!enableMagnifyingGlass) {
        initImageDimensions();
    }
        else {
          setImgAnimation('imgDrag')
        }
    setMagnifyingGlass(!enableMagnifyingGlass)
  }

  const initImageDimensions = () => {
    let img = document.getElementById('img')
    let imageContainerH, imageContainerW
    if (isMobile) {
      imageContainerW = 0.92

      // horizontal image
      if (img.naturalWidth > img.naturalHeight) {
        imageContainerH = 0.65
      }
      //vertical image
      else {
        imageContainerH = 0.6
      }

      // remove dragging motion
    } else {
      imageContainerW = 0.92
      imageContainerH = 0.65
    }

    let { width, height, x, y } = contain(
      screen.width * imageContainerW,
      screen.height * imageContainerH,
      img.naturalWidth,
      img.naturalHeight
    )
    setImgContainHeight(height)
    setImgContainWidth(width)
  }

  const changeCursor = (cursor_name) => {
    if (!enableMagnifyingGlass) {
      let imgElem = document.getElementById('img')
      let container = imgElem.parentElement.parentElement
      container.style.cursor = `${cursor_name}`
    }
  }

  const removeDragEffect = (ref, e) => {
    console.log('call remove effect')
    setImgAnimation('')
  }

  const zoomEvent = (ref, e) => {
    console.log('ZOOM EVENT ', ref)

    if (ref.state.scale == 1) {
      setImgAnimation('imgDrag')
      setImgSwipeMotion(imgSwipeDirection)
      console.log('reinit drag anim')
    } else {
      // setImgAnimation("fade");
    }
  }

  const wheelEvent = (ref, e) => {
    console.log('WHEEL EVENT ', ref)
    setImgAnimation('fade')

    setLockAxisY(false)
    // if (ref.state.scale == 1) {
    //   setImgAnimation("imgDrag");
    //   setImgSwipeMotion(imgSwipeDirection)
    //   console.log("reinit drag anim")
    // }
  }

  const initSmoothZoom = () => {
    if (!enableMagnifyingGlass) {
      let imgElem = document.getElementById('img')

      let container = imgElem.parentElement
      container.style.transition = 'transform 0.2s'
    }
  }

  const removeSmoothZoom = () => {
    if (!enableMagnifyingGlass) {
      let imgElem = document.getElementById('img')

      let container = imgElem.parentElement
      container.style.transition = ''
    }
  }

  const initFullScreenChangeEventListeners = () => {
    document.addEventListener('fullscreenchange', exitFullScreen)
    document.addEventListener('webkitfullscreenchange', exitFullScreen)
    document.addEventListener('MSFullscreenChange', exitFullScreen)
    document.addEventListener('mozfullscreenchange', exitFullScreen)
  }

  const removeFullScreenChangeEventListeners = () => {
    document.removeEventListener('fullscreenchange', exitFullScreen)
    document.removeEventListener('webkitfullscreenchange', exitFullScreen)
    document.removeEventListener('MSFullscreenChange', exitFullScreen)
    document.removeEventListener('mozfullscreenchange', exitFullScreen)
  }

  const initKeyboardEventListeners = () => {
    document.addEventListener('keydown', keyPressHandler)

    if (isBrowser) {
      window.addEventListener('resize', handleWindowResize)
    }
  }

  const removeKeyboardEventListeners = () => {
    if (isBrowser) {
      window.removeEventListener('resize', handleWindowResize)
      document.removeEventListener('keydown', keyPressHandler)
    }
  }

  const smoothZoomTimeout = () => {
    setTimeout(() => {
      initSmoothZoom()
    }, 300)
  }

  const setReducedMotion = (mediaQuery) => {
    if (mediaQuery.matches) {
      setImgAnimation('fade')
    }
  }

  // Check if the user has a preference for reduced motion
  // If so, the image animation transitions between slides in the slideshow will be adjusted
  // to account for this
  const checkAndInitReducedMotion = () => {
    let reducedMotionMediaQuery = ''

    if (isBrowser) {
      reducedMotionMediaQuery = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      )

      if (!reducedMotionMediaQuery || reducedMotionMediaQuery.matches) {
        setImgAnimation('fade')
      }

      reducedMotionMediaQuery.addEventListener(
        'change',
        setReducedMotion(reducedMotionMediaQuery)
      )
    }

    return reducedMotionMediaQuery
  }

  // Slideshow feature; if isSlideshowPlaying set to true, then slideshow cycles through images
  useInterval(
    () => {
      updateImageSlideshow(1)
    },
    isSlideshowPlaying ? slideshowInterval : null
  )

  useEffect(() => {
    if (isBrowser) {
      setWidth(window.innerWidth)
    }

    if (window.innerWidth <= mobileWidth) {
      setImgAnimation('fade')
    }

    // setImgElem(imgElemRef.current)
    initKeyboardEventListeners()
    let reducedMotionMediaQuery = checkAndInitReducedMotion()

    if (!isInit) {
      if (lightboxIdentifier) {
        let img_gallery = document.querySelectorAll('[data-lightboxjs]')
        let img_elements = []

        let usesAttr = false
        if (img_gallery.length > 0) {
          for (let i = 0; i <= img_gallery.length - 1; i++) {
            let img = img_gallery[i]

            let attr_val = img.getAttribute('data-lightboxjs')
            if (attr_val == lightboxIdentifier) {
              img.addEventListener(
                'click',
                () => {
                  openModal(i)
                },
                false
              )
              img.classList.add('cursor-pointer')
              usesAttr = true
              img_elements.push({ src: img.src, alt: img.alt })
            }
          }

          if (usesAttr) {
            setUsesDataAttr(true)
          }

          setImages(img_elements)
        }
      } else {
        if (props.children) {
          setImages(
            props.children
              .filter((elem) => elem.type == 'img')
              .map((obj) => obj.props)
          )
        }
      }

      setIsInit(true)
    }

    initStyling()
    return () => {
      removeKeyboardEventListeners()
      reducedMotionMediaQuery.removeEventListener(
        'change',
        reducedMotionMediaQuery
      )
    }
  }, [keyPressHandler])


  return (
    <div class={`${props.className} lightboxjs`}>
      {lightboxIdentifier != false ? props.children : null}

      <AnimateSharedLayout type='crossfade'>
        <AnimatePresence initial={false}>
          {/* Gallery images */}
          {lightboxIdentifier != false
            ? null
            : props.children
                .filter((elem) => elem.type == 'img')
                .map((elem, index) => (
                  <motion.img
                    {...elem.props}
                    class={elem.props.className + ' cursor-pointer'}
                    onClick={() => openModal(index)}
                    key={index}
                    whileTap={{ scale: 0.97 }}
                  />
                ))}

          {showModal !== false && (
            <Portal>
              <motion.div
                className='slideshowAnimContainer'
                key='slideshowAnimContainer'
                id='slideshowAnim'
                // onClick={(event) => {if (!isZoomed) checkModalClick(event)}}

                initial={{ opacity: 0, scale: 0.98 }}
                exit={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.2
                }}
              >
                <div
                  className={`lightboxContainer`}
                  style={{
                    backgroundColor: backgroundColor
                  }}
                >
                  <section
                    className={
                      'iconsHeader imageModal ' + arrowStyle + '_header_icon'
                    }
                    style={{ color: iconColor }}
                  >
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <ZoomIn onClick={() => zoomIn()} />
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }}>
                      <ZoomOut onClick={() => zoomOut()} />
                    </motion.div>

                    {isBrowserFullScreen ? (
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <FullscreenExit
                          onClick={() => {
                            isBrowserFullScreen
                              ? exitFullScreen()
                              : fullScreen()
                          }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Fullscreen
                          onClick={() => {
                            isBrowserFullScreen
                              ? exitFullScreen()
                              : fullScreen()
                          }}
                        />
                      </motion.div>
                    )}

                    <motion.div whileTap={{ scale: 0.95 }}>
                      <GridFill
                        onClick={() => {
                          setShowThumbnails(!showThumbnails)
                        }}
                      />
                    </motion.div>

                    {isMobile ? null : (
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Search onClick={() => initMagnifyingGlass()} />
                      </motion.div>
                    )}

                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className='slideshowPlayBtn'
                    >
                      {isSlideshowPlaying ? (
                        <PauseCircleFill
                          onClick={() => {
                            isSlideshowPlaying
                              ? stopSlideshow()
                              : playSlideshow()
                          }}
                        />
                      ) : (
                        <PlayCircleFill
                          onClick={() => {
                            isSlideshowPlaying
                              ? stopSlideshow()
                              : playSlideshow()
                          }}
                        />
                      )}
                    </motion.div>

                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className='closeIcon'
                    >
                      <XLg
                        onClick={() => {
                          closeModal()
                        }}
                      />
                    </motion.div>
                  </section>

                  <div
                    className={'next1 ' + arrowStyle + '_icon imageModal'}
                    onClick={() => updateCurrentSlide(1)}
                  >
                    <span>&#10095;</span>
                  </div>
                  <div
                    className={'prev1 ' + arrowStyle + '_icon imageModal'}
                    onClick={() => updateCurrentSlide(-1)}
                  >
                    <span>&#10094;</span>
                  </div>

                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                    // onClick={(event) => {zoomIn()}}
                      className={`slideshowInnerContainer ${
                        showThumbnails
                          ? 'slideshowInnerContainerThumbnails'
                          : ''
                      } 
                      ${imageFullScreen ? 'fullScreenContainer' : ''}`}
                      custom={direction}
                      variants={variants[imgAnimation]}
                      initial='enterImg'
                      key={imgSlideIndex}
                      animate={'centerImg'}
                      exit='exitImg'
                      transition={animTransition}
                      drag={(imgAnimation == "imgDrag") ? imgSwipeMotion : false}
                      drag={false}
                      dragElastic={1}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragStart={(e, { offset, velocity }) => {
                        setLockAxisY(true)
                      }}
                      onDragEnd={(e, { offset, velocity }) => {
                        checkAndUpdateSlide(offset, velocity)
                        setLockAxisY(false)
                      }}
                      onAnimationComplete={() => {
                        setIsAnimating(false)
                      }}
                      onAnimationStart={() => {
                        setIsAnimating(true)
                      }}
                    >
                     
                        <TransformWrapper
                          ref={initZoomRef}
                          onWheel={{ wheelEvent }}
                          onZoom={zoomEvent}
                          centerZoomedOut={true}
                        >
                          <TransformComponent wrapperStyle={{marginLeft: "auto", marginRight: "auto"}}
                          contentStyle={fullScreen ? { width: "100vw", height: "100vh", marginLeft: "auto", marginRight: "auto"} 
                        : { width: "80vw", height: "100vh", marginLeft: "auto", marginRight: "auto"} }>
                            <img
                              className={`mx-auto ${
                                imageFullScreen ? '' : 'object-contain'
                              } imageModal ${
                                roundedImages ? 'rounded-lg' : ''
                              }`}
                              src={images[imageIndex].src}
                              id='img'
                            />
                          </TransformComponent>
                        </TransformWrapper>
                      
                       
                      
                    </motion.div>
                  </AnimatePresence>

                  <div
                    className='thumbnailsOuterContainer imageModal'
                    style={imagesLoaded ? {} : { display: 'displayHidden' }}
                  >
                    <ScrollContainer
                      className='scroll-container'
                      vertical={false}
                      horizontal={true}
                    >
                      <AnimatePresence initial={animatedThumbnails}>
                        {showThumbnails !== false && (
                          <motion.div
                            initial={'hidden'}
                            exit={'hidden'}
                            animate={'visible'}
                            transition={{
                              type: 'spring',
                              duration: 0.75
                            }}
                            variants={thumbnailVariants}
                            className='thumbnails flex justify-centre align-centre gap-2 md:gap-4 rounded-sm mx-auto'
                          >
                            {images.map((img, index) => (
                              <img
                                className={
                                  'thumbnail ' +
                                  (imageIndex === index ? 'active' : '')
                                }
                                src={img.src}
                                style={
                                  imageIndex === index
                                    ? { border: activeThumbnailBorder }
                                    : { border: thumbnailBorder }
                                }
                                onClick={() => {
                                  setCurrentSlide(index)
                                }}
                                alt={img.caption}
                                onLoad={() => setImagesLoaded(true)}
                              />
                              // <span style={{color: "white"}}>{index}</span>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </ScrollContainer>
                  </div>
                </div>
              </motion.div>
            </Portal>
          )}
        </AnimatePresence>
      </AnimateSharedLayout>
    </div>
  )
}
