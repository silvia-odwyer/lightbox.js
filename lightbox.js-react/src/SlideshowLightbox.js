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
  GridFill
} from 'react-bootstrap-icons'
import ScrollContainer from 'react-indiana-drag-scroll'
import Magnifier from 'react-magnifier'
import { cover, contain } from 'intrinsic-scale'
import { isBrowser } from './utility'
import { Portal } from 'react-portal'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import ReactSwipe from 'react-swipe'

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
  // const [reactSwipeEl, setReactSwipeEl] = useState(false);

  const [images, setImages] = useState([])

  const [imagesMetadata, setImagesMetadata] = useState(
    props.images ? props.images : []
  )

  const [previewImageElems, setPreviewImageElems] = useState([])

  const imageIndex = wrapNums(0, images.length, imgSlideIndex)
  const [reactSwipeOptions, setReactSwipeOptions] = useState({
    continuous: true,
    startSlide: 0
  })

  const [slideshowInterval, setSlideshowInterval] = useState(
    props.slideshowInterval ? props.slideshowInterval : 1100
  )

  const [rightArrowStyle, setRightArrowStyle] = useState(
    props.rightArrowStyle ? props.rightArrowStyle : {}
  );

  const [leftArrowStyle, setLeftArrowStyle] = useState(
    props.leftArrowStyle ? props.leftArrowStyle : {}
  );

  const [isRounded, setIsRounded] = useState(
    props.roundedImages ? props.roundedImages : false
  )
  const [showControls, setShowControls] = useState(
    props.showControls ? props.showControls : true
  )
  const [frameworkID, setFrameworkID] = useState(
    props.framework ? props.framework : ""
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
  const [showLoader, setShowLoader] = useState(
    props.showLoader ? props.showLoader : false
  )
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
  const [refIndex, setRefIndex] = useState(0)

  const [zoomIdx, setZoomIdx] = useState(0)

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
  const zoomRef = useRef(null)
  const [zoomBtnRef, setZoomBtnRef] = useState(null)
  const [zoomRefs, setZoomRefs] = useState([])
  const zoomReferences = useRef([])

  const initZoomRef = (ref) => {
    if (ref) setZoomBtnRef(ref)
    else setZoomBtnRef(null)
  }

  const shouldDisplayLoader = () => {
    if (imgSlideIndex) {
      if (imgSlideIndex > -1) {
        if (images[imgSlideIndex % images.length]['loaded'] == true) {
          return true
        }
      }

    }
    if (!showLoader) {
      return true
    } else {
      return false
    }
  }

  const getLoaderThemeClass = () => {
    if (props.theme) {
      if (props.theme == 'night' || props.theme == 'lightbox') {
        return 'night_loader'
      } else if (props.theme == 'day') {
        return 'day_loader'
      }
    }
    return 'night_loader'
  }

  const initZoomRef2 = (ref) => {
    let refs = zoomRefs
    if (ref) {
      zoomRefs.push(ref)
    }
    setZoomRefs(refs)
    // else setZoomBtnRef2(null)
  }

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
    setImgSlideIndex([imgSlideIndex + newDirection, newDirection])
    if (isMobile) {
      setZoomBtnRef(zoomRef)
    }
  }

  const updateImageSlideshow = (newDirection) => {
    reactSwipeEl.next()

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
    reactSwipeEl.slide(newIndex, 500)
  }

  const closeModal = () => {
    //reset zoom ref
    setZoomIdx(0)

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

  const openModalWithSlideNum = (index) => {
    let reactSwipeOptionConfig = reactSwipeOptions
    reactSwipeOptionConfig.startSlide = index
    setReactSwipeOptions(reactSwipeOptionConfig);
    setZoomIdx(index)
    openModal(index)
  }



  const openModalAndSetSlide = (num) => {
    reactSwipeEl.slide(num, 0)

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

  const zoomIntoImg = () => {
    if (!isMobile) {
      // changeCursor('all-scroll')
      setIsZoomed(true)
    }
    if (zoomBtnRef) {
      zoomBtnRef.zoomIn()
    }
  }

  const zoomOutFromImg = () => {
    if (!isMobile) {
      changeCursor('zoom-in')
      setIsZoomed(false)
      setZoomImg(zoomImg - 1)

      if (zoomImg == 1) {
        resetMapInteraction()
      }
    }

    if (zoomBtnRef) {
      zoomBtnRef.zoomOut()
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

  const getThumbnailImgSrc = (img_src) => {
    if (typeof img_src === 'object' &&
      !Array.isArray(img_src) &&
      img_src !== null) {
        return img_src.src;
      }
      else {
        return img_src;
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
        setIsRounded(false)
      }
    }
  }

  const imageSlideElement = (index) => {
    let imageElem;
    if (!props.images) {
        imageElem = <img
        className='test_img'
        loading='lazy'
        style={isRounded ? {borderRadius: "20px"} : {}}
        src={
          images[index].original
            ? images[index].original
            : images[index].src
        }
        onLoad={() => {
          images[index]['loaded'] = true
        }}
        // id='img'
      />
    }
    else if (props.images && props.render) {
      imageElem = props.render.imgSlide(imagesMetadata[index]);
    }

    else {
      let img_link;

      // check if object (Next.js local image imports are passed as objects with a src attribute)
      if (typeof imagesMetadata[index].src === 'object' &&
      !Array.isArray(imagesMetadata[index].src) &&
      imagesMetadata[index].src !== null) {
        img_link = imagesMetadata[index].src.src;
      }
      else {
        img_link = imagesMetadata[index].src;
      }
      imageElem = <img
      className='test_img'
      loading='lazy'
      style={isRounded ? {borderRadius: "20px"} : {}}
      src={
        imagesMetadata[index].original
          ? imagesMetadata[index].original
          : img_link
      }
      onLoad={() => {
        images[index]['loaded'] = true
      }}
      // id='img'
    />
    }

    return imageElem;
      
}
  

  const regularImgPaneNodes = Array.apply(null, Array(images.length)).map((_, index) => {
    return (
      <div key={index}>
        {enableMagnifyingGlass == true ? (
          <Magnifier
            src={images[index].src}
            className='imageModal mx-auto mt-0 magnifyWrapper'
            height={imgContainHeight}
            width={imgContainWidth}
            mgShowOverflow={false}
            style={{
              width: imgContainWidth,
              height: imgContainHeight
            }}
          />
        ) : 1 == 1 ? (
          <div>
            <TransformWrapper
              ref={(el) => (zoomReferences.current[index] = el)}
              onWheel={{ wheelEvent }}
              key={index}
              onZoom={zoomEvent}
              centerZoomedOut={true}
              initialScale={1}
            >
              <TransformComponent
                wrapperStyle={{
                  width: '100vw',
                  height: '100vh',
                  margin: 'auto'
                }}
                contentStyle={
                  fullScreen
                    ? {
                        width: '100vw',
                        height: '100vh',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                      }
                    : {
                        width: '100vw',
                        height: '100vh',
                        margin: 'auto',
                        display: 'grid'
                      }
                }
                key={index}
              >
                <div className='div_img'>
                  <img
                    className='test_img'
                    loading='lazy'
                    style={isRounded ? {borderRadius: "20px"} : {}}
                    src={
                      images[index].original
                        ? images[index].original
                        : images[index].src
                    }
                    onLoad={() => {
                      images[index]['loaded'] = true
                    }}
                    // id='img'
                  />
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
        ) : null}
      </div>
    )
  });

  const insertContentNodes = Array.apply(null, Array(images.length)).map((_, index) => {
    return (
      <div key={index}>
        {enableMagnifyingGlass == true ? (
          <Magnifier
            src={images[index].src}
            className='imageModal mx-auto mt-0 magnifyWrapper'
            height={imgContainHeight}
            width={imgContainWidth}
            mgShowOverflow={false}
            style={{
              width: imgContainWidth,
              height: imgContainHeight
            }}
          />
        ) : 1 == 1 ? (
          <div>
            <TransformWrapper
              ref={(el) => (zoomReferences.current[index] = el)}
              onWheel={{ wheelEvent }}
              key={index}
              onZoom={zoomEvent}
              centerZoomedOut={true}
              initialScale={1}
            >
              <TransformComponent
                wrapperStyle={{
                  width: '100vw',
                  height: '100vh',
                  margin: 'auto'
                }}
                contentStyle={
                  fullScreen
                    ? {
                        width: '100vw',
                        height: '100vh',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                      }
                    : {
                        width: '100vw',
                        height: '100vh',
                        margin: 'auto',
                        display: 'grid'
                      }
                }
                key={index}
              >

                <div className='div_img'>
                  {imageSlideElement(index)}
                  </div>

              </TransformComponent>
            </TransformWrapper>
          </div>
        ) : null}
      </div>
    )
  });

  


  const initMagnifyingGlass = () => {
    if (!enableMagnifyingGlass) {
      initImageDimensions()
    } else {
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
        imageContainerH = 0.57
      }

      // remove dragging motion
    } else {
      imageContainerW = 0.92
      imageContainerH = 0.71
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

  const zoomEvent = (ref, e) => {
    if (ref.state.scale == 1) {
      setImgAnimation('imgDrag')
      setImgSwipeMotion(imgSwipeDirection)
    } else {
      // setImgAnimation("fade");
    }
  }

  const wheelEvent = (ref, e) => {
    setImgAnimation('fade')

    setLockAxisY(false)
    // if (ref.state.scale == 1) {
    //   setImgAnimation("imgDrag");
    //   setImgSwipeMotion(imgSwipeDirection)
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

  const initProps = () => {
    if (props.showControls != undefined) {
      setShowControls(props.showControls)
    }

    if (isBrowser) {
      setWidth(window.innerWidth)
    }

    if (window.innerWidth <= mobileWidth) {
      setImgAnimation('fade')
    }
  }

  // Slideshow feature; if isSlideshowPlaying set to true, then slideshow cycles through images
  useInterval(
    () => {
      updateImageSlideshow(1)
    },
    isSlideshowPlaying ? slideshowInterval : null
  )

  useEffect(() => {
    // Error check
    if (props.render) {
      if (!props.images) {
        console.error("Array of images must be passed to `SlideshowLightbox` (with the `images` prop) if using custom render method. ")
      }
    }
    
    let isMounted = true
    if (isMounted) initProps()

    // setImgElem(imgElemRef.current)
    if (isMounted) initKeyboardEventListeners()

    let reducedMotionMediaQuery = checkAndInitReducedMotion()

    if (!isInit) {
      if (lightboxIdentifier) {

        let img_gallery = document.querySelectorAll(`[data-lightboxjs=${lightboxIdentifier}]`)
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
                  let reactSwipeOptionConfig = reactSwipeOptions
                  reactSwipeOptionConfig.startSlide = i
                  if (isMounted) setReactSwipeOptions(reactSwipeOptionConfig);
                  setZoomIdx(i)
                  openModal(i)
                },
                false
              )
              img.classList.add('cursor-pointer')
              usesAttr = true
              img_elements.push({ src: img.src, alt: img.alt, loaded: 'false' });
            }
          }

          if (usesAttr) {
            if (isMounted) setUsesDataAttr(true)
          }

          if (isMounted) setImages(img_elements)
        }
      } 
      
      // otherwise, if no lightbox identifier or custom render method
      else if (!props.render) {
        if (props.children) {
          let imgs = []
          for (let k = 0; k < props.children.length; k++) {
            let img_elem = props.children[k]
            let img_obj = {
              src: img_elem.props.src,
              alt: img_elem.props.alt,
              loaded: 'false'
            }
            imgs.push(img_obj)
          }
          if (isMounted) setImages(imgs)
          setPreviewImageElems(props.children)
        } else {
          if (isMounted) setImages(props.images)
        }
      }

      if (isMounted) setIsInit(true)
    }

    if (isMounted) initStyling()
    return () => {
      isMounted = false
      removeKeyboardEventListeners()
      reducedMotionMediaQuery.removeEventListener(
        'change',
        reducedMotionMediaQuery
      )
    }
  }, [keyPressHandler])

  let reactSwipeEl
  return (
    <div className={`${props.className} lightboxjs`}>

      {props.images && props.children && lightboxIdentifier == false ? props.children : null}

      {props.images && lightboxIdentifier == false 
        ? props.images.map((elem, index) => (
            <img
              className={' cursor-pointer'}
              src={elem.src}
              onClick={() => {
                openModalWithSlideNum(index)
              }}
              key={index}
              // whileTap={{ scale: 0.97 }}
            />
          ))
        : null}
      
      {/* IF Lightbox identifier provided or props.images provided */}
      {lightboxIdentifier != false ? props.children : null}

    {lightboxIdentifier == false && props.images ? null 
      : // No lightbox identifier provided
      previewImageElems
      .filter((elem) => elem.type == 'img')
      .map((elem, index) => (
        <img
          {...elem.props}
          className={elem.props.className + ' cursor-pointer'}
          onClick={() => {
            openModalWithSlideNum(index)
          }}
          key={index}
          // whileTap={{ scale: 0.97 }}
        />
      ))}




      <AnimateSharedLayout type='crossfade'>
        <AnimatePresence initial={false}>
          {showModal !== false && (
            <Portal>
              <motion.div
                className='slideshowAnimContainer'
                key='slideshowAnimContainer'
                id='slideshowAnim'
                initial={{ opacity: 0, scale: 0.98 }}
                exit={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.2
                }}
              >
                {/* <TransformWrapper
                          ref={initZoomRef}
                          onWheel={{ wheelEvent }}
                          onZoom={zoomEvent}
                          centerZoomedOut={true}
                          initialScale={1}

                        >
                          {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <React.Fragment> */}

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
                    {showControls && (
                      <div className='controls'>
                        <motion.div 
                        // whileTap={{ scale: 0.95 }}
                        >
                          <ZoomIn
                            size={24}
                            onClick={() => {
                              zoomReferences.current[zoomIdx].zoomIn()
                            }}
                          />
                        </motion.div>

                        <motion.div 
                        //whileTap={{ scale: 0.95 }}
                        >
                          <ZoomOut
                            size={24}
                            onClick={() => {
                              zoomReferences.current[zoomIdx].zoomOut()
                            }}
                          />
                        </motion.div>

                        {isBrowserFullScreen ? (
                          <motion.div 
                          // whileTap={{ scale: 0.95 }}
                          >
                            <FullscreenExit
                              size={24}
                              onClick={() => {
                                isBrowserFullScreen
                                  ? exitFullScreen()
                                  : fullScreen()
                              }}
                            />
                          </motion.div>
                        ) : (
                          <motion.div 
                          // whileTap={{ scale: 0.95 }}
                          >
                            <Fullscreen
                              size={24}
                              onClick={() => {
                                isBrowserFullScreen
                                  ? exitFullScreen()
                                  : fullScreen()
                              }}
                            />
                          </motion.div>
                        )}

                        <motion.div 
                        //whileTap={{ scale: 0.95 }}
                        >
                          <GridFill
                            size={24}
                            onClick={() => {
                              setShowThumbnails(!showThumbnails)
                            }}
                          />
                        </motion.div>

                        {isMobile ? null : (
                          <motion.div 
                          // whileTap={{ scale: 0.95 }}
                          >
                            <Search
                              size={24}
                              onClick={() => initMagnifyingGlass()}
                            />
                          </motion.div>
                        )}

                        <motion.div
                          // whileTap={{ scale: 0.95 }}
                          className='slideshowPlayBtn'
                        >
                          {isSlideshowPlaying ? (
                            <PauseCircleFill
                              size={24}
                              onClick={() => {
                                isSlideshowPlaying
                                  ? stopSlideshow()
                                  : playSlideshow()
                              }}
                            />
                          ) : (
                            <PlayCircleFill
                              size={24}
                              onClick={() => {
                                isSlideshowPlaying
                                  ? stopSlideshow()
                                  : playSlideshow()
                              }}
                            />
                          )}
                        </motion.div>
                      </div>
                    )}

                    <motion.div
                      // whileTap={{ scale: 0.95 }}
                      className='closeIcon'
                    >
                      <XLg
                        size={24}
                        onClick={() => {
                          closeModal()
                        }}
                      />
                    </motion.div>
                  </section>

                  <div
                    className={rightArrowStyle ? 'next1 ' + arrowStyle + '_icon imageModal' : "imageModal"}
                    style={rightArrowStyle}
                    onClick={() => {
                      zoomReferences.current[zoomIdx].resetTransform()
                      setRefIndex(refIndex + 1)
                      reactSwipeEl.next()
                      setImgSlideIndex([imgSlideIndex + 1, 1])
                      setZoomIdx(zoomIdx + 1 >= images.length ? 0 : zoomIdx + 1)
                    }}
                  >
                    <span>&#10095;</span>
                  </div>
                  <div
                    className={leftArrowStyle ?  'prev1 ' + arrowStyle + '_icon imageModal' : "imageModal"}
                    style={leftArrowStyle}
                    onClick={() => {
                      setRefIndex(refIndex - 1)
                      reactSwipeEl.prev()
                      setZoomIdx(
                        zoomIdx - 1 < 0 ? images.length - 1 : zoomIdx - 1
                      )
                      setImgSlideIndex([imgSlideIndex - 1, 1])
                    }}
                  >
                    <span>&#10094;</span>
                  </div>

                  <AnimatePresence initial={false} custom={direction}>
                    <ReactSwipe
                      className={`slideshowInnerContainer  ${
                        showThumbnails
                          ? 'slideshowInnerContainerThumbnails'
                          : ''
                      } `}
                      swipeOptions={reactSwipeOptions}
                      ref={(el) => (reactSwipeEl = el)}
                      childCount={images.length}
                    >
                      {((props.render && props.images) || frameworkID == "next") ? insertContentNodes : regularImgPaneNodes} 
                    </ReactSwipe>

                    {shouldDisplayLoader() ? null : (
                      <span
                        key='loader'
                        className={`loader ${getLoaderThemeClass()}`}
                      ></span>
                    )}
                  </AnimatePresence>

                  <div
                    className='thumbnailsOuterContainer imageModal'
                    style={imagesLoaded ? {} : { display: 'displayHidden' }}
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
                          className='thumbnails  rounded-sm mx-auto'
                        >
                          <ScrollContainer
                            className='scroll-container'
                            vertical={false}
                            horizontal={true}
                            hideScrollbars={false}
                          >
                            {frameworkID == "next" && imagesMetadata && props.images ? 
                                       imagesMetadata.map((img, index) => (
                                        <img
                                          className={
                                            'thumbnail ' +
                                            (imageIndex === index ? 'active' : '')
                                          }
                                          src={getThumbnailImgSrc(img.src)}
                                          style={
                                            imageIndex === index
                                              ? { border: activeThumbnailBorder }
                                              : { border: thumbnailBorder }
                                          }
                                          key={index}
                                          onClick={() => {
                                            setCurrentSlide(index)
                                          }}
                                          alt={img.caption}
                                          onLoad={() => setImagesLoaded(true)}
                                        />
                                        // <span style={{color: "white"}}>{index}</span>
                                      ))
                                      
                                      :
                                      images.map((img, index) => (
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
                                          key={index}
                                          onClick={() => {
                                            setCurrentSlide(index)
                                          }}
                                          alt={img.caption}
                                          onLoad={() => setImagesLoaded(true)}
                                        />
                                        // <span style={{color: "white"}}>{index}</span>
                                      ))
                                      }
                 
                          </ScrollContainer>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {/* </React.Fragment> */}
                {/* )} */}

                {/* </TransformWrapper>      */}
              </motion.div>
            </Portal>
          )}
        </AnimatePresence>
      </AnimateSharedLayout>
    </div>
  )
}
