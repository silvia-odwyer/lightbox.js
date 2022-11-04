import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData } from '../lib/posts'
import Link from 'next/link'
import Date from '../components/date'
import { GetStaticProps } from 'next'
import { initLightboxJS } from 'lightbox.js-react'
import { SlideshowLightbox } from 'lightbox.js-react'
import Image from "next/image";
import 'lightbox.js-react/dist/index.css'
import { Flex, Box } from 'reflexbox';
import React, { forwardRef } from 'react'
import image1 from "../public/images/image1.png"

const images = [
  {
    src: image1,
    alt: 'Mechanical keyboard with white keycaps.',
  },
  {
    src: 'https://source.unsplash.com/rsAeSMzOX9Y/768x512',
    alt: 'Mechanical keyboard with white, pastel green and red keycaps.',
  },
  {
    src: 'https://source.unsplash.com/Z6SXt1v5tP8/768x512',
    alt: 'Mechanical keyboard with white, pastel pink, yellow and red keycaps.',
  },
  {
    src: 'https://source.unsplash.com/2WcghjtPodU/549x711',
    alt: 'Mechanical keyboard with white keycaps.',
  },

]

export default function Home(
  {
  
  allPostsData
}: {
  allPostsData: {
    date: string
    title: string
    id: string
  }[]
}
) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <SlideshowLightbox lightboxIdentifier="l2" framework="next" images={images}>
        {images.slice(0, 2).map((image, j) => (


            <Image
              src={image.src}
              key={j}
              alt={image.alt}
              height={500}
              width={500}
              data-lightboxjs="l2"
              quality={80}
            />

        ))}

      </SlideshowLightbox>
    
      <section className={utilStyles.headingMd}>
        <p>[Your Self Introduction]</p>
        <p>
          (This is a sample website - you’ll be building a site like this in{' '}
          <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}
