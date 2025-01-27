
# Changelog
This file contains notable changes and updates that have been made to Lightbox.js, including bug fixes and new functionality.

## [1.3.3] - 2025-01-27
### Added
   - Added new **fullScreenFillMode** prop, to specify whether or not the image object-fit property should be set to "contain" or "cover".

## [1.3.1] - 2025-01-23
### Added
   - Image rotation functionality implemented

## [1.3.0] - 2025-01-11
### Fixed
   - Horizontal tablet swiping between images now fixed

## [1.2.8] - 2025-01-10
### Fixed
   - Modal width bug fixed

## [1.2.2] - 2024-11-21
### Updated
   - Updated dependencies

## [1.2.0] - 2024-11-20
### Added
   - Added **disableAnim** prop so that animations can be toggled on/off. If set to true, no entry/exit animation will be
   shown when the modal is closed.

## [1.1.9] - 2024-11-16
### Added
   - Added **onThumbnailClick** prop so that the lightbox can listen for thumbnail click events and emit these events

## [1.1.7] - 2024-10-19
### Added
   - Added **lightboxWidth** prop so that the lightbox's width can be specifid
   - Added **rightSidebarComponent** prop, where a sidebar can be added to the right-hand side of the lightbox

## [1.1.6] - 2024-10-14
### Added
   - Added **onSelect** event listener which keeps track of when the slide index is updated. When the lightbox is opened and
   when slides are moved to, this will emit the new slide index and metadata about the image (such as img src etc).

## [1.1.5] - 2024-10-08
### Added
   - Added new **showControlsBar** prop so that top controls bar can be shown/hidden, depending on the value set. If set to true,
   the controls bar will be shown (default), and if set to false, the controls bar will be hidden and only the close icon
   will be shown
   - Added new **closeIconBtnStyle** prop so that the style of the close icon can be specified

## [1.1.3] - 2024-09-14
### Fixed
   - Img animation style for full-screen images can now be specified

## [1.1.0] - 2024-08-28
### Fixed
   - Added new **imgElemClassname** so that custom classes can be directly added to the image element within
   each lightbox slide item. For instance, a custom border radius can be applied to the images.

## [1.0.9] - 2024-06-10
### Fixed
   - The lightbox's surrounding wrapper element is now the first element rendered, removed the container that was 
   previously the wrapper element's parent

## [1.0.6] - 2024-04-12
### Added
   - Image swiping on desktop and mobile when the **imgAnimation** prop is set to the "fade" option
### Fixed
   - Classname bug for images

## [1.0.4] - 2024-04-08
### Fixed
   - Updated image sizing on mobile devices

## [1.0.3] - 2024-03-21
### Fixed
   - Updated image sizing when captions are displayed

## [1.0.1] - 2024-02-28
### Added
   - Added **onImgError** prop, so that when an image error occurs, the info can be passed to the event callback

### Fixed
   - Fixed Safari <14 bug regarding adding event listeners

## [0.9.9] - 2023-12-29
### Added
   - Added **maxZoomScale** prop, so that the maximum zoom scale can be specified.

## [0.9.8] - 2023-12-06
### Fixed
   - Fixed a bug regarding navigation through multiple custom embeds in the lightbox

## [0.9.7] - 2023-12-05
### Added
   - Added **showNavigationDots** prop; if set to true, carousel dots will be shown instead of image thumbnails in the lightbox
   - Custom components can be displayed in the controls menu, by passing the component to the **controlComponent** prop
   - Custom embeds can be rendered in the lightbox (such as the Next.js Image component)

## [0.9.6] - 2023-11-01
### Added
   - Added **thumbnailImgClass** prop, so that custom styling can be applied to lightbox thumbnails
   - Thumbnail image src links can be specified for each individual image by adding a **thumbnailSrc** property to each image object in the images prop array

## [0.9.5] - 2023-10-23
### Added
   - Image metadata can be displayed alongside each image in the lightbox

## [0.9.1] - 2023-09-27

### Fixed
   - If the `startingSlideIndex` prop is dynamically changed, its value is now updated in the lightbox

## [0.8.8] - 2023-09-25

### Added
   - Custom video embed support available. Videos with custom `iframe` elements can be rendered in the lightbox.

## [0.8.7] - 2023-09-21

### Added
   - New prop for Image component: **wrapperClassName** - CSS classes can be passed to the container element of the Image component via the `wrapperClassName` prop

## [0.8.6] - 2023-09-19

### Fixed
   - Fixed custom classes not being applied to the external image element(s) and container
   - When the theme is changed dynamically , the lightbox now updates with the newly selected theme. For example, if the lightbox `theme` prop is updated dynamically, the lightbox styling is then updated without needing to refresh the page.

## [0.7.8] - 2023-08-30
 
### Added
   - Added new callbacks: **onNext** and **onPrev** -  When the lightbox moves to the next image or previous image, an event is emitted, allowing the developer to be notified of when the lightbox's currently selected image has been updated

### Fixed
   - Fixed image swiping bug on mobile devices. The lightbox now enables image swiping after zooming in and out of the image with pinch-to-zoom on mobile devices.

## [0.7.7] - 2023-08-29
 
### Fixed
   - When the lightbox is opened, the corresponding thumbnail is displayed in the center of the device (on mobile/tablet devices) to match the selected image. 
   For instance, if the user selects the fourth image in the gallery, the lightbox will open to display the fourth thumbnail in the center of the screen. Previously on mobile devices, the thumbnails started from the beginning, but this has been fixed.

## [0.7.6] - 2023-08-29
 
### Fixed
   - For image slide rendering logic, the corresponding image object in the `images` prop is no longer mutated, and a new object is created and added to the array instead. 

## [0.7.5] - 2023-08-27
 
### Added
   - Image thumbnails move/scroll in accordance with the current image slide. For instance, if the user 
   swipes forward three images, the thumbnail will automatically scroll also.

## [0.7.3] - 2023-08-22

### Added
   - Different image sizes for the thumbnail and original, high-resolution image can be specified via data attributes.
   The value of the `data-lightboxjs-original` data attribute specifies the high-resolution image, while the `src` attribute of the `img` element specifies the src URL for the external image that's rendered outside the lightbox.

## [0.6.8] - 2023-07-10
 
### Added
   - Added new props to Image component, which were only previously available for the `SlideshowLightbox` component. 
   New props include `modalClose` and `fullScreen`
   - Next.js support added to the Lightbox.js Image component: In Next.js, the Image component (from next/image) can be rendered within the Lightbox.js Image component, which previously only rendered `<img>` HTML elements. Clicking on the Next.js Image component will result in the lightbox displaying.

## [0.6.4] - 2023-05-08
 
### Added
   - Picture HTML elements (`<picture>`)  with `<source>` tags can be added to the lightbox
   - Lightbox no longer requires the `SlideshowLightbox` component to contain the images as children of the component. The library now populates the lightbox with images specified in the `images` prop
   - Added new prop: **lightboxImgClass**:  Custom CSS class can be added to the lightbox image via the `lightboxImgClass` prop

## [0.6.0] - 2023-04-24
 
### Added
   - New prop: **modalClose** - Modal can be closed via clicking outside the image. To enable this feature, set the `modalClose` prop to `clickOutside`. 
   By default, the modal doesn't close when the outside of the image is clicked, so if a developer wishes to add this to the lightbox, the `modalClose` prop must be set to `clickOutside` for the new modal-closing functionality to be enabled.

## [0.5.9] - 2023-04-19
 
### Added
   - Lightbox can now be opened via setting the new `open` prop to `true`. 
   - The image the lightbox should open to can be specified via the `startingSlideIndex` prop
   - New event listener `onClose` now available, which emits an event when the lightbox has been closed
   - New props added: **rightArrowClassname** and **leftArrowClassname**: Custom classes can be added to right and left arrows using the new `rightArrowClassname` and `leftArrowClassname` props

## [0.5.4] - 2023-04-13
 
### Fixed
   - Fixed image refresh bug. The lightbox now refreshes the set of images shown in the lightbox when the values of the `images` prop is changed.

## [0.4.8] - 2023-03-31

### Fixed
   - Magnifying glass feature removed for video elements, as the functionality is currently only available for images

## [0.4.6] - 2023-03-22
 
### Added
- Moved to CSS modules for lightbox styling

### Fixed
- Portrait videos now contained within the device's screen height
- Fixed loading indicator display bug. Loading indicator should now be removed as soon as the element has loaded.

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
   - New props added related to hiding/showing the various icons in the top-right controls section:
      - **disableImageZoom** - If set to `true`, this disables the image zooming functionality. Default is `false`
      - **showFullScreenIcon**: Whether or not to display the full-screen icon
      - **showThumbnailIcon**: Whether or not to display the thumbnail icon
      - **showSlideshowIcon**: Whether or not to display the slideshow icon
      - **showMagnificationIcons**: Whether or not to display the magnification icon

## [0.3.6] - 2023-03-06

## Added
  - Added functionality to enable the external gallery to show only one image, while multiple images can be rendered within the lightbox. This would be useful for developers who wish to display one image, such as a product image, but have other images of that product rendered in the lightbox.

### Fixed
  - Fixed bug related to `thumbnailColor` and `iconColor` custom prop values not applying as expected. The lightbox default styling was overriding the custom specifications, but this has been fixed.

## [0.2.9] - 2022-12-22
 
### Fixed
   - Fixed Next.js lightbox image download bug. A download icon can be displayed in the lightbox by setting the `downloadImages` prop to `true`

## [0.2.7] - 2022-12-20
 
### Added
   - Images can be downloaded or saved. Note: This is only for React for this current version, see version 0.2.9 for Next.js support.
   - New prop: **downloadImages**: If set to `true`, a download icon is displayed in the top-right controls section. If this icon is clicked, the image is downloaded to the user's device or is opened to a new browser window.

## [0.2.4] - 2022-11-21
 
### Added
   - Full-screen image support available
   - New prop: **fullScreen**: If set to `true`, the images in the lightbox will take up the full available height of the screen.

## [0.2.1] - 2022-11-09
 
### Added
   - Added support for image captions. To enable this functionality, an array of image objects needs to be created, and each image object should have a `caption` property with its value being the corresponding caption text.

## [0.0.9] - 2022-09-13
 
### Added
   - Image lazyloading functionality now available. 
   - Loading indicator can be added to lightbox to display that an image is still loading via the new `showIndicator` prop

**Note**: The format of this changelog file is based on [Keep a Changelog](http://keepachangelog.com/).