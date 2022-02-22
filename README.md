# lightbox.js

> React lightbox with animation and customization options

Lightbox.js is an all-in-one lightbox solution for use with React.js. 

The following features are provided:
- Mobile support for swiping 
- Fully responsive for desktop and mobile devices
- Five pre-built lightbox designs with variations in UI and theme
- Theming and customization options
- Zooming functionality (with mobile-support also)
- Slideshow functionality
- Keyboard shortcuts
- Entry/exit animations
- No external CSS required

## Features to be added
- Loading indicators

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

## Features
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
