# lightbox.js

> React lightbox with animation and customization options

Lightbox.js is an all-in-one lightbox solution for use with React.js. 

The following features are provided:
- Mobile support for swiping 
- Fully responsive for desktop and mobile devices
- Five pre-built lightbox designs with variations in UI and theme
- Theming and customization options
- Keyboard shortcuts
- Entry/exit animations
- No external CSS required

## Features to be added
- Zooming functionality (with mobile-support also)
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

## Keyboard Shortcuts
The lightbox can also be controlled using the keyboard by pressing the following keys:
- **Left Key**: Moves to previous image
- **Right key**: Moves to next image
- **`Esc`**: Closes the lightbox

## License

GNU General Public License v3.0  © [silvia-odwyer](https://github.com/silvia-odwyer)
