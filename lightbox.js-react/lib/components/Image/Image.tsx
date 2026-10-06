"use client";

import React, { ReactNode, useState } from "react";
import {
  ImageItem,
  ItemLightbox,
  useResolvedSrc,
} from "../ItemLightbox/ItemLightbox";

export interface ImageProps {
  /** For Next.js: pass a next/image element as the preview */
  children?: ReactNode;
  image?: ImageItem | any;
  framework?: string;

  fullScreen?: boolean;
  backgroundColor?: string;
  theme?: string;
  iconColor?: any;
  modalClose?: string;
  roundedImages?: boolean;
  disableImageZoom?: boolean;
  singleClickZoom?: boolean;
  zoomCursor?: boolean;
  maxZoomScale?: number;
  rotateIcon?: boolean;
  showFullScreenIcon?: boolean;
  showMagnificationIcons?: boolean;
  showControls?: boolean;
  downloadImages?: boolean;
  captionPlacement?: string;
  captionStyle?: React.CSSProperties;

  width?: number | string | null;
  height?: number | string | null;
  lightboxImgClass?: string;
  wrapperClassName?: string;
  className?: string;

  onOpen?: (item?: any) => void;
  onClose?: (item?: any) => void;
  onError?: (event: any, message: string) => void;
  onRotate?: (rotation: number) => void;

  /** No longer used; kept for API compatibility */
  lightboxIdentifier?: string;
  /** No longer used (single item); kept for API compatibility */
  rtl?: boolean;
}

export const Image: React.FC<ImageProps> = (props) => {
  const [open, setOpen] = useState(false);

  const image = props.image;
  const previewSrc = useResolvedSrc(image?.src);
  const alt: string = image?.alt ?? image?.title ?? "";
  const canOpen = !!image;

  const openLightbox = () => {
    if (canOpen) setOpen(true);
  };

  const triggerProps = canOpen
    ? {
        role: "button",
        tabIndex: 0,
        "aria-haspopup": "dialog" as const,
        "aria-label": alt ? `View ${alt}` : "View image",
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox();
          }
        },
      }
    : {};

  const getTrigger = (): ReactNode => {
    // Next.js: the preview is a next/image element passed as children.
    // Wrap rather than cloneElement: children coming from a Server Component
    // can't be reliably cloned in a Client Component, so injected props would be lost.
    if (props.framework === "next" && props.children) {
      return (
        <span
          {...triggerProps}
          onClick={openLightbox}
          style={{ display: "inline-block", cursor: canOpen ? "pointer" : undefined }}
        >
          {props.children}
        </span>
      );
    }

    if (image) {
      return (
        <img
          src={previewSrc}
          alt={alt}
          width={props.width ?? "100%"}
          height={props.height ?? "100%"}
          className={props.className ?? ""}
          style={{ cursor: "pointer" }}
          onClick={openLightbox}
          {...triggerProps}
        />
      );
    }

    return props.children ?? null;
  };

  return (
    <ItemLightbox
      item={image}
      open={open}
      onOpen={props.onOpen}
      onClose={(item) => {
        setOpen(false);
        props.onClose?.(item);
      }}
      onError={props.onError}
      onRotate={props.onRotate}
      theme={props.theme}
      backgroundColor={props.backgroundColor}
      iconColor={props.iconColor}
      fullScreen={props.fullScreen}
      modalClose={props.modalClose}
      roundedImages={props.roundedImages}
      disableImageZoom={props.disableImageZoom}
      singleClickZoom={props.singleClickZoom}
      zoomCursor={props.zoomCursor}
      maxZoomScale={props.maxZoomScale}
      rotateIcon={props.rotateIcon}
      showFullScreenIcon={props.showFullScreenIcon}
      showMagnificationIcons={props.showMagnificationIcons}
      showControls={props.showControls}
      downloadImages={props.downloadImages}
      captionPlacement={props.captionPlacement}
      captionStyle={props.captionStyle}
      lightboxImgClass={props.lightboxImgClass}
      imgWrapperClassName={props.wrapperClassName}
    >
      {getTrigger()}
    </ItemLightbox>
  );
};