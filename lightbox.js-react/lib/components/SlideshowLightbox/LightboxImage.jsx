import * as React from 'react'
import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, ForwardRefExoticComponent } from 'react'
import exifr from 'exifr/dist/full.esm.mjs'
import styles from './SlideshowLightbox.module.css'

export function LightboxImage({ props, imgRef, fullImg, imgStyle, imgSrc, index, displayImgMetadata, enableMagnifyingGlass,
    onUpdateImgMetadata }) {
    const [isLoading, setIsLoading] = useState(true);
  
    const getImageFilename = (img_src) => {
      let img_src_split = img_src.split("/");
      let name = img_src_split[img_src_split.length - 1];
      return name;
    }
  
    const handleError = (event, index) => {
      if (props.onImgError) {
        props.onImgError(event, index);
      }
    }
  
    const getLoaderThemeClass = () => {
      if (props.theme) {
        if (props.theme == 'night' || props.theme == 'lightbox') {
          return styles.nightLoader
        } else if (props.theme == 'day') {
          return styles.dayLoader
        }
      }
      return styles.nightLoader
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
  
  
    return (
      <>
        {isLoading ?
          <span
            key='loader'
            className={`${styles.loader} ${getLoaderThemeClass()}`}></span>
          : null}
  
        <img
          className={`imageModal ${fullImg && props.thumbnailImgAnim ? styles.fullImg : false}  
            ${props.imgElemClassname ? props.imgElemClassname : ''}
          ${styles.lightboxImg} ${styles.rotate_img}
          ${enableMagnifyingGlass
              ? styles.maxWidthFull
              : styles.maxWidthWithoutMagnifier
            }  ${styles.containImg} `}
  
  
          style={imgStyle}
          ref={imgRef}
          loading='lazy'
          src={
            imgSrc
          }
          onError={(event) => {
            setIsLoading(false)
            handleError(event, index)
          }}
  
          onLoad={(img) => {
            setIsLoading(false)
  
            if (displayImgMetadata) {
  
              if (img) {
                let img_target = img.target;
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
                    onUpdateImgMetadata(imgMetadataItems);
  
  
                  }
  
                })
              }
            }
  
          }}
          id='img'
        />
  
      </>
    );
  }
  