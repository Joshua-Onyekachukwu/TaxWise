"use client";

import React, { useState } from "react";
import Image from "next/image";

// TypeScript interfaces for data structure
interface VideoTestimonial {
  id: number;
  image: {
    src: string;
    alt: string;
  };
  name: string;
  role: string;
  rating: number; // Number of stars (1-5)
  videoUrl: string; // Added to support individual video URLs
}

interface TextTestimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  avatar: {
    src: string;
    alt: string;
  };
  rating: number;
}

interface TestimonialsData {
  sectionTitle: {
    tag: string;
    title: string;
    description: string;
  };
  videoTestimonials: VideoTestimonial[];
  textTestimonials: TextTestimonial[];
}

// Dynamic data configuration
const testimonialsData: TestimonialsData = {
  sectionTitle: {
    tag: "Testimonials",
    title: "Trusted by Nigerian Freelancers",
    description:
      "See how Taxwise is helping people like you save time and money on their taxes.",
  },
  videoTestimonials: [
    {
      id: 1,
      image: {
        src: "/images/girl-with-card.jpg",
        alt: "girl-with-card",
      },
      name: "Amara N.",
      role: "Digital Marketer",
      rating: 5,
      videoUrl: "https://www.youtube.com/embed/_ZppXdKk4c8?si=9IpWzVHI_uDyzL4n",
    },
    {
      id: 2,
      image: {
        src: "/images/boy-with-card.jpg",
        alt: "boy-with-card",
      },
      name: "Tunde O.",
      role: "Software Developer",
      rating: 5,
      videoUrl: "https://www.youtube.com/embed/ZXYIp5SyMEs?si=cHNHUd3ilpCfZRxr",
    },
  ],
  textTestimonials: [
    {
      id: 1,
      quote:
        "Taxwise saved me hours of sorting through bank statements. The AI categorization is surprisingly accurate!",
      name: "Chioma E.",
      role: "Content Creator",
      avatar: {
        src: "/images/users/user1.jpg",
        alt: "user-image",
      },
      rating: 5,
    },
    {
      id: 2,
      quote:
        "I finally know exactly what I owe in taxes without guessing. The 'Ask Taxwise' chat is like having an accountant in my pocket.",
      name: "David K.",
      role: "Freelance Designer",
      avatar: {
        src: "/images/users/user2.jpg",
        alt: "user-image",
      },
      rating: 5,
    },
    {
      id: 3,
      quote:
        "The monthly reports help me track my business growth. Highly recommended for any small business owner.",
      name: "Sarah J.",
      role: "E-commerce Seller",
      avatar: {
        src: "/images/users/user3.jpg",
        alt: "user-image",
      },
      rating: 5,
    },
  ],
};

const Testimonials: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  // Open modal with the specific video URL
  const openModal = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setIsModalOpen(true);
  };

  // Close modal and reset video URL
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentVideoUrl("");
  };

  // Function to render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <i
        key={index}
        className={`ri-star-fill ${
          index < rating ? "text-orange-400" : "text-gray-300"
        }`}
      ></i>
    ));
  };

  return (
    <>
      {/* Video Modal */}
      {isModalOpen && (
        <div
          className="fixed p-3 inset-0 z-[999] flex items-center justify-center bg-black/80"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="relative w-full max-w-3xl p-4 bg-white rounded-lg dark:bg-[#0a0e19]">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -top-2 -right-2 bg-[#000] p-1 rounded-full text-red-500 hover:text-red-400"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* YouTube Video Iframe */}
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" /* 16:9 Aspect Ratio */ }}
            >
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src={currentVideoUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#f3ede6] dark:bg-[#0a0e19] py-[70px] md:py-[90px] lg:py-[110px] xl:py-[130px] 2xl:py-[160px]">
        <div className="container sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1308px] mx-auto px-[12px]">
          {/* Section Header */}
          <div className="mb-[30px] md:mb-[40px] lg:mb-[50px] xl:mb-[60px] 2xl:mb-[70px] text-center mx-auto md:max-w-[475px]">
            <span className="inline-block bg-white dark:bg-dark text-purple-600 rounded-[30px] py-[6.5px] px-[18px] mb-[15px]">
              {testimonialsData.sectionTitle.tag}
            </span>
            <h2 className="!font-medium md:-tracking-[1px] !text-xl md:!text-2xl lg:!text-3xl xl:!text-5xl !leading-[1.2] !mb-[13px]">
              {testimonialsData.sectionTitle.title}
            </h2>
            <p className="md:text-[15px] lg:text-md">
              {testimonialsData.sectionTitle.description}
            </p>
          </div>

          {/* Video Testimonials - 2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px]">
            {testimonialsData.videoTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="relative z-[1] rounded-[15px]"
              >
                <Image
                  src={testimonial.image.src}
                  className="inline-block rounded-[15px]"
                  alt={testimonial.image.alt}
                  width={630}
                  height={408}
                />
                <div className="absolute left-0 right-0 bottom-0 px-[20px] md:px-[30px] lg:px-[60px] pb-[20px] md:pb-[30px] lg:pb-[45px] flex items-center justify-between">
                  <div className="flex items-center gap-[13px] md:gap-[15px] lg:gap-[18px]">
                    <button
                      type="button"
                      onClick={() => openModal(testimonial.videoUrl)}
                      className="flex items-center justify-center text-white w-[45px] h-[45px] lg:w-[50px] lg:h-[50px] rounded-full bg-purple-600 text-xl transition-all hover:bg-purple-500"
                    >
                      <i className="ri-play-large-fill"></i>
                    </button>
                    <div>
                      <h3 className="!font-normal !text-md md:!text-lg !mb-[3px] !text-black">
                        {testimonial.name}
                      </h3>
                      <span className="block text-">{testimonial.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-purple-500 leading-none text-md gap-[2px]">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Text Testimonials - 3 Grid */}
          <div className="mt-[25px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[25px]">
            {testimonialsData.textTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="p-[20px] md:p-[30px] xl:p-[40px] bg-white dark:bg-dark rounded-[15px]"
              >
                <div className="flex items-center leading-none text-md gap-[2px] mb-[13px] md:mb-[20px]">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-black dark:text-white">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-[12px] mt-[15px] md:mt-[20px] lg:mt-[25px]">
                  <Image
                    src={testimonial.avatar.src}
                    className="rounded-full"
                    alt={testimonial.avatar.alt}
                    width={42}
                    height={42}
                  />
                  <div>
                    <h5 className="!text-base !mb-[4px] !font-semibold !text-[#06201B] dark:!text-white">
                      {testimonial.name}
                    </h5>
                    <span className="block">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Testimonials;
