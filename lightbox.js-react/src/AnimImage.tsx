import React, { useEffect, useState, useRef } from 'react'
import { SlideshowLightbox } from './SlideshowLightbox';

const themes: any = {
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
const defaultTheme = "lightbox";

export const AnimImage = (props) => {
  const [backgroundColor, setBackgroundColor] = useState(props.backgroundColor ? props.backgroundColor : themes[defaultTheme].background);

  const [iconColor, setIconColor] = useState(props.iconColor ? props.iconColor : themes[defaultTheme].iconColor);

  const [fullScreen, setFullScreen] = useState(props.fullScreen ? props.fullScreen : false);

  const [modalCloseOption, setModalCloseOption] = useState(props.modalClose ? props.modalClose : "default");

  const [disableZoom, setDisableZoom] = useState(
    props.disableImageZoom ? props.disableImageZoom : false
  )

  const [imageRoundedBorder, setImageRoundedBorder] = useState(
    props.roundedImages ? props.roundedImages : false
  )

  const [displayFullScreenIcon, setDisplayFullScreenIcon] = useState(
    props.showFullScreenIcon ? props.showFullScreenIcon : true
  )

  const [displayMagnificationIcons, setDisplayMagnificationIcons] = useState(
    props.showMagnificationIcons ? props.showMagnificationIcons : true
  )

  const [showDownloadBtn, setShowDownloadBtn] = useState(
    props.downloadImages ? props.downloadImages : false
  )

  const [isRTL, setIsRTL] = useState(props.rtl ? props.rtl : false)

  const [lightboxIdentifier, setLightboxIdentifier] = useState(
    props.lightboxIdentifier ? props.lightboxIdentifier : false
  )

  const [frameworkID, setFrameworkID] = useState(
    props.framework ? props.framework : ''
  )

  const [images, setImages] = useState<any>([])

  // const [displayLoader, setDisplayLoader] = useState(
  //   props.showLoader ? props.showLoader : false
  // )

  // const [textColor, setTextColor] = useState(
  //   props.textColor ? props.textColor : themes[defaultTheme].textColor
  // )


  const [state, setState] = React.useState();

  useEffect(() => {
    if (props.theme) {
      if (themes[props.theme]) {
        setBackgroundColor(themes[props.theme].background);
        setIconColor(themes[props.theme].iconColor);
      }
    }

    if (props.image && images.length == 0 && frameworkID == "next") {
      let imgs: any = [];
      imgs.push(props.image) 
      setImages(imgs);
    }
    else {
      setImages(null)
    }

    return () => {
    };

  }, [state]);

  const getImage = () => {
    if (frameworkID == "next" && props.children != undefined) {
      return props.children
    }
    else if (frameworkID != "next") {
      return (
        <img src={props.image.src} alt={props.image.title} className="img1" />
      )
    }
  }

  return (
    <SlideshowLightbox
      showArrows={false} 
      showThumbnailIcon={false} 
      showSlideshowIcon={false} 
      showThumbnails={false}
      backgroundColor={backgroundColor} 
      iconColor={iconColor} 
      theme={props.theme} 
      lightboxIdentifier={lightboxIdentifier}
      fullScreen={fullScreen} 
      showMagnificationIcons={displayMagnificationIcons}
      showFullScreenIcon={displayFullScreenIcon} 
      downloadImages={showDownloadBtn}
      roundedImages={imageRoundedBorder} 
      disableImageZoom={disableZoom}
      modalClose={modalCloseOption}
      imageComponent={true}
      framework={frameworkID}
      images={images}>

      {getImage()}
    
    </SlideshowLightbox>
  );

}