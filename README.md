# lightbox.js

> React lightbox with animation and customization options

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
- Entry/exit animations
- No external CSS required

## Features to be added
- Loading indicators
- New presets

[![NPM](https://img.shields.io/npm/v/lightbox.js.svg)](https://www.npmjs.com/package/lightbox.js) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Usage

```jsx
import React, { Component } from 'react'

import Lightbox from 'lightbox.js'
import 'lightbox.js/dist/index.css'

class Example extends Component {
  render() {
    return <Lightbox />
  }
}
```

## Types of Lightboxes Available
Several types of lightboxes have been provided, which have varying features to cater to your project's requirements.
For instance, a gallery lightbox is provided, which allows users to cycle through images included in the gallery. 

However another lightbox is provided for displaying a single image only.

For further themes and presets, be sure to take a look at the list of available presets below, which incorporate lightboxes 
of different styles.


## Features
### Multiple Presets 

Several presets are provided, which offer varying themes and customization options. These include:

- **Slideshow w/ thumbnails**:  A lightbox which displays images along with thumbnails underneath, so that users can navigate to other imagery in the slideshow.
- **Full-screen lightbox**: A lightbox which displays images at full-screen width and height.
- **Video lightbox**: Videos can also be displayed.
- **Sidebar**: A lightbox with a sidebar, where ads or other content can be displayed.

### Keyboard Shortcuts
The lightbox can also be controlled using the keyboard by pressing the following keys:
- **Left Key**: Navigate to previous image
- **Right key**: Navigate to next image
- **`Esc`**: Closes the lightbox

### Slideshow 
The lightbox component contains a slideshow feature, which cycles through the images in an automated manner. 
If you'd like to switch this on, simply click the Play button and the slideshow feature will be enabled.

To pause or stop the slideshow, click the Pause button in the upper-right corner.

### Zooming 
Users can zoom into the images displayed in the lightbox on both desktop and mobile devices. 

- **Desktop**: On a desktop device, users can zoom by scrolling with the mouse-wheel.  
- **Mobile**: Mobile users can zoom through using the pinch-to-zoom feature. 

## License

GNU General Public License v3.0  © [silvia-odwyer](https://github.com/silvia-odwyer)
