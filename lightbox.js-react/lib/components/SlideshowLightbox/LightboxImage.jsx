import exifr from 'exifr/dist/full.esm.mjs';
import * as React from 'react';
import { useState } from 'react';
import styles from './SlideshowLightbox.module.css';

const getImageFilename = (img_src) => {
  let img_src_split = img_src.split("/");
  return img_src_split[img_src_split.length - 1];
}

const parseCreateDate = (js_date, locale) => {
  if (js_date instanceof Date) {
    let date = js_date.getDate();
    let month = js_date.getMonth() + 1;
    let year = js_date.getFullYear();
    let time = js_date.toLocaleTimeString(locale);

    return '' + year + '-' + (month <= 9 ? '0' + month : month) + '-' + (date <= 9 ? '0' + date : date) + ` ${time}`;
  }
  return ""
}

/**
 * onUpdateImgMetadata receives a state *updater function*
 * (prevMetadata) => ({ ...prevMetadata, [index]: metadata }),
 * so passing a useState setter directly works and concurrent loads don't overwrite each other.
 */
export function LightboxImage({ props, imgRef, fullImg = false, imgStyle, imgSrc, alt = "", index = 0,
  displayImgMetadata = false, enableMagnifyingGlass = false,
  onImgError = undefined,
  onUpdateImgMetadata = undefined,
  metadataLocale = undefined }) {

  const locale = metadataLocale ?? props?.metadataTimeLocale ?? "en-US";

  // Track which src has finished loading, so the loader resets whenever imgSrc changes
  // (e.g. after an async src resolves) without an effect racing the onLoad event.
  const [settledSrc, setSettledSrc] = useState(null);
  const isLoading = !imgSrc || settledSrc !== imgSrc;

  const handleError = (event, index) => {
    if (onImgError) {
      onImgError(event, index);
    }
  }

  const getLoaderThemeClass = () => {
    if (props?.theme == 'day') {
      return styles.dayLoader
    }
    return styles.nightLoader
  }

  const loadMetadata = (img_target) => {
    let individual_image_metadata = {};
    individual_image_metadata["name"] = getImageFilename(img_target.src);

    exifr.parse(img_target, true).then(exif => {
      if (!exif) return;

      if (exif.ISO) individual_image_metadata["isoData"] = exif.ISO;
      if (exif.CreateDate) individual_image_metadata["createDate"] = parseCreateDate(exif.CreateDate, locale);
      if (exif.ExifImageHeight) individual_image_metadata["height"] = exif.ExifImageHeight;
      if (exif.ExifImageWidth) individual_image_metadata["width"] = exif.ExifImageWidth;
      if (exif.FNumber) individual_image_metadata["fNumber"] = exif.FNumber;
      if (exif.ShutterSpeedValue) individual_image_metadata["shutterSpeed"] = exif.ShutterSpeedValue;

      if (onUpdateImgMetadata) {
        onUpdateImgMetadata((prevMetadata) => ({
          ...(prevMetadata || {}),
          [index]: individual_image_metadata,
        }));
      }
    }).catch(() => {
      // Image has no readable EXIF data (or is cross-origin); ignore
    });
  }

  return (
    <>
      {isLoading ?
        <span
          key='loader'
          className={`${styles.loader} ${getLoaderThemeClass()}`}></span>
        : null}

      <img
        className={`imageModal ${fullImg && props?.thumbnailImgAnim ? styles.fullImg : ''}
          ${props?.imgElemClassname ? props.imgElemClassname : ''}
          ${props?.isZoomCursor ? styles.zoomInCursor : ""}
          ${styles.lightboxImg} ${styles.rotate_img}
          ${enableMagnifyingGlass
            ? styles.maxWidthFull
            : styles.maxWidthWithoutMagnifier
          }  ${styles.containImg} `}
        style={imgStyle}
        ref={imgRef}
        alt={alt}
        loading='lazy'
        src={imgSrc || undefined}
        onError={(event) => {
          setSettledSrc(imgSrc)
          handleError(event, index)
        }}
        onLoad={(event) => {
          setSettledSrc(imgSrc)
          if (displayImgMetadata && event?.target) {
            loadMetadata(event.target)
          }
        }}
      />
    </>
  );
}