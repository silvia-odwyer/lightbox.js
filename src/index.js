import React, {useEffect} from 'react'
import styles from './styles.module.css'
import './css/tailwind.css';
import {VideoLightbox} from "./VideoLightbox";
import {ImageGridGallery} from "./ImageGridGallery";
import {ImageGridSlideshow} from "./ImageGridSlideshow";
import {ImageGridSlideshowNoAnim} from "./ImageGridSlideshowNoAnim";
import Carousel from "./Carousel"
import {CarouselItem} from "./Carousel";
import {Lightbox} from "./Lightbox";
import {Image} from "./Image";
import {LightboxZoomAnim} from "./LightboxZoomAnim";

export const ExampleComponent = ({ text }) => {
  return <div className="text-4xl italic text-purple-200">Example Component: {text}</div>
}

export { VideoLightbox, Image, ImageGridGallery, ImageGridSlideshow, ImageGridSlideshowNoAnim, Carousel, CarouselItem , Lightbox, LightboxZoomAnim}