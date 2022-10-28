// Utility functions related to handling keyboard events 
// so that keyboard shortcuts can be provided to navigate through the 
// lightbox's imagery
export const keyPressHandler = (event) => {
    let key = event.key;

    if (key == "ArrowLeft") {
      updateCurrentSlide(-1);
    }

    else if (key == "ArrowRight") {
      updateCurrentSlide(1);
      
    }
    else if (key == "Escape") {
      closeModal(1)
    }
};