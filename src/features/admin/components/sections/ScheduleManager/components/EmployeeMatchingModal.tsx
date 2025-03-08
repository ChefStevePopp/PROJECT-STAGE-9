import React, { useState, useEffect } from "react";
import { Check, AlertTriangle, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  email?: string;
  punch_id?: string;
  avatar_url?: string;
}

interface ScheduleEmployee {
  employee_name: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  matched?: boolean;
  matchedTeamMember?: TeamMember;
}

interface EmployeeMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleEmployees: ScheduleEmployee[];
  onConfirmMatches: (matches: { [key: string]: TeamMember }) => void;
}

export const EmployeeMatchingModal: React.FC<EmployeeMatchingModalProps> = ({
  isOpen,
  onClose,
  scheduleEmployees,
  onConfirmMatches,
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [matches, setMatches] = useState<{ [key: string]: TeamMember }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<
    ScheduleEmployee[]
  >([]);

  // Fetch team members when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  // Filter employees based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = scheduleEmployees.filter((emp) =>
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(scheduleEmployees);
    }
  }, [searchTerm, scheduleEmployees]);

  // Fetch team members from the database
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("organization_team_members")
        .select(
          "id, first_name, last_name, display_name, email, punch_id, avatar_url",
        );

      if (error) throw error;

      setTeamMembers(data || []);

      // Try to auto-match employees
      const autoMatches = findAutoMatches(scheduleEmployees, data || []);
      setMatches(autoMatches);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  // Find automatic matches based on name similarity
  const findAutoMatches = (
    employees: ScheduleEmployee[],
    team: TeamMember[],
  ) => {
    const newMatches: { [key: string]: TeamMember } = {};

    employees.forEach((employee) => {
      // Try exact match first
      let match = team.find(
        (member) =>
          `${member.first_name} ${member.last_name}`.toLowerCase() ===
          employee.employee_name.toLowerCase(),
      );

      // If no exact match, try first name + last initial
      if (!match && employee.first_name && employee.last_name) {
        match = team.find(
          (member) =>
            member.first_name.toLowerCase() ===
              employee.first_name?.toLowerCase() &&
            member.last_name.charAt(0).toLowerCase() ===
              employee.last_name?.charAt(0).toLowerCase(),
        );
      }

      // If still no match, try just first name if it's distinctive
      if (!match && employee.first_name) {
        const firstNameMatches = team.filter(
          (member) =>
            member.first_name.toLowerCase() ===
            employee.first_name?.toLowerCase(),
        );

        if (firstNameMatches.length === 1) {
          match = firstNameMatches[0];
        }
      }

      if (match) {
        newMatches[employee.employee_name] = match;
      }
    });

    return newMatches;
  };

  // Handle selecting a team member for an employee
  const handleSelectTeamMember = (
    employeeName: string,
    teamMember: TeamMember,
  ) => {
    setMatches((prev) => ({
      ...prev,
      [employeeName]: teamMember,
    }));
  };

  // Handle confirming all matches
  const handleConfirmMatches = () => {
    onConfirmMatches(matches);
    onClose();
  };

  // Calculate match percentage
  const matchPercentage = Math.round(
    (Object.keys(matches).length / scheduleEmployees.length) * 100,
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg w-full max-w-5xl my-8 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-white">
              Match Schedule Employees
            </h3>
            <p className="text-sm text-gray-400">
              Match employees from your schedule with team members in your
              organization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-800 rounded-full h-8 w-8 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {matchPercentage}%
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-800 bg-gray-800/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg w-full text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    No employees found matching your search
                  </p>
                </div>
              ) : (
                filteredEmployees.map((employee) => {
                  const isMatched = !!matches[employee.employee_name];
                  const matchedMember = matches[employee.employee_name];

                  return (
                    <div
                      key={employee.employee_name}
                      className={`bg-gray-800/50 rounded-lg p-4 ${isMatched ? "border border-green-500/30" : "border border-gray-700"}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-700 rounded-full h-10 w-10 flex items-center justify-center text-white font-medium">
                            {employee.first_name?.[0] ||
                              employee.employee_name[0]}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">
                              {employee.employee_name}
                            </h4>
                            {employee.role && (
                              <span className="text-xs text-gray-400">
                                {employee.role}
                              </span>
                            )}
                          </div>
                        </div>
                        {isMatched && (
                          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs">
                            <Check className="w-3 h-3" />
                            Matched
                          </div>
                        )}
                      </div>

                      {isMatched ? (
                        <div className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {matchedMember.avatar_url ? (
                                <img
                                  src={matchedMember.avatar_url}
                                  alt={matchedMember.first_name}
                                  className="h-10 w-10 rounded-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedMember.first_name}${matchedMember.last_name}`;
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-medium">
                                  {matchedMember.first_name[0]}
                                  {matchedMember.last_name[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {matchedMember.display_name ||
                                  `${matchedMember.first_name} ${matchedMember.last_name}`}
                              </div>
                              {matchedMember.punch_id && (
                                <div className="text-xs text-gray-400">
                                  Punch ID: {matchedMember.punch_id}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setMatches((prev) => {
                                const newMatches = { ...prev };
                                delete newMatches[employee.employee_name];
                                return newMatches;
                              });
                            }}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-400 mb-2">
                            Select a team member to match with this employee:
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                            {teamMembers.map((member) => (
                              <button
                                key={member.id}
                                onClick={() =>
                                  handleSelectTeamMember(
                                    employee.employee_name,
                                    member,
                                  )
                                }
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 text-left"
                              >
                                <div className="relative">
                                  {member.avatar_url ? (
                                    <img
                                      src={member.avatar_url}
                                      alt={member.first_name}
                                      className="h-8 w-8 rounded-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.first_name}${member.last_name}`;
                                      }}
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-xs">
                                      {member.first_name[0]}
                                      {member.last_name[0]}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm text-white">
                                    {member.display_name ||
                                      `${member.first_name} ${member.last_name}`}
                                  </div>
                                  {member.punch_id && (
                                    <div className="text-xs text-gray-400">
                                      Punch ID: {member.punch_id}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-800 flex justify-between items-center">
          <div>
            {matchPercentage < 100 && (
              <>
                <div className="flex items-center text-amber-400 gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">
                    {scheduleEmployees.length - Object.keys(matches).length}{" "}
                    employees are not matched
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Consider adding unmatched employees to your team database
                  after uploading.
                </p>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleConfirmMatches}
              className="btn-primary"
              disabled={Object.keys(matches).length === 0}
            >
              Confirm Matches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
