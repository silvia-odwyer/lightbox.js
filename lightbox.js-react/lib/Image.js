import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { SlideshowLightbox } from './SlideshowLightbox';
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
};
const defaultTheme = "lightbox";
export const Image = (props) => {
    const [backgroundColor, setBackgroundColor] = useState(props.backgroundColor ? props.backgroundColor : themes[defaultTheme].background);
    const [iconColor, setIconColor] = useState(props.iconColor ? props.iconColor : themes[defaultTheme].iconColor);
    const [fullScreen, setFullScreen] = useState(props.fullScreen ? props.fullScreen : false);
    const [modalCloseOption, setModalCloseOption] = useState(props.modalClose ? props.modalClose : "default");
    const [disableZoom, setDisableZoom] = useState(props.disableImageZoom ? props.disableImageZoom : false);
    const [imageRoundedBorder, setImageRoundedBorder] = useState(props.roundedImages ? props.roundedImages : false);
    const [displayFullScreenIcon, setDisplayFullScreenIcon] = useState(props.showFullScreenIcon ? props.showFullScreenIcon : true);
    const [className, setClassName] = useState(props.className ? props.className : "");
    const [imgWrapperClass, setImgWrapperClass] = useState(props.wrapperClassName ? props.wrapperClassName : "");
    const [width, setWidth] = useState(props.width ? props.width : null);
    const [height, setHeight] = useState(props.height ? props.height : null);
    const [lightboxImgClassName, setLightboxImgClassName] = useState(props.lightboxImgClass ? props.lightboxImgClass : "");
    const [imgClass, setImgClass] = useState(props.className ? props.className : "");
    const [displayMagnificationIcons, setDisplayMagnificationIcons] = useState(props.showMagnificationIcons ? props.showMagnificationIcons : true);
    const [displayControls, setDisplayControls] = useState(props.showControls ? props.showControls : true);
    const [showDownloadBtn, setShowDownloadBtn] = useState(props.downloadImages ? props.downloadImages : false);
    const [isRTL, setIsRTL] = useState(props.rtl ? props.rtl : false);
    const [lightboxIdentifier, setLightboxIdentifier] = useState(props.lightboxIdentifier ? props.lightboxIdentifier : "");
    const [frameworkID, setFrameworkID] = useState(props.framework ? props.framework : '');
    const [images, setImages] = useState([]);
    // const [displayLoader, setDisplayLoader] = useState(
    //   props.showLoader ? props.showLoader : false
    // )
    // const [textColor, setTextColor] = useState(
    //   props.textColor ? props.textColor : themes[defaultTheme].textColor
    // )
    const [state, setState] = React.useState();
    const initProps = () => {
        if (props.showControls != undefined) {
            setDisplayControls(props.showControls);
            setDisableZoom(props.showControls);
            if (props.showControls == false) {
                setDisplayMagnificationIcons(false);
            }
        }
    };
    useEffect(() => {
        if (props.theme) {
            if (themes[props.theme]) {
                setBackgroundColor(themes[props.theme].background);
                setIconColor(themes[props.theme].iconColor);
            }
        }
        if (props.image && images && images.length == 0 && frameworkID == "next") {
            let imgs = [];
            imgs.push(props.image);
            setImages(imgs);
        }
        else {
            setImages(null);
        }
        return () => {
        };
    }, [state]);
    const getImage = () => {
        if (frameworkID == "next" && props.children != undefined) {
            return props.children;
        }
        else if (frameworkID != "next") {
            return (_jsx("img", { src: props.image ? props.image.src : "", alt: props.image.title, width: width != null ? width : "100%", height: height != null ? height : "100%", className: `${className}` }));
        }
    };
    useEffect(() => {
        let isMounted = true;
        if (isMounted)
            initProps();
        return () => {
            isMounted = false;
        };
    }, []);
    return (_jsx(SlideshowLightbox, { showSlideshowIcon: false, showThumbnails: false, backgroundColor: backgroundColor, iconColor: iconColor, theme: props.theme, lightboxIdentifier: lightboxIdentifier, fullScreen: fullScreen, showMagnificationIcons: displayMagnificationIcons, showFullScreenIcon: displayFullScreenIcon, downloadImages: showDownloadBtn, roundedImages: imageRoundedBorder, disableImageZoom: disableZoom, showArrows: false, showThumbnailIcon: false, showControls: displayControls, modalClose: modalCloseOption, lightboxImgClass: lightboxImgClassName, imgClassName: imgClass, imageComponent: true, framework: frameworkID, 
        // className={className}
        imgWrapperClassName: imgWrapperClass, images: images, children: getImage() }));
};
