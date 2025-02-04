"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    title: "Analyzing Your Statements",
    description:
      "Our AI is processing your bank statements to extract valuable insights.",
  },
  {
    title: "Identifying Patterns",
    description:
      "We're looking for spending patterns and trends in your financial data.",
  },
  {
    title: "Generating Recommendations",
    description:
      "Based on your data, we're creating personalized financial recommendations.",
  },
];

const Slideshow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-4">
            {slides[currentSlide].title}
          </h2>
          <p className="text-lg">{slides[currentSlide].description}</p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-8 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? "bg-casca-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
