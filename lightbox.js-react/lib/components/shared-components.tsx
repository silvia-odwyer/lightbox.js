import * as React from "react";
import styles from "./SlideshowLightbox/SlideshowLightbox.module.css";

import KeyHandler from "@banzai-inc/react-key-handler";
import { ReactNode } from "react";

type IconButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  showOutline?: boolean;
  style?: any;
};



export function IconButton({
  onClick,
  children,
  label,
  id,
  showOutline = true,
  disabled = false,
  className = "",
  style = {},
}: IconButtonProps) {
  function handleKeyDown(e) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(e);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      id={id}
      onKeyDown={handleKeyDown}
      className={`${styles.lightboxjsBtn} ${className} ${showOutline ? styles.lightboxjsBtn_showOutline : ""}`}
      style={style}
      tabIndex={0}
      aria-label={label}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function EscKeyHandlers({ isBrowserFullScreen, onCloseModal }) {
  return (
    <>
      <KeyHandler
        keyValue={"Escape"}
        code={"27"}
        onKeyHandle={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!isBrowserFullScreen) {
            onCloseModal();
          }
        }}
      />

      {/* Support for Internet Explorer and Edge key values  */}

      <KeyHandler
        keyValue={"Esc"}
        code={"27"}
        onKeyHandle={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!isBrowserFullScreen) {
            onCloseModal();
          }
        }}
      />
    </>
  );
}



export function PictureElem({
  elem_metadata,
  enableMagnifyingGlass,
  onHandleError,
  index,
}) {
  return (
    <picture
      className={`imageModal 
      ${styles.lightboxImg} 
      ${
        enableMagnifyingGlass
          ? styles.maxWidthFull
          : styles.maxWidthWithoutMagnifier
      } `}
    >
      {Object.keys(elem_metadata).map((format) => (
        <source
          type={format}
          key={format}
          srcSet={elem_metadata[format].srcSet}
        />
      ))}
      <img
        src={elem_metadata["fallback"]}
        onError={(error) => {
          onHandleError(error, index);
        }}
      />
    </picture>
  );
}
