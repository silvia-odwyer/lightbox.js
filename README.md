# lightbox.js
[![NPM](https://img.shields.io/npm/v/lightboxjs.svg)](https://www.npmjs.com/package/lightboxjs) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> All-in-one React lightbox with animation and customization options

Lightbox.js is an all-in-one lightbox solution for use with React.js. 

![Imgur](https://i.imgur.com/xMPMSza.png)

The following features are provided:
- Mobile support for swiping 
- Fully responsive for desktop and mobile devices
- Five pre-built lightbox designs with variations in UI and theme
- Theming and customization options
- Zooming functionality (with mobile-support also)
- Slideshow functionality
- Keyboard shortcuts
- Thumbnails
- Multiple image transitions
- Entry/exit animations
- No external CSS required

## Getting Started
To get started, simply install the module via NPM. 

```bash
npm install lightboxjs
```

Then, import the components required and import the CSS file for this library. Next, wrap the images in a `SlideshowLightbox` component as shown below:

```jsx
import React, { Component } from 'react'

import {SlideshowLightbox} from 'lightboxjs'
import 'lightboxjs/dist/index.css'

class Demo extends Component {
  render() {
    return <SlideshowLightbox className="container grid grid-cols-3 gap-2 mx-auto" licenseKey="Insert License Key Here">
              <img className="w-full rounded" src="https://source.unsplash.com/pAKCx4y2H6Q/1400x1200" />
              <img className="w-full rounded" src="https://source.unsplash.com/AYS2sSAMyhc/1400x1200" />  
              <img className="w-full rounded" src="https://source.unsplash.com/Kk8mEQAoIpI/1600x1200" />
              <img className="w-full rounded" src="https://source.unsplash.com/HF3X2TWv1-w/1600x1200" />              
            </SlideshowLightbox> 
  }
}
```

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

However, these just include the preset themes. Full customization of the background and icon colors is available by passing colors through 
the props provided, see the documentation for more details.

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

For further themes and presets, be sure to take a look at the list of available presets below, which incorporate lightboxes 
of different styles.

## License

GNU General Public License v3.0  © [silvia-odwyer](https://github.com/silvia-odwyer)
