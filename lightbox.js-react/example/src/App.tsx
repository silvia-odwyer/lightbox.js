import React, { useEffect } from 'react'

import { SlideshowLightbox,  initLightboxJS} from 'lightbox.js-react'
import 'lightbox.js-react/dist/index.css'
import "./App.css"

const App = () => {

  useEffect(() => {
    initLightboxJS(process.env.lightboxJSLicenseKey, "invididual")
  })

  return <div>
      <SlideshowLightbox theme={"day"} showControls={true}>
        <img className='w-full rounded' src='https://source.unsplash.com/EVQH70oYYNM/1400x1200' />
        <img className='w-full rounded' src='https://source.unsplash.com/8Twe0QOt1Jo/1400x1200' />  
        <img className='w-full rounded' src='https://source.unsplash.com/ROsXqvRzhiQ/1400x1200' />       
      </SlideshowLightbox> 


    </div>
}

export default App
