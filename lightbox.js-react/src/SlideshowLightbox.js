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
import {
  ZoomIn,
  ZoomOut,
  Fullscreen,
  PlayCircleFill,
  Search,
  Download,
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
import { saveAs } from 'file-saver'
import Div100vh from 'react-div-100vh'
import KeyHandler, { KEYPRESS } from 'react-key-handler'

let thumbnailVariants = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 100 }
}

const themes = {
  day: {
    background: 'white',
    iconColor: 'black',
    thumbnailBorder: 'solid transparent 2px',
    textColor: 'black'
  },
  night: {
    background: '#151515',
    iconColor: 'silver',
    thumbnailBorder: 'solid rgb(107, 133, 206)  2px',
    textColor: 'silver'
  },
  lightbox: {
    background: 'rgba(12, 12, 12, 0.93)',
    iconColor: 'silver',
    thumbnailBorder: 'solid rgb(107, 133, 206) 2px',
    textColor: 'silver'
  }
}

const activeThumbnailBorder = 'solid rgba(107, 133, 206, 0.6) 2px'
const inactiveThumbnailBorder = 'solid transparent 2px'
const arrowStyles = {
  light: { background: 'white', color: 'black' },
  dark: { background: '#151515', color: 'silver' }
}

const opacityDuration = 0.2
const imgSwipeDirection = 'x'
const defaultTheme = 'night'
const mobileWidth = 768

export const SlideshowLightbox = (props) => {
  const [[imgSlideIndex, direction], setImgSlideIndex] = useState([0, 0])
  const [showModal, setShowModal] = useState(false)
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false)

  const [images, setImages] = useState([])

  const [imagesMetadata, setImagesMetadata] = useState(
    props.images ? props.images : []
  )

  const [magnifyingGlassFeature, setMagnifyingGlassFeature] = useState(
    props.magnifyingGlass ? props.magnifyingGlass : false
  )

  const [disableZoom, setDisableZoom] = useState(
    props.disableImageZoom ? props.disableImageZoom : false
  )

  const [previewImageElems, setPreviewImageElems] = useState([])

  const imageIndex = wrapNums(0, images.length, imgSlideIndex)
  const [reactSwipeOptions, setReactSwipeOptions] = useState({
    continuous: true,
    startSlide: 0,
    stopPropagation: true
  })

  const [slideshowInterval, setSlideshowInterval] = useState(
    props.slideshowInterval ? props.slideshowInterval : 1100
  )

  const [rightArrowStyle, setRightArrowStyle] = useState(
    props.rightArrowStyle ? props.rightArrowStyle : {}
  )

  const [leftArrowStyle, setLeftArrowStyle] = useState(
    props.leftArrowStyle ? props.leftArrowStyle : {}
  )

  const [zoomedIn, setZoomedIn] = useState(false)

  const [isRounded, setIsRounded] = useState(
    props.roundedImages ? props.roundedImages : false
  )

  const [showControls, setShowControls] = useState(
    props.showControls ? props.showControls : true
  )

  const [displayFullScreenIcon, setDisplayFullScreenIcon] = useState(
    props.showFullScreenIcon ? props.showFullScreenIcon : true
  )

  const [displayThumbnailIcon, setDisplayThumbnailIcon] = useState(
    props.showThumbnailIcon ? props.showThumbnailIcon : true
  )

  const [displaySlideshowIcon, setDisplaySlideshowIcon] = useState(
    props.showSlideshowIcon ? props.showSlideshowIcon : true
  )

  const [displayMagnificationIcons, setDisplayMagnificationIcons] = useState(
    props.showMagnificationIcons ? props.showMagnificationIcons : true
  )

  // const [nextArrow, setNextArrow] = useState(
  //   props.rightArrow ? props.rightArrow : <span>&#10095;</span>
  // )

  // const [prevArrow, setPrevArrow] = useState(
  //   props.leftArrow ? props.leftArrow : <span>&#10094;</span>
  // )

  const [showDownloadBtn, setShowDownloadBtn] = useState(
    props.downloadImages ? props.downloadImages : false
  )

  const [isRTL, setIsRTL] = useState(props.rtl ? props.rtl : false)

  const [frameworkID, setFrameworkID] = useState(
    props.framework ? props.framework : ''
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
  const [showLoader, setShowLoader] = useState(
    props.showLoader ? props.showLoader : false
  )
  const [videoCurrentlyPlaying, setVideoCurrentlyPlaying] = useState(false)
  const [isYtVideo, setIsYtVideo] = useState(false)

  const [width, setWidth] = useState(0)

  const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false)
  const [enableMagnifyingGlass, setMagnifyingGlass] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [refIndex, setRefIndex] = useState(0)

  const imageRef = useRef()

  const [zoomIdx, setZoomIdx] = useState(0)

  const [imgContainHeight, setImgContainHeight] = useState(500)
  const [imgContainWidth, setImgContainWidth] = useState(426)
  const [isInit, setIsInit] = useState(false)

  // Refs
  const zoomRef = useRef(null)
  const [zoomBtnRef, setZoomBtnRef] = useState(null)
  const [zoomRefs, setZoomRefs] = useState([])
  const zoomReferences = useRef([])

  const videoReferences = useRef({})

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

  const createCustomThumbnailBorder = () => {
    if (props.thumbnailBorder) {
      return `solid ${props.thumbnailBorder} 2px`
    }
  }

  // Styling/theming
  const [backgroundColor, setBackgroundColor] = useState(
    props.backgroundColor
      ? props.backgroundColor
      : themes[defaultTheme].background
  )
  const [iconColor, setIconColor] = useState(
    props.iconColor ? props.iconColor : null
  )
  const [textColor, setTextColor] = useState(
    props.textColor ? props.textColor : themes[defaultTheme].textColor
  )

  const [coverMode, setCoverMode] = useState(
    props.useCoverMode ? props.useCoverMode : false
  )

  const [thumbnailBorder, setThumbnailBorder] = useState(
    props.thumbnailBorder
      ? createCustomThumbnailBorder()
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

  const isImageCaption = () => {
    if (props.images && props.images[imageIndex].caption) {
      return true
    }
    return false
  }

  function handleWindowResize() {
    setWidth(window.innerWidth)
  }

  const shouldDisplayMagnifyingGlassIcon = () => {
    if (isMobile == true) {
      return false
    }
    if (imageFullScreen == true) {
      return false
    }

    if (magnifyingGlassFeature == true) {
      return true
    }
    return false
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

  const getRTLIndex = (img_gallery_length, i) => {
    let index
    if (i == 0) {
      index = img_gallery_length - 1
    } else if (i == img_gallery_length - 1) {
      index = 0
    } else {
      index = img_gallery_length - i - 1
    }
    return index
  }

  const fullScreen = () => {

    let lightbox = document.getElementById('slideshowAnim')
    openFullScreen(lightbox)
    setIsBrowserFullScreen(true)
    initFullScreenChangeEventListeners()
  }

  const exitFullScreenHandler = () => {
    //in full screen mode
    if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) {
      setIsBrowserFullScreen(true)
    }
    else {
      if (isBrowserFullScreen) {
        closeFullScreen(document)

      }
      removeFullScreenChangeEventListeners()
      setIsBrowserFullScreen(false);
    }

  }

  const exitFullScreen = () => {
    closeFullScreen(document)
    removeFullScreenChangeEventListeners()
    setIsBrowserFullScreen(false);
  }

  const updateImageSlideshow = (newDirection) => {
    if (isRTL) {
      reactSwipeEl.prev()
    } else {
      reactSwipeEl.next()
    }

    setImgSlideIndex([imgSlideIndex + newDirection, newDirection])
    if (isRTL) {
      setRefIndex(refIndex - 1)

      setZoomIdx(zoomIdx - 1 < 0 ? images.length - 1 : zoomIdx - 1)
    } else {
      setZoomIdx(zoomIdx + 1 >= images.length ? 0 : zoomIdx + 1)
      setRefIndex(refIndex + 1)
    }
  }

  const setCurrentSlide = (newIndex) => {
    let newDirection
    if (newIndex > imgSlideIndex) {
      newDirection = 1
    } else {
      newDirection = -1
    }

    setZoomIdx(newIndex)

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

    setShowModal(false)
  }

  const openModal = (num) => {
    setImgSlideIndex([num, 1])
    setShowModal(true)
  }

  const nextSlide = () => {
    resetVideo();
    resetImage()
    reactSwipeEl.next()
    setRefIndex(refIndex + 1)
    setImgSlideIndex([imgSlideIndex + 1, 1])
    setZoomIdx(zoomIdx + 1 >= images.length ? 0 : zoomIdx + 1);
  }

  const prevSlide = () => {
    resetVideo();
    resetImage()
    reactSwipeEl.prev()
    setRefIndex(refIndex - 1)
    setZoomIdx(zoomIdx - 1 < 0 ? images.length - 1 : zoomIdx - 1)
    setImgSlideIndex([imgSlideIndex - 1, 1])
  }

  const pauseVideo = () => {
    if (videoCurrentlyPlaying) {
      videoReferences.current[imageIndex].pause()
    }
    if (isYtVideo) {

    }
    setVideoCurrentlyPlaying(false)
  }

  const openModalWithSlideNum = (index) => {
    let reactSwipeOptionConfig = reactSwipeOptions
    reactSwipeOptionConfig.startSlide = index
    setReactSwipeOptions(reactSwipeOptionConfig)
    setZoomIdx(index)
    openModal(index)
  }

  const saveImage = () => {
    if (imagesMetadata.length > 0) {
      if (imagesMetadata[imageIndex].original) {
        saveAs(imagesMetadata[imageIndex].original, 'image.jpg')
      } else {
        saveAs(imagesMetadata[imageIndex].src, 'image.jpg')
      }
    } else {
      saveAs(images[imageIndex].src, 'image.jpeg')
    }
  }

  const playSlideshow = () => {
    setMagnifyingGlass(false)
    if (isRTL) {
      updateImageSlideshow(-1)
    } else {
      updateImageSlideshow(1)
    }
    setIsSlideshowPlaying(true)
  }

  const stopSlideshow = () => {
    setIsSlideshowPlaying(false)
  }

  const resetVideo =() => {
    if (videoCurrentlyPlaying) {
      pauseVideo();
    }
    if (props.images) {
      if (props.images[imageIndex].type == "yt") {
        let elem = props.images[imageIndex];
        videoReferences.current[imageIndex].src = `https://www.youtube.com/embed/${elem.videoID}?${shouldAutoplay(elem) ? "autoplay=1" : ""}`
      }
      
    }
  }

  const resetImage = () => {
    if (enableMagnifyingGlass) {
      initMagnifyingGlass()
    } else {
      if (zoomReferences.current[zoomIdx]) {
        zoomReferences.current[zoomIdx].resetTransform()
      }
    }
  }

  const getThumbnailImgSrc = (img_src) => {
    if (
      typeof img_src === 'object' &&
      !Array.isArray(img_src) &&
      img_src !== null
    ) {
      return img_src.src
    } else {
      return img_src
    }
  }

  const initStyling = () => {
    if (props.theme) {
      if (themes[props.theme]) {
        setBackgroundColor(themes[props.theme].background)
        // setIconColor(themes[props.theme].iconColor)
        // setThumbnailBorder(themes[props.theme].thumbnailBorder)
        setTextColor(themes[props.theme].textColor)
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
    let imageElem
    if (!props.images) {
      imageElem = (
        <img
          className={`${
            props.fullScreen ? 'fullScreenLightboxImg' : 'lightbox_img'
          } 
          ${
            enableMagnifyingGlass
              ? ' maxWidthFull'
              : ' maxWidthWithoutMagnifier'
          }`}
          ref={imageRef}
          loading='lazy'
          // style = {{borderRadius: `${isRounded ? "20px" : ""}`, maxWidth : `${enableMagnifyingGlass ? "100%" : "80%"}`}}
          src={
            images[index].original ? images[index].original : images[index].src
          }
          onLoad={() => {
            images[index]['loaded'] = true
          }}
          id='img'
        />
      )
    } else if (props.images && props.render) {
      imageElem = props.render.imgSlide(imagesMetadata[index])
    } else {
      let img_link

      // check if object (Next.js local image imports are passed as objects with a src attribute)
      if (
        typeof imagesMetadata[index].src === 'object' &&
        !Array.isArray(imagesMetadata[index].src) &&
        imagesMetadata[index].src !== null
      ) {
        img_link = imagesMetadata[index].src.src
      } else if (props.coverImageInLightbox == true) {
        img_link = images[index].src
      } else {
        img_link = imagesMetadata[index].src
      }
      imageElem = (
        <img
          className={`${
            props.fullScreen ? 'fullScreenLightboxImg' : 'lightbox_img'
          } 
          ${
            enableMagnifyingGlass
              ? ' maxWidthFull'
              : ' maxWidthWithoutMagnifier'
          }`}
          ref={imageRef}
          loading='lazy'
          style={isRounded ? { borderRadius: '20px' } : {}}
          src={
            imagesMetadata[index].original
              ? imagesMetadata[index].original
              : img_link
          }
          onLoad={() => {
            images[index]['loaded'] = true
          }}
          id='img'
        />
      )
    }

    return imageElem
  }

  const isVideo = (elem) => {
    if (elem.type == 'yt' || elem.type == 'htmlVideo') {
      return true
    }
    return false
  }

  const shouldAutoplay = (elem) => {
    // Autoplay for HTML5 Video elems set to true by default
    // Autoplay is off by default for YouTube embeds 

    if (elem.type == "yt" && (elem.autoPlay != true && elem.autoPlay != "true")) {
        return false;
    }
    else if (elem.autoPlay == false || elem.autoPlay == "false") {
      return false;
    }
    return true;

  }

  const getVideoHeight = (elem) => {
    if (elem.videoHeight) {
      return elem.videoHeight
    }
    return 500;
  }

  const getVideoWidth = (elem) => {
    if (elem.videoWidth) {
      return elem.videoWidth
    }
    return 900;
  }

  const videoSlideElement = (elem, index) => {

    let videoElem
    if (elem.type == 'yt') {

      videoElem = (
        <div className='videoOuterContainer'>
          <iframe
            className='ytVideo'
            width={getVideoWidth(elem)}
            height={getVideoHeight(elem)}
            ref={(el) => (videoReferences.current[index] = el)}
            src={`https://www.youtube.com/embed/${elem.videoID}?${shouldAutoplay(elem) ? "autoplay=1" : ""}`}
            title='YouTube video player'
            frameBorder='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            allowFullScreen
            
          ></iframe>
        </div>
      )
    } else if (elem.type == 'htmlVideo') {

      videoElem = (
        <div className='htmlVideo htmlVideoOuterContainer'>
          <video
            className={`cursor-pointer lightboxVideo`}
            // key={props.id}
            width={getVideoWidth(elem)}
            ref={(el) => (videoReferences.current[index] = el)}
            onPlay={() => {setVideoCurrentlyPlaying(true)}}
            height={getVideoHeight(elem)}
            autoPlay={index == imgSlideIndex ? shouldAutoplay(elem) : ""}
            controls
          >
            <source src={elem.videoSrc} type='video/mp4' />
          </video>
        </div>
      )
    }

    return videoElem
  }

  const regularImgPaneNodes = Array.apply(null, Array(images.length)).map(
    (_, index) => {
      return (
        <div key={index}>
          {enableMagnifyingGlass == true ? (
            <Magnifier
              src={images[index].src}
              className='imageModal mx-auto mt-0 magnifyWrapper lightbox_img'
              height={imgContainHeight}
              width={imgContainWidth}
              mgShowOverflow={false}
              style={{
                width: imgContainWidth,
                height: imgContainHeight
              }}
            />
          ) : (
            <div className='slidePane'>
              <TransformWrapper
                ref={(el) => (zoomReferences.current[index] = el)}
                onWheel={{ wheelEvent }}
                disabled={disableZoom}
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
                  <div
                    className={`${
                      props.fullScreen
                        ? 'slideshow_img_fullscreen'
                        : 'slideshow_img'
                    }`}
                  >
                    {isVideo(props.images[index]) ? (
                      videoSlideElement(props.images[index], index)
                    ) : (props.images && props.render) ||
                      frameworkID == 'next' ? (
                      imageSlideElement(index)
                    ) : (
                      <img
                        className={`${
                          props.fullScreen
                            ? 'fullScreenLightboxImg'
                            : 'lightbox_img'
                        } 
                      ${
                        enableMagnifyingGlass
                          ? ' maxWidthFull'
                          : ' maxWidthWithoutMagnifier'
                      }`}
                        ref={imageRef}
                        loading='lazy'
                        style={isRounded ? { borderRadius: '20px' } : {}}
                        src={
                          props.images && props.images[index].original
                            ? imagesMetadata[index].original
                            : images[index].src
                        }
                        onLoad={() => {
                          images[index]['loaded'] = true
                        }}
                        id='img'
                      />
                    )}
                  </div>
                </TransformComponent>
              </TransformWrapper>
            </div>
          )}
        </div>
      )
    }
  )

  const initMagnifyingGlass = () => {
    if (!enableMagnifyingGlass) {
      initImageDimensions()
    } else {
      setImgAnimation('imgDrag')
    }
    setMagnifyingGlass(!enableMagnifyingGlass)
  }

  const initImageDimensions = () => {
    let img
    if (imgSlideIndex == 0 || imgSlideIndex % images.length == 0) {
      img = document.getElementById('img')
    } else {
      img = imageRef.current
    }

    var ratio = img.naturalWidth / img.naturalHeight
    var width = img.height * ratio
    var height = img.height
    if (width > img.width) {
      width = img.width
      height = img.width / ratio
    }

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
      setZoomedIn(false)
    } else {
      // setImgAnimation("fade");
      setZoomedIn(true)
    }
  }

  const isSrcStr = (img_src) => {
    if (
      typeof img_src === 'object' &&
      !Array.isArray(img_src) &&
      img_src !== null
    ) {
      return false
    }
    return true
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

  const initFullScreenChangeEventListeners = () => {
    document.addEventListener('fullscreenchange', exitFullScreenHandler)
    document.addEventListener('webkitfullscreenchange', exitFullScreenHandler)
    document.addEventListener('MSFullscreenChange', exitFullScreenHandler)
    document.addEventListener('mozfullscreenchange', exitFullScreenHandler)
  }

  const removeFullScreenChangeEventListeners = () => {
    document.removeEventListener('fullscreenchange', exitFullScreenHandler)
    document.removeEventListener('webkitfullscreenchange', exitFullScreenHandler)
    document.removeEventListener('MSFullscreenChange', exitFullScreenHandler)
    document.removeEventListener('mozfullscreenchange', exitFullScreenHandler)
  }

  const initEventListeners = () => {
    // document.addEventListener('keydown', keyPressHandler, false)
    // document.addEventListener('keyup', keyUpHandler, false)

    if (isBrowser) {
      window.addEventListener('resize', handleWindowResize)
    }
  }

  const removeEventListeners = () => {
    if (isBrowser) {
      window.removeEventListener('resize', handleWindowResize)
      // document.removeEventListener('keydown', keyPressHandler, false)
      // document.removeEventListener('keyup', keyUpHandler, false)
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

  const initPropsForControlIcons = () => {
    if (props.showFullScreenIcon != undefined) {
      setDisplayFullScreenIcon(props.showFullScreenIcon)
    }
    if (props.showThumbnailIcon != undefined) {
      setDisplayThumbnailIcon(props.showThumbnailIcon)
    }

    if (props.showSlideshowIcon != undefined) {
      setDisplaySlideshowIcon(props.showSlideshowIcon)
    }

    if (props.showMagnificationIcons != undefined) {
      setDisplayMagnificationIcons(props.showMagnificationIcons)
    }
  }

  const initProps = () => {
    if (props.showControls != undefined) {
      setShowControls(props.showControls)
    }

    initPropsForControlIcons()

    if (props.disableImageZoom) {
      setDisableZoom(props.disableImageZoom)
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
      if (isRTL) {
        updateImageSlideshow(-1)
      } else {
        updateImageSlideshow(1)
      }
    },
    isSlideshowPlaying ? slideshowInterval : null
  )

  useEffect(() => {
    // Error check
    if (props.render) {
      if (!props.images) {
        console.error(
          'Array of images must be passed to `SlideshowLightbox` (with the `images` prop) if using custom render method. '
        )
      }
    }

    let isMounted = true
    if (isMounted) initProps()

    if (coverMode && imagesMetadata) {
      if (props.coverImageInLightbox == false) {
        let filterImages = imagesMetadata.filter((img) => img.cover != true)
        setImages(filterImages)
      } else {
        setImages(imagesMetadata)
      }
    }

    if (isMounted) {
      initEventListeners()
    }

    let reducedMotionMediaQuery = checkAndInitReducedMotion()

    if (!isInit) {
      if (lightboxIdentifier) {
        let img_gallery = document.querySelectorAll(
          `[data-lightboxjs=${lightboxIdentifier}]`
        )
        let img_elements = []

        if (img_gallery.length > 0) {
          for (let i = 0; i <= img_gallery.length - 1; i++) {
            let img = img_gallery[i]

            let attr_val = img.getAttribute('data-lightboxjs')
            if (attr_val == lightboxIdentifier) {
              img.addEventListener(
                'click',
                () => {
                  let index

                  if (isRTL) {
                    index = getRTLIndex(img_gallery.length, i)
                  } else {
                    index = i
                  }

                  let reactSwipeOptionConfig = reactSwipeOptions
                  reactSwipeOptionConfig.startSlide = index

                  if (isMounted) setReactSwipeOptions(reactSwipeOptionConfig)
                  setZoomIdx(index)
                  openModal(index)
                },
                false
              )
              img.classList.add('cursor-pointer')

              if (img.src) {
                img_elements.push({
                  src: img.src,
                  alt: img.alt,
                  loaded: 'false'
                })
              } else if (img.tagName == 'DIV') {
                let corresponding_img_item = props.images[i]
                let img_src = corresponding_img_item.src
                let img_alt = corresponding_img_item.alt
                img_elements.push({
                  src: img_src,
                  alt: img_alt,
                  loaded: 'false'
                })
              }
            }
          }

          if (isMounted && !coverMode) setImages(img_elements)
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
          if (isRTL) {
            imgs.reverse()
          }
          if (isMounted) setImages(imgs)
          setPreviewImageElems(props.children)
        } else {
          if (isMounted) setImages(props.images)
        }
      }

      if (isMounted) setIsInit(true)
    }

    if (!isInit) {
      if (props.images && isRTL == true) {
        // flip images array
        let imagesMetadataCopy = imagesMetadata
        imagesMetadataCopy.reverse()

        setImagesMetadata(imagesMetadataCopy)

        if (images.length > 0) {
          let imagesRTLCopy = images
          imagesRTLCopy.reverse()
          setImages(imagesRTLCopy)
        }
      }
    }

    if (isMounted) initStyling()
    return () => {
      isMounted = false
      removeEventListeners()
      reducedMotionMediaQuery.removeEventListener(
        'change',
        reducedMotionMediaQuery
      )
    }
  }, [])

  var reactSwipeEl

  return (
    <div className={`${props.className} lightboxjs`}>
      {props.images && props.children && lightboxIdentifier == false
        ? props.children
        : null}

      {props.images && lightboxIdentifier == false
        ? props.images.map((elem, index) => (
            <img
              className={' cursor-pointer'}
              src={elem.src}
              // src={isSrcStr(elem.src) ? elem.src : elem.src.src}
              onClick={() => {
                let img_index

                if (isRTL) {
                  img_index = getRTLIndex(props.images.length, index)
                } else {
                  img_index = index
                }

                openModalWithSlideNum(img_index)
              }}
              key={index}
              // whileTap={{ scale: 0.97 }}
            />
          ))
        : null}

      {/* IF Lightbox identifier provided or props.images provided */}
      {lightboxIdentifier != false && coverMode == false
        ? props.children
        : null}

      {(lightboxIdentifier == false && props.images) || coverMode == true
        ? null
        : // No lightbox identifier provided or no cover mode
          previewImageElems
            .filter((elem) => elem.type == 'img')
            .map((elem, index) => (
              <img
                {...elem.props}
                className={`${
                  elem.props.className ? elem.props.className : ''
                } cursor-pointer`}
                onClick={() => {
                  let img_index

                  if (isRTL) {
                    img_index = getRTLIndex(previewImageElems.length, index)
                  } else {
                    img_index = index
                  }

                  openModalWithSlideNum(img_index)
                }}
                key={index}
                // whileTap={{ scale: 0.97 }}
              />
            ))}

      {coverMode ? props.children : false}

      <AnimateSharedLayout type='crossfade'>
        <AnimatePresence initial={false}>
          {showModal !== false && (
            <Portal>
              <Div100vh>
                <motion.div
                  className='slideshowAnimContainer'
                  key='slideshowAnimContainer'
                  id='slideshowAnim'
                  style={{
                    backgroundColor: backgroundColor
                  }}
                  initial={{ opacity: 0, scale: 0.98 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.2
                  }}
                >
                  <div className={`lightboxContainer`}>
                    <section
                      className={`iconsHeader imageModal ${
                        iconColor ? '' : arrowStyle + '_header_icon'
                      }`}
                      style={{ color: iconColor }}
                    >
                      <KeyHandler
                        keyValue={'ArrowLeft'}
                        code={'37'}
                        onKeyHandle={() => {
                          prevSlide()
                        }}
                      />
                      <KeyHandler
                        keyValue={'ArrowRight'}
                        code={'39'}
                        onKeyHandle={() => {
                          nextSlide()
                        }}
                      />
                      <KeyHandler
                        keyValue={'Escape'}
                        code={'27'}
                        onKeyHandle={() => {
                          if (!isBrowserFullScreen) {
                            closeModal()
                          }
                        }}
                      />

                      {/* Support for Internet Explorer and Edge key values  */}
                      <KeyHandler
                        keyValue={'Left'}
                        code={'37'}
                        onKeyHandle={() => {
                          prevSlide()
                        }}
                      />
                      <KeyHandler
                        keyValue={'Right'}
                        code={'39'}
                        onKeyHandle={() => {
                          nextSlide()
                        }}
                      />
                      <KeyHandler
                        keyValue={'Esc'}
                        code={'27'}
                        onKeyHandle={() => {
                          if (!isBrowserFullScreen) {
                            closeModal()
                          }
                        }}
                      />

                      {showControls && (
                        <div className='controls'>
                          {disableZoom ||
                          displayMagnificationIcons == false ? null : (
                            <motion.div
                            // whileTap={{ scale: 0.95 }}
                            >
                              <ZoomIn
                                size={24}
                                onClick={() => {
                                  if (enableMagnifyingGlass) {
                                    initMagnifyingGlass()
                                  }
                                  if (zoomReferences.current[zoomIdx] != null) {
                                    zoomReferences.current[zoomIdx].zoomIn()
                                  }
                                }}
                              />
                            </motion.div>
                          )}

                          {disableZoom ||
                          displayMagnificationIcons == false ? null : (
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
                          )}

                          {showDownloadBtn ? (
                            <Download
                              size={24}
                              onClick={() => {
                                saveImage()
                              }}
                            />
                          ) : null}

                          {displayFullScreenIcon ? (
                            isBrowserFullScreen ? (
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
                            )
                          ) : null}

                          {displayThumbnailIcon ? (
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
                          ) : null}

                          {shouldDisplayMagnifyingGlassIcon() ? (
                            <motion.div
                            // whileTap={{ scale: 0.95 }}
                            >
                              <Search
                                size={24}
                                onClick={() => initMagnifyingGlass()}
                              />
                            </motion.div>
                          ) : null}

                          {displaySlideshowIcon ? (
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
                          ) : null}
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
                      className={
                        rightArrowStyle
                          ? 'next1 ' + arrowStyle + '_icon imageModal'
                          : 'imageModal'
                      }
                      style={rightArrowStyle}
                      onClick={() => {
                        nextSlide()
                      }}
                    >
                      <span>&#10095;</span>
                    </div>
                    <div
                      className={
                        leftArrowStyle
                          ? 'prev1 ' + arrowStyle + '_icon imageModal'
                          : 'imageModal'
                      }
                      style={leftArrowStyle}
                      onClick={() => {
                        prevSlide()
                      }}
                    >
                      {/* {prevArrow} */}
                      <span>&#10094;</span>
                    </div>

                    <AnimatePresence initial={false} custom={direction}>
                      <ReactSwipe
                        className={`${
                          showThumbnails
                            ? 'slideshowInnerContainerThumbnails'
                            : ''
                        } ${isImageCaption() ? 'slideImageAndCaption' : ''} 
                      ${
                        props.fullScreen
                          ? 'slideshowInnerContainerFullScreen'
                          : 'slideshowInnerContainer'
                      }  `}
                        swipeOptions={reactSwipeOptions}
                        ref={(el) => (reactSwipeEl = el)}
                        childCount={images.length}
                      >
                        {regularImgPaneNodes}
                      </ReactSwipe>

                      {shouldDisplayLoader() ? null : (
                        <span
                          key='loader'
                          className={`loader ${getLoaderThemeClass()}`}
                        ></span>
                      )}
                    </AnimatePresence>

                    <div
                      className={`thumbnailsOuterContainer imageModal ${
                        isImageCaption() ? 'thumbnailsAndCaption' : ''
                      }`}
                      style={
                        isImageCaption()
                          ? {
                              backgroundColor: backgroundColor
                            }
                          : {}
                      }
                    >
                      {isImageCaption() && !zoomedIn ? (
                        <div className='imgTitleContainer'>
                          <p
                            className='imgTitle'
                            key={'imgCaption' + imageIndex}
                            style={
                              props.captionStyle
                                ? props.captionStyle
                                : { color: textColor }
                            }
                          >
                            {imagesMetadata[imageIndex].caption}
                          </p>
                        </div>
                      ) : null}

                      <AnimatePresence initial={animatedThumbnails}>
                        {showThumbnails !== false && (
                          <motion.div
                            initial={'hidden'}
                            exit={'hidden'}
                            animate={'visible'}
                            style={
                              imagesLoaded ? {} : { display: 'displayHidden' }
                            }
                            transition={{
                              type: 'spring',
                              duration: 0.75
                            }}
                            variants={thumbnailVariants}
                            className={`thumbnails rounded-sm mx-auto ${
                              isImageCaption() ? 'thumbnailsWithCaption' : ''
                            }`}
                          >
                            <ScrollContainer
                              className='scroll-container'
                              vertical={false}
                              horizontal={true}
                              hideScrollbars={false}
                            >
                              {frameworkID == 'next' &&
                              imagesMetadata &&
                              props.images
                                ? imagesMetadata.map((img, index) => (
                                    <img
                                      className={`thumbnail`}
                                      src={getThumbnailImgSrc(img.src)}
                                      style={
                                        imageIndex === index
                                          ? { border: thumbnailBorder }
                                          : { border: inactiveThumbnailBorder }
                                      }
                                      key={index}
                                      onClick={() => {
                                        resetVideo();
                                        resetImage();
                                        setCurrentSlide(index);
                                      }}
                                      alt={img.alt}
                                      onLoad={() => setImagesLoaded(true)}
                                    />
                                  ))
                                : // Not Next.js
                                  images.map((img, index) => (
                                    <img
                                      src={img.src}
                                      style={
                                        imageIndex === index
                                          ? { border: thumbnailBorder }
                                          : { border: inactiveThumbnailBorder }
                                      }
                                      className={'thumbnail'}
                                      key={index}
                                      onClick={() => {
                                        resetVideo();
                                        resetImage();
                                        setCurrentSlide(index);
                                      }}
                                      alt={img.alt}
                                      onLoad={() => setImagesLoaded(true)}
                                    />
                                  ))}
                            </ScrollContainer>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </Div100vh>
            </Portal>
          )}
        </AnimatePresence>
      </AnimateSharedLayout>
    </div>
  )
}
