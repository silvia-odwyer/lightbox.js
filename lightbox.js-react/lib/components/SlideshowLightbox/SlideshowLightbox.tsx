import { AnimatePresence, motion, MotionGlobalConfig } from "framer-motion";
import * as React from "react";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { EscKeyHandlers, IconButton, PictureElem } from "../shared-components";
import { LightboxImage } from "./LightboxImage.jsx";
import styles from "./SlideshowLightbox.module.css";

import {
  checkOutsideClick,
  downloadImage,
  fullScreen,
  getContainerHeight,
  getContainerWidth,
  removeFullScreenChangeEventListeners,
  themes,
  useScrollLock,
  variants,
} from "../shared-utility.js";

import KeyHandler from "@banzai-inc/react-key-handler";
import useResizeObserver from "@react-hook/resize-observer";
import useEmblaCarousel from "embla-carousel-react";
import { ReactNode } from "react";
import {
  ArrowClockwise,
  Download,
  Fullscreen,
  FullscreenExit,
  GridFill,
  InfoCircle,
  PauseCircleFill,
  PlayCircleFill,
  Search,
  XLg,
  ZoomIn,
  ZoomOut,
} from "react-bootstrap-icons";
import Div100vh from "react-div-100vh";
import { createPortal } from "react-dom";
import YouTube from "react-youtube";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import { useInterval } from "usehooks-ts";
import {
  areObjectsEqual,
  closeFullScreen,
  createCustomThumbnailBorder,
  getScale,
  getVideoHeight,
  getVideoWidth,
  shouldAutoplay,
  usePrevious,
  wrapNums,
} from "./utility";
//import exifr from 'exifr'
import { use100vh } from "react-div-100vh";

let thumbnailVariants: any = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 100 },
};

// const activeThumbnailBorder = 'solid rgba(107, 133, 206, 0.6) 2px'
const inactiveThumbnailBorder = "solid transparent 2px";
const delta = 6;
const imgZoomDelta = 2;
const defaultTheme = "night";
const mobileWidth = 768;
const tabletWidth = 1100;

interface SlideItem {
  src?: any;
  original?: string;
  type?: string;
  alt?: string;
  loaded?: boolean;
  thumbnailSrc?: string;
}

interface ImageElement {
  src?: any;
  alt?: string;
  loaded?: boolean;
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
  lightboxHeight?: string;
  lightboxWidth?: string;
  showThumbnails?: boolean;
  open?: boolean;
  displayMetadata?: boolean;
  noWindow?: boolean;
  navigationDots?: boolean;
  animateThumbnails?: boolean;
  queryElems?: any;
  controlsPlacement?: string;
  showFullScreenIcon?: boolean;
  showThumbnailIcon?: boolean;
  showSlideshowIcon?: boolean;
  showMagnificationIcons?: boolean;
  roundedImages?: boolean;
  downloadImages?: boolean;
  singleClickZoom?: boolean;
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
  disableAnim?: any;
  rightArrowStyle?: any;
  leftArrowStyle?: any;
  imgAnimation?: string;
  maxZoomScale?: number;
  textColor?: string;
  licenseKey?: string;
  images?: any;
  render?: any;
  imageComponent?: boolean;
  imgElemClassname?: string;
  showArrows?: boolean;
  showControlsBar?: boolean;
  toggleThumbnailDisplay?: boolean;
  rightSidebarComponent?: any;
  lightboxFooterComponent?: any;
  closeIconBtnStyle?: any;
  controlComponent?: any;
  zoomInComponent?: any;
  zoomOutComponent?: any;
  closeComponent?: any;
  lightboxImgClass?: string;
  iconStyle?: any;
  zoomCursor?: boolean;
  thumbnailImgAnim?: boolean;
  thumbnailImgClass?: string;
  coverImageInLightbox?: boolean;
  captionPlacement?: string;
  onOpen?: any;
  onClose?: any;
  onNext?: any;
  onPrev?: any;
  onSelect?: any;
  onRotate?: any;
  onThumbnailClick?: any;
  onImgError?: any;
  className?: string;
  imgWrapperClassName?: string;
  fullScreenFillMode?: string;
  imgClassName?: string;
  startingSlideIndex?: number;
  rotateIcon?: boolean;
  showAllImages?: any;
  rightArrowClassname?: string;
  leftArrowClassname?: string;
  displayedImages?: any;
  metadataTimeLocale?: string;
  captionStyle?: any;
}

export const SlideshowLightbox: React.FC<SlideshowLightboxProps> =
  React.forwardRef<SlideshowLightboxHandle, SlideshowLightboxProps>(
    (props, ref) => {
      useImperativeHandle(ref, () => ({
        reset() {
          initImages(true, true);
        },
      }));

      const [[imgSlideIndex, direction], setImgSlideIndex] = useState([0, 0]);
      const [showModal, setShowModal] = useState(false);
      const [slideAnimDuration, setSlideAnimDuration] = useState(
        props.slideDuration ? props.slideDuration : 25,
      );
      const [toggleThumbnails, setToggleThumbnails] = useState(
        props.toggleThumbnailDisplay ? props.toggleThumbnailDisplay : false,
      );
      const [controlsPlacement, setControlsPlacement] = useState(
        props.controlsPlacement ? props.controlsPlacement : "default",
      );

      const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
      const [customIconStyle, setCustomIconStyle] = useState(
        props.iconStyle ? props.iconStyle : null,
      );

      const [emblaReinitialized, setEmblaReinitialized] = useState(false);

      const [images, setImages] = useState<SlideItem[]>([]);

      const [previewImageElems, setPreviewImageElems] = useState<any[]>([]);

      const slideIndex = wrapNums(0, images.length, imgSlideIndex);

      const [reactSwipeOptions, setReactSwipeOptions] = useState({
        loop: true,
        startIndex: 0,
        active: true,
        duration: slideAnimDuration,
        dragThreshold: 10,
        skipSnaps: true,
      });

      let initialThumbnailOptions: any = {
        startIndex: 0,
        containScroll: "keepSnaps",
        dragFree: true,
      };

      const [width, setWidth] = useState(0);

      const isMobile = width <= mobileWidth;
      const isTablet = width <= tabletWidth;

      const [thumbnailSwipeOptions, setThumbnailSwipeOptions] = useState(
        initialThumbnailOptions,
      );

      const [carouselReady, setCarouselReady] = useState(false);
      const [isTabletUserAgent, setIsTabletUserAgent] = useState(false);

      const [zoomedIn, setZoomedIn] = useState(false);

      const [fullImg, setFullImg] = useState(false);

      const [isOpen, setIsOpen] = useState(false);

      const [prevFocusedElem, setPrevFocusedElem] =
        useState<HTMLElement | null>(null);
      const [animationEntered, setAnimationEntered] = useState(false);

      const [lightboxModalWidth, setLightboxModalWidth] = useState(
        props.lightboxWidth ? props.lightboxWidth : "100vw",
      );

      const [lightboxModalHeight, setLightboxModalHeight] = useState(
        props.lightboxHeight ? props.lightboxHeight : "100vh",
      );

      const [magnifyingGlassFeature, _setMagnifyingGlassFeature] = useState(
        props.magnifyingGlass ? props.magnifyingGlass : false,
      );

      const [disableZoom, setDisableZoom] = useState(
        props.disableImageZoom ? props.disableImageZoom : false,
      );

      const [slideshowInterval, setSlideshowInterval] = useState(
        props.slideshowInterval ? props.slideshowInterval : 1700,
      );

      const [rightArrowStyle, setRightArrowStyle] = useState(
        props.rightArrowStyle ? props.rightArrowStyle : {},
      );

      const [leftArrowStyle, setLeftArrowStyle] = useState(
        props.leftArrowStyle ? props.leftArrowStyle : {},
      );

      const [maxScale, setMaxScale] = useState<number>(
        props.maxZoomScale ? getScale(props.maxZoomScale, 24) : 8,
      );

      const [isRounded, setIsRounded] = useState(
        props.roundedImages ? props.roundedImages : false,
      );

      const [showControls, setShowControls] = useState<boolean>(
        props.showControls ? props.showControls : true,
      );

      const [displayFullScreenIcon, setDisplayFullScreenIcon] =
        useState<boolean>(
          props.showFullScreenIcon ? props.showFullScreenIcon : true,
        );

      const [displayThumbnailIcon, setDisplayThumbnailIcon] = useState<boolean>(
        props.showThumbnailIcon ? props.showThumbnailIcon : true,
      );

      const [displaySlideshowIcon, setDisplaySlideshowIcon] = useState<boolean>(
        props.showSlideshowIcon ? props.showSlideshowIcon : true,
      );

      const [rotateImgIcon, setRotateImgIcon] = useState<boolean>(
        props.rotateIcon ? props.rotateIcon : false,
      );

      const [displayMagnificationIcons, setDisplayMagnificationIcons] =
        useState<boolean>(
          props.showMagnificationIcons ? props.showMagnificationIcons : true,
        );

      const [nextArrowElem, setNextArrowElem] = useState(
        props.nextArrow ? props.nextArrow : null,
      );

      const [isImageComponent, setImageComponent] = useState(
        props.imageComponent ? props.imageComponent : null,
      );

      const [prevArrowElem, setPrevArrowElem] = useState(
        props.prevArrow ? props.prevArrow : null,
      );

      const [modalCloseOption, setModalCloseOption] = useState(
        props.modalClose ? props.modalClose : "default",
      );

      const [showDownloadBtn, setShowDownloadBtn] = useState(
        props.downloadImages ? props.downloadImages : false,
      );

      const [navigationDots, setNavigationDots] = useState(
        props.showNavigationDots ? props.showNavigationDots : false,
      );

      const [metadataLocale, setMetadataLocale] = useState(
        props.metadataTimeLocale ? props.metadataTimeLocale : "en-US",
      );

      const [isRTL, setIsRTL] = useState(props.rtl ? props.rtl : false);

      const [frameworkID, setFrameworkID] = useState(
        props.framework ? props.framework : "",
      );
      const [lightboxIdentifier, setLightboxIdentifier] = useState(
        props.lightboxIdentifier ? props.lightboxIdentifier : false,
      );
      const [imageFullScreen, setImageFullScreen] = useState(
        props.fullScreen ? props.fullScreen : false,
      );
      const [licenseKey, setLicenseKey] = useState(
        props.licenseKey ? props.licenseKey : "",
      );

      const [displayLoader, setDisplayLoader] = useState(
        props.showLoader ? props.showLoader : false,
      );

      const [isMounted, setIsMounted] = useState(false);
      

      const [pinch, setPinch] = useState(false);
      const [currentZoomScale, setCurrentZoomScale] = useState(1);

      const [startingIndex, setStartingIndex] = useState(
        props.startingSlideIndex ? props.startingSlideIndex : 0,
      );

      const [showZoomCursor, setShowZoomCursor] = useState(
        props.zoomCursor ? props.zoomCursor : false,
      );

      const [zoomCursor, setZoomCursor] = useState("zoom-in");

      const [singleClickZoom, setSingleClickZoom] = useState(
        props.singleClickZoom ? props.singleClickZoom : false,
      );

      // Styling/theming
      const [backgroundColor, setBackgroundColor] = useState(
        props.backgroundColor
          ? props.backgroundColor
          : themes[defaultTheme].background,
      );
      const [iconColor, setIconColor] = useState(
        props.iconColor ? props.iconColor : null,
      );
      const [textColor, setTextColor] = useState(
        props.textColor ? props.textColor : themes[defaultTheme].textColor,
      );
      const [showControlsBar, setShowControlsBar] = useState(
        props.showControlsBar ? props.showControlsBar : true,
      );

      const [imgCaptionPlacement, setImgCaptionPlacement] = useState(
        props.captionPlacement ? props.captionPlacement : "below",
      );

      const [coverMode, setCoverMode] = useState(
        props.useCoverMode ? props.useCoverMode : false,
      );

      const [displayImgMetadata, setDisplayImgMetadata] = useState(
        props.displayMetadata ? props.displayMetadata : false,
      );

      const [showImgMetadataPanel, setShowImgMetadataPanel] = useState(false);

      const [imgMetadata, setImgMetadata] = useState({});

      const [showThumbnails, setShowThumbnails] = useState(
        props.showThumbnails ? props.showThumbnails : false,
      );
      const [animatedThumbnails, setAnimatedThumbnails] = useState(
        props.animateThumbnails ? props.animateThumbnails : true,
      );
      const [imgAnimation, setImgAnimation] = useState(
        props.imgAnimation ? props.imgAnimation : "imgDrag",
      );
      const [arrowStyle, setArrowStyle] = useState(
        props.arrowStyle ? props.arrowStyle : "dark",
      );

      const div100vhHeight = use100vh();
      const lboxHeight =
        lightboxModalHeight == "100vh" ? div100vhHeight : lightboxModalHeight;

      const [YTVideoCurrentlyPlaying, setYTVideoCurrentlyPlaying] =
        useState(false);

      const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false);
      const [enableMagnifyingGlass, setMagnifyingGlass] = useState(false);
      const [imagesLoaded, setImagesLoaded] = useState(false);
      const [resolvedSrcs, setResolvedSrcs] = useState({
        full: {},
        thumbnail: {},
      });

      const imageRef: React.RefObject<HTMLImageElement> = useRef(null);

      const [zoomIdx, setZoomIdx] = useState(0);

      const [imgContainHeight, setImgContainHeight] = useState(500);
      const [imgContainWidth, setImgContainWidth] = useState(426);
      const [isInit, setIsInit] = useState(false);
      const [currentRotation, setCurrentRotation] = useState(0);

      const { open } = props;
      const previousValues: any = usePrevious({ open });

      // Refs
      const zoomReferences = useRef<(ReactZoomPanPinchRef | null)[]>([]);
      const videoReferences = useRef({});
      const imageRefs = useRef([]);

      const btnRef = useRef(null);
      const [videoElements, setVideoElements] = useState({});

      const [isLoading, setIsLoading] = useState(true);
      const [noWindow, setNoWindow] = useState(
        props.noWindow ? props.noWindow : false,
      );

      const [zoomDataImages, setZoomDataImages] = useState({});

      const [touchStart, setTouchStart] = useState<any>(0);
      const [touchEnd, setTouchEnd] = useState<any>(0);

      const [mouseStartX, setMouseStartX] = useState<any>(0);
      const [mouseStartY, setMouseStartY] = useState<any>(0);

      const minimumSwipeDistance = 50;
      const lightboxRef = useRef();

      const zoomImage = () => {
        let nextScale;

        // Determine zoom direction from the cursor
        if (zoomCursor === "zoom-in") {
          nextScale = zoomIntoImage();
        } else {
          nextScale = zoomOutImage();
        }

        // Determine boundaries safely
        const reachedMax = nextScale >= maxScale * 0.999;
        const reachedMin = nextScale <= 1.01;

        setZoomDataImages((prev) => ({
          ...prev,
          [zoomIdx]: {
            currentZoomScale: nextScale,
          },
        }));

        // 4. Update cursor based on the new scale
        if (reachedMax) {
          setZoomCursor("zoom-out");
        } else if (reachedMin) {
          setZoomCursor("zoom-in");
        }
      };

      const zoomOutImage = () => {
        if (zoomReferences.current[zoomIdx] != null) {
          zoomReferences.current[zoomIdx]!.zoomOut();
        }
        let scale = zoomReferences.current[zoomIdx]!.state.scale;

        if (scale <= 1) {
          setZoomedIn(false);
        }
        return scale;
      };

      const zoomIntoImage = () => {
        if (zoomReferences.current[zoomIdx] != null) {
          zoomReferences.current[zoomIdx]!.zoomIn();
        }
        setZoomedIn(true);
        let scale = zoomReferences.current[zoomIdx]!.state.scale;
        return scale;
      };

      const onTouchStart = (e) => {
        if (e.targetTouches && e.targetTouches.length == 1) {
          setTouchEnd(null);
          setTouchStart(e.targetTouches[0].clientX);
        }

        if (e.targetTouches && e.targetTouches.length == 2) {
          setPinch(true);
        }
      };

      const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

      const onTouchEnd = (e) => {
        // only move to new image if imgAnimation set to "fade"
        if (
          touchStart != null &&
          touchEnd != null &&
          imgAnimation == "fade" &&
          zoomedIn == false &&
          pinch == false
        ) {
          const distance: any = touchStart - touchEnd;
          if (distance != null) {
            const isLeftSwipe = distance > minimumSwipeDistance;
            const isRightSwipe = distance < -minimumSwipeDistance;
            if (isLeftSwipe) {
              nextSlide();
            } else if (isRightSwipe) {
              prevSlide();
            }
          }
        } else if (
          touchStart != null &&
          touchEnd != null &&
          zoomedIn == false &&
          pinch == false
        ) {
          // click
          if (toggleThumbnails) {
            setShowThumbnails(!showThumbnails);
          }
        }
        setPinch(false);
        setTouchStart(null);
      };

      const onMouseDown = (event) => {
        setMouseStartX(event.pageX);
        setMouseStartY(event.pageY);
      };

      const onMouseUp = (event) => {
        const differenceX = Math.abs(event.pageX - mouseStartX);
        const isLeftDragMotion = mouseStartX - event.pageX > delta;
        const isRightDragMotion = mouseStartX - event.pageX < -delta;

        if (differenceX > delta) {
          if (isLeftDragMotion && imgAnimation == "fade" && zoomedIn == false) {
            nextSlide();
          } else if (
            isRightDragMotion &&
            imgAnimation == "fade" &&
            zoomedIn == false
          ) {
            prevSlide();
          }
        } else {
          // click
          if (toggleThumbnails) {
            setShowThumbnails(!showThumbnails);
          }

          // if (singleClickZoom) {
          //   event.stopPropagation()
          //   zoomIntoImage()
          // }
        }
      };

      const [thumbnailBorder, setThumbnailBorder] = useState(
        props.thumbnailBorder
          ? createCustomThumbnailBorder(props.thumbnailBorder)
          : themes[defaultTheme].thumbnailBorder,
      );

      const [emblaRef, emblaApi] = useEmblaCarousel(reactSwipeOptions);
      const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel(
        thumbnailSwipeOptions,
      );

      const scrollPrev = useCallback(() => {
        if (emblaApi) {
          emblaApi.scrollPrev();
        }
      }, [emblaApi]);

      const scrollNext = useCallback(() => {
        if (emblaApi) {
          emblaApi.scrollNext();
        }
      }, [emblaApi]);

      const isImageCaption = (placement) => {
        if (placement != imgCaptionPlacement) {
          return false;
        }
        if (props.images && props.images.length > 0) {
          if (props.images[slideIndex]?.caption) {
            return true;
          }
        }
        return false;
      };

      const getContainerStyles = () => {
        if (props.showControlsBar == false || props.fullScreen) {
          return { height: lboxHeight };
        } else if (isBrowserFullScreen) {
          // return {height: "100vh"}
        } else {
          return {};
        }
      };

      const getInnerContainerStyles = () => {
        if (isImageCaption("above")) {
          return styles.innerContainerWithTopCaption;
        }
        if (rotateImgIcon) {
          return styles.rotateImgInnerContainer;
        }
        return styles.slideshowInnerContainerThumbnails;
      };

      const displayDownloadBtn = () => {
        if (isVideo(slideIndex)) {
          return false;
        } else {
          return showDownloadBtn;
        }
      };

      function handleWindowResize() {
        if (!noWindow) {
          setWidth(window.innerWidth);
        }
      }

      const shouldDisplayMagnifyingGlassIcon = () => {
        if (isVideo(slideIndex)) {
          return false;
        }
        if (isMobile == true) {
          return false;
        }
        if (imageFullScreen == true) {
          return false;
        }

        if (magnifyingGlassFeature == true) {
          return true;
        }
        return false;
      };

      const getImageStyle = () => {
        let styleObject = {};
        styleObject["objectFit"] = "contain";

        if (imageFullScreen) {
          if (props.fullScreenFillMode) {
            styleObject["objectFit"] = props.fullScreenFillMode;
            if (props.fullScreenFillMode == "cover") {
              styleObject["maxHeight"] = "94vh";
              styleObject["maxWidth"] = "70vw";
              styleObject["marginTop"] = "auto";
              styleObject["marginBottom"] = "auto";
            }
          } else {
            styleObject["objectFit"] = "contain";
            styleObject["height"] = lboxHeight;
            styleObject["maxHeight"] = lboxHeight;
          }
        }
        if (!imageFullScreen && !rotateImgIcon) {
          if (isImageCaption(imgCaptionPlacement) && showThumbnails == false) {
            // styleObject["height"] = "67vh"
          }
          if (isImageCaption(imgCaptionPlacement) && showThumbnails) {
            // styleObject["height"] = "67vh"
          }

          if (props.thumbnailImgAnim && showThumbnails == false) {
            styleObject["height"] = "87vh";
          } else if (isImageCaption(imgCaptionPlacement) != true) {
            // styleObject["height"] = "77vh"
          }
          if (props.thumbnailImgAnim && showThumbnails) {
            styleObject["height"] = "67vh";
          }
        }

        if (rotateImgIcon && showThumbnails) {
          styleObject["width"] = "57vw";
          styleObject["marginTop"] = "10vh";
        } else if (rotateImgIcon && showThumbnails == false) {
          styleObject["width"] = "57vw";
          styleObject["marginTop"] = "15vh";
        }

        if (isRounded) {
          styleObject["borderRadius"] = "20px";
        }
        if (modalCloseOption == "clickOutside") {
          styleObject["pointerEvents"] = "auto";
        }
        if (isImageComponent && showThumbnails == false && !isMobile) {
          styleObject["height"] = "85vh";
        }
        return styleObject;
      };

      const shouldDisplaySlideshowIcon = () => {
        if (props.showSlideshowIcon != undefined) {
          return props.showSlideshowIcon;
        }

        if (images) {
          if (images.length == 1) {
            return false;
          }
        } else if (props.images) {
          if (props.images.length == 1) {
            return false;
          }
        }

        return true;
      };

      const navigationClick = (index) => {
        initLoader(index);
        setCurrentSlide(index);
      };

      const isZoomEnabled = () => {
        if (disableZoom == true) {
          return false;
        }
      };

      const getRTLIndex = (img_gallery_length, i) => {
        let index;
        if (i == 0) {
          index = img_gallery_length - 1;
        } else if (i == img_gallery_length - 1) {
          index = 0;
        } else {
          index = img_gallery_length - i - 1;
        }
        return index;
      };

      const getMetadataTextColor = () => {
        if (props.theme) {
          if (themes[props.theme]) {
            return themes[props.theme].metadataTextColor;
          }
        } else {
          return themes[defaultTheme].metadataTextColor;
        }
      };

      const getImgSrc = async (images, index) => {
        if (images) {
          let image = images[index];
          if (image.original) {
            return image.original;
          }

          const resolved = await resolveSlideSrc(image);
          return resolved.src;
        }
      };

      const getThumbSrc = async (images, index) => {
        const image = images[index];

        if (image.thumbnail) {
          // thumbnail may be string or async function
          if (typeof image.thumbnail === "function") {
            return await image.thumbnail();
          }
          return image.thumbnail;
        }

        // fallback: use full source

        let src = await getImgSrc(images, index);
      };

      const resolveSource = async (source) => {
        // check if source() returns a Promise<string> or is a string
        if (typeof source === "function") {
          return await source();
        }
        return source;
      };

      const resolveSlideSrc = async (slide) => ({
        src: await resolveSource(slide.src),
        thumbnail: slide.thumbnail
          ? await resolveSource(slide.thumbnail)
          : null,
      });

      const fullScreenHandler = () => {
        //in full screen mode
        if (
          document["webkitIsFullScreen"] ||
          document["mozFullScreen"] ||
          document["msFullscreenElement"]
        ) {
          setIsBrowserFullScreen(true);
          setLightboxModalHeight("100vh");
        } else {
          if (isBrowserFullScreen) {
            closeFullScreen(document);
          }
          removeFullScreenChangeEventListeners(fullScreenHandler);
          setIsBrowserFullScreen(false);
          setLightboxModalHeight(
            props.lightboxHeight ? props.lightboxHeight : "100vh",
          );
        }
      };

      const exitFullScreen = () => {
        closeFullScreen(document);
        removeFullScreenChangeEventListeners(fullScreenHandler);
        // setIsBrowserFullScreen(false)
      };

      const emblaSlideSelect = useCallback((emblaApi) => {}, []);

      useEffect(() => {
        if (emblaApi) emblaApi.on("slidesInView", emblaSlideSelect);
      }, [emblaApi, emblaSlideSelect]);

      const updateImageSlideshow = (newDirection) => {
        if (isRTL) {
          scrollPrev();
        } else {
          scrollNext();
        }

        setImgSlideIndex([imgSlideIndex + newDirection, newDirection]);
        if (isRTL) {
          setZoomIdx(zoomIdx - 1 < 0 ? images.length - 1 : zoomIdx - 1);
        } else {
          setZoomIdx(zoomIdx + 1 >= images.length ? 0 : zoomIdx + 1);
        }
      };

      const displayArrows = () => {
        if (props.showArrows == false) {
          return false;
        }
        if (props.images) {
          if (props.images.length == 1) {
            return false;
          }
        } else if (images.length == 1) {
          return false;
        }

        return true;
      };

      const initLoader = (newIndex) => {
        if (props.showLoader && props.images) {
          if (
            !isVideo(newIndex) &&
            imagesLoadedDict &&
            imagesLoadedDict[newIndex].loaded != true
          ) {
            setDisplayLoader(true);
          } else if (
            props.showLoader &&
            props.images &&
            imagesLoadedDict &&
            imagesLoadedDict[newIndex]["loaded"]
          ) {
            setDisplayLoader(false);
          }
        }
      };

      const getImageCaption = (): string => {
        if (props.images && props.images.length > 0) {
          return props.images[slideIndex].caption;
        }
        return "";
      };

      const getArrowStyle = (): string | void => {
        if (arrowStyle == "dark") {
          return styles.darkIcon;
        } else if (arrowStyle == "light") {
          return styles.lightIcon;
        }
      };

      const getIconClasses = (): string | undefined => {
        if (arrowStyle == "dark") {
          return styles.darkHeaderIcon;
        } else if (arrowStyle == "light") {
          return styles.lightHeaderIcon;
        }
      };

      const setCurrentSlide = (newIndex) => {
        let newDirection;
        if (newIndex > imgSlideIndex) {
          newDirection = 1;
        } else {
          newDirection = -1;
        }

        setZoomIdx(newIndex);

        setImgSlideIndex([newIndex, newDirection]);

        if (emblaApi) {
          emblaApi.scrollTo(newIndex);
        }
      };

      const dispatchOpenEvent = () => {
        if (props.onOpen) {
          props.onOpen(slideIndex, images[slideIndex]);
        }
        if (props.onSelect) {
          props.onSelect(slideIndex, images[slideIndex]);
        }
      };

      const dispatchCloseEvent = () => {
        if (props.onClose) {
          props.onClose(slideIndex);
        }
      };

      const dispatchNextImgEvent = (newIndex) => {
        if (props.onNext) {
          props.onNext(newIndex, images[newIndex]);
        }
      };

      const dispatchPrevImgEvent = (newIndex) => {
        if (props.onPrev) {
          props.onPrev(newIndex, images[newIndex]);
        }
      };

      const closeModal = () => {
        //reset zoom ref
        setZoomIdx(0);

        if (isBrowserFullScreen) {
          exitFullScreen();
        }

        // ensure slideshow is paused
        if (isSlideshowPlaying) {
          setIsSlideshowPlaying(false);
        }

        setShowModal(false);
        setIsOpen(false);
        setCarouselReady(false);
        setEmblaReinitialized(false);
        setCurrentRotation(0);
        //resetRotation()
        //if (prevFocusedElem) prevFocusedElem?.focus();
      };

      const getCursor = () => {
        if (showZoomCursor) {
          if (zoomCursor == "zoom-in") {
            return styles.zoomInCursor;
          } else if (zoomCursor == "zoom-out") {
            return styles.zoomOutCursor;
          }
        }

        return "";
      };

      const openModal = (num) => {
        if (emblaApi) {
          emblaApi.reInit();
          if (emblaThumbsApi) {
            emblaThumbsApi?.scrollTo(emblaApi.selectedScrollSnap());
          }
        }
        setImgSlideIndex([num, 1]);
        setShowModal(true);
        setIsOpen(true);
      };

      var imagesLoadedDict;

      const setItemLoaded = (index) => {
        setDisplayLoader(false);
        if (props.images) {
          let imgs;
          if (imagesLoadedDict) {
            imgs = imagesLoadedDict;
          } else {
            imgs = images;
          }
          let newImages = imgs.map((img, i) =>
            index === i
              ? {
                  ...img,
                  loaded: true,
                }
              : img,
          );
          setImages((images) => newImages);
          imagesLoadedDict = newImages;
        }
      };

      const setImagesItemLoaded = (index) => {
        setImages((images) =>
          images.map((img, i) =>
            index === i
              ? {
                  ...img,
                  loaded: true,
                }
              : img,
          ),
        );
      };

      const resetMedia = (slide_index) => {
        resetVideo(slide_index);
        resetImage();
      };

      const initImgMetadataPanel = () => {
        if (isMobile && showImgMetadataPanel) {
          setShowImgMetadataPanel(false);
        }
      };

      const initSlide = (newSlideIndex) => {
        setImgSlideIndex([newSlideIndex, 1]);

        let wrap_slide_index = wrapNums(0, images.length, newSlideIndex);
        setZoomIdx(wrap_slide_index);
        initLoader(wrap_slide_index);
        if (imageRefs.current[wrap_slide_index]) {
          imageRefs.current[wrap_slide_index].classList.add(
            `${styles.rotate_img}`,
          );
        }

        if (displayImgMetadata) {
          initImgMetadataPanel();

          if (!imgMetadata[wrap_slide_index]) {
            setIsLoading(true);
          }
        }

        if (showZoomCursor) {
          const zoomDataForImage = zoomDataImages[wrap_slide_index];

          const scale = zoomDataForImage?.currentZoomScale ?? 1;
          const atMax = scale >= maxScale * 0.999;
          const atMin = scale <= 1.01;

          if (atMax) {
            setZoomCursor("zoom-out");
          } else {
            setZoomCursor("zoom-in");
          }
        }
      };

      const nextSlide = () => {
        scrollNext();
        initSlide(imgSlideIndex + 1);
        if (imgAnimation == "fade") {
          // since embla carousel not used for fade animations, dispatch next event manually
          dispatchNextImgEvent((imgSlideIndex + 1) % images.length);
        }
      };

      const prevSlide = () => {
        scrollPrev();
        initSlide(imgSlideIndex - 1);
        if (imgAnimation == "fade") {
          // since embla carousel not used for fade animations, dispatch next event manually
          dispatchPrevImgEvent((imgSlideIndex - 1) % images.length);
        }
      };

      const setThumbnailStartIndex = (index) => {
        let thumbnailSwipeOptionConfig = thumbnailSwipeOptions;
        thumbnailSwipeOptionConfig.startIndex = index;
        setThumbnailSwipeOptions(thumbnailSwipeOptionConfig);
      };

      const openModalWithSlideNum = (index) => {
        let reactSwipeOptionConfig = reactSwipeOptions;
        reactSwipeOptionConfig.startIndex = index;
        setReactSwipeOptions(reactSwipeOptionConfig);
        setThumbnailStartIndex(index);
        setZoomIdx(index);
        openModal(index);
      };



      const saveImage = () => {
        let img_url;
        if (props.images?.length > 0) {
          if (props.images[slideIndex].original) {
            img_url = props.images[slideIndex].original;
          } else {
            img_url = props.images[slideIndex]["src"];
          }
        } else {
          if (images[slideIndex].src) {
            img_url = images[slideIndex].src!;
          }
        }

        downloadImage(img_url)
      };

      const playSlideshow = () => {
        setMagnifyingGlass(false);
        if (isRTL) {
          updateImageSlideshow(-1);
        } else {
          updateImageSlideshow(1);
        }
        setIsSlideshowPlaying(true);
      };

      const stopSlideshow = () => {
        setIsSlideshowPlaying(false);
      };

      const getEmbedIndex = (slide_index, elems) => {
        if (props.images) {
          let iframe_index = 0;

          for (let i = 0; i < props.images.length; i++) {
            let item = props.images[i];
            if (item.type == "customVideoEmbed" || item.type == "yt") {
              if (i == slide_index) {
                iframe_index++;
                break;
              } else {
                iframe_index++;
              }
            }
          }

          return iframe_index - 1;
        }
      };

      const getEmblaClass = (index) => {
        if (displayImgMetadata) {
          return styles.emblaSlideGrid;
        }

        if (imgAnimation == "fade") {
          let styles_str = "";

          if (props.fullScreen != true) {
            styles_str += `${styles.notFullScreen} `;
          }

          styles_str += ` ${styles.imgfade} ${styles.emblaSlide} `;
          if (slideIndex == index) {
            styles_str += `${styles.emblaSlideSelected} `;
          }
          return styles_str;
        } else {
          return styles.emblaSlide;
        }
      };

      const resetVideo = (slide_index) => {
        var videos = document.querySelectorAll("#lightboxContainer video");
        if (videos && videos.length) {
          for (let i = 0; i < videos.length; i++) {
            let video: any = videos[i];
            video?.pause();
          }
        }

        if (props.images) {
          let elem = props.images[slide_index];
          if (elem) {
            if (elem.type == "htmlVideo") {
              videoReferences.current[slide_index].pause();
            } else if (elem.type == "yt") {
              if (videoElements[slide_index]) {
                videoElements[slide_index].target.pauseVideo();
              }
            } else if (elem.type == "customVideoEmbed") {
              let lightboxjs_elem =
                document.getElementById("lightboxContainer");
              let elems = lightboxjs_elem?.querySelectorAll("iframe");
              if (elems) {
                let iframe_elem_index = getEmbedIndex(slide_index, elems);
                if (iframe_elem_index != undefined && iframe_elem_index >= 0) {
                  // reset iframe
                  let iframe = elems[iframe_elem_index];
                  let iframe_src = iframe.src;
                  iframe.src = iframe_src;
                }
              }
            }
          }
        }
      };

      const getNavigationDot = (index) => {
        return (
          <button
            style={
              slideIndex === index ? { backgroundColor: "cornflowerblue" } : {}
            }
            className={`${styles.navigationDot} imageModal`}
            onClick={() => {
              navigationClick(index);
            }}
          ></button>
        );
      };

      const getThumbnailsOuterContainerStyle = () => {
        let style = {};
        if (isImageCaption("below")) {
          if (showThumbnails) {
            style["height"] = "21vh";
          } else {
            style["height"] = "12vh";
          }
          style["backgroundColor"] = backgroundColor;
        }
        return style;
      };

      const getImageThumbnail = (img, index, isNextJS, props) => {
        return (
          <div
            key={"thumbnail_slide_" + index}
            className={`${styles.emblaThumbsSlide}`}
          >
            <img
              className={`${styles.thumbnail} imageModal ${props.thumbnailImgClass ? props.thumbnailImgClass : ""}  `}
              src={
                isNextJS == true
                  ? getThumbnailImgSrcNext(img, index)
                  : getThumbnailImgSrc(img, index)
              }
              alt={img.alt}
              onLoad={() => setImagesLoaded(true)}
              style={
                slideIndex === index
                  ? { border: thumbnailBorder }
                  : { border: inactiveThumbnailBorder }
              }
              key={"thumbnail_" + index}
              onClick={(event) => {
                if (props.onThumbnailClick) {
                  props.onThumbnailClick(index, img);
                }
                navigationClick(index);
              }}
            />
          </div>
        );
      };

      const handleError = (event, index) => {
        if (props.onImgError) {
          props.onImgError(event, images[slideIndex], index);
        }
      };

      const rotateImage = () => {
        let img_elem = imageRefs.current[zoomIdx];
        let transform_val = img_elem.style.transform;

        let current_rotation = 0;
        if (transform_val) {
          var reg = /rotate\(([0-9.]+)deg\)/;
          current_rotation = parseFloat(transform_val.match(reg)[1]);
        }

        let newRotation = current_rotation + 90;

        let res = newRotation / 90;

        img_elem.style.transform = `rotate(${newRotation}deg)`;

        setCurrentRotation(newRotation);
        if (props.onRotate) {
          let rotationVal = newRotation;
          if (newRotation > 360) {
            rotationVal = newRotation % 360;
          }
          props.onRotate(rotationVal);
        }
      };

      const resetRotation = () => {
        imageRefs.current[zoomIdx].classList.remove(`${styles.rotate_img}`);

        imageRefs.current[zoomIdx].style.transform = "";
        setCurrentRotation(0);
      };

      const resetImage = () => {
        if (enableMagnifyingGlass) {
          initMagnifyingGlass();
        } else {
          if (zoomReferences.current[zoomIdx] != null) {
            zoomReferences.current[zoomIdx]!.resetTransform();
          }
        }
        // resetRotation()
      };

      const getThumbnailImgSrc = (img, index) => {
        if (!img) return null;

        const image = props.images?.[index] || img;

        // If thumbnailSrc (static)
        if (image?.thumbnailSrc) {
          return image.thumbnailSrc;
        }

        // Resolved async thumbnail (from state)
        if (resolvedSrcs?.thumbnail?.[index]) {
          return resolvedSrcs.thumbnail[index];
        }

        // Video-specific thumbnail
        if (isVideo(index) && image.thumbnail) {
          return image.thumbnail;
        }

        // Fall back to original thumbnail definition (if static string)
        if (typeof image?.thumbnail === "string") {
          return image.thumbnail;
        }

        // Fall back to src (resolved async or static)
        if (resolvedSrcs?.full?.[index]) {
          return resolvedSrcs.full[index];
        }

        if (typeof image?.src === "string") {
          return image.src;
        }

        // Fall back to original (if defined)
        if (image?.original) {
          return image.original;
        }

        return "";
      };

      const getImgFadeClass = () => {
        if (imgAnimation == "fade") {
          if (isImageCaption("above")) {
            return ` ${styles.imgfade} ${styles.imgFadeWithTopCaption}`;
          } else {
            return ` ${styles.imgfade}`;
          }
        }
      };

      const getThumbnailImgSrcNext = (img, index) => {
        if (img.thumbnailSrc) {
          return img.thumbnailSrc;
        } else if (isVideo(index)) {
          return img.thumbnail;
        } else {
          let img_src = img.src;
          if (
            typeof img_src === "object" &&
            !Array.isArray(img_src) &&
            img_src !== null
          ) {
            return img_src.src;
          } else {
            return img_src;
          }
        }
      };

      const isAnimImageComponent = () => {
        if (images) {
          if (images.length == 1) {
            return true;
          }
        }
        return false;
      };

      const initWrapperClassname = () => {
        let classNameStr = "";
        if (props.className) {
          classNameStr += `${props.className} `;
        }
        if (isAnimImageComponent()) {
          if (props.imgWrapperClassName) {
            classNameStr += `${props.imgWrapperClassName} `;
          }
        }

        classNameStr += `${styles.lightboxjs}`;

        return classNameStr;
      };

      const initStyling = () => {
        if (props.theme) {
          if (themes[props.theme]) {
            setBackgroundColor(themes[props.theme].background);
            // setIconColor(themes[props.theme].iconColor)
            // setThumbnailBorder(themes[props.theme].thumbnailBorder)
            setTextColor(themes[props.theme].textColor);
          }
        }

        if (props.fullScreen) {
          if (props.fullScreen == true) {
            setImgAnimation(
              props.imgAnimation && props.imgAnimation == "imgDrag"
                ? props.imgAnimation
                : "fade",
            );
            setIsRounded(false);
          }
        }
      };

      const getMetadataPanel = () => {
        let imgMetadataItem = imgMetadata[slideIndex];

        if (imgMetadataItem) {
          let element = (
            <div className={styles.metadataPanel}>
              <b>Filename</b>
              {imgMetadataItem.name ? <p>{imgMetadataItem.name}</p> : null}

              {imgMetadataItem.createDate ? (
                <div>
                  <b>Captured Time</b>
                  <p>{imgMetadataItem.createDate.toString()}</p>
                </div>
              ) : null}

              {imgMetadataItem.width && imgMetadataItem.height ? (
                <div>
                  <b>Resolution</b>
                  <p>
                    {imgMetadataItem.width}*{imgMetadataItem.height}
                  </p>
                </div>
              ) : null}

              {imgMetadataItem.isoData ||
              imgMetadataItem.fNumber ||
              imgMetadataItem.shutterSpeed ? (
                <div>
                  <b>Image Details</b>
                  {imgMetadataItem.isoData ? (
                    <span>ISO {imgMetadataItem.isoData}</span>
                  ) : null}

                  {imgMetadataItem.fNumber ? (
                    <span>f{imgMetadataItem.fNumber}</span>
                  ) : null}

                  {imgMetadataItem.shutterSpeed ? (
                    <span>Shutter speed: {imgMetadataItem.shutterSpeed}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
          return element;
        }
      };

      const imageSlideElement = (index) => {
        let imageElem;
        if (!props.images) {
          imageElem = (
            <LightboxImage
              onImgError={(e, index) => handleError(e, index)}
              props={props}
              imgStyle={getImageStyle()}
              imgRef={(el) => (imageRefs.current[index] = el)}
              imgSrc={
                images[index].original
                  ? images[index].original
                  : images[index].src
              }
              displayImgMetadata={displayImgMetadata}
              enableMagnifyingGlass={enableMagnifyingGlass}
              index={index}
              onUpdateImgMetadata={(newImgMetadata) =>
                setImgMetadata(newImgMetadata)
              }
            />
          );
        } else if (props.images && props.render) {
          imageElem = props.render.imgSlide(props.images[index]);
        } else {
          let img_link;

          // check if object (Next.js local image imports are passed as objects with a src attribute)
          if (props.images) {
            if (
              typeof images[index].src === "object" &&
              !Array.isArray(images[index].src) &&
              images[index].src !== null
            ) {
              img_link = images[index].src?.src;
            } else if (props.coverImageInLightbox == true) {
              img_link = images[index].src;
            } else {
              img_link = images[index].src;
            }
          }

          imageElem = (
            <LightboxImage
              onImgError={(e, index) => handleError(e, index)}
              props={props}
              imgStyle={getImageStyle()}
              imgRef={(el) => (imageRefs.current[index] = el)}
              imgSrc={
                images[index].original ? images[index].original : img_link
              }
              displayImgMetadata={displayImgMetadata}
              enableMagnifyingGlass={enableMagnifyingGlass}
              index={index}
              onUpdateImgMetadata={(newImgMetadata) =>
                setImgMetadata(newImgMetadata)
              }
            />
          );
        }

        return imageElem;
      };

      const getCloseIconBtnStyle = () => {
        let style_object = {};
        if (iconColor) {
          style_object = { color: iconColor };
        }
        if (props.closeIconBtnStyle) {
          let closeIconBtnStyleKeys = Object.keys(props.closeIconBtnStyle);
          for (let i = 0; i < closeIconBtnStyleKeys.length; i++) {
            let keyName = closeIconBtnStyleKeys[i];
            let style_obj = props.closeIconBtnStyle[keyName];
            style_object[keyName] = style_obj;
          }
        }
        if (customIconStyle) {
          style_object = customIconStyle;
        }
        return style_object;
      };

      const isPanningDisabled = () => {
        if ((isMobile || isTablet || isTabletUserAgent) && zoomedIn == false) {
          return true;
        }
        if ((isMobile || isTablet || isTabletUserAgent) && zoomedIn) {
          return false;
        }
        return false;
      };

      const getLightboxElem = (index) => {
        if (isCustomEmbed(index)) {
          return customEmbedElement(index);
        } else if (isVideo(index)) {
          return videoSlideElement(index);
        } else if (isPictureElement(index)) {
          let elem_metadata = props.images[index]["picture"];
          return (
            <PictureElem
              elem_metadata={elem_metadata}
              enableMagnifyingGlass={enableMagnifyingGlass}
              onHandleError={(error, index) => {
                handleError(error, index);
              }}
              index={index}
            />
          );
        } else {
          if ((images && props.render) || frameworkID == "next") {
            return imageSlideElement(index);
          } else {
            const src = resolvedSrcs.full[index];

            return (
              <LightboxImage
                onImgError={(e, index) => handleError(e, index)}
                props={props}
                imgStyle={getImageStyle()}
                imgRef={(el) => (imageRefs.current[index] = el)}
                imgSrc={src}
                displayImgMetadata={displayImgMetadata}
                enableMagnifyingGlass={enableMagnifyingGlass}
                index={index}
                onUpdateImgMetadata={(newImgMetadata) =>
                  setImgMetadata(newImgMetadata)
                }
              />
            );
          }
        }
      };

      const isCustomEmbed = (index) => {
        if (props.images) {
          let elem = props.images[index];
          if (elem) {
            if (elem.type == "customEmbed") {
              return true;
            }
          }
        }
        return false;
      };

      const isVideo = (index) => {
        if (props.images) {
          let elem = props.images[index];
          if (elem) {
            if (
              elem.type == "yt" ||
              elem.type == "htmlVideo" ||
              elem.type == "customVideoEmbed"
            ) {
              return true;
            }
          }
        }

        return false;
      };

      const shouldDisplayMetadataPanel = () => {
        if (isMobile) {
          if (showImgMetadataPanel) {
            return true;
          } else {
            return false;
          }
        } else {
          return displayImgMetadata;
        }
      };

      const isPictureElement = (index) => {
        if (props.images) {
          let elem = props.images[index];
          if (elem) {
            if (elem.picture) {
              return true;
            }
          }
        }

        return false;
      };

        useEffect(() => {
          setIsMounted(true);
      
        }, [])
      

      useEffect(() => {
        if (!emblaApi) return;

        if (imgAnimation == "fade") {
          emblaApi.internalEngine().translate.toggleActive(false);
        }
      }, [carouselReady, emblaApi]);

      useEffect(() => {
        if (!images || !images[imgSlideIndex]) return;

        const loadFullSrc = async () => {
          const resolved = await getImgSrc(images, imgSlideIndex);
          setResolvedSrcs((prev) => ({
            ...prev,
            full: { ...prev.full, [imgSlideIndex]: resolved },
          }));
        };

        if (!resolvedSrcs.full[imgSlideIndex]) {
          loadFullSrc();
        }
      }, [images, imgSlideIndex]);

      // thumbnails
      useEffect(() => {
        if (!images) return;

        const loadThumbSrc = async (i) => {
          const resolved = await getThumbSrc(images, i);
          setResolvedSrcs((prev) => ({
            ...prev,
            thumbnail: { ...prev.thumbnail, [i]: resolved },
          }));
        };

        images.forEach((_, i) => {
          if (!resolvedSrcs?.thumbnail[i]) {
            loadThumbSrc(i);
          }
        });
      }, [images]);

      const getIconStyle = () => {
        if (iconColor) {
          return { color: iconColor };
        } else if (customIconStyle) {
          return customIconStyle;
        } else {
          return {};
        }
      };

      const isHTMLVideo = (index) => {
        if (props.images) {
          if (props.images && props.images[index].type == "htmlVideo") {
            return true;
          }
        }

        return false;
      };

      const videoSlideElement = (index) => {
        let elem = props.images[index];
        let videoElem;

        if (elem.type == "yt") {
          videoElem = (
            <div className={`${styles.videoOuterContainer} imageModal`}>
              <YouTube
                videoId={elem.videoID}
                ref={(el) => (videoReferences.current[index] = el)}
                iframeClassName={`${styles.ytVideo}`}
                title="YouTube video player"
                opts={{
                  height: getVideoHeight(elem),
                  width: getVideoWidth(elem),
                  playerVars: {
                    // https://developers.google.com/youtube/player_parameters
                    autoplay: shouldAutoplay(elem) ? 1 : 0,
                  },
                }}
                // style={object}
                // className={`${styles.ytVideo}`}
                //loading={string}
                onReady={(event) => {
                  let videoElems = videoElements;
                  videoElems[index] = event;
                  setVideoElements(videoElems);
                  if (index == slideIndex) {
                    setDisplayLoader(false);
                  }
                  setItemLoaded(index);
                }}
                onPlay={(event) => {
                  setYTVideoCurrentlyPlaying(true);
                }}
                onPause={(event) => {
                  setYTVideoCurrentlyPlaying(false);
                }}
                onEnd={(event) => {
                  setYTVideoCurrentlyPlaying(false);
                }}
                onError={(event) => {
                  handleError(event, index);
                }}
                onStateChange={(event) => {}}
                onPlaybackRateChange={(event) => {}}
                onPlaybackQualityChange={(event) => {}}
              />
            </div>
          );
        } else if (elem.type == "htmlVideo") {
          videoElem = (
            <div
              className={`${styles.htmlVideo} ${styles.htmlVideoOuterContainer} imageModal`}
            >
              <video
                className={`${styles.cursorPointer} ${styles.lightboxVideo}`}
                width={getVideoWidth(elem)}
                ref={(el) => (videoReferences.current[index] = el)}
                onPlay={() => {}}
                onError={(event) => {
                  handleError(event, index);
                }}
                height={getVideoHeight(elem)}
                autoPlay={index == imgSlideIndex ? shouldAutoplay(elem) : false}
                controls
              >
                <source
                  src={elem.videoSrc}
                  type="video/mp4"
                  onLoad={() => {
                    setItemLoaded(index);
                  }}
                />
              </video>
            </div>
          );
        } else if (elem.type == "customVideoEmbed") {
          videoElem = (
            <div className={`${styles.customVideoContainer} imageModal`}>
              {elem.embed}
            </div>
          );
        }

        return videoElem;
      };

      const customEmbedElement = (index) => {
        let elem = props.images[index];
        let customElem;

        if (elem.type == "customEmbed") {
          customElem = (
            <div className={`${styles.customEmbedContainer} imageModal`}>
              {elem.embed}
            </div>
          );
        }

        return customElem;
      };

      const initZoom = (ref) => {
        if (imgAnimation == "fade") {
          if (ref.state.scale <= 1) {
            setZoomedIn(false);
          } else {
            setZoomedIn(true);
          }
        } else {
          if (ref.state.scale <= 1.65) {
            setZoomedIn(false);
          } else {
            setZoomedIn(true);
          }
        }

        if (showZoomCursor == true) {
          if (ref.state.scale >= maxScale) {
            setZoomCursor("zoom-out");
          } else if (ref.state.scale <= 1) {
            setZoomCursor("zoom-in");
          }
        }

        setCurrentZoomScale(ref.state.scale);
      };

      const regularImgPaneNodes = Array.apply(null, Array(images.length)).map(
        (_, index) => {
          return (
            <div
              key={index}
              className={`${props.fullScreen ? styles.fullScreenContainer : null}`}
              style={{ height: lboxHeight }}
            >
              {enableMagnifyingGlass == true ? (
                <div></div>
              ) : (
                // <Magnifier
                //   src={images[index].src!}
                //   className={`${styles.magnifyWrapper} ${styles.lightboxImg}`}
                //   height={imgContainHeight}
                //   width={imgContainWidth}
                //   mgShowOverflow={false}
                // />
                <div
                  className={getEmblaClass(index)}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  onMouseDown={onMouseDown}
                  onMouseUp={onMouseUp}
                >
                  <TransformWrapper
                    ref={(el) => (zoomReferences.current[index] = el)}
                    onWheel={(ref, wheelEvent) => {
                      initZoom(ref);
                    }}
                    disabled={disableZoom}
                    panning={{
                      disabled: isPanningDisabled(),
                    }}
                    doubleClick={{
                      disabled: singleClickZoom == true ? true : false,
                    }}
                    key={index}
                    onZoom={(ref, event) => {
                      initZoom(ref);
                    }}
                    onZoomStop={(ref, event) => {
                      initZoom(ref);
                    }}
                    onTransformed={(ref, event) => {
                      initZoom(ref);
                    }}
                    onPinchingStop={(ref, event) => {
                      initZoom(ref);
                    }}
                    centerZoomedOut={true}
                    initialScale={1}
                    maxScale={maxScale}
                    alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
                  >
                    <TransformComponent
                      wrapperClass={styles.reactTransformWrapper}
                      contentClass={styles.reactTransformComponent}
                      wrapperStyle={{
                        maxWidth: "100vw",
                        height: "100vh",
                        margin: "auto",
                      }}
                      contentStyle={{
                        maxWidth: "100vw",
                        height: "100vh",
                        margin: "auto",
                        display: "grid",
                      }}
                      key={index}
                    >
                      <div
                        onMouseDown={onMouseDown}
                        onClick={(e) => {
                          const differenceX = Math.abs(e.pageX - mouseStartX);
                          const differenceY = Math.abs(e.pageY - mouseStartY);

                          // check if it's a click or drag motion
                          if (
                            !(
                              differenceX > imgZoomDelta ||
                              differenceY > imgZoomDelta
                            )
                          ) {
                            e.stopPropagation();
                            if (singleClickZoom) {
                              zoomImage();
                            }
                          }
                        }}
                        className={`${styles.slideshowImg}
                        ${props.fullScreen ? styles.fullScreenSlideshowImg : ""}
                        ${props.lightboxImgClass ? props.lightboxImgClass : ""}
                      ${displayImgMetadata ? styles.slideshowImgMetadata : ""} 
                      ${getCursor()}

                      ${isImageCaption(imgCaptionPlacement) ? styles.slideshowImgWithCaption : ""}
                      `}
                        style={{
                          width: getContainerWidth(
                            props.lightboxWidth,
                            isBrowserFullScreen,
                          ),
                          height: getContainerHeight(
                            props.lightboxHeight,
                            isBrowserFullScreen,
                          ),
                        }}
                      >
                        {getLightboxElem(index)}
                      </div>
                    </TransformComponent>
                  </TransformWrapper>
                </div>
              )}
            </div>
          );
        },
      );

      const initMagnifyingGlass = () => {
        if (!enableMagnifyingGlass) {
          initImageDimensions();
        } else {
          setImgAnimation("imgDrag");
        }
        setMagnifyingGlass(!enableMagnifyingGlass);
      };

      const getMetadataPanelStyle = () => {
        let style_object = {};
        if (isMobile && showImgMetadataPanel) {
          style_object = { height: "100vh" };
        }
        style_object["color"] = getMetadataTextColor();
        return style_object;
      };

      const initImageDimensions = () => {
        let img;
        if (imgSlideIndex == 0 || imgSlideIndex % images.length == 0) {
          img = document.getElementById("img");
        } else {
          img = imageRef.current;
        }

        var ratio = img.naturalWidth / img.naturalHeight;
        var width = img.height * ratio;
        var height = img.height;
        if (width > img.width) {
          width = img.width;
          height = img.width / ratio;
        }

        setImgContainHeight(height);
        setImgContainWidth(width);
      };

      const initEventListeners = () => {
        if (isBrowser() && !noWindow) {
          window.addEventListener("resize", handleWindowResize);
        }
      };

      const removeEventListeners = () => {
        removeOnSelectListener();
        if (isBrowser() && !noWindow) {
          window.removeEventListener("resize", handleWindowResize);
        }
      };

      const setReducedMotion = (mediaQuery) => {
        if (mediaQuery.matches) {
          setImgAnimation("fade");
        }
      };

      // Check if the user has a preference for reduced motion
      // If so, the image animation transitions between slides in the slideshow will be adjusted
      // to account for this
      const checkAndInitReducedMotion = () => {
        let reducedMotionMediaQuery: any = "";

        if (isBrowser() && !noWindow) {
          reducedMotionMediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          );

          if (!reducedMotionMediaQuery || reducedMotionMediaQuery.matches) {
            setImgAnimation("fade");
          }

          if (reducedMotionMediaQuery?.addEventListener) {
            reducedMotionMediaQuery.addEventListener(
              "change",
              setReducedMotion(reducedMotionMediaQuery),
            );
          } else {
            reducedMotionMediaQuery.addListener(
              setReducedMotion(reducedMotionMediaQuery),
            );
          }
        }

        return reducedMotionMediaQuery;
      };

      const initPropsForControlIcons = () => {
        if (props.showFullScreenIcon != undefined) {
          setDisplayFullScreenIcon(props.showFullScreenIcon);
        }
        if (props.showThumbnailIcon != undefined) {
          setDisplayThumbnailIcon(props.showThumbnailIcon);
        }

        if (props.showSlideshowIcon != undefined) {
          setDisplaySlideshowIcon(props.showSlideshowIcon);
        }
        if (props.showMagnificationIcons != undefined) {
          setDisplayMagnificationIcons(props.showMagnificationIcons);
        }
      };

      const initProps = () => {
        if (props.showControls != undefined) {
          setShowControls(props.showControls);
          if (props.showControls == false) {
            setDisplayMagnificationIcons(false);
          }
        }

        if (props.disableAnim == true) {
          MotionGlobalConfig.skipAnimations = true;
        }

        initPropsForControlIcons();

        if (props.disableImageZoom) {
          setDisableZoom(props.disableImageZoom);
        }

        if (isBrowser() && !noWindow) {
          setWidth(window.innerWidth);
        }

        // if (window.innerWidth <= mobileWidth) {
        //   setImgAnimation('fade')
        // }
      };

      // Slideshow feature; if isSlideshowPlaying set to true, then slideshow cycles through images
      useInterval(
        () => {
          if (isRTL) {
            updateImageSlideshow(-1);
          } else {
            updateImageSlideshow(1);
          }
        },

        // Delay in milliseconds or null to stop it
        isSlideshowPlaying ? slideshowInterval : null,
      );

      const isBrowser = () => {
        if (!noWindow) {
          return typeof window !== "undefined";
        }
        return false;
      };

      const initRTLImages = () => {
        // flip images array
        let imagesMetadataCopy = props.images;
        imagesMetadataCopy.reverse();

        setImages(imagesMetadataCopy);

        if (images.length > 0) {
          let imagesRTLCopy = images;
          imagesRTLCopy.reverse();
          setImages(imagesRTLCopy);
        }
      };

      const initAndOpenLightbox = (i, img_gallery, isMounted) => {
        let index;

        if (isRTL) {
          index = getRTLIndex(img_gallery.length, i);
        } else {
          index = i;
        }

        let reactSwipeOptionConfig = reactSwipeOptions;
        reactSwipeOptionConfig.startIndex = index;

        if (isMounted) setReactSwipeOptions(reactSwipeOptionConfig);
        setZoomIdx(index);
        openModal(index);
      };

      const initImages = (isMounted, updateImages) => {
        if (coverMode && props.images) {
          if (props.coverImageInLightbox == false) {
            let filterImages = props.images.filter((img) => img.cover != true);
            setImages(filterImages);
          } else {
            setImages(props.images);
          }
        }

        if (updateImages || !isInit) {
          if (lightboxIdentifier && props.children) {
            if (props.queryElems) {
              let img_gallery: any = [];
              for (let k = 0; k < props.queryElems.length; k++) {
                let elemSelector = props.queryElems[k];
                let queryElems = document.querySelectorAll(`${elemSelector}`);
                queryElems.forEach((element) => {
                  img_gallery.push(element);
                });
              }
              let img_elements: ImageElement[] = [];

              if (img_gallery.length > 0) {
                for (let i = 0; i <= img_gallery.length - 1; i++) {
                  let img = img_gallery[i];
                  img.addEventListener(
                    "click",
                    () => {
                      initAndOpenLightbox(i, img_gallery, isMounted);
                    },
                    false,
                  );
                  img.classList.add("cursor-pointer");

                  if (img.src) {
                    img_elements.push({
                      src: img.src,
                      alt: img.alt,
                      loaded: false,
                    });
                  } else if (img.href) {
                    img_elements.push({
                      src: img.href,
                      alt: img.alt,
                      loaded: false,
                    });
                  }
                }

                if (isMounted && !coverMode) {
                  if (props.framework != "next") {
                    setImages(img_elements);
                  } else if (props.framework == "next") {
                    setImages(props.images);
                  }
                }
              }
            } else {
              let img_gallery: NodeListOf<HTMLImageElement> =
                document.querySelectorAll(
                  `[data-lightboxjs=${lightboxIdentifier}]`,
                );
              let originalImageAttr = false;

              let img_elements: ImageElement[] = [];
              if (img_gallery.length > 0) {
                for (let i = 0; i <= img_gallery.length - 1; i++) {
                  let img = img_gallery[i];

                  let attr_val = img.getAttribute("data-lightboxjs");
                  if (attr_val == lightboxIdentifier) {
                    img.addEventListener(
                      "click",
                      () => {
                        initAndOpenLightbox(i, img_gallery, isMounted);
                      },
                      false,
                    );
                    img.classList.add("cursor-pointer");

                    let original_img_src = img.getAttribute(
                      "data-lightboxjs-original",
                    );
                    if (original_img_src) {
                      img_elements.push({
                        src: original_img_src,
                        alt: img.alt,
                        loaded: false,
                      });
                      originalImageAttr = true;
                    } else if (
                      props.images &&
                      props.images[i] &&
                      props.images[i].original
                    ) {
                      img_elements.push({
                        src: props.images[i].original,
                        alt: props.images[i].alt,
                        loaded: false,
                      });
                    } else if (img.src) {
                      img_elements.push({
                        src: img.src,
                        alt: img.alt,
                        loaded: false,
                      });
                    } else if (img.tagName == "DIV") {
                      let corresponding_img_item = props.images[i];
                      let img_src = corresponding_img_item.src;
                      let img_alt = corresponding_img_item.alt;
                      img_elements.push({
                        src: img_src,
                        alt: img_alt,
                        loaded: false,
                      });
                    }
                  }
                }
                if (isMounted && !coverMode) {
                  if (originalImageAttr) {
                    setImages(img_elements);
                  } else if (
                    props.showAllImages != true &&
                    props.framework != "next"
                  ) {
                    setImages(img_elements);
                  } else if (props.framework == "next" && !originalImageAttr) {
                    setImages(props.images);
                  } else {
                    setImages(props.images);
                  }
                }
              } else {
                if (props.images) {
                  setImages(props.images);
                }
              }
            }
          } else if (lightboxIdentifier && props.images && !props.children) {
            setImages(props.images);
          } else if (!lightboxIdentifier && props.images && !props.children) {
            setImages(props.images);
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

            let imgs: ImageElement[] = [];
            for (let k = 0; k < imgArray.length; k++) {
              let img_elem = imgArray[k];
              let img_obj = {
                src: img_elem.props.src,
                alt: img_elem.props.alt,
                loaded: false,
              };
              imgs.push(img_obj);
            }
            if (isRTL) {
              imgs.reverse();
            }
            if (isMounted) {
              setImages(imgs);
            }

            setPreviewImageElems(imgArray);
          } else {
            if (isMounted) {
              setImages(props.images);
            }
          }

          if (isMounted) setIsInit(true);
        }
      };

      const useForceUpdate = () => {
        let [value, setValue] = useState(true);
        return () => setValue(!value);
      };

      const forceUpdate = useForceUpdate();

      const dispatchSlideSelectEvents = (newIndex, prevIndex) => {
        if (props.onSelect) {
          props.onSelect(newIndex, images[newIndex]);
          forceUpdate();
        }

        if (newIndex == 0 && prevIndex == images.length - 1) {
          dispatchNextImgEvent(newIndex);
        } else if (newIndex == images.length - 1 && prevIndex == 0) {
          dispatchPrevImgEvent(newIndex);
        } else if (newIndex > prevIndex) {
          dispatchNextImgEvent(newIndex);
        } else if (newIndex < prevIndex) {
          dispatchPrevImgEvent(newIndex);
        }
      };

      const onSelect = useCallback(() => {
        if (!emblaApi) return;

        let newSlideIndex: any = emblaApi.selectedScrollSnap();
        let prevSlideIndex: any = emblaApi.previousScrollSnap();

        if (newSlideIndex != prevSlideIndex) {
          initSlide(newSlideIndex);
          resetMedia(prevSlideIndex);
          dispatchSlideSelectEvents(newSlideIndex, prevSlideIndex);
        }

        if (emblaThumbsApi) {
          emblaThumbsApi.scrollTo(emblaApi.selectedScrollSnap());
        }
      }, [emblaApi, emblaThumbsApi]);

      const onReinit = useCallback(() => {
        if (!emblaApi) return;
        setEmblaReinitialized(true);
      }, [emblaApi, emblaReinitialized]);

      const handleResize = (entry) => {
        emblaApi?.reInit();
      };

      const rootNode = emblaApi?.rootNode() || null;

      if (isBrowser() && !noWindow) {
        useResizeObserver(rootNode, handleResize);
      }

      const removeOnSelectListener = useCallback(() => {
        if (emblaApi) emblaApi.off("select", onSelect);
      }, [emblaApi, onSelect]);

      useEffect(() => {
        if (emblaApi) {
          if (zoomedIn) {
            emblaApi.reInit({ watchDrag: false });
          } else {
            emblaApi.reInit({ watchDrag: true });
          }
        }
      }, [zoomedIn]);

      useEffect(() => {
        if (displayImgMetadata) {
          if (width != 0 && isMobile) {
            setShowImgMetadataPanel(false);
          } else {
            setShowImgMetadataPanel(true);
          }
        }
      }, [width]);

      useEffect(() => {
        if (!emblaApi) return;

        if (showModal) emblaApi.reInit();
      }, [showModal, emblaApi]);

      useEffect(() => {
        if (emblaApi) emblaApi.on("select", onSelect);
        if (emblaApi) {
        }
      }, [emblaApi, onSelect]);

      useEffect(() => {
        if (emblaApi) emblaApi.on("reInit", onReinit);
      }, [emblaApi, onReinit]);

      // update theme if prop changes
      useEffect(() => {
        initStyling();
        if (props.iconColor) {
          setIconColor(props.iconColor);
        }
        if (props.backgroundColor) {
          setBackgroundColor(props.backgroundColor);
        }
      }, [props.theme, props.iconColor, props.backgroundColor]);

      useEffect(() => {
        initImages(true, true);
      }, [props.images, props.displayedImages]);

      const prevValue = usePrevious(open);
      const prevImages: any = usePrevious(images);

      const imagesEqualToPrevious = (images: any) => {
        if (images && prevImages) {
          if (
            (images && images?.length) != (prevImages && prevImages?.length)
          ) {
            return false;
          }

          let imgArray;
          if (images.length > prevImages) {
            imgArray = images;
          } else {
            imgArray = prevImages;
          }
          for (let i = 0; i < imgArray.length; i++) {
            let images_copy = images.slice(0);
            let prevImages_copy = prevImages.slice(0);

            let image = images_copy[i];
            let prevImage = prevImages_copy[i];

            if (image["loaded"]) {
              delete image["loaded"];
            }

            if (prevImage["loaded"]) {
              delete prevImage["loaded"];
            }

            if (!areObjectsEqual(image, prevImage)) {
              return false;
            }
          }
        }
        return true;
      };

      useEffect(() => {
        let starting_index = 0;
        if (props.startingSlideIndex) {
          starting_index = wrapNums(0, images.length, props.startingSlideIndex);
          setStartingIndex(starting_index);
        }

        if (
          props.open == true &&
          imagesEqualToPrevious(images) == false &&
          props.startingSlideIndex
        ) {
          if (props.images) {
            setImages(props.images);
          }
          openModalWithSlideNum(starting_index);
        } else if (props.open && prevValue != true) {
          if (props.images) {
            setImages(props.images);
          }

          openModalWithSlideNum(starting_index);
        } else if (props.open == false) {
          closeModal();
        }
      }, [props.open, props.startingSlideIndex, images]);

      useEffect(() => {
        if (isOpen == true) {
          dispatchOpenEvent();
        } else {
          dispatchCloseEvent();
        }
      }, [isOpen]);

      useEffect(() => {
        //lightboxRef.current?.focus();

        // Error check
        if (props.render) {
          if (!props.images) {
            console.error(
              "Array of images must be passed to `SlideshowLightbox` (with the `images` prop) if using custom render method. ",
            );
          }
        }

        let isMounted = true;
        if (isMounted) initProps();

        if (window) {
          const userAgent = window.navigator.userAgent.toLowerCase();
          let is_tablet_useragent =
            /(ipad|iphone|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
              userAgent,
            );
          let is_ipad_useragent =
            /Macintosh/i.test(navigator.userAgent) &&
            navigator.maxTouchPoints > 1;

          setIsTabletUserAgent(is_tablet_useragent || is_ipad_useragent);
        }

        if (coverMode && props.images) {
          if (props.coverImageInLightbox == false) {
            let filterImages = props.images.filter((img) => img.cover != true);
            setImages(filterImages);
          } else {
            setImages(props.images);
          }
        }

        if (isMounted) {
          initEventListeners();
        }

        let reducedMotionMediaQuery = checkAndInitReducedMotion();

        if (displayImgMetadata) {
          setImgAnimation("fade");
        }

        if (!isInit) {
          initImages(isMounted, false);

          if (props.images && isRTL == true) {
            initRTLImages();
          }
        }

        if (isMounted) initStyling();

        return () => {
          isMounted = false;
          removeEventListeners();
          if (reducedMotionMediaQuery) {
            reducedMotionMediaQuery.removeEventListener(
              "change",
              reducedMotionMediaQuery,
            );
          }
        };
      }, []);

      const renderPreviewImages = () => {
        let image_elems;

        if (props.images && props.children && lightboxIdentifier == false) {
          image_elems = props.children;
        } else if (props.images && lightboxIdentifier == false) {
          image_elems = props.images.map((elem, index) => (
            <img
              className={`${
                props.imgClassName ? props.imgClassName : ""
              } ${styles.cursorPointer}`}
              src={!isVideo(index) ? elem.src : elem.thumbnail}
              onClick={() => {
                let img_index;

                if (isRTL) {
                  img_index = getRTLIndex(props.images.length, index);
                } else {
                  img_index = index;
                }

                openModalWithSlideNum(img_index);
              }}
              key={index}
            />
          ));
        } else if (
          lightboxIdentifier != false &&
          props.children &&
          coverMode == false
        ) {
          {
            /* IF Lightbox identifier provided or props.images provided AND props.children */
          }
          image_elems = props.children;
        }
        // No lightbox identifier provided or no cover mode
        else if (
          !((lightboxIdentifier == false && props.images) || coverMode == true)
        ) {
          image_elems = previewImageElems
            .filter((elem) => elem.type == "img")
            .map((elem, index) => (
              <img
                {...elem.props}
                className={`${
                  elem.props.className ? elem.props.className : ""
                } ${styles.cursorPointer}`}
                onClick={() => {
                  let img_index;

                  if (isRTL) {
                    img_index = getRTLIndex(previewImageElems.length, index);
                  } else {
                    img_index = index;
                  }

                  openModalWithSlideNum(img_index);
                }}
                key={index}
              />
            ));
        } else if (coverMode) {
          image_elems = props.children;
        }
        return image_elems;
      };

      useEffect(() => {
        const modal = document.getElementById("lightboxContainer");
        if (!showModal || !modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElem = focusableElements[0] as HTMLElement;
        const lastElem: HTMLElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        const handleTab = (e) => {
          if (e.key === "Tab") {
            if (e.shiftKey) {
              // Shift + Tab

              if (document.activeElement === firstElem) {
                e.preventDefault();
                lastElem.focus();
              }
            } else {
              // Tab

              if (document.activeElement === lastElem) {
                e.preventDefault();
                firstElem.focus();
              }
            }
          }
        };

        modal.addEventListener("keydown", handleTab);
        return () => modal.removeEventListener("keydown", handleTab);
      }, [showModal]);

      useScrollLock(showModal);

      return (
        <div className={`${initWrapperClassname()}`}>
          {renderPreviewImages()}


          {isMounted && createPortal(

          <AnimatePresence initial={false}>
            {showModal !== false && (
                <Div100vh>
                  <div
                    style={{ height: lboxHeight }}
                    ref={lightboxRef}
                    tabIndex={-1} // allow focus via JS
                    className="lightboxContainer"
                    id="lightboxContainer"
                    aria-modal="true"
                    role="dialog"
                  >
                    <motion.div
                      className={`${styles.modalContainer}`}
                      style={{ height: lboxHeight }}
                      initial={"inactive"}
                      variants={variants}
                      animate={showModal ? "active" : "inactive"}
                      exit={"inactive"}
                      transition={{ duration: "0.3" }}
                      // Do not remove: forces JS animation; avoids Framer WAAPI end-of-animation flicker
                      onUpdate={() => {}}
                      onAnimationComplete={() => {
                        let animEntered = !animationEntered;
                        setAnimationEntered(animEntered);

                        if (animEntered == true) {
                          let prevFocusedElement: any = document.activeElement;
                          setPrevFocusedElem(prevFocusedElement);

                          const firstButton: HTMLElement =
                            document.querySelector(
                              ".lightboxContainer button, .lightboxContainer [tabindex='0']",
                            );
                          if (firstButton) {
                            firstButton.focus();
                          }

                          document.getElementById("lightboxContainer")?.focus();
                        } else {
                          prevFocusedElem?.focus();
                        }
                        if (emblaApi) emblaApi.reInit();
                      }}
                    >
                      <motion.div
                        className={`${styles.slideshowAnimContainer} `}
                        key="slideshowAnimContainer"
                        id="slideshowAnim"
                        style={{
                          backgroundColor: backgroundColor,
                          width: lightboxModalWidth,
                          height: lboxHeight,
                        }}
                      >
                        <div
                          className={`${styles.lightboxContainer} `}
                          id="lightboxContent"
                          tabIndex={-1}
                          role="dialog"
                          onClick={(e) => {
                            if (modalCloseOption == "clickOutside") {
                              checkOutsideClick(e, ".imageModal", closeModal);
                            }
                          }}
                        >
                          <section
                            className={` ${styles.iconsHeader} 
                      ${controlsPlacement == "default" ? styles.iconHeaderDefault : styles.iconHeaderCenter} 
                      
                      ${iconColor ? "" : getIconClasses()} imageModal`}
                            style={{ color: iconColor }}
                          >
                            <KeyHandler
                              keyValue={"ArrowLeft"}
                              code={"37"}
                              onKeyHandle={() => {
                                prevSlide();
                              }}
                            />
                            <KeyHandler
                              keyValue={"ArrowRight"}
                              code={"39"}
                              onKeyHandle={() => {
                                nextSlide();
                              }}
                            />

                            <EscKeyHandlers
                              isBrowserFullScreen={isBrowserFullScreen}
                              onCloseModal={closeModal}
                            />

                            {/* Support for Internet Explorer and Edge key values  */}
                            <KeyHandler
                              keyValue={"Left"}
                              code={"37"}
                              onKeyHandle={() => {
                                prevSlide();
                              }}
                            />
                            <KeyHandler
                              keyValue={"Right"}
                              code={"39"}
                              onKeyHandle={() => {
                                nextSlide();
                              }}
                            />

                            {showControls == true && (
                              <div className={`${styles.controls}`}>
                                {disableZoom ||
                                displayMagnificationIcons == false ? null : (
                                  <motion.div>
                                    <IconButton
                                      onClick={() => {
                                        if (enableMagnifyingGlass)
                                          initMagnifyingGlass();
                                        zoomIntoImage();
                                      }}
                                      label="Zoom in"
                                      //className={styles.lightboxjsBtn}
                                      style={getIconStyle()}
                                    >
                                      {props.zoomInComponent ? (
                                        props.zoomInComponent
                                      ) : (
                                        <ZoomIn
                                          size={24}
                                          color={iconColor || undefined}
                                          className={`${styles.lightboxjsIcon} ${iconColor ? "" : getIconClasses()}`}
                                        />
                                      )}
                                    </IconButton>
                                  </motion.div>
                                )}

                                {disableZoom ||
                                displayMagnificationIcons == false ? null : (
                                  <motion.div>
                                    <IconButton
                                      label="Zoom out"
                                      onClick={() => {
                                        zoomOutImage();
                                      }}
                                    >
                                      {props.zoomOutComponent ? (
                                        props.zoomOutComponent
                                      ) : (
                                        <ZoomOut
                                          size={24}
                                          className={`${styles.lightboxjsIcon} ${
                                            iconColor ? "" : getIconClasses()
                                          }`}
                                          style={getIconStyle()}
                                          color={
                                            iconColor ? iconColor : undefined
                                          }
                                        />
                                      )}
                                    </IconButton>
                                  </motion.div>
                                )}

                                {displayDownloadBtn() ? (
                                  <IconButton
                                    label="Download"
                                    onClick={() => {
                                      saveImage();
                                    }}
                                  >
                                    <Download
                                      size={24}
                                      className={`${styles.lightboxjsIcon} ${
                                        iconColor ? "" : getIconClasses()
                                      }`}
                                      style={getIconStyle()}
                                      color={iconColor ? iconColor : undefined}
                                    />
                                  </IconButton>
                                ) : null}

                                {displayFullScreenIcon ? (
                                  isBrowserFullScreen ? (
                                    <motion.div>
                                      <IconButton
                                        label="Exit full screen"
                                        onClick={() => {
                                          isBrowserFullScreen
                                            ? exitFullScreen()
                                            : fullScreen(fullScreenHandler);
                                        }}
                                      >
                                        <FullscreenExit
                                          size={24}
                                          className={`${styles.lightboxjsIcon} ${
                                            iconColor ? "" : getIconClasses()
                                          }`}
                                          style={getIconStyle()}
                                          color={
                                            iconColor ? iconColor : undefined
                                          }
                                        />
                                      </IconButton>
                                    </motion.div>
                                  ) : (
                                    <motion.div>
                                      <IconButton
                                        label="Make lightbox full screen"
                                        onClick={() => {
                                          isBrowserFullScreen
                                            ? exitFullScreen()
                                            : fullScreen(fullScreenHandler);
                                        }}
                                      >
                                        <Fullscreen
                                          size={24}
                                          className={`${styles.lightboxjsIcon} ${
                                            iconColor ? "" : getIconClasses()
                                          }`}
                                          style={getIconStyle()}
                                          color={
                                            iconColor ? iconColor : undefined
                                          }
                                        />
                                      </IconButton>
                                    </motion.div>
                                  )
                                ) : null}

                                {isMobile && displayImgMetadata ? (
                                  <motion.div>
                                    <IconButton
                                      label="Show image metadata"
                                      onClick={() => {
                                        setShowImgMetadataPanel(
                                          !showImgMetadataPanel,
                                        );
                                        setDisplayLoader(false);
                                      }}
                                    >
                                      <InfoCircle
                                        size={24}
                                        className={`${styles.lightboxjsIcon} ${
                                          iconColor ? "" : getIconClasses()
                                        }`}
                                        style={getIconStyle()}
                                        color={
                                          iconColor ? iconColor : undefined
                                        }
                                      />
                                    </IconButton>
                                  </motion.div>
                                ) : null}

                                {rotateImgIcon ? (
                                  <motion.div>
                                    <IconButton
                                      label="Rotate image"
                                      onClick={() => {
                                        // setShowThumbnails(!showThumbnails)
                                        // setFullImg(!fullImg)
                                        rotateImage();
                                      }}
                                    >
                                      <ArrowClockwise
                                        size={24}
                                        className={`${styles.lightboxjsIcon} ${
                                          iconColor ? "" : getIconClasses()
                                        }`}
                                        style={getIconStyle()}
                                        color={
                                          iconColor ? iconColor : undefined
                                        }
                                      />
                                    </IconButton>
                                  </motion.div>
                                ) : null}

                                {displayThumbnailIcon ? (
                                  <motion.div>
                                    <IconButton
                                      label="Show thumbnails"
                                      onClick={() => {
                                        setShowThumbnails(!showThumbnails);
                                        setFullImg(!fullImg);
                                      }}
                                    >
                                      <GridFill
                                        size={24}
                                        className={`${styles.lightboxjsIcon} ${
                                          iconColor ? "" : getIconClasses()
                                        }`}
                                        style={getIconStyle()}
                                        color={
                                          iconColor ? iconColor : undefined
                                        }
                                      />
                                    </IconButton>
                                  </motion.div>
                                ) : null}

                                {shouldDisplayMagnifyingGlassIcon() ? (
                                  <motion.div>
                                    <IconButton
                                      label="Show magnifying glass"
                                      onClick={() => initMagnifyingGlass()}
                                    >
                                      <Search
                                        size={24}
                                        className={`${styles.lightboxjsIcon} ${
                                          iconColor ? "" : getIconClasses()
                                        }`}
                                        style={getIconStyle()}
                                        color={
                                          iconColor ? iconColor : undefined
                                        }
                                      />
                                    </IconButton>
                                  </motion.div>
                                ) : null}

                                {shouldDisplaySlideshowIcon() ? (
                                  <motion.div
                                    className={styles.slideshowPlayBtn}
                                  >
                                    {isSlideshowPlaying ? (
                                      <IconButton
                                        label="Pause slideshow"
                                        onClick={() => {
                                          isSlideshowPlaying
                                            ? stopSlideshow()
                                            : playSlideshow();
                                        }}
                                      >
                                        <PauseCircleFill
                                          size={24}
                                          className={`${styles.lightboxjsIcon} ${
                                            iconColor ? "" : getIconClasses()
                                          }`}
                                          style={getIconStyle()}
                                          color={
                                            iconColor ? iconColor : undefined
                                          }
                                        />
                                      </IconButton>
                                    ) : (
                                      <IconButton
                                        label="Play slideshow"
                                        onClick={() => {
                                          isSlideshowPlaying
                                            ? stopSlideshow()
                                            : playSlideshow();
                                        }}
                                      >
                                        <PlayCircleFill
                                          size={24}
                                          className={`${styles.lightboxjsIcon} ${
                                            iconColor ? "" : getIconClasses()
                                          }`}
                                          style={getIconStyle()}
                                          color={
                                            iconColor ? iconColor : undefined
                                          }
                                        />
                                      </IconButton>
                                    )}
                                  </motion.div>
                                ) : null}

                                {props.controlComponent ? (
                                  <motion.div>
                                    <IconButton>
                                      {props.controlComponent}
                                    </IconButton>
                                  </motion.div>
                                ) : null}
                              </div>
                            )}

                            {props.closeComponent ? (
                              <div
                                onClick={() => {
                                  closeModal();
                                }}
                              >
                                <IconButton
                                  label="Close"
                                  id="closeBtn"
                                  onClick={() => {
                                    closeModal();
                                  }}
                                >
                                  {props.closeComponent}
                                </IconButton>
                              </div>
                            ) : (
                              <motion.div
                                className={`${styles.closeIcon} ${props.showControls == false ? styles.mlAuto : ""}`}
                              >
                                <IconButton
                                  label="Close"
                                  id="closeBtn"
                                  className={`${
                                    props.showControlsBar == false &&
                                    props.showControls == false
                                      ? styles.closeButtonRounded
                                      : styles.closeButton
                                  }`}
                                  onClick={() => {
                                    closeModal();
                                  }}
                                >
                                  <XLg
                                    id="closeIcon"
                                    size={24}
                                    className={`${styles.lightboxjsIcon} ${
                                      iconColor ? "" : getIconClasses()
                                    }`}
                                    color={iconColor ? iconColor : undefined}
                                    style={getCloseIconBtnStyle()}
                                  />
                                </IconButton>
                              </motion.div>
                            )}
                          </section>
                          {displayArrows() ? (
                            <div>
                              <IconButton
                                label="Left arrow"
                                className={
                                  leftArrowStyle
                                    ? `${styles.prev1} ${getArrowStyle()} imageModal ${displayImgMetadata ? styles.prev1Metadata : ""}`
                                    : "imageModal"
                                }
                                style={leftArrowStyle}
                                onClick={() => {
                                  prevSlide();
                                }}
                              >
                                {prevArrowElem ? (
                                  prevArrowElem
                                ) : (
                                  <span
                                    className={`${props.leftArrowClassname ? props.leftArrowClassname : ""}`}
                                  >
                                    &#10094;
                                  </span>
                                )}
                              </IconButton>
                              <IconButton
                                label="Right arrow"
                                className={
                                  rightArrowStyle
                                    ? `${styles.next1} ${getArrowStyle()} imageModal`
                                    : "imageModal"
                                }
                                style={rightArrowStyle}
                                onClick={() => {
                                  nextSlide();
                                }}
                              >
                                {nextArrowElem ? (
                                  nextArrowElem
                                ) : (
                                  <span
                                    className={`${props.rightArrowClassname ? props.rightArrowClassname : ""}`}
                                  >
                                    &#10095;
                                  </span>
                                )}
                              </IconButton>
                            </div>
                          ) : null}

                          <AnimatePresence initial={false} custom={direction}>
                            <div
                              className={`${getInnerContainerStyles()} ${styles.embla} 
                        ${
                          isImageCaption("below") && showControlsBar == true
                            ? styles.slideImageAndCaption
                            : ""
                        } 
                          ${props.fullScreen ? "" : styles.slideshowInnerContainer} 
                          ${
                            props.showControlsBar == false || props.fullScreen
                              ? styles.hideControlsBar
                              : ""
                          }
                          ${displayImgMetadata ? styles.slideshowInnerContainerImgMetadata : ""}  `}
                              style={getContainerStyles()}
                            >
                              {shouldDisplayMetadataPanel() ? (
                                <div
                                  className={styles.metadata}
                                  style={getMetadataPanelStyle()}
                                >
                                  {isLoading ? null : (
                                    <div
                                      className={styles.metadataInnerContainer}
                                    >
                                      {getMetadataPanel()}

                                      {isMobile && showImgMetadataPanel ? (
                                        <IconButton
                                          className={styles.imgMetadataCloseBtn}
                                          onClick={() => {
                                            setShowImgMetadataPanel(false);
                                          }}
                                        >
                                          <XLg
                                            size={24}
                                            className={`${styles.lightboxjsIcon} ${
                                              iconColor ? "" : getIconClasses()
                                            }`}
                                            color={
                                              iconColor ? iconColor : undefined
                                            }
                                            style={getIconStyle()}
                                          />
                                        </IconButton>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                              ) : null}
                              {isImageCaption("above") ? (
                                <div
                                  className={`${styles.imgTitleContainer} imageModal`}
                                >
                                  <p
                                    className={`${styles.imgTitle}`}
                                    key={"imgCaption" + slideIndex}
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

                              <div
                                className={`${styles.emblaViewport} 
                            ${displayImgMetadata ? styles.emblaContainerImgMetadata : ""}`}
                                style={
                                  props.fullScreen == true
                                    ? { height: lightboxModalHeight }
                                    : {}
                                }
                                ref={showModal ? emblaRef : null}
                              >
                                <div
                                  className={`
                          ${getImgFadeClass()}
                          ${styles.emblaContainer}
                            ${displayImgMetadata ? styles.emblaContainerImgMetadata : ""}`}
                                >
                                  {regularImgPaneNodes}
                                </div>
                              </div>
                            </div>
                          </AnimatePresence>

                          <div
                            className={`${styles.thumbnailsOuterContainer} ${isImageCaption("below") ? styles.thumbnailsAndCaption : ""}
                      ${displayImgMetadata ? styles.thumbnailsOuterContainerMetadata : ""} `}
                            style={getThumbnailsOuterContainerStyle()}
                          >
                            {isImageCaption("below") ? (
                              <div
                                className={`${styles.imgTitleContainer} imageModal`}
                              >
                                <p
                                  className={`${styles.imgTitle}`}
                                  key={"imgCaption" + slideIndex}
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
                              {showThumbnails !== false &&
                                navigationDots !== true && (
                                  <motion.div
                                    initial={"hidden"}
                                    exit={"hidden"}
                                    animate={"visible"}
                                    style={
                                      imagesLoaded
                                        ? {}
                                        : { display: "displayHidden" }
                                    }
                                    transition={{
                                      type: "spring",
                                      duration: 0.75,
                                    }}
                                    variants={thumbnailVariants}
                                    className={`${styles.thumbnails} ${
                                      isImageCaption("below")
                                        ? styles.thumbnailsWithCaption
                                        : ""
                                    }`}
                                  >
                                    <div
                                      className={`${styles.emblaThumbs} ${styles.thumbnails}`}
                                    >
                                      <div
                                        className={styles.emblaThumbsViewport}
                                        ref={emblaThumbsRef}
                                      >
                                        <div
                                          className={
                                            styles.emblaThumbsContainer
                                          }
                                        >
                                          {frameworkID == "next" && props.images
                                            ? props.images.map((img, index) =>
                                                getImageThumbnail(
                                                  img,
                                                  index,
                                                  true,
                                                  props,
                                                ),
                                              )
                                            : // Not Next.js
                                              images.map((img, index) =>
                                                getImageThumbnail(
                                                  img,
                                                  index,
                                                  false,
                                                  props,
                                                ),
                                              )}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                              {showThumbnails !== true &&
                                navigationDots !== false && (
                                  <motion.div
                                    initial={"hidden"}
                                    exit={"hidden"}
                                    animate={"visible"}
                                    style={
                                      imagesLoaded
                                        ? {}
                                        : { display: "displayHidden" }
                                    }
                                    transition={{
                                      type: "spring",
                                      duration: 0.75,
                                    }}
                                    variants={thumbnailVariants}
                                    className={`${styles.thumbnails} ${
                                      isImageCaption("below")
                                        ? styles.thumbnailsWithCaption
                                        : ""
                                    }`}
                                  >
                                    <div
                                      className={`${styles.emblathumbs} ${styles.thumbnails}`}
                                    >
                                      <div
                                        className={styles.emblaThumbsViewport}
                                        ref={emblaThumbsRef}
                                      >
                                        <div
                                          className={`${styles.navigationDots} ${styles.emblaThumbsContainer} imageModal
                                `}
                                        >
                                          {frameworkID == "next" && props.images
                                            ? props.images.map((img, index) =>
                                                getNavigationDot(index),
                                              )
                                            : // Not Next.js
                                              images.map((img, index) =>
                                                getNavigationDot(index),
                                              )}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                      {props.rightSidebarComponent
                        ? props.rightSidebarComponent
                        : null}
                    </motion.div>

                    {props.lightboxFooterComponent
                      ? props.lightboxFooterComponent
                      : null}
                  </div>
                </Div100vh>
            )}
          </AnimatePresence>
            ,
            document.body

          )}


        </div>
      );
    },
  );
