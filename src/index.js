import React, {useEffect} from 'react'
import styles from './styles.module.css'
import './css/tailwind.css';
import {VideoLightbox} from "./VideoLightbox";
import {AnimImage as Image} from "./AnimImage";
import {SlideshowLightbox} from "./SlideshowLightbox";

// Icons
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlay, faPause, faClose, faPlus, faMinus, 
  faMagnifyingGlassPlus, faMagnifyingGlassMinus, faBorderAll, faTableCellsLarge, faTable, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons'

library.add(faPlay, faPause, faClose, faPlus, faMinus, faExpand, faMagnifyingGlassPlus, faCompress, faMagnifyingGlassMinus, faBorderAll, faTableCellsLarge);

export { VideoLightbox, Image, SlideshowLightbox }