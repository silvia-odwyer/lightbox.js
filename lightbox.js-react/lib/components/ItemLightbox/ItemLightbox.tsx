"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowClockwise,
  Download,
  Fullscreen,
  FullscreenExit,
  XLg,
  ZoomIn,
  ZoomOut,
} from "react-bootstrap-icons";
import Div100vh, { use100vh } from "react-div-100vh";
import { createPortal } from "react-dom";
import YouTube from "react-youtube";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

import {
  EscKeyHandlers,
  IconButton,
  PictureElem,
} from "../shared-components.js";
import {
  checkOutsideClick,
  downloadImage,
  fullScreen,
  getContainerHeight,
  getContainerWidth,
  removeFullScreenChangeEventListeners,
  singleItemThemes as themes,
  useScrollLock,
  variants,
} from "../shared-utility.js";
import { LightboxImage } from "../SlideshowLightbox/LightboxImage.jsx";
import styles from "../SlideshowLightbox/SlideshowLightbox.module.css";
import {
  closeFullScreen,
  getScale,
  getVideoHeight,
  getVideoWidth,
  shouldAutoplay,
} from "../SlideshowLightbox/utility.js";

const defaultTheme = "lightbox";
const mobileWidth = 768;
const tabletWidth = 1100;
// Max pointer movement (px) between mousedown and click for it to count as a click, not a drag
const imgZoomDelta = 2;

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])';

const transformWrapperStyle = {
  maxWidth: "100vw",
  height: "100vh",
  margin: "auto",
};
const transformContentStyle = { ...transformWrapperStyle, display: "grid" };

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

/** Shape of a Next.js static image import (`import pic from "./pic.jpg"`). */
type StaticImport = {
  src: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
};

/** A string URL, a Next.js static import, or a (possibly async) function returning either. */
export type ImageSource =
  | string
  | StaticImport
  | (() => string | StaticImport | Promise<string | StaticImport>);

export type ImageItem = {
  type?: "image";
  src?: ImageSource;
  /** Higher-resolution version shown in the lightbox; takes precedence over `src`. */
  original?: ImageSource;
  alt?: string;
  title?: string;
  caption?: string;
  picture?: Record<string, any>;
};

export type VideoItem =
  | { type: "yt"; videoID: string; caption?: string; [key: string]: any }
  | { type: "htmlVideo"; videoSrc: string; caption?: string; [key: string]: any }
  | {
      type: "customVideoEmbed";
      embed: ReactNode;
      caption?: string;
      [key: string]: any;
    };

export type CustomEmbedItem = {
  type: "customEmbed";
  embed: ReactNode;
  caption?: string;
};

export type LightboxItem = ImageItem | VideoItem | CustomEmbedItem;

const VIDEO_TYPES = ["yt", "htmlVideo", "customVideoEmbed"];

export const isVideoItem = (item: any): item is VideoItem =>
  !!item && VIDEO_TYPES.includes(item.type);

export const isImageItem = (item: any): item is ImageItem =>
  !!item && !isVideoItem(item) && item.type !== "customEmbed";

/* -------------------------------------------------------------------------- */
/*                              Source resolution                             */
/* -------------------------------------------------------------------------- */

const toSrcString = (value: any): string | undefined => {
  if (value == null || value === "") return undefined;
  if (typeof value === "string") return value;
  // Next.js static imports are objects with a `src` string
  if (typeof value === "object" && typeof value.src === "string") {
    return value.src;
  }
  return undefined;
};

/** Resolves any ImageSource to a URL string. */
export const resolveImageSource = async (
  source: ImageSource | undefined,
): Promise<string | undefined> => {
  if (typeof source === "function") return toSrcString(await source());
  return toSrcString(source);
};

/**
 * Returns a URL for an ImageSource. Strings and static imports resolve
 * synchronously (so they work during SSR); functions resolve asynchronously.
 * Async source functions should be stable (defined outside render or memoised),
 * otherwise they are re-invoked on every render.
 */
export function useResolvedSrc(
  source: ImageSource | undefined,
  onError?: (error: any) => void,
): string | undefined {
  const isAsync = typeof source === "function";
  const [asyncSrc, setAsyncSrc] = useState<string | undefined>(undefined);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (typeof source !== "function") return;
    let cancelled = false;

    Promise.resolve()
      .then(() => source())
      .then((value) => {
        if (!cancelled) setAsyncSrc(toSrcString(value));
      })
      .catch((error) => {
        if (cancelled) return;
        setAsyncSrc(undefined);
        onErrorRef.current?.(error);
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  return isAsync ? asyncSrc : toSrcString(source);
}

/* -------------------------------------------------------------------------- */
/*                                   Props                                    */
/* -------------------------------------------------------------------------- */

export interface ItemLightboxProps {
  /** The single image or video item to display. */
  item?: LightboxItem | any;
  /** Rendered inline (outside the modal), e.g. a clickable preview. */
  children?: ReactNode;

  open?: boolean;
  onOpen?: (item?: LightboxItem) => void;
  onClose?: (item?: LightboxItem) => void;
  onSelect?: (item?: LightboxItem) => void;
  onError?: (event: any, message: string) => void;
  onRotate?: (rotation: number) => void;

  // Theming
  theme?: string;
  backgroundColor?: string;
  iconColor?: any;
  textColor?: string;
  iconStyle?: any;
  closeIconBtnStyle?: any;

  // Layout
  fullScreen?: boolean;
  fullScreenFillMode?: any;
  lightboxHeight?: string;
  lightboxWidth?: string;
  lightboxImgClass?: string;
  className?: string;
  imgWrapperClassName?: string;
  roundedImages?: boolean;
  /** @deprecated use `roundedImages` */
  rounded?: boolean;

  // Controls (all default to true unless noted)
  showControls?: boolean;
  showControlsBar?: boolean;
  showFullScreenIcon?: boolean;
  showMagnificationIcons?: boolean;
  /** Default false */
  downloadImages?: boolean;
  /** Default false. Images only. */
  rotateIcon?: boolean;
  modalClose?: string;
  controlComponent?: ReactNode;
  closeComponent?: ReactNode;
  zoomInComponent?: ReactNode;
  zoomOutComponent?: ReactNode;
  lightboxFooterComponent?: ReactNode;

  // Zoom (images only)
  disableImageZoom?: boolean;
  singleClickZoom?: boolean;
  zoomCursor?: boolean;
  maxZoomScale?: number;

  // Captions
  captionPlacement?: "above" | "below" | string;
  captionStyle?: React.CSSProperties;

  /** Accepted for API compatibility; Next.js static imports are detected automatically. */
  framework?: string;
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export const ItemLightbox: React.FC<ItemLightboxProps> = (props) => {
  const item = props.item;
  const isImage = isImageItem(item);
  const isPicture = isImage && !!item.picture;

  /* ---------------------- Values derived from props ----------------------- */

  const showControls = props.showControls ?? true;
  const showControlsBar = props.showControlsBar ?? true;
  const showFullScreenIcon = props.showFullScreenIcon ?? true;
  const showMagnificationIcons = props.showMagnificationIcons ?? true;
  const downloadImages = props.downloadImages ?? false;
  const disableZoom = props.disableImageZoom ?? false;
  const singleClickZoom = props.singleClickZoom ?? false;
  const showZoomCursor = props.zoomCursor ?? false;
  const isRounded = props.roundedImages ?? props.rounded ?? false;
  const modalCloseOption = props.modalClose ?? "default";
  const captionPlacement = props.captionPlacement ?? "below";
  const maxScale = props.maxZoomScale
    ? getScale(props.maxZoomScale, 24)
    : 8;

  const isZoomable = isImage && !disableZoom;
  const canRotate = isImage && !isPicture && (props.rotateIcon ?? false);

  // Theme: explicit props win over the theme, which wins over the default theme
  const themeConfig =
    (props.theme && themes[props.theme]) || themes[defaultTheme];
  const backgroundColor = props.backgroundColor ?? themeConfig.background;
  const iconColor = props.iconColor ?? themeConfig.iconColor;
  const textColor = props.textColor ?? themeConfig.textColor ?? "white";
  const customIconStyle = props.iconStyle ?? null;

  /* -------------------------------- State --------------------------------- */

  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false);
  const [lightboxModalHeight, setLightboxModalHeight] = useState(
    props.lightboxHeight ?? "100vh",
  );
  const [viewportWidth, setViewportWidth] = useState(0);
  const [isTabletUserAgent, setIsTabletUserAgent] = useState(false);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [zoomCursor, setZoomCursor] = useState<"zoom-in" | "zoom-out">(
    "zoom-in",
  );
  const [rotation, setRotation] = useState(0);

  const lightboxRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<ReactZoomPanPinchRef | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const prevFocusedElemRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const mouseStartRef = useRef({ x: 0, y: 0 });

  const div100vhHeight = use100vh();
  const lboxHeight =
    lightboxModalHeight == "100vh" ? div100vhHeight : lightboxModalHeight;
  const lightboxModalWidth = props.lightboxWidth ?? "100vw";

  const isMobile = viewportWidth <= mobileWidth;
  const isTablet = viewportWidth <= tabletWidth;

  useScrollLock(showModal);

  const handleError = (event: any) => {
    props.onError?.(
      event,
      "An error occurred, please see event for more details",
    );
  };

  // `original` takes precedence over `src`; picture items render their own sources
  const imageSrc = useResolvedSrc(
    isImage && !isPicture ? (item.original ?? item.src) : undefined,
    handleError,
  );
  const downloadSrc = imageSrc ?? (isPicture ? item.picture.fallback : undefined);

  /* ------------------------------- Effects -------------------------------- */

  // Browser-only setup (kept out of render so the component is SSR-safe)
  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isTabletUA =
      /(ipad|iphone|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
        userAgent,
      );
    const isIPad =
      /Macintosh/i.test(window.navigator.userAgent) &&
      window.navigator.maxTouchPoints > 1;
    setIsTabletUserAgent(isTabletUA || isIPad);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Controlled open state
  useEffect(() => {
    if (props.open === true) {
      openModal();
    } else if (props.open === false) {
      closeModal();
    }
  }, [props.open]);

  // Fire onOpen / onClose only on actual transitions (not on mount)
  useEffect(() => {
    if (showModal && !wasOpenRef.current) {
      props.onOpen?.(item);
      props.onSelect?.(item);
    } else if (!showModal && wasOpenRef.current) {
      props.onClose?.(item);
    }
    wasOpenRef.current = showModal;
  }, [showModal]);

  // Focus trap: keep Tab / Shift+Tab inside the lightbox while it is open
  useEffect(() => {
    if (!showModal) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const container = lightboxRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          el.getAttribute("aria-hidden") !== "true",
      );

      if (focusable.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const focusOutside =
        !active || active === container || !container.contains(active);

      if (e.shiftKey) {
        if (focusOutside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (focusOutside || active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [showModal]);

  /* --------------------------- Open / close ------------------------------- */

  const openModal = () => {
    prevFocusedElemRef.current = document.activeElement as HTMLElement | null;
    setShowModal(true);
  };

  const closeModal = () => {
    if (isBrowserFullScreen) {
      exitFullScreen();
    }
    setShowModal(false);
    // Zoom resets naturally as the TransformWrapper unmounts; reset the rest
    setZoomedIn(false);
    setZoomCursor("zoom-in");
    setRotation(0);
  };

  /* ----------------------------- Full screen ------------------------------ */

  const fullScreenHandler = () => {
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
      setLightboxModalHeight(props.lightboxHeight ?? "100vh");
    }
  };

  const exitFullScreen = () => {
    closeFullScreen(document);
    removeFullScreenChangeEventListeners(fullScreenHandler);
  };

  /* -------------------------------- Zoom ---------------------------------- */

  const updateZoomState = (ref: ReactZoomPanPinchRef) => {
    const scale = ref.state.scale;
    setZoomedIn(scale > 1.01);
    if (scale >= maxScale * 0.999) {
      setZoomCursor("zoom-out");
    } else if (scale <= 1.01) {
      setZoomCursor("zoom-in");
    }
  };

  const zoomIn = () => zoomRef.current?.zoomIn();
  const zoomOut = () => zoomRef.current?.zoomOut();

  const isPanningDisabled = () =>
    (isMobile || isTablet || isTabletUserAgent) && !zoomedIn;

  const onMediaMouseDown = (e: React.MouseEvent) => {
    mouseStartRef.current = { x: e.pageX, y: e.pageY };
  };

  const onMediaClick = (e: React.MouseEvent) => {
    const dx = Math.abs(e.pageX - mouseStartRef.current.x);
    const dy = Math.abs(e.pageY - mouseStartRef.current.y);
    // Ignore drags (panning)
    if (dx > imgZoomDelta || dy > imgZoomDelta) return;

    e.stopPropagation();
    if (singleClickZoom) {
      zoomCursor === "zoom-in" ? zoomIn() : zoomOut();
    }
  };

  const getCursorClass = () => {
    if (!showZoomCursor || !isZoomable) return "";
    return zoomCursor === "zoom-in"
      ? styles.zoomInCursor
      : styles.zoomOutCursor;
  };

  /* ------------------------------- Rotate --------------------------------- */

  const rotateImage = () => {
    const newRotation = rotation + 90;
    setRotation(newRotation);
    props.onRotate?.(newRotation > 360 ? newRotation % 360 : newRotation);
  };

  /* ------------------------------ Download -------------------------------- */

  const saveImage = () => {
    if (downloadSrc) downloadImage(downloadSrc);
  };

  /* ------------------------------- Styles --------------------------------- */

  const getIconClasses = (): string => {
    if (props.theme == "dark") return styles.darkHeaderIcon;
    if (props.theme == "light") return styles.lightHeaderIcon;
    return "";
  };

  const iconClassName = `${styles.lightboxjsIcon} ${iconColor ? "" : getIconClasses()}`;

  const getIconStyle = () => {
    if (iconColor) return { color: iconColor };
    if (customIconStyle) return customIconStyle;
    return {};
  };

  const getCloseIconBtnStyle = () => {
    if (customIconStyle) return customIconStyle;
    return {
      ...(iconColor ? { color: iconColor } : {}),
      ...(props.closeIconBtnStyle ?? {}),
    };
  };

  const getImageStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = { objectFit: "contain" };

    if (props.fullScreen) {
      if (props.fullScreenFillMode) {
        style.objectFit = props.fullScreenFillMode;
        if (props.fullScreenFillMode == "cover") {
          style.maxHeight = "94vh";
          style.maxWidth = "70vw";
          style.marginTop = "auto";
          style.marginBottom = "auto";
        }
      } else {
        style.height = lboxHeight ?? undefined;
        style.maxHeight = lboxHeight ?? undefined;
      }
    }

    if (canRotate) {
      style.width = "57vw";
      style.marginTop = "15vh";
    }
    if (isRounded) {
      style.borderRadius = "20px";
    }
    if (modalCloseOption == "clickOutside") {
      style.pointerEvents = "auto";
    }
    if (!props.fullScreen && !isMobile) {
      style.height = "85vh";
    }
    if (rotation) {
      style.transform = `rotate(${rotation}deg)`;
    }
    return style;
  };

  const getContainerStyles = () =>
    !showControlsBar || props.fullScreen ? { height: lboxHeight } : {};

  const getInnerContainerStyles = () => {
    if (isImageCaption("above")) return styles.innerContainerWithTopCaption;
    if (canRotate) return styles.rotateImgInnerContainer;
    return styles.slideshowInnerContainerThumbnails;
  };

  const getWrapperClassName = () =>
    [props.className, props.imgWrapperClassName, styles.lightboxjs]
      .filter(Boolean)
      .join(" ");

  /* ------------------------------- Captions ------------------------------- */

  const isImageCaption = (placement: string) =>
    (item?.caption || item?.title) && placement === captionPlacement;

  const captionNode = (
    <div className={`${styles.imgTitleContainer} imageModal`}>
      <p
        className={styles.imgTitle}
        style={props.captionStyle ?? { color: textColor }}
      >
        {item?.caption || item?.title}
      </p>
    </div>
  );

  /* --------------------------- Media rendering ---------------------------- */

  const renderVideo = (elem: any) => {
    if (elem.type == "yt") {
      return (
        <div className={`${styles.videoOuterContainer} imageModal`}>
          <YouTube
            videoId={elem.videoID}
            iframeClassName={styles.ytVideo}
            title="YouTube video player"
            opts={{
              height: getVideoHeight(elem),
              width: getVideoWidth(elem),
              playerVars: {
                // https://developers.google.com/youtube/player_parameters
                autoplay: shouldAutoplay(elem) ? 1 : 0,
              },
            }}
            onError={(event) => handleError(event)}
          />
        </div>
      );
    }

    if (elem.type == "htmlVideo") {
      return (
        <div
          className={`${styles.htmlVideo} ${styles.htmlVideoOuterContainer} imageModal`}
        >
          <video
            className={`${styles.cursorPointer} ${styles.lightboxVideo}`}
            width={getVideoWidth(elem)}
            height={getVideoHeight(elem)}
            autoPlay={shouldAutoplay(elem)}
            onError={(event) => handleError(event)}
            controls
          >
            <source src={elem.videoSrc} type="video/mp4" />
          </video>
        </div>
      );
    }

    if (elem.type == "customVideoEmbed") {
      return (
        <div className={`${styles.customVideoContainer} imageModal`}>
          {elem.embed}
        </div>
      );
    }

    return null;
  };

  const renderMedia = () => {
    if (!item) return null;

    if (item.type == "customEmbed") {
      return (
        <div className={`${styles.customEmbedContainer} imageModal`}>
          {item.embed}
        </div>
      );
    }

    if (isVideoItem(item)) return renderVideo(item);

    if (isPicture) {
      return (
        <PictureElem
          elem_metadata={item.picture}
          enableMagnifyingGlass={false}
          onHandleError={(error) => handleError(error)}
          index={0}
        />
      );
    }

    return (
      <LightboxImage
        props={props}
        imgSrc={imageSrc}
        alt={item.alt ?? item.title ?? ""}
        imgStyle={getImageStyle()}
        imgRef={imageRef}
        index={0}
        enableMagnifyingGlass={false}
        displayImgMetadata={false}
        onImgError={(event) => handleError(event)}
        onUpdateImgMetadata={() => {}}
      />
    );
  };

  const mediaNode = () => {
    const content = (
      <div
        onMouseDown={isZoomable ? onMediaMouseDown : undefined}
        onClick={isZoomable ? onMediaClick : undefined}
        className={`${styles.slideshowImg}
          ${props.fullScreen ? styles.fullScreenSlideshowImg : ""}
          ${props.lightboxImgClass ?? ""}
          ${getCursorClass()}
          ${isImageCaption(captionPlacement) ? styles.slideshowImgWithCaption : ""}`}
        style={{
          width: getContainerWidth(props.lightboxWidth, isBrowserFullScreen),
          height: getContainerHeight(props.lightboxHeight, isBrowserFullScreen),
        }}
      >
        {renderMedia()}
      </div>
    );

    return (
      <div
        className={props.fullScreen ? styles.fullScreenContainer : undefined}
        style={{ height: lboxHeight ?? undefined }}
      >
        <div className={styles.emblaSlide}>
          {isZoomable ? (
            <TransformWrapper
              ref={zoomRef}
              initialScale={1}
              maxScale={maxScale}
              centerZoomedOut={true}
              alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
              doubleClick={{ disabled: singleClickZoom }}
              panning={{ disabled: isPanningDisabled() }}
              onWheel={updateZoomState}
              onZoom={updateZoomState}
              onZoomStop={updateZoomState}
              onTransformed={updateZoomState}
              onPinchingStop={updateZoomState}
            >
              <TransformComponent
                wrapperClass={styles.reactTransformWrapper}
                contentClass={styles.reactTransformComponent}
                wrapperStyle={transformWrapperStyle}
                contentStyle={transformContentStyle}
              >
                {content}
              </TransformComponent>
            </TransformWrapper>
          ) : (
            // Same wrapper structure/styles as TransformWrapper/TransformComponent, without zoom
            <div
              className={styles.reactTransformWrapper}
              style={transformWrapperStyle}
            >
              <div
                className={styles.reactTransformComponent}
                style={transformContentStyle}
              >
                {content}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ------------------------------- Render --------------------------------- */

  const controls = (
    <div className={styles.controls}>
      {isZoomable && showMagnificationIcons ? (
        <>
          <motion.div>
            <IconButton label="Zoom in" onClick={zoomIn} style={getIconStyle()}>
              {props.zoomInComponent ?? (
                <ZoomIn
                  size={24}
                  className={iconClassName}
                  color={iconColor || undefined}
                />
              )}
            </IconButton>
          </motion.div>
          <motion.div>
            <IconButton label="Zoom out" onClick={zoomOut}>
              {props.zoomOutComponent ?? (
                <ZoomOut
                  size={24}
                  className={iconClassName}
                  style={getIconStyle()}
                  color={iconColor || undefined}
                />
              )}
            </IconButton>
          </motion.div>
        </>
      ) : null}

      {isImage && downloadImages && downloadSrc ? (
        <IconButton label="Download" onClick={saveImage}>
          <Download
            size={24}
            className={iconClassName}
            style={getIconStyle()}
            color={iconColor || undefined}
          />
        </IconButton>
      ) : null}

      {showFullScreenIcon ? (
        <motion.div>
          <IconButton
            label={
              isBrowserFullScreen ? "Exit full screen" : "Make lightbox full screen"
            }
            onClick={() => {
              isBrowserFullScreen
                ? exitFullScreen()
                : fullScreen(fullScreenHandler);
            }}
          >
            {isBrowserFullScreen ? (
              <FullscreenExit
                size={24}
                className={iconClassName}
                style={getIconStyle()}
                color={iconColor || undefined}
              />
            ) : (
              <Fullscreen
                size={24}
                className={iconClassName}
                style={getIconStyle()}
                color={iconColor || undefined}
              />
            )}
          </IconButton>
        </motion.div>
      ) : null}

      {canRotate ? (
        <motion.div>
          <IconButton label="Rotate image" onClick={rotateImage}>
            <ArrowClockwise
              size={24}
              className={iconClassName}
              style={getIconStyle()}
              color={iconColor || undefined}
            />
          </IconButton>
        </motion.div>
      ) : null}

      {props.controlComponent ? (
        <motion.div>
          <IconButton>{props.controlComponent}</IconButton>
        </motion.div>
      ) : null}
    </div>
  );

  const closeButton = props.closeComponent ? (
    <IconButton label="Close" id="closeBtn" onClick={closeModal}>
      {props.closeComponent}
    </IconButton>
  ) : (
    <motion.div
      className={`${styles.closeIcon} ${!showControls ? styles.mlAuto : ""}`}
    >
      <IconButton
        label="Close"
        id="closeBtn"
        className={
          !showControlsBar && !showControls
            ? styles.closeButtonRounded
            : styles.closeButton
        }
        onClick={closeModal}
      >
        <XLg
          id="closeIcon"
          size={24}
          className={iconClassName}
          color={iconColor || undefined}
          style={getCloseIconBtnStyle()}
        />
      </IconButton>
    </motion.div>
  );

  return (
    <div className={getWrapperClassName()}>
      {props.children}

      {isMounted &&
        createPortal(
          <AnimatePresence
            initial={false}
            onExitComplete={() => {
              prevFocusedElemRef.current?.focus({ preventScroll: true });
            }}
          >
            {showModal && (
              <Div100vh>
                <div
                  style={{ height: lboxHeight ?? undefined }}
                  ref={lightboxRef}
                  tabIndex={-1} // allow focus via JS
                  className="lightboxContainer"
                  id="lightboxContainer"
                  aria-modal="true"
                  role="dialog"
                  aria-label={item?.alt || item?.caption || item?.title || "Lightbox"}
                >
                  <motion.div
                    className={styles.modalContainer}
                    initial={"inactive"}
                    variants={variants}
                    style={{ height: lboxHeight ?? undefined }}
                    // Do not remove: forces JS animation; avoids Framer WAAPI end-of-animation flicker
                    onUpdate={() => {}}
                    animate={"active"}
                    exit={"inactive"}
                    transition={{ duration: 0.3 }}
                    onAnimationComplete={(definition) => {
                      // ignore the exit animation
                      if (definition !== "active") return;
                      lightboxRef.current?.focus({ preventScroll: true });
                    }}
                  >
                    <motion.div
                      className={styles.slideshowAnimContainer}
                      key="slideshowAnimContainer"
                      id="slideshowAnim"
                      style={{
                        backgroundColor: backgroundColor,
                        width: lightboxModalWidth,
                        height: lboxHeight ?? undefined,
                      }}
                    >
                      <div
                        className={styles.lightboxContainer}
                        id="lightboxContent"
                        onClick={(e) => {
                          if (modalCloseOption == "clickOutside") {
                            checkOutsideClick(e, ".imageModal", closeModal);
                          }
                        }}
                      >
                        <section
                          className={`${styles.iconsHeader} ${styles.iconHeaderDefault} ${
                            iconColor ? "" : getIconClasses()
                          } imageModal`}
                          style={{ color: iconColor }}
                        >
                          <EscKeyHandlers
                            isBrowserFullScreen={isBrowserFullScreen}
                            onCloseModal={closeModal}
                          />

                          {showControls ? controls : null}
                          {closeButton}
                        </section>

                        <div
                          className={`${getInnerContainerStyles()} ${styles.embla}
                            ${isImageCaption("below") && showControlsBar ? styles.slideImageAndCaption : ""}
                            ${props.fullScreen ? "" : styles.slideshowInnerContainer}
                            ${!showControlsBar || props.fullScreen ? styles.hideControlsBar : ""}`}
                          style={getContainerStyles()}
                        >
                          {isImageCaption("above") ? captionNode : null}

                          <div
                            className={styles.emblaViewport}
                            style={
                              props.fullScreen
                                ? { height: lightboxModalHeight }
                                : {}
                            }
                          >
                            <div className={styles.emblaContainer}>
                              {mediaNode()}
                            </div>
                          </div>
                        </div>

                        {isImageCaption("below") ? (
                          <div
                            className={`${styles.thumbnailsOuterContainer} ${styles.thumbnailsAndCaption}`}
                            style={{ height: "12vh", backgroundColor }}
                          >
                            {captionNode}
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  </motion.div>

                  {props.lightboxFooterComponent ?? null}
                </div>
              </Div100vh>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};