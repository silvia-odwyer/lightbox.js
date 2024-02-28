import * as React from 'react'
import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, ForwardRefExoticComponent } from 'react'
import { motion, AnimatePresence, AnimateSharedLayout, useIsPresent } from 'framer-motion'
import styles from './styles.module.css'

import {
  wrapNums,
  getVideoHeight,
  getVideoWidth,
  shouldAutoplay,
  getScale,
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
  InfoCircle,
  XLg,
  GridFill
} from 'react-bootstrap-icons'
import { ReactNode } from 'react';
import Magnifier from 'react-magnifier'
import { Portal } from 'react-portal'
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef, } from 'react-zoom-pan-pinch'
import { saveAs } from 'file-saver'
import Div100vh from 'react-div-100vh'
import KeyHandler from 'react-key-handler'
import { useInterval } from 'usehooks-ts'
import useEmblaCarousel from 'embla-carousel-react'
import YouTube from 'react-youtube';
import useResizeObserver from '@react-hook/resize-observer';
import exifr from 'exifr'

let thumbnailVariants: any = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 100 }
}

const themes: any = {
  day: {
    background: 'white',
    iconColor: 'black',
    thumbnailBorder: 'solid transparent 2px',
    textColor: 'black',
    metadataTextColor: "black"
  },
  night: {
    background: '#151515',
    iconColor: '#626b77',
    thumbnailBorder: 'solid rgb(107, 133, 206)  2px',
    textColor: '#626b77',
    metadataTextColor: "white"

  },
  lightbox: {
    background: 'rgba(12, 12, 12, 0.93)',
    iconColor: '#626b77',
    thumbnailBorder: 'solid rgb(107, 133, 206) 2px',
    textColor: 'silver',
    metadataTextColor: "white"

  }
}

// const activeThumbnailBorder = 'solid rgba(107, 133, 206, 0.6) 2px'
const inactiveThumbnailBorder = 'solid transparent 2px'

const defaultTheme = 'night'
const mobileWidth = 768

const usePrevious = (value) => {
  // custom hook to get previous prop value
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

interface SlideItem {
  src?: any,
  original?: string,
  type?: string,
  alt?: string,
  loaded?: boolean,
  thumbnailSrc?: string,
}

interface ImageElement {
  src?: any,
  alt?: string,
  loaded?: boolean,
}

type SlideshowLightboxHandle = {
  children?: ReactNode;
  reset: () => void;
};

export interface SlideshowLightboxProps {
  children?: ReactNode;
  ref?: any;
  thumbnailBorder?: string;
  magnifyingGlass?: boolean;
  backgroundColor?: string;
  theme?: string;
  iconColor?: any;
  fullScreen?: boolean;
  showControls?: boolean;
  disableImageZoom?: boolean;
  slideshowInterval?: number;
  slideDuration?: number;
  showThumbnails?: boolean;
  open?: boolean;
  displayMetadata?: boolean;
  navigationDots?: boolean;
  animateThumbnails?: boolean;
  showFullScreenIcon?: boolean;
  showThumbnailIcon?: boolean;
  showSlideshowIcon?: boolean;
  showMagnificationIcons?: boolean;
  roundedImages?: boolean;
  downloadImages?: boolean;
  showNavigationDots?: boolean;
  rtl?: boolean;
  modalClose?: string;
  framework?: string;
  lightboxIdentifier?: string;
  nextArrow?: any;
  prevArrow?: any;
  arrowStyle?: any;
  showLoader?: boolean;
  useCoverMode?: boolean;
  rightArrowStyle?: any;
  leftArrowStyle?: any;
  imgAnimation?: string;
  maxZoomScale?: number;
  textColor?: string;
  licenseKey?: string;
  images?: any;
  render?: any;
  imageComponent?: boolean;
  showArrows?: boolean;
  controlComponent?: any;
  lightboxImgClass?: string;
  thumbnailImgClass?: string;
  coverImageInLightbox?: boolean;
  onOpen?: any;
  onClose?: any;
  onNext?: any;
  onPrev?: any;
  onImgError?: any;
  className?: string;
  imgWrapperClassName?: string;
  imgClassName?: string;
  startingSlideIndex?: number;
  showAllImages?: any;
  rightArrowClassname?: string;
  leftArrowClassname?: string;
  displayedImages?: any;
  metadataTimeLocale?: string;
  captionStyle?: any;
}

export const SlideshowLightbox: React.FC<SlideshowLightboxProps> = React.forwardRef<SlideshowLightboxHandle, SlideshowLightboxProps>((props, ref) => {

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        initImages(true, true)
      }
    })
  )

  const [[imgSlideIndex, direction], setImgSlideIndex] = useState([0, 0])
  const [showModal, setShowModal] = useState(false)
  const [slideAnimDuration, setSlideAnimDuration] = useState(props.slideDuration ? props.slideDuration : 25)

  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false)

  const [emblaReinitialized, setEmblaReinitialized] = useState(false)

  const [images, setImages] = useState<SlideItem[]>([]);

  const [previewImageElems, setPreviewImageElems] = useState<any[]>([]);

  const slideIndex = wrapNums(0, images.length, imgSlideIndex)

  const [reactSwipeOptions, setReactSwipeOptions] = useState({
    loop: true,
    startIndex: 0,
    active: true,
    duration: slideAnimDuration,
    dragThreshold: 2
  })

  let initialThumbnailOptions: any = {
    startIndex: 0,
    containScroll: 'keepSnaps',
    dragFree: true
  }

  const [width, setWidth] = useState(0)

  const isMobile = width <= mobileWidth;

  const [thumbnailSwipeOptions, setThumbnailSwipeOptions] = useState(initialThumbnailOptions)

  const [carouselReady, setCarouselReady] = useState(false)

  const [zoomedIn, setZoomedIn] = useState(false)
  const [text, setText] = useState("")

  const [isDisplay, setIsDisplay] = useState(false)

  const [isOpen, setIsOpen] = useState(false)

  const [prevFocusedElem, setPrevFocusedElem] = useState<HTMLElement | null>(null)
  const [animationEntered, setAnimationEntered] = useState(false)

  const [magnifyingGlassFeature, _setMagnifyingGlassFeature] = useState(
    props.magnifyingGlass ? props.magnifyingGlass : false
  )

  const [disableZoom, setDisableZoom] = useState(
    props.disableImageZoom ? props.disableImageZoom : false
  )

  const [slideshowInterval, setSlideshowInterval] = useState(
    props.slideshowInterval ? props.slideshowInterval : 1700
  )

  const [rightArrowStyle, setRightArrowStyle] = useState(
    props.rightArrowStyle ? props.rightArrowStyle : {}
  )

  const [leftArrowStyle, setLeftArrowStyle] = useState(
    props.leftArrowStyle ? props.leftArrowStyle : {}
  )

  const [maxScale, setMaxScale] = useState<number>(
    props.maxZoomScale ? getScale(props.maxZoomScale, 24) : 8
  )

  const [isRounded, setIsRounded] = useState(
    props.roundedImages ? props.roundedImages : false
  )

  const [showControls, setShowControls] = useState<boolean>(
    props.showControls ? props.showControls : true
  )

  const [displayFullScreenIcon, setDisplayFullScreenIcon] = useState<boolean>(
    props.showFullScreenIcon ? props.showFullScreenIcon : true
  )

  const [displayThumbnailIcon, setDisplayThumbnailIcon] = useState<boolean>(
    props.showThumbnailIcon ? props.showThumbnailIcon : true
  )

  const [displaySlideshowIcon, setDisplaySlideshowIcon] = useState<boolean>(
    props.showSlideshowIcon ? props.showSlideshowIcon : true
  )

  const [displayMagnificationIcons, setDisplayMagnificationIcons] = useState<boolean>(
    props.showMagnificationIcons ? props.showMagnificationIcons : true
  )

  const [nextArrowElem, setNextArrowElem] = useState(
    props.nextArrow ? props.nextArrow : null
  )

  const [isImageComponent, setImageComponent] = useState(
    props.imageComponent ? props.imageComponent : null
  )

  const [prevArrowElem, setPrevArrowElem] = useState(
    props.prevArrow ? props.prevArrow : null
  )

  const [modalCloseOption, setModalCloseOption] = useState(
    props.modalClose ? props.modalClose : "default"
  )

  const [showDownloadBtn, setShowDownloadBtn] = useState(
    props.downloadImages ? props.downloadImages : false
  )

  const [navigationDots, setNavigationDots] = useState(
    props.showNavigationDots ? props.showNavigationDots : false
  )

  const [metadataLocale, setMetadataLocale] = useState(props.metadataTimeLocale ? props.metadataTimeLocale : "en-US")

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

  const [displayLoader, setDisplayLoader] = useState(
    props.showLoader ? props.showLoader : false
  )

  const [customControlComponent, setCustomControlComponent] = useState(
    props.controlComponent ? props.controlComponent : false
  )

  const [startingIndex, setStartingIndex] = useState(
    props.startingSlideIndex ? props.startingSlideIndex : 0
  )

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

  const [displayImgMetadata, setDisplayImgMetadata] = useState(
    props.displayMetadata ? props.displayMetadata : false
  )

  const [showImgMetadataPanel, setShowImgMetadataPanel] = useState(false)

  const [imgMetadata, setImgMetadata] = useState({})

  const [showThumbnails, setShowThumbnails] = useState(
    props.showThumbnails ? props.showThumbnails : false
  )
  const [animatedThumbnails, setAnimatedThumbnails] = useState(
    props.animateThumbnails ? props.animateThumbnails : true
  )
  const [imgAnimation, setImgAnimation] = useState(
    props.imgAnimation ? props.imgAnimation : 'imgDrag'
  )
  const [arrowStyle, setArrowStyle] = useState(
    props.arrowStyle ? props.arrowStyle : 'dark'
  )

  const [YTVideoCurrentlyPlaying, setYTVideoCurrentlyPlaying] = useState(false)


  const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false)
  const [enableMagnifyingGlass, setMagnifyingGlass] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  const imageRef: React.RefObject<HTMLImageElement> = useRef(null)

  const [zoomIdx, setZoomIdx] = useState(0)

  const [imgContainHeight, setImgContainHeight] = useState(500)
  const [imgContainWidth, setImgContainWidth] = useState(426)
  const [isInit, setIsInit] = useState(false)

  const { open } = props;
  const previousValues: any = usePrevious({ open });

  // Refs
  const zoomReferences = useRef<(ReactZoomPanPinchRef | null)[]>([])
  const videoReferences = useRef({})
  const btnRef = useRef(null)
  const [videoElements, setVideoElements] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const createCustomThumbnailBorder = (): string | void => {
    if (props.thumbnailBorder) {
      return `solid ${props.thumbnailBorder} 2px`
    }
  }

  const [thumbnailBorder, setThumbnailBorder] = useState(
    props.thumbnailBorder
      ? createCustomThumbnailBorder()
      : themes[defaultTheme].thumbnailBorder
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(reactSwipeOptions);
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel(thumbnailSwipeOptions)

  const getLoaderThemeClass = () => {
    if (props.theme) {
      if (props.theme == 'night' || props.theme == 'lightbox') {
        return styles.night_loader
      } else if (props.theme == 'day') {
        return styles.day_loader
      }
    }
    return styles.night_loader
  }

  const scrollPrev = useCallback(() => {
    if (emblaApi) { emblaApi.scrollPrev() }

  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const variants = {
    active: {
      opacity: 1,
    },
    inactive: {
      opacity: 0,
    }
  }

  const isImageCaption = () => {
    if (props.images && props.images.length > 0) {
      if (props.images[slideIndex]?.caption) {
        return true
      }
    }
    return false
  }

  const displayDownloadBtn = () => {
    if (isVideo(slideIndex)) {
      return false
    } else {
      return showDownloadBtn
    }
  }

  function handleWindowResize() {
    setWidth(window.innerWidth)
  }

  const shouldDisplayMagnifyingGlassIcon = () => {
    if (isVideo(slideIndex)) {
      return false
    }
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

  const getImageStyle = () => {
    let styleObject = {};
    if (isRounded) {
      styleObject["borderRadius"] = "20px";
    }
    if (modalCloseOption == "clickOutside") {
      styleObject["pointerEvents"] = "auto"
    }
    if (isImageComponent && showThumbnails == false && !isMobile) {
      styleObject["height"] = "85vh";
    }
    return styleObject;
  }

  const shouldDisplaySlideshowIcon = () => {

    if (props.showSlideshowIcon != undefined) {
      return props.showSlideshowIcon;
    }

    if (images) {
      if (images.length == 1) {
        return false;
      }
    }
    else if (props.images) {
      if (props.images.length == 1) {
        return false;
      }
    }

    return true;
  }

  const navigationClick = (index) => {
    initLoader(index)
    setCurrentSlide(index)
  }

  const checkModalClick = (e) => {
    const modals = document.getElementsByClassName('imageModal')
    let arr_modals = Array.from(modals)
    for (let i = 0; i < arr_modals.length; i++) {
      let elem = arr_modals[i]
      let clickInside = elem.contains(e.target);

      if (clickInside) {
        return
      }
    }

    closeModal()
  }

  const isZoomEnabled = () => {
    if (disableZoom == true) {
      return false;
    }
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

  const getMetadataTextColor = () => {
    if (props.theme) {
      if (themes[props.theme]) {
        return themes[props.theme].metadataTextColor;
      }
    }
    else {
      return themes[defaultTheme].metadataTextColor;
    }
  }

  const fullScreen = () => {
    let lightbox = document.getElementById('slideshowAnim')
    openFullScreen(lightbox)
    setIsBrowserFullScreen(true)
    initFullScreenChangeEventListeners()
  }

  const exitFullScreenHandler = () => {
    //in full screen mode
    if (
      document['webkitIsFullScreen'] ||
      document['mozFullScreen'] ||
      document['msFullscreenElement']
    ) {
      setIsBrowserFullScreen(true)
    } else {
      if (isBrowserFullScreen) {
        closeFullScreen(document)
      }
      removeFullScreenChangeEventListeners()
      setIsBrowserFullScreen(false)
    }
  }

  const exitFullScreen = () => {
    closeFullScreen(document)
    removeFullScreenChangeEventListeners()
    setIsBrowserFullScreen(false)
  }

  const updateImageSlideshow = (newDirection) => {
    if (isRTL) {
      scrollPrev()
    } else {
      scrollNext();
    }

    setImgSlideIndex([imgSlideIndex + newDirection, newDirection])
    if (isRTL) {
      setZoomIdx(zoomIdx - 1 < 0 ? images.length - 1 : zoomIdx - 1)
    } else {
      setZoomIdx(zoomIdx + 1 >= images.length ? 0 : zoomIdx + 1)
    }
  }

  const displayArrows = () => {
    if (props.showArrows == false) {
      return false;
    }
    if (props.images) {
      if (props.images.length == 1) {
        return false;
      }
    }
    else if (images.length == 1) {
      return false;
    }

    return true;
  }

  const initLoader = (newIndex) => {
    if (props.showLoader && props.images) {
      if (!isVideo(newIndex) && images[newIndex].loaded != true) {
        setDisplayLoader(true)
      } else if (
        props.showLoader &&
        props.images &&
        images[newIndex]['loaded']
      ) {
        setDisplayLoader(false)
      }
    }
  }

  const getImageCaption = (): string => {
    if (props.images && props.images.length > 0) {
      return props.images[slideIndex].caption;
    }
    return ""
  }

  const getArrowStyle = (): string | void => {
    if (arrowStyle == 'dark') {
      return styles.dark_icon
    } else if (arrowStyle == 'light') {
      return styles.light_icon
    }
  }

  const getIconStyle = (): string | undefined => {
    if (arrowStyle == 'dark') {
      return styles.dark_header_icon
    }
    else if (arrowStyle == 'light') {
      return styles.light_header_icon
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

    if (emblaApi) {
      emblaApi.scrollTo(newIndex)
    }
  }

  const dispatchOpenEvent = () => {
    if (props.onOpen) {
      props.onOpen(slideIndex, images[slideIndex]);
    }
  }

  const dispatchCloseEvent = () => {
    if (props.onClose) {
      props.onClose(slideIndex)
    }
  }

  const dispatchNextImgEvent = (newIndex) => {
    if (props.onNext) {
      props.onNext(newIndex, images[newIndex])
    }
  }

  const dispatchPrevImgEvent = (newIndex) => {
    if (props.onPrev) {
      props.onPrev(newIndex, images[newIndex])
    }
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
    setIsOpen(false)
    setCarouselReady(false)
    setEmblaReinitialized(false)
    if (prevFocusedElem) prevFocusedElem?.focus();
  }

  const openModal = (num) => {

    if (emblaApi) {
      emblaApi.reInit();
      if (emblaThumbsApi) {
        emblaThumbsApi?.scrollTo(emblaApi.selectedScrollSnap())
      }
    }
    setImgSlideIndex([num, 1])
    setShowModal(true)
    setIsOpen(true)

  }

  const setItemLoaded = (index) => {
    if (props.images) {

      setImages(images =>
        images.map((img, i) => index === i ? {
          ...img,
          loaded: true
        } : img)
      )

    }
  }

  const setImagesItemLoaded = (index) => {
    setImages(images =>
      images.map((img, i) => index === i ? {
        ...img,
        loaded: true
      } : img)
    )
  }

  const resetMedia = (slide_index) => {
    resetVideo(slide_index)
    resetImage()
  }

  const initImgMetadataPanel = () => {
    if (isMobile && showImgMetadataPanel) {
      setShowImgMetadataPanel(false)
    }
  }

  const initSlide = (newSlideIndex) => {
    setImgSlideIndex([newSlideIndex, 1])
    let wrap_slide_index = wrapNums(0, images.length, newSlideIndex)
    setZoomIdx(wrap_slide_index)
    initLoader(wrap_slide_index);

    if (displayImgMetadata) {
      initImgMetadataPanel();

      if (!imgMetadata[wrap_slide_index]) {
        setIsLoading(true)
      }
    }


  }

  const nextSlide = () => {
    setText("text1")
    if (imgAnimation == "fade") {

    }

    scrollNext();


    initSlide(imgSlideIndex + 1);

  }

  const prevSlide = () => {
    setText("text")
    if (imgAnimation == "fade") {

    }

    scrollPrev()


    initSlide(imgSlideIndex - 1);
  }

  const setThumbnailStartIndex = (index) => {
    let thumbnailSwipeOptionConfig = thumbnailSwipeOptions;
    thumbnailSwipeOptionConfig.startIndex = index
    setThumbnailSwipeOptions(thumbnailSwipeOptionConfig)
  }

  const openModalWithSlideNum = (index) => {

    let reactSwipeOptionConfig = reactSwipeOptions
    reactSwipeOptionConfig.startIndex = index
    setReactSwipeOptions(reactSwipeOptionConfig)
    setThumbnailStartIndex(index)
    setZoomIdx(index)
    openModal(index)
  }

  const saveImage = () => {
    if (props.images.length > 0) {
      if (props.images[slideIndex].original) {
        saveAs(props.images[slideIndex].original, 'image.jpg')
      } else {
        saveAs(props.images[slideIndex]['src'], 'image.jpg')
      }
    } else {
      if (images[slideIndex].src) {
        saveAs(images[slideIndex].src!, 'image.jpeg')
      }
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

  const getEmbedIndex = (slide_index, elems) => {
    if (props.images) {
      let iframe_index = 0;

      for (let i = 0; i < props.images.length; i++) {
        let item = props.images[i];
        if ((item.type == "customVideoEmbed" || item.type == "yt")) {
          if (i == slide_index) {
            iframe_index++;
            break;
          }
          else {
            iframe_index++;
          }
        }
      }

      return iframe_index - 1;
    }
  }

  const getEmblaClass = (index) => {

    if (displayImgMetadata) {
      return styles.embla__slide_grid;
    }

    if (slideIndex == index && imgAnimation == "fade") {
      return `${styles.imgfade} ${styles.embla__slide} ${styles.embla__slide_selected}`
    }
    else if (imgAnimation == "fade") {
      return `${styles.imgfade} ${styles.embla__slide}`;
    }
    else {
      return styles.embla__slide;
    }
  }

  const resetVideo = (slide_index) => {
    if (props.images) {
      let elem = props.images[slide_index]
      if (elem) {
        if (elem.type == 'htmlVideo') {
          videoReferences.current[slide_index].pause()
        }
        else if (elem.type == "yt") {
          if (videoElements[slide_index]) {
            videoElements[slide_index].target.pauseVideo()

          }
        }
        else if (elem.type == "customVideoEmbed") {
          let lightboxjs_elem = document.getElementById("lightboxContainer");
          let elems = lightboxjs_elem?.querySelectorAll("iframe");
          if (elems) {
            let iframe_elem_index = getEmbedIndex(slide_index, elems);
            if (iframe_elem_index != undefined && iframe_elem_index >= 0) {
              // reset iframe
              let iframe = elems[iframe_elem_index];
              let iframe_src = iframe.src
              iframe.src = iframe_src;
            }

          }

        }
      }
    }
  }

  const getNavigationDot = (index) => {
    return (
      <button style={slideIndex === index ? { backgroundColor: "cornflowerblue" } : {}}
        className={`${styles.navigationDot} imageModal`} onClick={() => { navigationClick(index) }}></button>

    )
  }



  const getImageThumbnail = (img, index, isNextJS) => {
    return (
      <div key={"thumbnail_slide_" + index} className={`${styles.embla_thumbs__slide}`}>

        <img
          className={`${props.thumbnailImgClass ? props.thumbnailImgClass : ""} ${styles.thumbnail} imageModal `}
          src={isNextJS == true ? getThumbnailImgSrcNext(img, index) : getThumbnailImgSrc(img, index)}
          alt={img.alt}
          onLoad={() => setImagesLoaded(true)}
          style={
            slideIndex === index
              ? { border: thumbnailBorder }
              : { border: inactiveThumbnailBorder }
          }
          key={"thumbnail_" + index}
          onClick={() => {
            navigationClick(index);
          }}
        />
      </div>
    )
  }

  const handleError = (event, index) => {
    if (props.onImgError) {
      props.onImgError(event, images[slideIndex], index);

    }
  }

  const resetImage = () => {
    if (enableMagnifyingGlass) {
      initMagnifyingGlass()
    } else {
      if (zoomReferences.current[zoomIdx] != null) {
        zoomReferences.current[zoomIdx]!.resetTransform()
      }
    }
  }

  const getThumbnailImgSrc = (img, index) => {

    if (props.images && props.images.length > 0) {
      if (props.images[index].thumbnailSrc) {
        return props.images[index].thumbnailSrc
      }
    }

    if (isVideo(index) && img.thumbnail) {
      return img.thumbnail
    }
    else {
      return img.src
    }
  }

  const getThumbnailImgSrcNext = (img, index) => {
    if (img.thumbnailSrc) {
      return img.thumbnailSrc
    }

    else if (isVideo(index)) {
      return img.thumbnail
    } else {
      let img_src = img.src
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
  }

  const isAnimImageComponent = () => {
    if (images) {
      if (images.length == 1) {
        return true;
      }
    }
    return false;
  }

  const initWrapperClassname = () => {

    let classNameStr = "";
    if (props.className) {
      classNameStr += `${props.className} `
    }
    if (isAnimImageComponent()) {
      if (props.imgWrapperClassName) {
        classNameStr += `${props.imgWrapperClassName} `
      }
    }

    classNameStr += `${styles.lightboxjs}`;

    return classNameStr;
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

  const getMetadataPanel = () => {

    let imgMetadataItem = imgMetadata[slideIndex];

    if (imgMetadataItem) {
      let element = <div className={styles.metadataPanel}>
        <b>Filename</b>
        {imgMetadataItem.name ? <p>{imgMetadataItem.name}</p> : null}

        {imgMetadataItem.createDate ?
          <div>
            <b>Captured Time</b>
            <p>{imgMetadataItem.createDate.toString()}</p>
          </div>

          : null}

        {
          imgMetadataItem.width && imgMetadataItem.height ?
            <div>
              <b>Resolution</b>
              <p>{imgMetadataItem.width}*{imgMetadataItem.height}</p>
            </div> : null
        }

        {imgMetadataItem.isoData || imgMetadataItem.fNumber || imgMetadataItem.shutterSpeed ?
          <div>
            <b>Image Details</b>
            {
              imgMetadataItem.isoData ? <span>ISO {imgMetadataItem.isoData}</span>
                : null
            }

            {
              imgMetadataItem.fNumber ? <span>f{imgMetadataItem.fNumber}</span> : null
            }

            {
              imgMetadataItem.shutterSpeed ? <span>Shutter speed: {imgMetadataItem.shutterSpeed}</span> : null
            }
          </div> : null

        }


      </div>
      return element;
    }

  }

  const imageSlideElement = (index) => {
    let imageElem;
    if (!props.images) {
      imageElem = (
        <img
          className={`imageModal ${styles.embla__slide__img}
        ${props.fullScreen
              ? styles.fullScreenLightboxImg
              : styles.lightbox_img
            } 
        ${enableMagnifyingGlass
              ? styles.maxWidthFull
              : styles.maxWidthWithoutMagnifier
            } `}
          style={getImageStyle()}
          ref={imageRef}
          loading='lazy'
          src={
            images[index].original ? images[index].original : images[index].src
          }
          onError={(event) => {
            handleError(event, index)
          }}
          onLoad={(img) => {
            if (index == slideIndex) {
              setDisplayLoader(false)
            }

            if (props.images) {
              setItemLoaded(index)
            } else {
              setImagesItemLoaded(index)
            }

          }}
          id='img'
        />

      )
    } else if (props.images && props.render) {
      imageElem = props.render.imgSlide(props.images[index])
    } else {
      let img_link

      // check if object (Next.js local image imports are passed as objects with a src attribute)
      if (props.images) {
        if (
          typeof images[index].src === 'object' &&
          !Array.isArray(images[index].src) &&
          images[index].src !== null
        ) {
          img_link = images[index].src?.src
        } else if (props.coverImageInLightbox == true) {
          img_link = images[index].src
        } else {
          img_link = images[index].src
        }
      }


      imageElem = (
        <img
          className={`imageModal ${styles.embla__slide__img}
        ${props.fullScreen
              ? styles.fullScreenLightboxImg
              : styles.lightbox_img
            } 
        ${enableMagnifyingGlass
              ? styles.maxWidthFull
              : styles.maxWidthWithoutMagnifier
            } `}
          ref={imageRef}
          loading='lazy'
          style={getImageStyle()}
          src={
            images[index].original
              ? images[index].original
              : img_link
          }
          onError={(event) => {
            handleError(event, index)
          }}
          onLoad={(img) => {
            if (index == slideIndex) {
              setDisplayLoader(false)
            }

            if (props.images) {
              setItemLoaded(index)
            } else {
              setImagesItemLoaded(index)
            }

          }}
          id='img'
        />
      )
    }

    return imageElem
  }

  const isPanningDisabled = () => {
    if (isMobile && zoomedIn == false) {
      return true;
    }
    if (isMobile && zoomedIn) {
      return false;
    }

    return false;
  }

  const getImageFilename = (img_src) => {
    let img_src_split = img_src.split("/");
    let name = img_src_split[img_src_split.length - 1];
    return name;
  }

  const parseCreateDate = (js_date) => {

    if (js_date) {
      let date = js_date.getDate();
      let month = js_date.getMonth() + 1;
      let year = js_date.getFullYear();
      let time = js_date.toLocaleTimeString(metadataLocale);

      return '' + year + '-' + (month <= 9 ? '0' + month : month) + '-' + (date <= 9 ? '0' + date : date) + ` ${time}`;
    }
    return ""
  }

  const getLightboxElem = (index) => {
    if (isCustomEmbed(index)) {
      return customEmbedElement(index)
    }
    else if (isVideo(index)) {
      return videoSlideElement(index)
    }
    else if (isPictureElement(index)) {
      let elem_metadata = props.images[index]["picture"];
      return <picture className={`imageModal 
      ${props.fullScreen
          ? styles.fullScreenLightboxImg
          : styles.lightbox_img
        } 
      ${enableMagnifyingGlass
          ? styles.maxWidthFull
          : styles.maxWidthWithoutMagnifier
        } `}>
        {Object.keys(elem_metadata).map((format) => (
          <source
            type={format}
            key={format}
            srcSet={elem_metadata[format].srcSet}
          />
        ))}
        <img src={elem_metadata['fallback']}
          onError={(error) => {
            handleError(error, index)
          }}
        />
      </picture>
    }
    else {

      if ((images && props.render) ||
        frameworkID == 'next') {
        return imageSlideElement(index);
      }
      else {
        return <img
          className={`imageModal ${styles.embla__slide__img}
          ${props.fullScreen
              ? styles.fullScreenLightboxImg
              : styles.lightbox_img
            } 
          ${enableMagnifyingGlass
              ? styles.maxWidthFull
              : styles.maxWidthWithoutMagnifier
            } `}
          ref={imageRef}
          key={index}
          loading='lazy'
          style={getImageStyle()}
          src={
            images && images[index].original
              ? images[index].original
              : images[index].src
          }
          onLoad={(img: any) => {

            if (displayImgMetadata) {

              if (img) {
                let img_target: any = img.target;
                let individual_image_metadata = {};

                // get filename
                let name = getImageFilename(img_target.src)
                individual_image_metadata["name"] = name;

                exifr.parse(img_target, true).then(exif => {
                  if (exif) {
                    let keys = ["isoData", "createDate", "height", "width", "shutterSpeed", "fNumber"];

                    for (let i = 0; i < keys.length; i++) {
                      let keyName = keys[i];
                      switch (keyName) {
                        case "isoData":
                          if (exif.ISO) {
                            individual_image_metadata["isoData"] = exif.ISO;
                          }
                          break;
                        case "createDate":
                          if (exif.CreateDate) {
                            individual_image_metadata["createDate"] = parseCreateDate(exif.CreateDate);
                          }
                          break;
                        case "height":
                          if (exif.ExifImageHeight) {
                            individual_image_metadata["height"] = exif.ExifImageHeight;
                          }
                          break;
                        case "width":
                          if (exif.ExifImageWidth) {
                            individual_image_metadata["width"] = exif.ExifImageWidth;
                          }
                          break;
                        case "fNumber":
                          if (exif.fNumber) {
                            individual_image_metadata["fNumber"] = exif.fNumber;
                          }
                          break;
                        case "shutterSpeed":
                          if (exif.ShutterSpeedValue) {
                            individual_image_metadata["shutterSpeed"] = exif.ShutterSpeedValue;
                          }
                          break;
                      }
                    }

                    let imgMetadataItems = imgMetadata;
                    imgMetadataItems[index] = individual_image_metadata;
                    setImgMetadata(imgMetadataItems);

                    if (index == slideIndex) {
                      setIsLoading(false)
                    }
                  }

                }
                )
              }
            }

            if (index == slideIndex) {
              setDisplayLoader(false)
            }

            if (props.images) {
              setItemLoaded(index)
            } else {
              setImagesItemLoaded(index)
            }
          }}
          id='img'
        />

      }
    }
  }

  const isCustomEmbed = (index) => {

    if (props.images) {
      let elem = props.images[index]
      if (elem) {
        if (elem.type == 'customEmbed') {
          return true
        }
      }
    }
    return false
  }

  const isVideo = (index) => {

    if (props.images) {
      let elem = props.images[index]
      if (elem) {
        if (elem.type == 'yt' || elem.type == 'htmlVideo' || elem.type == 'customVideoEmbed') {
          return true
        }
      }
    }

    return false
  }

  const shouldDisplayMetadataPanel = () => {
    if (isMobile) {
      if (showImgMetadataPanel) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return displayImgMetadata;
    }
  }

  const isPictureElement = (index) => {
    if (props.images) {
      let elem = props.images[index]
      if (elem) {
        if (elem.picture) {
          return true
        }
      }
    }

    return false
  }

  useEffect(() => {
    if (!emblaApi) return

    if (imgAnimation == "fade") {
      emblaApi.internalEngine().translate.toggleActive(false);
    }

  }, [
    carouselReady, emblaApi
  ])

  const isHTMLVideo = (index) => {
    if (props.images) {
      if (props.images && props.images[index].type == 'htmlVideo') {
        return true
      }
    }

    return false
  }

  const videoSlideElement = (index) => {
    let elem = props.images[index];
    let videoElem;

    if (elem.type == 'yt') {
      videoElem = (
        <div className={`${styles.videoOuterContainer} imageModal`}>
          <YouTube
            videoId={elem.videoID}
            ref={(el) => (videoReferences.current[index] = el)}
            iframeClassName={`${styles.ytVideo}`}
            title='YouTube video player'
            opts={{
              height: getVideoHeight(elem),
              width: getVideoWidth(elem),
              playerVars: {
                // https://developers.google.com/youtube/player_parameters
                autoplay: shouldAutoplay(elem) ? 1 : 0,
              }
            }
            }
            // style={object}
            // className={`${styles.ytVideo}`}
            //loading={string}                     
            onReady={(event) => {
              let videoElems = videoElements; videoElems[index] = event; setVideoElements(videoElems);
              if (index == slideIndex) {
                setDisplayLoader(false)
              }
              setItemLoaded(index)
            }}
            onPlay={(event) => {
              setYTVideoCurrentlyPlaying(true)
            }}
            onPause={(event) => {
              setYTVideoCurrentlyPlaying(false)
            }}
            onEnd={(event) => { setYTVideoCurrentlyPlaying(false) }}
            onError={(event) => { handleError(event, index) }}
            onStateChange={(event) => { }}
            onPlaybackRateChange={(event) => { }}
            onPlaybackQualityChange={(event) => { }}
          />
        </div>
      )
    } else if (elem.type == 'htmlVideo') {
      videoElem = (
        <div
          className={`${styles.htmlVideo} ${styles.htmlVideoOuterContainer} imageModal`}
        >
          <video
            className={`${styles.cursorPointer} ${styles.lightboxVideo}`}
            width={getVideoWidth(elem)}
            ref={(el) => (videoReferences.current[index] = el)}
            onPlay={() => {
            }}
            onError={(event) => {
              handleError(event, index)
            }}
            height={getVideoHeight(elem)}
            autoPlay={index == imgSlideIndex ? shouldAutoplay(elem) : false}
            controls
          >
            <source
              src={elem.videoSrc}
              type='video/mp4'
              onLoad={() => {
                setItemLoaded(index)
              }}
            />
          </video>
        </div>
      )
    }
    else if (elem.type == "customVideoEmbed") {
      videoElem = (
        <div className={`${styles.customVideoContainer} imageModal`}>
          {elem.embed}
        </div>
      )
    }

    return videoElem
  }

  const customEmbedElement = (index) => {
    let elem = props.images[index];
    let customElem;

    if (elem.type == "customEmbed") {
      customElem = (
        <div className={`${styles.customEmbedContainer} imageModal`}>
          {elem.embed}
        </div>
      )
    }

    return customElem
  }

  const initZoom = (ref) => {

    if (ref.state.scale <= 1.65) {
      setZoomedIn(false)
    }
    else {
      setZoomedIn(true)
    }
  }

  const regularImgPaneNodes = Array.apply(null, Array(images.length)).map(
    (_, index) => {
      return (
        <div key={index}>
          {
            enableMagnifyingGlass == true ? (
              <Magnifier
                src={images[index].src!}
                className={`${styles.magnifyWrapper} ${styles.lightbox_img}`}
                height={imgContainHeight}
                width={imgContainWidth}
                mgShowOverflow={false}
              />
            )

              : (
                <div className={getEmblaClass(index)}>

                  <TransformWrapper
                    ref={(el) => (zoomReferences.current[index] = el)}
                    onWheel={(ref, wheelEvent) => {
                      initZoom(ref)
                    }}
                    disabled={disableZoom}
                    panning={{
                      disabled: isPanningDisabled()
                    }}

                    key={index}
                    onZoom={
                      (ref, event) => {
                        initZoom(ref)
                      }
                    }
                    onZoomStop={(ref, event) => { initZoom(ref) }}
                    onTransformed={
                      (ref, event) => {
                        initZoom(ref)
                      }
                    }
                    onPinchingStop={(ref, event) => {
                      initZoom(ref)
                    }}
                    centerZoomedOut={true}
                    initialScale={1}
                    maxScale={maxScale}
                    alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
                  >
                    <TransformComponent
                      wrapperClass={styles.react_transform_wrapper}
                      contentClass={styles.react_transform_component}
                      wrapperStyle={{
                        maxWidth: '100vw',
                        height: '100vh',
                        margin: 'auto'
                      }}
                      contentStyle={
                        props.fullScreen
                          ? {
                            maxWidth: '100vw',
                            height: '100vh',
                            marginLeft: 'auto',
                            marginRight: 'auto'
                          }
                          : {
                            maxWidth: '100vw',
                            height: '100vh',
                            margin: 'auto',
                            display: 'grid'
                          }
                      }
                      key={index}
                    >
                      <div
                        className={`${props.fullScreen
                          ? styles.slideshow_img_fullscreen
                          : styles.slideshow_img
                          } ${props.lightboxImgClass ? props.lightboxImgClass : ""}
                      ${displayImgMetadata ? styles.slideshow_img_metadata : ""}
                      `}
                      >
                        {getLightboxElem(index)}
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

  // const shouldShowImgMetadataPanel = () => {
  //   if (displayImgMetadata && showImgMetadataPanel) {
  //     return true;
  //   }
  //   return false;
  // }

  const getMetadataPanelStyle = () => {
    let style_object = {}
    if (isMobile && showImgMetadataPanel) {
      style_object = { height: "100vh" }
    }
    style_object["color"] = getMetadataTextColor()
    return style_object;
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

  const initFullScreenChangeEventListeners = () => {
    document.addEventListener('fullscreenchange', exitFullScreenHandler)
    document.addEventListener('webkitfullscreenchange', exitFullScreenHandler)
    document.addEventListener('MSFullscreenChange', exitFullScreenHandler)
    document.addEventListener('mozfullscreenchange', exitFullScreenHandler)
  }

  const removeFullScreenChangeEventListeners = () => {
    document.removeEventListener('fullscreenchange', exitFullScreenHandler)
    document.removeEventListener(
      'webkitfullscreenchange',
      exitFullScreenHandler
    )
    document.removeEventListener('MSFullscreenChange', exitFullScreenHandler)
    document.removeEventListener('mozfullscreenchange', exitFullScreenHandler)
  }

  const initEventListeners = () => {
    if (isBrowser()) {
      window.addEventListener('resize', handleWindowResize)
    }
  }

  const removeEventListeners = () => {
    removeOnSelectListener();
    if (isBrowser()) {
      window.removeEventListener('resize', handleWindowResize)
    }
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
    let reducedMotionMediaQuery: any = ''

    if (isBrowser()) {
      reducedMotionMediaQuery = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      )

      if (!reducedMotionMediaQuery || reducedMotionMediaQuery.matches) {
        setImgAnimation('fade')
      }

      if (reducedMotionMediaQuery?.addEventListener) {
        reducedMotionMediaQuery.addEventListener('change', setReducedMotion(reducedMotionMediaQuery));
      } 
      else {
        reducedMotionMediaQuery.addListener(setReducedMotion(reducedMotionMediaQuery));
      }

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
      if (props.showControls == false) {
        setDisplayMagnificationIcons(false)
      }
    }

    initPropsForControlIcons()

    if (props.disableImageZoom) {
      setDisableZoom(props.disableImageZoom)
    }

    if (isBrowser()) {
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

    // Delay in milliseconds or null to stop it
    isSlideshowPlaying ? slideshowInterval : null
  )

  const openFullScreen = (lightbox_elem) => {
    if (lightbox_elem.requestFullscreen) {
      lightbox_elem.requestFullscreen();
    }

    /* Safari */
    else if (lightbox_elem.webkitRequestFullscreen) {
      lightbox_elem.webkitRequestFullscreen();
    }

    /* Internet Explorer */
    else if (lightbox_elem.msRequestFullscreen) {
      lightbox_elem.msRequestFullscreen();
    }
  }

  const closeFullScreen = (document) => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }

    /* Safari */
    else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }

    /* Internet Explorer */
    else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  const isBrowser = () => typeof window !== "undefined"

  const initRTLImages = () => {
    // flip images array
    let imagesMetadataCopy = props.images
    imagesMetadataCopy.reverse()

    setImages(imagesMetadataCopy)

    if (images.length > 0) {
      let imagesRTLCopy = images
      imagesRTLCopy.reverse()
      setImages(imagesRTLCopy)
    }
  }

  const initImages = (isMounted, updateImages) => {

    if (coverMode && props.images) {
      if (props.coverImageInLightbox == false) {
        let filterImages = props.images.filter((img) => img.cover != true)
        setImages(filterImages)
      } else {
        setImages(props.images)
      }
    }

    if (updateImages || !isInit) {
      if (lightboxIdentifier && props.children) {

        let img_gallery: NodeListOf<HTMLImageElement> = document.querySelectorAll(
          `[data-lightboxjs=${lightboxIdentifier}]`
        )
        let originalImageAttr = false;

        let img_elements: ImageElement[] = []
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
                  reactSwipeOptionConfig.startIndex = index

                  if (isMounted) setReactSwipeOptions(reactSwipeOptionConfig)
                  setZoomIdx(index)
                  openModal(index)
                },
                false
              )
              img.classList.add('cursor-pointer')

              let original_img_src = img.getAttribute('data-lightboxjs-original')

              if (original_img_src) {
                img_elements.push({
                  src: original_img_src,
                  alt: img.alt,
                  loaded: false
                })
                originalImageAttr = true;
              }
              else if (img.src) {
                img_elements.push({
                  src: img.src,
                  alt: img.alt,
                  loaded: false
                })
              } else if (img.tagName == 'DIV') {
                let corresponding_img_item = props.images[i]
                let img_src = corresponding_img_item.src
                let img_alt = corresponding_img_item.alt
                img_elements.push({
                  src: img_src,
                  alt: img_alt,
                  loaded: false
                })
              }
            }
          }
          if (isMounted && !coverMode) {
            if (originalImageAttr) {
              setImages(img_elements)

            }
            else if (props.showAllImages != true && props.framework != "next") {
              setImages(img_elements)
            }
            else if (props.framework == "next" && !originalImageAttr) {
              setImages(props.images)
            }
            else {
              setImages(props.images)
            }
          }
        }
        else {
          if (props.images) {
            setImages(props.images)
          }
        }
      }
      else if (lightboxIdentifier && props.images && !props.children) {
        setImages(props.images)

      }
      else if (!lightboxIdentifier && props.images && !props.children) {
        setImages(props.images)
      }

      // otherwise, if no lightbox identifier or custom render method
      else if (!props.render) {
        let imgArray: any = [];
        // only one image
        if (!Array.isArray(props.children)) {
          imgArray.push(props.children);
        }

        // multiple images
        else {
          imgArray = props.children;
        }

        let imgs: ImageElement[] = []
        for (let k = 0; k < imgArray.length; k++) {
          let img_elem = imgArray[k]
          let img_obj = {
            src: img_elem.props.src,
            alt: img_elem.props.alt,
            loaded: false
          }
          imgs.push(img_obj)
        }
        if (isRTL) {
          imgs.reverse()
        }
        if (isMounted) setImages(imgs)

        setPreviewImageElems(imgArray)

      } else {
        if (isMounted) {
          setImages(props.images);
        }
      }

      if (isMounted) setIsInit(true)
    }
  }

  const dispatchSlideSelectEvents = (newIndex, prevIndex) => {

    if (newIndex == 0 && prevIndex == images.length - 1) {
      dispatchNextImgEvent(newIndex)
    }
    else if (newIndex == images.length - 1 && prevIndex == 0) {
      dispatchPrevImgEvent(newIndex)
    }

    else if (newIndex > prevIndex) {
      dispatchNextImgEvent(newIndex)
    }
    else if (newIndex < prevIndex) {
      dispatchPrevImgEvent(newIndex)
    }

  }

  const onSelect = useCallback(() => {

    if (!emblaApi) return

    let newSlideIndex: any = emblaApi.selectedScrollSnap();
    let prevSlideIndex: any = emblaApi.previousScrollSnap();

    if (newSlideIndex != prevSlideIndex) {
      initSlide(newSlideIndex);
      resetMedia(prevSlideIndex);
      dispatchSlideSelectEvents(newSlideIndex, prevSlideIndex)
    }

    if (emblaThumbsApi) {
      emblaThumbsApi.scrollTo(emblaApi.selectedScrollSnap())
    }

  }, [emblaApi, emblaThumbsApi])

  const onReinit = useCallback(() => {
    if (!emblaApi) return
    setEmblaReinitialized(true)

  }, [emblaApi, emblaReinitialized])


  const handleResize = (entry) => {
    emblaApi?.reInit();
  };

  const rootNode = emblaApi?.rootNode() || null;

  useResizeObserver(rootNode, handleResize);

  const removeOnSelectListener = useCallback(() => {
    if (emblaApi) emblaApi.off('select', onSelect)
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (emblaApi) {
      if (zoomedIn) {
        emblaApi.reInit({ watchDrag: false });
      }
      else {
        emblaApi.reInit({ watchDrag: true });
      }
    }
  }, [zoomedIn])

  useEffect(() => {
    if (displayImgMetadata) {
      if (width != 0 && isMobile) {
        setShowImgMetadataPanel(false)
      }
      else {
        setShowImgMetadataPanel(true)
      }
    }

  }, [width])

  useEffect(() => {
    if (!emblaApi) return

    if (showModal) emblaApi.reInit()
  }, [showModal, emblaApi])

  useEffect(() => {
    if (emblaApi) emblaApi.on('select', onSelect)
    if (emblaApi) { }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (emblaApi) emblaApi.on('reInit', onReinit)
  }, [emblaApi, onReinit])

  // update theme if prop changes
  useEffect(() => {
    initStyling();
    if (props.iconColor) { setIconColor(props.iconColor) }
    if (props.backgroundColor) { setBackgroundColor(props.backgroundColor) }

  }, [props.theme, props.iconColor, props.backgroundColor]);

  useEffect(() => {
    initImages(true, true)
  }, [props.images, props.displayedImages]);

  const prevValue = usePrevious(open);
  const prevImages: any = usePrevious(images);

  const areObjectsEqual = (object1, object2) =>
    typeof object1 === 'object' && object1 != null && typeof object2 === 'object' && object2 != null
      && Object.keys(object1).length > 0
      ? Object.keys(object1).length === Object.keys(object2).length
      && Object.keys(object1).every(p => areObjectsEqual(object1[p], object2[p]))
      : object1 === object2;

  const imagesEqualToPrevious = (images: any) => {
    if (images && prevImages) {
      if ((images && images?.length) != (prevImages && prevImages?.length)) {
        return false;
      }

      let imgArray;
      if (images.length > prevImages) {
        imgArray = images;
      }
      else {
        imgArray = prevImages
      }
      for (let i = 0; i < imgArray.length; i++) {
        let images_copy = images.slice(0);
        let prevImages_copy = prevImages.slice(0);

        let image = images_copy[i];
        let prevImage = prevImages_copy[i];

        if (image["loaded"]) {
          delete image["loaded"]
        }

        if (prevImage["loaded"]) {
          delete prevImage["loaded"]
        }

        if (!areObjectsEqual(image, prevImage)) {
          return false;
        }

      }
    }
    return true;
  }

  useEffect(() => {
    let starting_index = 0;
    if (props.startingSlideIndex) {
      starting_index = wrapNums(0, images.length, props.startingSlideIndex);
      setStartingIndex(starting_index)
    }

    if ((props.open == true) && imagesEqualToPrevious(images) == false && props.startingSlideIndex) {
      if (props.images) {
        setImages(props.images)
      }
      openModalWithSlideNum(starting_index)
    }

    else if ((props.open && prevValue != true)) {
      if (props.images) {
        setImages(props.images)
      }

      setIsDisplay(true)

      openModalWithSlideNum(starting_index)
    }
    else if (props.open == false) {
      setIsDisplay(false)
      closeModal()
    }
  }, [props.open, props.startingSlideIndex, images]);

  useEffect(() => {
    if (isOpen == true) {
      dispatchOpenEvent()
    }
    else {
      dispatchCloseEvent()
    }

  }, [isOpen])

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

    if (coverMode && props.images) {
      if (props.coverImageInLightbox == false) {
        let filterImages = props.images.filter((img) => img.cover != true)
        setImages(filterImages)
      } else {
        setImages(props.images)
      }
    }

    if (isMounted) {
      initEventListeners()
    }

    let reducedMotionMediaQuery = checkAndInitReducedMotion()

    if (displayImgMetadata) {
      setImgAnimation("fade")
    }

    if (!isInit) {

      initImages(isMounted, false);

      if (props.images && isRTL == true) {
        initRTLImages();
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

  return <div>
    <div className={`${initWrapperClassname()}`}>
      {props.images && props.children && lightboxIdentifier == false
        ? props.children
        : null}

      {props.images && lightboxIdentifier == false
        ? props.images.map((elem, index) => (
          <img
            className={`${props.imgClassName ? props.imgClassName : ''
              } ${styles.cursorPointer}`}

            src={!isVideo(index) ? elem.src : elem.thumbnail}
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
          />
        ))
        : null}

      {/* IF Lightbox identifier provided or props.images provided AND props.children */}
      {lightboxIdentifier != false && props.children && coverMode == false
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
              className={`${elem.props.className ? elem.props.className : ''
                } ${styles.cursorPointer}`}
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
            />
          ))}

      {coverMode ? props.children : false}

      <AnimateSharedLayout type='crossfade'>

        <AnimatePresence initial={false} exitBeforeEnter={true}>
          {showModal !== false && (
            <Portal>
              <Div100vh>
                <motion.div
                  className={`${styles.slideshowAnimContainer}`}
                  key='slideshowAnimContainer'
                  id='slideshowAnim'
                  style={{
                    backgroundColor: backgroundColor,
                  }}
                  initial={"inactive"}
                  variants={variants}
                  animate={showModal ? "active" : "inactive"}
                  exit={"inactive"}
                  transition={
                    { duration: "0.3" }
                  }
                  onAnimationComplete={() => {
                    let animEntered = !animationEntered;
                    setAnimationEntered(animEntered);

                    if (animEntered == true) {
                      let prevFocusedElement: any = document.activeElement;
                      setPrevFocusedElem(prevFocusedElement)

                      document.getElementById("lightboxContainer")?.focus();
                    }
                    else {
                      prevFocusedElem?.focus();
                    }
                    if (emblaApi) emblaApi.reInit()
                  }}

                >
                  <div className={`${styles.lightboxContainer}`} id="lightboxContainer" tabIndex={-1} role="dialog"
                    onClick={(e) => { if (modalCloseOption == "clickOutside") { checkModalClick(e) } }}>
                    <section
                      className={`${styles.iconsHeader} ${iconColor ? '' : getIconStyle()
                        } imageModal`}
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
                        onKeyHandle={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
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
                        onKeyHandle={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (!isBrowserFullScreen) {
                            closeModal()
                          }
                        }}
                      />

                      {showControls == true && (
                        <div className={`${styles.controls}`}>
                          {disableZoom ||
                            displayMagnificationIcons == false ? null :
                            <motion.div>
                              <button onClick={() => {
                                if (enableMagnifyingGlass) {
                                  initMagnifyingGlass()
                                }
                                if (zoomReferences.current[zoomIdx] != null) {
                                  zoomReferences.current[zoomIdx]!.zoomIn()
                                }
                                setZoomedIn(true)
                              }}>
                                <ZoomIn
                                  size={24}
                                  color={iconColor ? iconColor : undefined}
                                  className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                                    }`}
                                  style={iconColor ? { color: iconColor } : {}}
                                />
                              </button>

                            </motion.div>
                          }

                          {disableZoom ||
                            displayMagnificationIcons == false ? null :
                            <motion.div>
                              <button
                                onClick={() => {
                                  zoomReferences.current[zoomIdx]!.zoomOut();
                                  let scale = zoomReferences.current[zoomIdx]!.state.scale;

                                  if (scale == 1 || scale == 1.65) {
                                    setZoomedIn(false)
                                  }

                                }}>
                                <ZoomOut
                                  size={24}
                                  className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                                    }`}
                                  style={iconColor ? { color: iconColor } : {}}
                                  color={iconColor ? iconColor : undefined}

                                />
                              </button>

                            </motion.div>
                          }

                          {displayDownloadBtn() ? (
                            <button
                              onClick={() => {
                                saveImage()
                              }}>
                              <Download
                                size={24}
                                className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                                  }`}
                                style={iconColor ? { color: iconColor } : {}}
                                color={iconColor ? iconColor : undefined}

                              />
                            </button>

                          ) : null}

                          {displayFullScreenIcon ? (
                            isBrowserFullScreen ? (
                              <motion.div>
                                <button
                                  onClick={() => {
                                    isBrowserFullScreen
                                      ? exitFullScreen()
                                      : fullScreen()
                                  }}>
                                  <FullscreenExit
                                    size={24}
                                    className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                                      }`}
                                    style={iconColor ? { color: iconColor } : {}}
                                    color={iconColor ? iconColor : undefined}

                                  />
                                </button>

                              </motion.div>
                            ) : (
                              <motion.div>
                                <button onClick={() => {
                                  isBrowserFullScreen
                                    ? exitFullScreen()
                                    : fullScreen()
                                }}>
                                  <Fullscreen
                                    size={24}
                                    className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                                      }`}
                                    style={iconColor ? { color: iconColor } : {}}
                                    color={iconColor ? iconColor : undefined}

                                  />
                                </button>

                              </motion.div>
                            )
                          ) : null}

                          {isMobile && displayImgMetadata ?
                            <motion.div>
                              <button onClick={() => {
                                setShowImgMetadataPanel(!showImgMetadataPanel)
                                setDisplayLoader(false)
                              }}>
                                <InfoCircle
                                  size={24}
                                  className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                                    }`}
                                  style={iconColor ? { color: iconColor } : {}}
                                  color={iconColor ? iconColor : undefined}
                                />
                              </button>

                            </motion.div> : null}

                          {displayThumbnailIcon ? (
                            <motion.div>
                              <button
                                onClick={() => {
                                  setShowThumbnails(!showThumbnails)
                                }}>
                                <GridFill
                                  size={24}
                                  className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                                    }`}
                                  style={iconColor ? { color: iconColor } : {}}
                                  color={iconColor ? iconColor : undefined}

                                />
                              </button>

                            </motion.div>
                          ) : null}

                          {shouldDisplayMagnifyingGlassIcon() ? (
                            <motion.div>
                              <button
                                onClick={() => initMagnifyingGlass()}
                              >
                                <Search
                                  size={24}
                                  className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                                    }`}
                                  style={iconColor ? { color: iconColor } : {}}
                                  color={iconColor ? iconColor : undefined}
                                />
                              </button>

                            </motion.div>
                          ) : null}

                          {shouldDisplaySlideshowIcon() ? (
                            <motion.div className={styles.slideshowPlayBtn}>
                              {isSlideshowPlaying ? (
                                <button onClick={() => {
                                  isSlideshowPlaying
                                    ? stopSlideshow()
                                    : playSlideshow()
                                }}>
                                  <PauseCircleFill
                                    size={24}
                                    className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                                      }`}
                                    style={iconColor ? { color: iconColor } : {}}
                                    color={iconColor ? iconColor : undefined}

                                  />
                                </button>

                              ) : (
                                <button onClick={() => {
                                  isSlideshowPlaying
                                    ? stopSlideshow()
                                    : playSlideshow()
                                }}>
                                  <PlayCircleFill
                                    size={24}
                                    className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                                      }`}
                                    style={iconColor ? { color: iconColor } : {}}
                                    color={iconColor ? iconColor : undefined}

                                  />
                                </button>

                              )}
                            </motion.div>
                          ) : null}

                          {customControlComponent ? <motion.div>{customControlComponent}</motion.div> : null}
                        </div>
                      )}
                      <motion.div className={`${styles.closeIcon} ${props.showControls == false ? styles.mlAuto : ""}`}>
                        <button id="closeBtn" className={styles.closeButton}
                          onClick={() => {
                            closeModal()
                          }}>
                          <XLg
                            id="closeIcon"
                            size={24}
                            className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                              }`}
                            color={iconColor ? iconColor : undefined}
                            style={iconColor ? { color: iconColor } : {}}
                          />
                        </button>

                      </motion.div>
                    </section>
                    {displayArrows() ?

                      <div>
                        <div
                          className={
                            rightArrowStyle
                              ? `${styles.next1} ${getArrowStyle()} imageModal`
                              : "imageModal"
                          }
                          style={rightArrowStyle}
                          onClick={() => {
                            nextSlide()
                          }}
                        >
                          {nextArrowElem ? nextArrowElem :
                            <span className={`${props.rightArrowClassname ? props.rightArrowClassname : ""}`}>&#10095;</span>
                          }
                        </div>
                        <div
                          className={
                            leftArrowStyle
                              ? `${styles.prev1} ${getArrowStyle()} imageModal ${displayImgMetadata ? styles.prev1_metadata : ""}`
                              : "imageModal"
                          }
                          style={leftArrowStyle}
                          onClick={() => {
                            prevSlide()
                          }}
                        >
                          {prevArrowElem ? prevArrowElem :
                            <span className={`${props.leftArrowClassname ? props.leftArrowClassname : ""}`}>&#10094;</span>
                          }
                        </div>
                      </div>
                      : null
                    }

                    <AnimatePresence initial={false} custom={direction}>

                      <div
                        className={`${styles.slideshowInnerContainerThumbnails
                          } ${styles.embla} ${isImageCaption() ? styles.slideImageAndCaption : ''
                          } 
                          ${props.fullScreen
                            ? styles.slideshowInnerContainerFullScreen
                            : styles.slideshowInnerContainer
                          } ${displayImgMetadata ? styles.slideshowInnerContainer_imgMetadata : ""}  `}>

                        {shouldDisplayMetadataPanel() ?
                          <div className={styles.metadata}
                            style={getMetadataPanelStyle()}>
                            {isLoading ? null :
                              <div className={styles.metadataInnerContainer}>

                                {getMetadataPanel()}

                                {isMobile && showImgMetadataPanel ?
                                  <button className={styles.imgMetadataCloseBtn}
                                    onClick={() => {
                                      setShowImgMetadataPanel(false)
                                    }}>
                                    <XLg
                                      size={24}
                                      className={`${styles.lightboxjs_icon} ${iconColor ? '' : getIconStyle()
                                        }`}
                                      color={iconColor ? iconColor : undefined}
                                      style={iconColor ? { color: iconColor } : {}}
                                    />
                                  </button> : null
                                }
                              </div>
                            }


                          </div>
                          : null}
                        <div className={`${styles.embla__viewport} 
                            ${displayImgMetadata ? styles.embla__container_imgMetadata : ""}`}
                          ref={showModal ? emblaRef : null}>
                          <div className={`
                          ${imgAnimation == "fade" ? styles.imgfade : ""} 
                          ${styles.embla__container}
                            ${displayImgMetadata ? styles.embla__container_imgMetadata : ""}`}>

                            {regularImgPaneNodes}

                          </div>
                        </div>
                      </div>

                      {displayLoader == true && !isHTMLVideo(slideIndex) ? (
                        <span
                          key='loader'
                          className={`${styles.loader
                            } ${getLoaderThemeClass()}`}
                        ></span>
                      ) : null}
                    </AnimatePresence>

                    <div
                      className={`${styles.thumbnailsOuterContainer} ${isImageCaption() ? styles.thumbnailsAndCaption : ''}
                      ${displayImgMetadata ? styles.thumbnailsOuterContainer_metadata : ""} `}
                      style={
                        isImageCaption()
                          ? {
                            backgroundColor: backgroundColor
                          }
                          : {}
                      }
                    >
                      {isImageCaption() ? (
                        <div className={`${styles.imgTitleContainer} imageModal`}>
                          <p
                            className={`${styles.imgTitle}`}
                            key={'imgCaption' + slideIndex}
                            style={
                              props.captionStyle
                                ? props.captionStyle
                                : { color: textColor }
                            }
                          >
                            {getImageCaption()}
                          </p>
                        </div>
                      ) : null}

                      <AnimatePresence initial={animatedThumbnails}>
                        {showThumbnails !== false && navigationDots !== true && (
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
                            className={`${styles.thumbnails} ${isImageCaption()
                              ? styles.thumbnailsWithCaption
                              : ''
                              }`}
                          >
                            <div className={`${styles.embla_thumbs} ${styles.thumbnails}`}>
                              <div className={styles.embla_thumbs__viewport} ref={emblaThumbsRef}>
                                <div className={styles.embla_thumbs__container}>
                                  {frameworkID == 'next' &&
                                    props.images
                                    ? props.images.map((img, index) => (
                                      getImageThumbnail(img, index, true)
                                    ))
                                    : // Not Next.js
                                    images.map((img, index) => (
                                      getImageThumbnail(img, index, false)
                                    ))}

                                </div>
                              </div>
                            </div>

                          </motion.div>
                        )}

                        {showThumbnails !== true && navigationDots !== false && (
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
                            className={`${styles.thumbnails} ${isImageCaption()
                              ? styles.thumbnailsWithCaption
                              : ''
                              }`}
                          >
                            <div className={`${styles.embla_thumbs} ${styles.thumbnails}`}>
                              <div className={styles.embla_thumbs__viewport} ref={emblaThumbsRef}>
                                <div className={`${styles.navigationDots} ${styles.embla_thumbs__container} imageModal
                                `}>
                                  {frameworkID == 'next' &&
                                    props.images
                                    ? props.images.map((img, index) => (
                                      getNavigationDot(index)
                                    ))
                                    : // Not Next.js
                                    images.map((img, index) => (
                                      getNavigationDot(index)
                                    ))}

                                </div>
                              </div>
                            </div>
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
  </div>

}
)