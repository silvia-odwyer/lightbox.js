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


const images = [
  {
    src: 'https://source.unsplash.com/sQZ_A17cufs/549x711',
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

export default function Home({
  allPostsData
}: {
  allPostsData: {
    date: string
    title: string
    id: string
  }[]
}) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      {/* <SlideshowLightbox lightboxIdentifier="lbx1" className="container grid grid-cols-3 gap-2 mx-auto">
      
      <Image
             src="https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=2250&q=80"
              layout={"fill"}
              data-lightboxjs="lbx1"
              alt={"alt text"}
            />
    <img data-lightboxjs="lbx1" className="w-full rounded" src="https://source.unsplash.com/pAKCx4y2H6Q/1400x1200" />
    <img  data-lightboxjs="lbx1"  className="w-full rounded" src="https://source.unsplash.com/AYS2sSAMyhc/1400x1200" />  
    <img data-lightboxjs="lbx1"  className="w-full rounded" src="https://source.unsplash.com/Kk8mEQAoIpI/1600x1200" />
    <img  data-lightboxjs="lbx1" className="w-full rounded" src="https://source.unsplash.com/HF3X2TWv1-w/1600x1200" />
</SlideshowLightbox>   */}

      <SlideshowLightbox lightboxIdentifier="l2" framework="next" images={images} showThumbnails={true} theme="day">
        {images.map((image) => (
          <Box
            height="100%"
            width="100%"
          >

            <Image
              src={image.src}
              alt={image.alt}
              height={500}
              width={500}
              data-lightboxjs="l2"
              quality={80}
            />
          </Box>

        ))}

      </SlideshowLightbox>

      {/* <SlideshowLightbox lightboxIdentifier="l1" theme="day" showThumbnails={true}
                              className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
                              render={{
                                slide: (image, offset, rect) => {
                                  const width = Math.round(Math.min(rect.width, (rect.height / image.height) * image.width));
                                  const height = Math.round(Math.min(rect.height, (rect.width / image.width) * image.height));
                            
                                  return (
                                    <div style={{ position: "relative", width, height }}>
                                      <Image
                                        src={image}
                                        layout="fill"
                                        loading="eager"
                                        placeholder="blur"
                                        objectFit="contain"
                                        alt={"alt" in image ? image.alt : ""}
                                        sizes={
                                          typeof window !== "undefined"
                                            ? `${Math.ceil((width / window.innerWidth) * 100)}vw`
                                            : `${width}px`
                                        }
                                      />
                                    </div>
                                  );
                                }
                              }}>
                                <div key={"1"} className="group">
                                  <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden xl:aspect-w-7 xl:aspect-h-8">
                                    <img
                                      src={"/images/profile.jpg"}
                                      data-lightboxjs="l1"
                                      className="w-full h-full object-center object-cover group-hover:opacity-75"
                                    />
                                  </div>
                                  <h3 className="mt-4 text-sm text-gray-700">Macarons</h3>
                                  <p className="mt-1 text-lg font-medium text-gray-900">$4.70</p>
                                </div>
                                <div key={"1"} className="group">
                                  <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden xl:aspect-w-7 xl:aspect-h-8">

                                          <Image
                                            src="/images/profile.jpg"
                                            alt="Keyboards"
                                            data-lightboxjs="l1"

                                            width={500}
                                            height={500}
                                          />
                                  </div>
                                  <h3 className="mt-4 text-sm text-gray-700">Macarons</h3>
                                  <p className="mt-1 text-lg font-medium text-gray-900">$4.70</p>
                                </div>
                              </SlideshowLightbox> */}



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
