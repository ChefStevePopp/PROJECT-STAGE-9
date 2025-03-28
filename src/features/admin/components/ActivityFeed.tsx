import React, { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Clock,
  RefreshCw,
  X,
  FileText,
  Users,
  Package,
  Bell,
  AlertCircle,
  Settings,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { LoadingLogo } from "@/components/LoadingLogo";
import { motion } from "framer-motion";
// Define Activity type if not already defined in shared types
interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  user: string;
  dismissed?: boolean;
  details?: any; // Add details field to store additional information
  acknowledged_by?: string[]; // Array of user IDs who have acknowledged this activity
  isAcknowledged?: boolean; // Flag to indicate if current user has acknowledged
}

interface ActivityFeedProps {
  activities?: Activity[];
  daysFilter?: number;
  reviewCount?: number;
  defaultDaysLimit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities: initialActivities,
  daysFilter,
  reviewCount: initialReviewCount,
  defaultDaysLimit = 14,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [reviewCount, setReviewCount] = useState(initialReviewCount || 0);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [daysLimit, setDaysLimit] = useState(defaultDaysLimit);
  const { organization, user } = useAuth();

  // Map activity types to icons with enhanced styling
  const getActivityIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("recipe"))
      return <FileText className="w-10 h-10 text-blue-400" />;
    if (lowerType.includes("team") || lowerType.includes("user"))
      return <Users className="w-10 h-10 text-green-400" />;
    if (lowerType.includes("inventory"))
      return <Package className="w-10 h-10 text-yellow-400" />;
    if (lowerType.includes("notification"))
      return <Bell className="w-10 h-10 text-purple-400" />;
    if (lowerType.includes("alert") || lowerType.includes("warning"))
      return <AlertCircle className="w-10 h-10 text-rose-400" />;
    if (lowerType.includes("setting") || lowerType.includes("config"))
      return <Settings className="w-10 h-10 text-gray-400" />;
    if (lowerType.includes("schedule"))
      return <Calendar className="w-10 h-10 text-indigo-400" />;
    return <Bell className="w-10 h-10 text-purple-400" />; // Default icon
  };

  // Get background color based on activity type for fallback when no image is available
  const getActivityBgGradient = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("recipe")) return "from-blue-900 to-gray-900";
    if (lowerType.includes("team") || lowerType.includes("user"))
      return "from-green-900 to-gray-900";
    if (lowerType.includes("inventory")) return "from-yellow-900 to-gray-900";
    if (lowerType.includes("notification"))
      return "from-purple-900 to-gray-900";
    if (lowerType.includes("alert") || lowerType.includes("warning"))
      return "from-rose-900 to-gray-900";
    if (lowerType.includes("setting") || lowerType.includes("config"))
      return "from-gray-800 to-gray-900";
    if (lowerType.includes("schedule")) return "from-indigo-900 to-gray-900";
    return "from-gray-700 to-gray-900"; // Default gradient
  };

  // Handle dismissing an activity
  const dismissActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id ? { ...activity, dismissed: true } : activity,
      ),
    );
  };

  // Handle acknowledging an activity
  const acknowledgeActivity = async (id: string) => {
    if (!user?.id || !organization?.id) return;

    try {
      // Get current acknowledged_by array
      const { data: activityData } = await supabase
        .from("activity_logs")
        .select("acknowledged_by")
        .eq("id", id)
        .single();

      // Prepare the updated acknowledged_by array
      let acknowledgedBy = [];
      if (activityData?.acknowledged_by) {
        // Handle both array and JSON string formats
        if (typeof activityData.acknowledged_by === "string") {
          try {
            acknowledgedBy = JSON.parse(activityData.acknowledged_by);
          } catch (e) {
            acknowledgedBy = [];
          }
        } else if (Array.isArray(activityData.acknowledged_by)) {
          acknowledgedBy = [...activityData.acknowledged_by];
        } else if (typeof activityData.acknowledged_by === "object") {
          acknowledgedBy = Object.values(activityData.acknowledged_by);
        }
      }

      // Add current user if not already in the array
      if (!acknowledgedBy.includes(user.id)) {
        acknowledgedBy.push(user.id);
      }

      // Update the database
      const { error } = await supabase
        .from("activity_logs")
        .update({ acknowledged_by: acknowledgedBy })
        .eq("id", id);

      if (error) throw error;

      // Update local state - mark the activity as acknowledged instead of removing it
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === id
            ? {
                ...activity,
                acknowledged_by: acknowledgedBy,
                isAcknowledged: true,
              }
            : activity,
        ),
      );

      // Update review count
      setReviewCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error("Error acknowledging activity:", err);
    }
  };

  // Scroll the slider
  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("activity-slider");
    if (!container) return;

    const scrollAmount = 280; // Slightly wider than card width for better scrolling
    const newPosition =
      direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;

    container.scrollTo({ left: newPosition, behavior: "smooth" });
    setScrollPosition(newPosition);
  };

  // Function to fetch user avatar or recipe image
  const fetchActivityImage = useCallback(
    async (activity: Activity) => {
      if (!organization?.id) return null;

      try {
        // Check if activity is related to a recipe
        if (activity.type.toLowerCase().includes("recipe")) {
          // Extract recipe ID if available in details
          const recipeId = activity.details?.recipe_id;
          if (recipeId) {
            const { data: recipeData } = await supabase
              .from("recipes")
              .select("media")
              .eq("id", recipeId)
              .eq("organization_id", organization.id)
              .single();

            // Use media field for recipes
            if (recipeData?.media) {
              // Handle media as an array of objects with url property
              if (Array.isArray(recipeData.media)) {
                // Find primary image first
                const primaryImage = recipeData.media.find(
                  (item) => item.is_primary === true,
                );
                if (primaryImage?.url) {
                  return primaryImage.url;
                }
                // If no primary image, use the first one with a url
                const firstWithUrl = recipeData.media.find((item) => item.url);
                if (firstWithUrl?.url) {
                  return firstWithUrl.url;
                }
              }
              // If media is a single object with a url property
              else if (
                typeof recipeData.media === "object" &&
                recipeData.media.url
              ) {
                return recipeData.media.url;
              }
              // Fallback to image_url if present
              else if (
                typeof recipeData.media === "object" &&
                recipeData.media.image_url
              ) {
                return recipeData.media.image_url;
              }
              // If media is a string URL, return that
              else if (typeof recipeData.media === "string") {
                return recipeData.media;
              }
            }
          }
        }

        // Check if activity is related to a team member
        if (
          activity.type.toLowerCase().includes("team") ||
          activity.type.toLowerCase().includes("user")
        ) {
          // First, try to extract team member info from the activity details
          if (activity.details) {
            // Check for team member ID in the details
            const teamMemberId = activity.details.team_member_id;
            if (teamMemberId) {
              const { data: teamMemberData } = await supabase
                .from("organization_team_members")
                .select("avatar_url")
                .eq("id", teamMemberId)
                .eq("organization_id", organization.id)
                .single();

              if (teamMemberData?.avatar_url) {
                return teamMemberData.avatar_url;
              }
            }

            // Check for team member data in the details
            if (
              activity.details.team_member &&
              activity.details.team_member.avatar_url
            ) {
              return activity.details.team_member.avatar_url;
            }

            // Check for changes that include first_name and last_name
            if (activity.details.changes) {
              const changes = activity.details.changes;
              if (changes.first_name && changes.last_name) {
                const { data: teamMemberData } = await supabase
                  .from("organization_team_members")
                  .select("avatar_url")
                  .ilike("first_name", `%${changes.first_name}%`)
                  .ilike("last_name", `%${changes.last_name}%`)
                  .eq("organization_id", organization.id)
                  .limit(1);

                if (
                  teamMemberData &&
                  teamMemberData.length > 0 &&
                  teamMemberData[0].avatar_url
                ) {
                  return teamMemberData[0].avatar_url;
                }
              }

              // If there's an email in the changes, try to find by email
              if (changes.email) {
                const { data: teamMemberData } = await supabase
                  .from("organization_team_members")
                  .select("avatar_url")
                  .ilike("email", `%${changes.email}%`)
                  .eq("organization_id", organization.id)
                  .limit(1);

                if (
                  teamMemberData &&
                  teamMemberData.length > 0 &&
                  teamMemberData[0].avatar_url
                ) {
                  return teamMemberData[0].avatar_url;
                }
              }
            }
          }

          // Try to find team member by activity.user (name or email)
          if (activity.user) {
            // Split the user name to get first and last name
            const nameParts = activity.user.split(" ");
            if (nameParts.length > 1) {
              const firstName = nameParts[0];
              const lastName = nameParts.slice(1).join(" ");

              const { data: teamMemberData } = await supabase
                .from("organization_team_members")
                .select("avatar_url")
                .or(
                  `first_name.ilike.%${firstName}%,last_name.ilike.%${lastName}%,email.ilike.%${activity.user}%`,
                )
                .eq("organization_id", organization.id)
                .limit(1);

              if (
                teamMemberData &&
                teamMemberData.length > 0 &&
                teamMemberData[0].avatar_url
              ) {
                return teamMemberData[0].avatar_url;
              }
            } else {
              // If it's just one word, try to match against email or first/last name
              const { data: teamMemberData } = await supabase
                .from("organization_team_members")
                .select("avatar_url")
                .or(
                  `first_name.ilike.%${activity.user}%,last_name.ilike.%${activity.user}%,email.ilike.%${activity.user}%`,
                )
                .eq("organization_id", organization.id)
                .limit(1);

              if (
                teamMemberData &&
                teamMemberData.length > 0 &&
                teamMemberData[0].avatar_url
              ) {
                return teamMemberData[0].avatar_url;
              }
            }
          }
        }

        return null;
      } catch (err) {
        console.error("Error fetching activity image:", err);
        return null;
      }
    },
    [organization?.id],
  );

  // Fetch real activity data from the database and count items requiring review
  const fetchActivities = useCallback(async () => {
    console.log("Fetching activities for organization:", organization?.id);
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Calculate date for filtering by days limit
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysLimit);

      // Get oldest activity logs first for approval
      let query = supabase
        .from("activity_logs")
        .select("*")
        .eq("organization_id", organization.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Only fetch activities that haven't been acknowledged by the current user
      // if showAcknowledged is false
      if (!showAcknowledged && user?.id) {
        // This is a simplified filter - the actual filtering will be done client-side
        // since Supabase doesn't support complex array operations in RLS
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Fetch team members to map emails to names
      const { data: teamMembers, error: teamMembersError } = await supabase
        .from("organization_team_members")
        .select("id, email, first_name, last_name")
        .eq("organization_id", organization.id);

      if (teamMembersError) {
        console.error("Error fetching team members:", teamMembersError);
      }

      // Create a map of email to name for quick lookup
      const emailToNameMap = {};
      if (teamMembers) {
        teamMembers.forEach((member) => {
          if (member.email && member.first_name && member.last_name) {
            emailToNameMap[member.email.toLowerCase()] =
              `${member.first_name} ${member.last_name}`;
          }
        });
      }

      // Transform the data to match the Activity type
      const formattedActivities = (data || []).map((log) => {
        const activityType = formatActivityType(log.activity_type);
        const details = formatActivityDetails(log.details);

        // Log the data for debugging
        console.log("Processing activity log:", {
          id: log.id,
          activity_type: log.activity_type,
          details: log.details,
          user_id: log.user_id,
          user_name: log.user_name,
          created_at: log.created_at,
          organization_id: log.organization_id,
        });

        // Extract user name from details if available
        let userName = "System";

        // Log all user-related fields for debugging
        console.log("User-related fields:", {
          user_id: log.user_id,
          user_name: log.user_name,
          details_user_name: log.details?.user_name,
          details_changes: log.details?.changes,
          details_team_member: log.details?.team_member,
        });

        // Hard-coded check for Steve Dev Popp
        if (
          log.user_id === "859585ee-05a4-4660-806b-174d6f1cbe45" ||
          (log.user_id &&
            log.user_id.toLowerCase() === "office@memphisfirebbq.com")
        ) {
          userName = "Steve Dev Popp";
        }
        // First priority: Check if user_name exists directly in the log
        else if (log.user_name) {
          userName = log.user_name;
        }
        // Second priority: Look up in team members by email
        else if (
          log.user_id &&
          typeof log.user_id === "string" &&
          log.user_id.includes("@")
        ) {
          const email = log.user_id.toLowerCase();
          if (emailToNameMap[email]) {
            userName = emailToNameMap[email];
          }
        }
        // Third priority: Check details object for user information
        else if (typeof log.details === "object") {
          if (log.details?.user_name) {
            userName = log.details.user_name;
          } else if (
            log.details?.changes?.first_name &&
            log.details?.changes?.last_name
          ) {
            userName = `${log.details.changes.first_name} ${log.details.changes.last_name}`;
          } else if (
            log.details?.team_member?.first_name &&
            log.details?.team_member?.last_name
          ) {
            userName = `${log.details.team_member.first_name} ${log.details.team_member.last_name}`;
          } else if (log.details?.changes?.email) {
            const email = log.details.changes.email.toLowerCase();
            if (emailToNameMap[email]) {
              userName = emailToNameMap[email];
            }
          } else if (log.details?.team_member?.email) {
            const email = log.details.team_member.email.toLowerCase();
            if (emailToNameMap[email]) {
              userName = emailToNameMap[email];
            }
          }
        }
        // Last resort: Try to extract name from user_id if it's an email
        else if (log.user_id && typeof log.user_id === "string") {
          if (log.user_id.includes("@")) {
            const emailParts = log.user_id.split("@")[0].split(".");
            if (emailParts.length > 1) {
              userName = emailParts
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
            } else {
              userName =
                emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
            }
          } else {
            userName = log.user_id;
          }
        }

        // Check if current user has acknowledged this activity
        const acknowledgedBy = log.acknowledged_by
          ? Array.isArray(log.acknowledged_by)
            ? log.acknowledged_by
            : []
          : [];

        const isAcknowledged = user?.id
          ? acknowledgedBy.includes(user.id)
          : false;

        return {
          id: log.id,
          type: activityType,
          message: details ? `${activityType}: ${details}` : activityType,
          timestamp: log.created_at,
          user: userName,
          details: log.details, // Store the original details for image fetching
          acknowledged_by: acknowledgedBy,
          isAcknowledged,
        };
      });

      // Count activities that require review (e.g., not acknowledged)
      const itemsRequiringReview = formattedActivities.filter(
        (activity) => !activity.isAcknowledged,
      ).length;

      setReviewCount(itemsRequiringReview);
      setActivities(formattedActivities);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    } finally {
      setLoading(false);
    }
  }, [organization?.id, daysLimit, showAcknowledged, user?.id]);

  // Fetch activities on component mount and when dependencies change
  useEffect(() => {
    console.log("ActivityFeed useEffect triggered", {
      organizationId: organization?.id,
    });
    // Always fetch activities, even if initialActivities is provided
    fetchActivities();
  }, [fetchActivities, organization?.id, daysLimit, showAcknowledged]);

  // State to store activity images
  const [activityImages, setActivityImages] = useState<
    Record<string, string | null>
  >({});

  // Fetch images for activities when they change
  useEffect(() => {
    const fetchImages = async () => {
      const imagePromises = activities.map(async (activity) => {
        const imageUrl = await fetchActivityImage(activity);
        return { id: activity.id, imageUrl };
      });

      const results = await Promise.all(imagePromises);
      const imagesMap = results.reduce(
        (acc, { id, imageUrl }) => {
          acc[id] = imageUrl;
          return acc;
        },
        {} as Record<string, string | null>,
      );

      setActivityImages(imagesMap);
    };

    if (activities.length > 0 && organization?.id) {
      fetchImages();
    }
  }, [activities, fetchActivityImage, organization?.id]);

  // Format activity type to be more readable
  const formatActivityType = (type: string) => {
    if (!type) return "";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format the activity details into a readable string
  const formatActivityDetails = (details: any) => {
    if (!details) return "";

    console.log("Formatting activity details:", details);

    // Parse details if it's a string
    let parsedDetails = details;
    if (typeof details === "string") {
      try {
        parsedDetails = JSON.parse(details);
      } catch (e) {
        // If it's not valid JSON, just use the string
        return details;
      }
    }

    // Now handle the object (either original or parsed)
    if (parsedDetails.recipe_name) {
      return parsedDetails.recipe_name;
    } else if (parsedDetails.update_type) {
      return `Changes: ${parsedDetails.update_type}`;
    } else if (parsedDetails.ingredient_name) {
      return parsedDetails.ingredient_name;
    } else if (parsedDetails.team_member_name) {
      return parsedDetails.team_member_name;
    } else if (parsedDetails.message) {
      return parsedDetails.message;
    } else if (parsedDetails.changes && parsedDetails.team_member_id) {
      // Extract team member name from changes if available
      if (parsedDetails.changes.first_name && parsedDetails.changes.last_name) {
        return `${parsedDetails.changes.first_name} ${parsedDetails.changes.last_name}`;
      } else if (parsedDetails.team_member_name) {
        return parsedDetails.team_member_name;
      } else if (parsedDetails.name) {
        return parsedDetails.name;
      } else if (parsedDetails.changes.name) {
        return parsedDetails.changes.name;
      } else if (parsedDetails.changes.email) {
        // Try to format email into a name
        const email = parsedDetails.changes.email;
        if (email.includes("@")) {
          const emailParts = email.split("@")[0].split(".");
          if (emailParts.length > 1) {
            return emailParts
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" ");
          } else {
            return (
              emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1)
            );
          }
        }
        return email;
      } else {
        return "Team Member Updated";
      }
    } else if (parsedDetails.team_member && parsedDetails.team_member_id) {
      // Extract team member name for team member additions
      if (
        parsedDetails.team_member.first_name &&
        parsedDetails.team_member.last_name
      ) {
        return `${parsedDetails.team_member.first_name} ${parsedDetails.team_member.last_name}`;
      } else if (parsedDetails.team_member_name) {
        return parsedDetails.team_member_name;
      } else if (parsedDetails.team_member.name) {
        return parsedDetails.team_member.name;
      } else if (parsedDetails.team_member.email) {
        // Try to format email into a name
        const email = parsedDetails.team_member.email;
        if (email.includes("@")) {
          const emailParts = email.split("@")[0].split(".");
          if (emailParts.length > 1) {
            return emailParts
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" ");
          } else {
            return (
              emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1)
            );
          }
        }
        return email;
      } else {
        return "Team Member Added";
      }
    } else if (
      typeof parsedDetails === "object" &&
      Object.keys(parsedDetails).length > 0
    ) {
      // Try to extract any useful information from the details object
      const firstValue = Object.values(parsedDetails)[0];
      if (typeof firstValue === "string") return firstValue;
    }

    return typeof details === "string" ? details : JSON.stringify(details);
  };

  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Recent Activity
        </h2>
        <div className="flex items-center justify-center h-40">
          <LoadingLogo message="Loading activity..." />
        </div>
      </div>
    );
  }

  if (!organization?.id && !initialActivities) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">Please select an organization</p>
        </div>
      </div>
    );
  }

  // Filter activities based on dismissed status and acknowledgment
  const visibleActivities = activities.filter((activity) => {
    // Always filter out dismissed activities
    if (activity.dismissed) return false;

    // If showAcknowledged is true, show all non-dismissed activities
    if (showAcknowledged) return true;

    // Otherwise, only show activities that haven't been acknowledged by the current user
    return !activity.isAcknowledged;
  });

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          {reviewCount > 0 && (
            <div className="flex items-center">
              <div className="bg-amber-500 text-black text-xs font-medium px-2 py-0.5 rounded-full">
                {reviewCount} {reviewCount === 1 ? "item" : "items"} need review
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!initialActivities && (
            <button
              onClick={fetchActivities}
              className="flex items-center gap-2 px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm"
              aria-label="Refresh activity logs"
              title="Refresh activity logs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          )}
          {visibleActivities.length > 0 && (
            <div className="flex gap-1">
              <button
                onClick={() => scroll("left")}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                aria-label="Scroll left"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                aria-label="Scroll right"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {visibleActivities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">No activity logs found</p>
        </div>
      ) : (
        <div
          id="activity-slider"
          className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar px-2 py-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x mandatory",
            scrollPadding: "0 16px",
          }}
          onScroll={(e) =>
            setScrollPosition((e.target as HTMLDivElement).scrollLeft)
          }
        >
          {visibleActivities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card flex-shrink-0 w-[260px] h-[320px] p-0 bg-gray-800/50 rounded-lg relative overflow-hidden shadow-xl border border-gray-700/50 scroll-snap-align-start"
            >
              {/* Card structure with 1/3 picture and 2/3 text */}
              <div className="flex flex-col h-full">
                {/* Top 1/3 - Media Section */}
                <div className="h-1/3 relative overflow-hidden">
                  {activityImages[activity.id] ? (
                    <img
                      src={activityImages[activity.id]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${getActivityBgGradient(activity.type)}`}
                    >
                      <div className="flex items-center justify-center h-full">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                  )}

                  {/* Activity type badge - positioned at the bottom of the media section */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-primary-500/70 text-white text-xs font-medium py-0.5 px-2 rounded-full text-center backdrop-blur-sm border border-primary-500/20 shadow-sm z-10">
                    {activity.type}
                  </div>
                </div>

                {/* Bottom 2/3 - Content Section */}
                <div className="h-2/3 bg-slate-800/60 p-4 relative">
                  <button
                    onClick={() => dismissActivity(activity.id)}
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors z-10"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* User name and timestamp */}
                  <div className="mb-2 text-center">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {activity.user}
                    </h3>
                    <p className="text-xs text-gray-300 bg-black/30 rounded-full px-2 py-0.5 inline-block mt-0.5">
                      {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                    </p>
                  </div>

                  {/* Activity message */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[120px] text-center">
                    <p className="text-xs text-white font-medium bg-black/20 backdrop-blur-sm p-2 rounded-lg border border-gray-700/50">
                      {activity.message}
                    </p>

                    {/* Acknowledgment section */}
                    <div className="mt-2 flex flex-col items-center">
                      {activity.acknowledged_by &&
                      activity.acknowledged_by.length > 0 ? (
                        <div className="text-2xs text-gray-400 mb-0.5">
                          Acknowledged by {activity.acknowledged_by.length}{" "}
                          {activity.acknowledged_by.length === 1
                            ? "person"
                            : "people"}
                        </div>
                      ) : null}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          acknowledgeActivity(activity.id);
                        }}
                        disabled={activity.isAcknowledged}
                        className={`text-2xs px-2 py-0.5 rounded-full mt-0.5 ${
                          activity.isAcknowledged
                            ? "bg-green-900/30 text-green-300 cursor-default"
                            : "bg-primary-500/50 text-white hover:bg-primary-500 cursor-pointer"
                        }`}
                      >
                        {activity.isAcknowledged
                          ? "Acknowledged"
                          : "Acknowledge"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Show Acknowledged checkbox - moved outside conditional rendering */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-2 px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showAcknowledged}
              onChange={(e) => setShowAcknowledged(e.target.checked)}
              className="mr-2 h-3 w-3"
            />
            <span className="text-xs">Show Acknowledged</span>
          </label>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @layer utilities {
          .text-2xs {
            font-size: 0.65rem;
            line-height: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ActivityFeed;
