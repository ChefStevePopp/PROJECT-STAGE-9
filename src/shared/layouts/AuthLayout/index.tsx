import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/config/routes";

export const AuthLayout: React.FC = () => {
  const { user } = useAuth();

  // Adobe Fonts (Typekit) stylesheet
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://use.typekit.net/lij2klc.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Array of background images with photographer credits
  const backgroundImages = [
    {
      url: "https://www.restaurantconsultants.ca/wp-content/uploads/2025/04/SMOKED_SALMON_LOGIN-1.webp",
      photographer: "Chef Steven Popp",
      description: "Inspired by Sunday Brunch",
    },
    {
      url: "https://www.restaurantconsultants.ca/wp-content/uploads/2025/04/PASTRIES_DESSERTS_LOGIN.webp",
      photographer: "Chef Steven Popp",
      description: "Inspired by my first Patissie class",
    },
    {
      url: "https://www.restaurantconsultants.ca/wp-content/uploads/2025/04/BLACK_BERRY_TART_LOGIN.webp",
      photographer: "Chef Steven Popp",
      description: "Inspired by blackberries",
    },
    // More images can be added here
  ];

  // Fallback image
  const fallbackImage = {
    url: "https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png",
    photographer: "ChefLife Team",
    description: "ChefLife Logo",
  };

  // State for current image index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track if the image loaded successfully
  const [imageLoaded, setImageLoaded] = useState(false);

  // State for showing/hiding photo info
  const [showPhotoInfo, setShowPhotoInfo] = useState(false);

  // Current background image data
  const currentImageData = backgroundImages[currentIndex] || fallbackImage;

  // Preload the image to check if it's valid
  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      console.log("Background image loaded successfully");
      setImageLoaded(true);
    };

    img.onerror = () => {
      console.error("Background image failed to load:", currentImageData.url);
      // Try next image if current fails
      handleNext();
    };

    img.src = currentImageData.url;
  }, [currentIndex]);

  // Previous image
  const handlePrevious = () => {
    setImageLoaded(false);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? backgroundImages.length - 1 : prevIndex - 1,
    );
  };

  // Next image
  const handleNext = () => {
    setImageLoaded(false);
    setCurrentIndex((prevIndex) =>
      prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1,
    );
  };

  // Toggle photo info
  const togglePhotoInfo = () => {
    setShowPhotoInfo((prev) => !prev);
  };

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center md:justify-end p-4 relative overflow-hidden"
      style={{
        backgroundImage: imageLoaded
          ? `url(${currentImageData.url})`
          : "linear-gradient(to bottom right, #1e293b, #0f172a, #020617)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 0.5s ease",
      }}
    >
      {/* Subtle overall darkening overlay */}
      {imageLoaded && (
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      )}

      {/* Logo with wordmark - positioned differently on mobile vs desktop */}
      <div className="absolute top-[20%] md:top-6 left-0 right-0 md:left-6 md:right-auto z-20">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center mb-3">
            <div className="mr-3">
              <img
                src="https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png"
                alt="ChefBot"
                className="w-12 h-12 md:w-10 md:h-10"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-3xl font-bold flex items-baseline">
                <span
                  style={{
                    fontFamily: "rockwell, serif",
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  CHEF
                </span>
                <span
                  style={{
                    fontFamily: "satisfy, cursive",
                    fontWeight: 400,
                    marginLeft: "2px",
                    color: "#3b82f6",
                  }}
                >
                  Life
                </span>
              </h1>
              <p className="text-sm md:text-xs text-gray-300">
                Behind Every Great Restaurant
              </p>
            </div>
          </div>

          {/* Gallery Navigation Controls - only visible on medium screens and up */}
          <div className="hidden md:flex items-center space-x-3 ml-1">
            <button
              onClick={handlePrevious}
              className="bg-black bg-opacity-30 backdrop-blur-sm p-2 rounded-full text-white hover:bg-opacity-50 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="bg-black bg-opacity-30 backdrop-blur-sm p-2 rounded-full text-white hover:bg-opacity-50 transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={togglePhotoInfo}
              className={`${showPhotoInfo ? "bg-opacity-50" : "bg-opacity-30"} bg-black backdrop-blur-sm p-2 rounded-full text-white hover:bg-opacity-50 transition-all`}
              aria-label="Photo information"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Photo Information Overlay - only visible on medium screens and up */}
      {showPhotoInfo && (
        <div className="hidden md:block absolute left-6 top-36 z-20 bg-black bg-opacity-75 backdrop-blur-sm rounded-lg p-4 max-w-xs border border-gray-800/30">
          <h3 className="text-white font-medium text-sm">
            {currentImageData.description}
          </h3>
          <p className="text-gray-300 text-xs mt-1">
            Photo by: {currentImageData.photographer}
          </p>
        </div>
      )}

      {/* Content - centered on mobile, right-aligned on larger screens */}
      <div className="w-full max-w-md md:pr-6 lg:pr-12 xl:pr-24 relative z-10">
        <div className="bg-gray-900 bg-opacity-40 backdrop-blur-sm rounded-xl shadow-xl border border-gray-800/30 aspect-square flex flex-col justify-center">
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
