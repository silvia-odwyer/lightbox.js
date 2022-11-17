import './App.css';
import 'lightbox.js-react/dist/index.css'
import {SlideshowLightbox} from 'lightbox.js-react'


function App() {
  return (
    <div className='ml-12 w-4/5 mt-8'>
      <h1 className="font-bold text-lg">Lightbox.js + Tailwind example</h1>
      <p className='mb-4 text-md'>Click on an image below to open the lightbox.</p>
      <SlideshowLightbox className='container grid grid-cols-3 gap-2 mx-auto'>
        <img className='w-full rounded' src='https://source.unsplash.com/EVQH70oYYNM/1400x1200' alt="Field with a blue sky"/>
        <img className='w-full rounded' src='https://source.unsplash.com/8Twe0QOt1Jo/1400x1200' alt='Pink flowers' />  
        <img className='w-full rounded' src='https://source.unsplash.com/ROsXqvRzhiQ/1400x1200' alt="Group of daisies" />       
      </SlideshowLightbox> 
    </div>
  );
}

export default App;
