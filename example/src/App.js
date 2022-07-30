import React, { useEffect } from 'react'
import './App.css'
import { Image, SlideshowLightbox, initLightboxJS } from 'lightbox.js-react'
// import img1 from "./cloud1.jpg";

const App = () => {

  useEffect(() => {
    console.log("init")
    initLightboxJS("License key", "individual");
  });

  const images = [
    {
      title: 0,
      src: 'https://source.unsplash.com/600x1200/?cyberpunk',
      caption: 'Street at night'
    },
    {
      title: 1,
      src: 'https://source.unsplash.com/1600x1200/?cyberpunk+night',
      caption: 'Cyberpunk night'
    },
    {
      title: 2,
      src: 'https://source.unsplash.com/2000x1600/?city+night',
      caption: 'City night'
    },
    {
      title: 3,
      src: 'https://source.unsplash.com/1800x1500/?cyberpunk+city',
      caption: 'Neon city'
    },
    {
      title: 4,
      src: 'https://source.unsplash.com/800x1200/?neon+city',
      caption: 'Neon night'
    }
  ]

  const image = {
    src: 'https://source.unsplash.com/1400x1200/?cyberpunk+city',
    title: 'cyberpunkcity',
    description: 'Cyberpunk city with neon lights'
  }

  return (
    <div className='main_section'>
      <div className='header font-sans'>
        <h1 className='text-gray-900'>Lightbox.js</h1>
        <p className='text-gray-500 font-sans text-lg '>
          Some examples of Lightbox.js in action, perfect for testing!
        </p>
      </div>

      <SlideshowLightbox
        className='images'
        theme='day'
        lightboxIdentifier='l1'
        animateThumbnails={false}
        roundedImages={true}
        showThumbnails={true}
        showControls={true}

      >
        <img
          className='w-full rounded'
          src={'https://source.unsplash.com/1600x1200/?hills+blue+sky'}
          alt="Blue sky"
          data-lightboxjs='l1'
        />
        <img
          className='w-full rounded'
          src={'https://source.unsplash.com/1600x1200/?green+hills+mountains'}
          alt="Green hills"
          data-lightboxjs='l1'
        />
        <img
          className='w-full rounded'
          src={'https://source.unsplash.com/1600x1200/?green+hills'}
          alt="Green hills"
          data-lightboxjs='l1'
        />
                <img
          className='w-full rounded'
          src={'https://source.unsplash.com/1600x1200/?clouds+hills+mountains'}
          alt="Green hills"
          data-lightboxjs='l1'
        />
        <img
          className='w-full rounded'
          src={'https://source.unsplash.com/1600x1200/?blue+sky+hills'}
          alt="Green hills"
          data-lightboxjs='l1'
        />
      </SlideshowLightbox>

      <SlideshowLightbox
        theme='day'
        animateThumbnails={false}
        showControls={false}

        showThumbnails={true}
        imgAnimation={'imgDrag'}
        className='container grid grid-cols-3 gap-2 mx-auto mt-8'
        fullScreen={true}
      >
        <img
          className='w-full rounded'
          src={'https://source.unsplash.com/1600x1200/?blue+sky'}
          alt='Blue sky'
          data-lightboxjs='hi2'
        />
        <img
          className='w-full rounded'
          src={'https://source.unsplash.com/1600x1200/?sunset+mountains'}
          alt='Mountains at sunset'
          data-lightboxjs='hi2'
        />
      </SlideshowLightbox>

      <SlideshowLightbox
        theme='day'
        animateThumbnails={false}
        fullScreen={true}
        showControls={false}

        showThumbnails={true}
        imgAnimation={'imgDrag'}
        className='container grid grid-cols-3 gap-2 mx-auto mt-8'
      >
        <img
          className='w-full rounded'
          src={'https://source.unsplash.com/1600x1200/?sunset'}
          alt='Sunset'
        />
        <img
          className='w-full rounded'
          src={'https://source.unsplash.com/1600x1200/?mountains'}
          alt='Mountain landscape'
        />
      </SlideshowLightbox>

      <SlideshowLightbox
        theme='day'
        animateThumbnails={false}
        fullScreen={true}
        showThumbnails={true}
        showControls={false}

        imgAnimation={'imgDrag'}
        className='container grid grid-cols-3 gap-2 mx-auto mt-8'
      >
        <img
          className='w-full rounded'
          src={'https://source.unsplash.com/1600x1200/?purple+sky'}
        />
        <img
          className='w-full rounded'
          src={'https://source.unsplash.com/1600x1200/?sunset+purple'}
        />
      </SlideshowLightbox>

      <div className='container grid grid-cols-3 gap-2 mx-auto mt-8'>
        <Image
          theme='lightbox'
          image={{
            src: 'https://source.unsplash.com/600x800/?flowers+meadow',
            title: 'Meadow with flowers'
          }}
        />

        <Image
          image={image}
          imgAnimation={'imgDrag'}
          theme='night'
          backgroundColor={'rgba(0, 0, 10, 0.8)'}
          alt='City at night'
        />
      </div>
    </div>
  )
}

export default App
