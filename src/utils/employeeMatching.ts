import { supabase } from "@/lib/supabase";

/**
 * Attempts to match an employee name with a team member in the database
 * @param employeeName The full name of the employee from the schedule
 * @returns Object with employee_id, first_name, and last_name
 */
export const matchEmployeeWithTeamMember = async (employeeName: string) => {
  if (!employeeName) {
    return {
      employee_id: "",
      first_name: "",
      last_name: "",
    };
  }

  // More intelligent name splitting - last word is last name, everything else is first name
  const nameParts = employeeName.trim().split(" ");
  let firstName = "";
  let lastName = "";

  if (nameParts.length === 1) {
    // Only one name provided
    firstName = nameParts[0];
  } else {
    // Last word is last name, everything else is first name(s)
    lastName = nameParts.pop() || "";
    firstName = nameParts.join(" ");
  }

  try {
    // Try to find a matching team member by first name
    const { data: teamMembers, error } = await supabase
      .from("organization_team_members")
      .select("id, first_name, last_name, punch_id")
      .ilike("first_name", `${firstName.split(" ")[0]}%`);

    if (error) throw error;

    if (teamMembers && teamMembers.length > 0) {
      // Find the best match - exact match first, then partial
      const exactMatch = teamMembers.find(
        (member) =>
          `${member.first_name} ${member.last_name}`.toLowerCase() ===
          employeeName.toLowerCase(),
      );

      if (exactMatch) {
        return {
          employee_id: exactMatch.punch_id || exactMatch.id,
          first_name: exactMatch.first_name,
          last_name: exactMatch.last_name,
        };
      }

      // Try last name match
      const lastNameMatch = teamMembers.find(
        (member) => member.last_name.toLowerCase() === lastName.toLowerCase(),
      );

      if (lastNameMatch) {
        return {
          employee_id: lastNameMatch.punch_id || lastNameMatch.id,
          first_name: lastNameMatch.first_name,
          last_name: lastNameMatch.last_name,
        };
      }

      // Return the first match as fallback
      return {
        employee_id: teamMembers[0].punch_id || teamMembers[0].id,
        first_name: teamMembers[0].first_name,
        last_name: teamMembers[0].last_name,
      };
    }
  } catch (error) {
    console.error("Error matching employee:", error);
  }

  // If no match or error, return the split name
  return {
    employee_id: "",
    first_name: firstName,
    last_name: lastName,
  };
};
