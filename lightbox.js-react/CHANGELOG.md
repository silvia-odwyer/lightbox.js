
# Changelog
This file contains notable changes and updates that have been made to Lightbox.js.

## [0.8.7] - 2023-09-21

### Added
   - New prop for Image component: **wrapperClassName** - CSS classes can be passed to the container element of the Image component via the `wrapperClassName` prop

## [0.8.6] - 2023-09-19

### Fixed
   - Fixed custom classes not being applied to lightbox image element and container
   - When the theme is changed dynamically , the lightbox now updates with the newly selected theme. For example, 
   if the website's theme is toggled between night mode and light mode, and the lightbox theme is updated dynamically to reflect
   the new mode, the lightbox styling is then updated.

## [0.7.8] - 2023-08-30
 
### Added
   - Added new callbacks: **onNext** and **onPrev** -  When the lightbox moves to the next image or previous image, an event is emitted, allowing the developer to be notified of when the lightbox's currently selected image has been updated

### Fixed
   - Fixed a bug on mobile devices where image swiping functionality was not available when the user zoomed into an image using pinch-to-zoom and zoomed out again. The lightbox now enables image swiping once more after zooming in and out of the image with pinch-to-zoom on mobile devices.

## [0.7.7] - 2023-08-29
 
### Fixed
   - When the lightbox is opened, the corresponding thumbnail is selected and displayed in the center of the device (on mobile/tablet devices) to match the selected image. For instance, if the user selects the fourth image in the gallery, the lightbox will open to display the fourth thumbnail. Previously on mobile devices, the thumbnails started from the beginning, but this has been fixed.

## [0.7.6] - 2023-08-29
 
### Fixed
   - For image slide rendering logic, the corresponding image object in the `images` prop is no longer mutated, and a new object is created and added to the array instead. 

## [0.7.5] - 2023-08-27
 
### Added
   - Added new functionality where image thumbnails move/scroll in accordance with the current image slide. For instance, if the user 
   swipes forward three images, the thumbnail will automatically scroll also.

## [0.7.3] - 2023-08-22

### Added
   - Different image sizes for the thumbnail and original, high-resolution image can be specified via data attributes.
   The value of the `data-lightboxjs-original` data attribute specifies the high-resolution image, while the `src` attribute
   of the `img` element specifies the src URL for the external image that's rendered outside the lightbox.

## [0.6.8] - 2023-07-10
 
### Added
   - Added new props to Image component, which were only previously available for SlideshowLightbox component. 
   New props include `modalClose` and `fullScreen`
   - Next.js support added to the Lightbox.js Image component: In Next.js, the Image component (from next/image) can be rendered within 
   the Lightbox.js Image component, which previously only rendered `<img>` HTML elements. Clicking on the Next.js Image component will result in the lightbox displaying.

## [0.6.4] - 2023-05-08
 
### Added
   - Picture HTML elements (`<picture>`)  with `<source>` tags can be added to the lightbox
   - Lightbox no longer requires the `SlideshowLightbox` component to contain the images as children of the component. The library now populates the lightbox with images specified in the `images` prop
   - Added new prop: **lightboxImgClass**:  Custom CSS class can be added to the lightbox image via the `lightboxImgClass` prop

## [0.6.0] - 2023-04-24
 
### Added
   - New prop: **modalClose** - Modal can be closed via clicking outside the image; to enable this feature, set the `modalClose` prop to `clickOutside`. 
   By default, the modal doesn't close when the outside of the image is clicked, so if a developer wishes to add this to the
   lightbox, the `modalClose` prop must be set to `clickOutside` for the new modal-closing functionality to be enabled.

## [0.5.9] - 2023-04-19
 
### Added
   - Lightbox can now be opened via setting the new `open` prop to `true`. 
   - The image the lightbox should open to can be specified via the `startingSlideIndex` prop
   - New event listener `onClose` now available, which emits an event when the lightbox has been closed
   - New props added: **rightArrowClassname** and **leftArrowClassname**: Custom class can be added to right and left arrows using the new `rightArrowClassname` and `leftArrowClassname` props

## [0.5.4] - 2023-04-13
 
### Fixed
   - Fixed a bug regarding the lightbox not refreshing the set of images in the lightbox when the value of the `images` array updates
   with new images. The lightbox now refreshes the set of images shown in the lightbox when the values of the `images` prop 
   is changed.

## [0.4.8] - 2023-03-31

### Fixed
   - Magnifying glass feature removed for video elements, as the functionality is currently only available for images

## [0.4.6] - 2023-03-22
 
### Added
- Moved to CSS modules for styling of the lightbox

### Fixed
- Portrait videos now contained within the device's screen height
- Fixed bug regarding loading indicator not being removed after lightbox element has loaded. It should now be removed 
as soon as the element has loaded.

## [0.4.1] - 2023-03-10
 
### Added
   - New props: **nextArrow** and **prevArrow**: Custom arrow icons can be passed to the lightbox via the `nextArrow` and `prevArrow` props

### Fixed
  - Fixed bug regarding image thumbnails not displaying for video elements when `coverMode` is set to `true`

## [0.3.8] - 2023-03-08
 
### Added
   - Video support now added to the lightbox. HTML5 `<video>` elements and YouTube embeds can be rendered within 
   the lightbox.

## [0.3.7] - 2023-03-06
 
### Added
   - New props added related to hiding/showing the various icons in the top-right controls section
   - New prop: **disableImageZoom** - If set to `true`, this disables the image zooming functionality. Default is `false`
   - New prop: **showFullScreenIcon**: Whether or not to display the full-screen icon
   - New prop: **showThumbnailIcon**: Whether or not to display the thumbnail icon
   - New prop: **showSlideshowIcon**: Whether or not to display the slideshow icon
   - New prop: **showMagnificationIcons**: Whether or not to display the magnification icon

## [0.3.6] - 2023-03-06

## Added
  - Added functionality to support the external gallery to show only one image, while multiple images can be rendered within the lightbox. This would be useful for developers who wish to display one image, such as a product image, but have other images of that product rendered in the lightbox.

### Fixed
  - Fixed bug related to `thumbnailColor` and `iconColor` custom prop values not applying as expected. The lightbox default
  styling was overriding the custom specifications, but this has been fixed.

## [0.2.9] - 2022-12-22
 
### Fixed
   - Next.js lightbox image download bug now fixed. A download icon can be displayed in the lightbox by setting the `downloadImages` prop to `true`

## [0.2.7] - 2022-12-20
 
### Added
   - Images can now be downloaded or saved. Note: This is only for React for this current version, see version 0.2.9 for Next.js support.
   - New prop: **downloadImages**: If set to `true`, a download icon is displayed in the top-right controls section. If this icon is clicked, the image is downloaded to the user's device or is opened to a new browser window.


## [0.2.4] - 2022-11-21
 
### Added
   - Full-screen image support available
   - New prop: **fullScreen**: If set to `true`, the images in the lightbox will take up the full available height of the screen.

## [0.2.1] - 2022-11-09
 
### Added
   - Added support for image captions. To enable this functionality, an array of image objects needs to be created, and 
   each image object should have a `caption` property with its value being the corresponding caption text.

## [0.0.9] - 2022-09-13
 
### Added
   - Image lazyloading functionality now included. 
   - Loading indicator can now be added to lightbox to display that an image is still loading via the new `showIndicator` prop


**Note**: The format of this changelog file is based on [Keep a Changelog](http://keepachangelog.com/).