import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useUserNameMapping = () => {
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);

      try {
        // First fetch organizations (for corporate entities)
        const { data: orgs } = await supabase
          .from("organizations")
          .select("id, name, owner_id");

        // Then fetch team members
        const { data: teamMembers } = await supabase
          .from("organization_team_members")
          .select("id, first_name, last_name, kitchen_role");

        const mapping: Record<string, string> = {};

        // Add organizations to mapping
        orgs?.forEach((org) => {
          mapping[org.id] = org.name; // Organization ID maps to org name
          if (org.owner_id) {
            mapping[org.owner_id] = `${org.name} (Owner)`; // Owner ID maps to org name + Owner
          }
        });

        // Add team members to mapping
        teamMembers?.forEach((member) => {
          const fullName = `${member.first_name} ${member.last_name}`;
          const displayName = member.kitchen_role
            ? `${fullName} (${member.kitchen_role})`
            : fullName;
          mapping[member.id] = displayName;
        });

        setUserMap(mapping);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Function to get user name from ID
  const getUserName = (userId: string | undefined | null): string => {
    if (!userId) return "Unknown";
    return userMap[userId] || `User ${userId.substring(0, 8)}...`;
  };

  return { getUserName, isLoading };
};
