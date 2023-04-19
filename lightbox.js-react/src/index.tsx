import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion'
import styles from './styles.module.css'
import axios from "axios";
import {
  wrapNums,
  getVideoHeight,
  getVideoWidth,
  shouldAutoplay,
  openFullScreen,
  closeFullScreen,
} from './utility'
import {
  ZoomIn,
  ZoomOut,
  Fullscreen,
  PlayCircleFill,
  Search,
  Download,
  PauseCircleFill,
  FullscreenExit,
  XLg,
  GridFill
} from 'react-bootstrap-icons'
import ScrollContainer from 'react-indiana-drag-scroll'
import Magnifier from 'react-magnifier'
import { Portal } from 'react-portal'
import { TransformWrapper, TransformComponent,  ReactZoomPanPinchRef, } from 'react-zoom-pan-pinch'
import ReactSwipe from 'react-swipe'
import { saveAs } from 'file-saver'
import Div100vh from 'react-div-100vh'
import KeyHandler from 'react-key-handler'
import {SlideshowLightbox} from "./SlideshowLightbox"
import {AnimImage} from "./AnimImage"
import { useIsomorphicLayoutEffect } from 'usehooks-ts'
import { useInterval } from 'usehooks-ts'

export const initLightboxJS = (licenseKey: string, plan_type: string) => {
  var body = {
    license_key: licenseKey,
    plan_type: plan_type,
  };

  axios.post('https://lightboxjs-server.herokuapp.com/license', body)
    .then(function (response) {

      console.log("response ", response)
      let licenseKeyValid = response.data.license_valid;

      if (!licenseKeyValid) {
        console.warn("Lightbox.js: Invalid license key specified, a valid license key must be provided.")
      }
    })
    .catch(function (error) {
      console.log(error);
    });

};


export { SlideshowLightbox, AnimImage as Image }