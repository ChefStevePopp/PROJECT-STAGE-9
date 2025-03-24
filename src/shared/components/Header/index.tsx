import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserMenu } from "../UserMenu";
import { ROUTES } from "@/config/routes";
import { Clock, Bell } from "lucide-react";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount, setNotificationCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Simulate receiving notifications
  useEffect(() => {
    // First notification after 1 minute
    const firstTimer = setTimeout(() => {
      setNotificationCount((prev) => prev + 1);
      triggerAnimation();
    }, 60000);

    // Subsequent notifications every 10 minutes
    const recurringTimer = setInterval(() => {
      setNotificationCount((prev) => prev + 1);
      triggerAnimation();
    }, 600000); // 10 minutes

    return () => {
      clearTimeout(firstTimer);
      clearInterval(recurringTimer);
    };
  }, []);

  // Function to trigger the animation
  const triggerAnimation = () => {
    if (videoRef.current) {
      // Reset the video to the beginning
      videoRef.current.currentTime = 0;
      // Play the video
      videoRef.current.play();
      setIsAnimating(true);

      let loopCount = 0;
      const maxLoops = 3;

      // Add event listener for the 'ended' event
      const handleVideoEnd = () => {
        loopCount++;

        if (loopCount < maxLoops) {
          // Reset and play again if we haven't reached max loops
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
          }
        } else {
          // After the animation completes all loops, set back to static
          setIsAnimating(false);
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; // First frame
            videoRef.current.removeEventListener("ended", handleVideoEnd);
          }
        }
      };

      // Add the event listener
      videoRef.current.addEventListener("ended", handleVideoEnd);
    }
  };

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate(ROUTES.KITCHEN.DASHBOARD)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png"
                alt="KITCHEN AI"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg font-semibold text-white">
                KITCHEN AI
              </span>
            </button>
          </div>

          {/* Date and Time */}
          <div className="hidden md:flex items-center gap-2 bg-gray-800/30 px-4 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-primary-400" />
            <div className="text-gray-300 text-sm">
              <span className="font-medium">{formattedDate}</span>
              <span className="mx-2 text-gray-500">•</span>
              <span className="text-primary-400">{formattedTime}</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center overflow-hidden">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-14 h-14 cursor-pointer object-cover scale-125"
                  src="https://www.restaurantconsultants.ca/wp-content/uploads/2025/03/Animation-1742423609525.webm"
                  muted
                  playsInline
                  loop={false}
                  autoPlay={false}
                />
                {notificationCount > 0 && !isAnimating && (
                  <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center right-0.5 bottom-0 top-8">
                    {notificationCount}
                  </div>
                )}
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
