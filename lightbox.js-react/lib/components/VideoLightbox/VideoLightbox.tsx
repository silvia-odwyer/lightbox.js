"use client";

import React from "react";
import {
  ItemLightbox,
  ItemLightboxProps,
  VideoItem,
} from "../ItemLightbox/ItemLightbox";

export interface VideoLightboxProps extends Omit<ItemLightboxProps, "item"> {
  mediaItem?: VideoItem | any;
}

export const VideoLightbox: React.FC<VideoLightboxProps> = ({
  mediaItem,
  ...rest
}) => <ItemLightbox {...rest} item={mediaItem} />;