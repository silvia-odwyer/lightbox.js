import React, { useState } from 'react';
import styles from './styles.module.css';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';

const themes = {"day": "white", "night": "rgb(0, 0, 0)", "lightbox": "rgba(0, 0, 0, 0.4)"}
const variants = {
  imgEnter: (direction) => {
    return {
      opacity: 1
    };
  },
  whileAnim: {
    zIndex: 1,
    opacity: 1
  },
  imgExit: (direction) => {
    return {
      zIndex: 0,
      opacity: 0,
      duration: 0.2
    };
  }
};

export const Lightbox = (props) => {
  const [indexNum, setIndexNum] = useState(false);
  const [slideIndex, setSlideIndex] = useState(1);
  const [currentCaption, setCurrentCaption] = useState(false);

  const onSlideshowClose = () => {
    setIndexNum(false);
  }

  const openModal = (num) => {
    document.getElementById("modal").style.display = "block";
    currentSlide(num)
  }

  const closeModal = (num) => {
    document.getElementById("modal").style.display = "none";
    currentSlide(num)
  }

  const currentSlide = (num) => {
    setSlideIndex(num)
    showSlides(num);
  }

  const updateSlideIndex = (num) => {
      let newIndex = slideIndex + num;
      setSlideIndex(newIndex);
      showSlides(newIndex);
   }

  const showSlides = (num) => {

    if (num > props.images.length) {
      setSlideIndex(1);
    }
    else if (num < 1) {
        setSlideIndex(props.images.length  - 1);
    }
    console.log("slide index is ", slideIndex)
  }

    const [backgroundColor, setBackgroundColor] = React.useState(props.backgroundColor ? props.backgroundColor : themes["day"]);
    const [state, setState] = React.useState();
    
    React.useEffect(() => {
        if (props.theme) {
          if (themes[props.theme]) {
            setBackgroundColor(themes[props.theme]);
          }
        }
        showSlides(slideIndex)

      }, [state]);

    return (
        <div>
            <div className="flex">
                {props.images.map((img, index) => (
                  <div style={{margin: "0.2em", cursor: "pointer"}}>
                    <img src={img.src} onClick={() => {openModal(index + 1) }} className="hoverShadow"/>
                  </div>
                ))}
            </div>

            <div id="modal" className="modal h-screen w-screen">  
                <span className="closeIcon" onClick={() => {closeModal(1) }}>&times;</span>
                <div className="modalContent" style={{margin: 0, padding: 0}}>
                    
                    {props.images.map((img, index) => (
                      <section
                      className={"flex justify-center items-center imageSlide fader mx-auto " + (slideIndex === index + 1 ? 'show' : 'hidden')}  style={{maxWidth: "70vw", maxHeight: "60vh"}}>
                        <div className="number_text">{index + 1} / {props.images.length}</div>
                        <img className="mx-auto " src={img.src} alt={img.caption}  />
                      </section>
                    ))}

                    <a className="prevIcon" onClick={() => {updateSlideIndex(-1) }}>&#10094;</a>

                    <a className="nextIcon" onClick={() => {updateSlideIndex(1) }}>&#10095;</a>

                    <div className="caption" >
                        <p>{props.images[slideIndex - 1].caption}</p>
                    </div>

                    <div className="thumbnails flex justify-centre gap-4 w-3/5 mx-auto" style={{height: "5vh"}}>
                      {props.images.map((img, index) => (
                          <img className={"thumbnail " + (slideIndex === index + 1 ? 'active' : '')} style={{height: "8vh", width: "8vw"}} src={img.src} onClick={() => {currentSlide(index + 1) }} alt={img.caption}/>        
                      ))}
                    </div>

            </div>
          </div> 

        </div>

  );

}