# lightbox.js
[![NPM](https://img.shields.io/npm/v/lightbox.js-react.svg)](https://www.npmjs.com/package/lightbox.js-react) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> All-in-one React lightbox with animation and customization options

Lightbox.js is an all-in-one lightbox solution for use with React.js. 

![Imgur](https://i.imgur.com/xMPMSza.png)

The following features are provided:

- **Fully responsive** for desktop and mobile devices
- **Slideshow functionality**
- **Animations**: Multiple image transitions with entry/exit animations
-**Keyboard shortcuts:** You can cycle through the images by pressing the right and left arrow keys.
- **Full-screen mode:** To exit full-screen mode, click the minimize icon or press the `Esc` key
- **Intuitive Zooming**: Users can zoom through:
        - Pinch-to-zoom
        - Mouse wheel
        - Single-click
- **Panning**: Once an image is zoomed into, the image can be panned by dragging the image through the mouse, or if on a mobile device, with a swipe-to-drag motion.
<!-- - **Image drag/swipe:** Images can be navigated from one image to the next by dragging the image using the mouse or with a swipe-to-drag motion. -->
- **Built-in themes:** Three pre-built lightbox designs with variations in UI and theme are available
- **Customization:** All lightbox components can be fully customized, including background color, icon colors and so much more.
- **Thumbnails:** The option to add thumbnails is also available, along with animated entry/exit transitions.
- **New features**: This is only the beginning! We're working hard to add even more new features to make Lightbox.js even better! If you have any feature requests, be sure to let us know by opening an issue!

## Getting Started
### Install

To get started, simply install the module via NPM. 

```bash
npm install lightbox.js-react
```

### Usage
Then, import the components required and import the CSS file for this library. 

```jsx
import {SlideshowLightbox} from 'lightbox.js-react'
import 'lightbox.js-react/dist/index.css'
```

You can initialize the license key as so:

```js
  useEffect(() => {
    console.log("init")
    initLightboxJS("Insert License key", "Insert plan type here");
  });
```

The two plan types are `individual` and `team`.

Next, wrap the images in a `SlideshowLightbox` component as shown below:

```jsx
import React, { Component } from 'react'

import {SlideshowLightbox} from 'lightbox.js-react'
import 'lightbox.js-react/dist/index.css'

class Demo extends Component {
  render() {
    return <SlideshowLightbox className="container grid grid-cols-3 gap-2 mx-auto">
              <img className="w-full rounded" src="https://source.unsplash.com/pAKCx4y2H6Q/1400x1200" />
              <img className="w-full rounded" src="https://source.unsplash.com/AYS2sSAMyhc/1400x1200" />  
              <img className="w-full rounded" src="https://source.unsplash.com/Kk8mEQAoIpI/1600x1200" />
              <img className="w-full rounded" src="https://source.unsplash.com/HF3X2TWv1-w/1600x1200" />              
            </SlideshowLightbox> 
  }
}
```

#### Getting A License Key
Depending on the nature of your project, there are two ways to get a license key:
1. **Commercial product:** If you require Lightbox.js for a commercial product, then a license can be purchased from [our website](https://getlightboxjs.com/pricing). 
2. **Open-source:** If your project is open-source, then you can request a free license key from our [website's contact form](https://getlightboxjs.com/contact/). 

## Features

### Zooming 
Users can zoom into the images displayed in the lightbox on both desktop and mobile devices. 

- **Desktop**: On a desktop device, users can zoom by scrolling with the mouse-wheel or through clicking on the image.
- **Mobile**: Mobile users can zoom through using the pinch-to-zoom feature. 

### Mobile Support 
Mobile support is also provided with responsive imagery, and mobile-supported drag/swipe motions.
- **Drag to swipe**: Users can navigate to the next image in the lightbox through a drag-to-swipe motion. 
- **Pinch-to-zoom**: Zooming functionality is also provided, and users can zoom on a mobile device through a pinch-to-zoom motion.

### Multiple Presets 

Several themes are provided, which offer varying backgrounds and icon colors. These include:

- **day**: A light theme with a white background and gray icons
- **night**: A dark theme with gray icons
- **lightbox**: A theme with a semi-transparent gray background

However, these just include the preset themes. Full customization of the background and icon colors is available by passing colors through the props provided, see the documentation for more details.

### Keyboard Shortcuts
The lightbox can also be controlled using the keyboard by pressing the following keys:
- **Left Key**: Navigate to previous image
- **Right key**: Navigate to next image
- **`Esc`**: Closes the lightbox

### Slideshow 
The lightbox component contains a slideshow feature, which cycles through the images in an automated manner. 
If you'd like to switch this on, simply click the Play button and the slideshow feature will be enabled.

To pause or stop the slideshow, click the Pause button in the upper-right corner.

## Types of Lightboxes Available
Several types of lightboxes have been provided, which have varying features to cater to your project's requirements.

These include:
- **Slideshow w/ thumbnails**:  A lightbox which displays images along with thumbnails underneath, so that users can navigate to other imagery in the slideshow.
- **Full-screen lightbox**: A lightbox which displays images at full-screen width and height.
- **Image**: Another lightbox is provided for displaying a single image only.

For instance, a gallery lightbox is provided, which allows users to cycle through images included in the gallery. 

For further themes and presets, be sure to take a look at the list of available presets below, which incorporate lightboxes of different styles.

## Props
| Prop Name      | Description |
| ----------- | ----------- |
| theme      | The theme to be applied to the lightbox. Options include day, night, lightbox       |
| fulLScreen   | Whether to display images so that they take up tne screen's full width and height        |
| backgroundColor   | the background color of the lightbox, as a CSS color name, RGBA value or HEX code        |
| iconColor   | the icon color for the lightbox, as a CSS color name, RGBA value or HEX code        |
| thumbnailBorder   | the color of the thumbnails' borders, as a CSS color name, RGBA value or HEX code        |
| showThumbnails   | Whether or not to show image thumbnails.        |
| slideshowInterval   | the time in milliseconds before the slideshow transitions to the next image.        |
| animateThumbnails   | Whether or not to animate the thumbnails as they enter the view.        |
| imgAnimation   | The image animation type to show between image transitions in the slideshow, options include "fade" and "imgDrag"        |

## Development 
Contributions are always welcome! If you'd like to add new features or wish to work on the library, simply clone this repo:

```bash
git clone https://github.com/silvia-odwyer/lightbox.js
cd lightbox.js
```

Then, install the dependencies required:

```bash
npm install
```

To start the development server for the library, run:

```bash
npm run start
```

You can then make changes to the library and after any saved changes, the development server will provide live reloading 
and build the library. In order to view your changes, simply set-up and run the example demo as shown below. That way, when 
you make edits to the library, you'll see these changes reflected in the demo and can try out the lightbox upon making changes, and so forth.

### Running the example demo
An example demo has been set-up that integrates with the library. 

Navigate to `lightbox.js/example`:

```bash
cd example
```

Then, install the dependencies required:

```bash
npm install
```

Once the dependencies have been installed, it's time to start the development server for the example demo:

```bash
npm run start
```

And there you have it! You can now make changes to the library and the example demo will automatically update. 

## Contributions
If you'd like to add any new features, we're always welcoming new contributions! We only accept contributions that are under the GPL v3 License, so if you agree to this license and its terms, then we'd be delighed to integrate your contribution! 

## License
### Commercial License
If you wish to use Lightbox.js for a commercial product, a commercial license can be purchased from [our website](https://getlightboxjs.com/pricing/), with two separate plans available -- an Individual plan for individual developers, as well as a Team & Company plan. 

### Open Source License
If your project is open-source and is compatible with the terms of the GPU v3 License, Lightbox.js can be used for free and is licensed under the GNU General Public License v3.0. A free license key can be requested through [our website's contact form](https://getlightboxjs.com/contact/).