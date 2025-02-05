import React from "react";
import {
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import type { Recipe } from "../../../types/recipe";

interface TrainingProps {
  recipe: Recipe;
}

export const Training: React.FC<TrainingProps> = ({ recipe }) => {
  const training = recipe.training || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">
            Training Requirements
          </h2>
          <p className="text-sm text-gray-400">
            Training and certification requirements
          </p>
        </div>
      </div>

      {/* Required Skill Level */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
          Required Skill Level
        </h3>
        <div className="text-lg font-medium text-white capitalize">
          {training.requiredSkillLevel || "Not specified"}
        </div>
      </div>

      {/* Required Certifications */}
      {training.certificationRequired?.length > 0 && (
        <div className="bg-amber-500/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-amber-400 mb-4">
            Required Certifications
          </h3>
          <div className="space-y-2">
            {training.certificationRequired.map((cert, index) => (
              <div key={index} className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Techniques */}
      {training.keyTechniques?.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Key Techniques
          </h3>
          <div className="space-y-2">
            {training.keyTechniques.map((technique, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                <span className="text-gray-300">{technique}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Errors */}
      {training.commonErrors?.length > 0 && (
        <div className="bg-rose-500/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-rose-400 mb-4">
            Common Errors to Avoid
          </h3>
          <div className="space-y-2">
            {training.commonErrors.map((error, index) => (
              <div key={index} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 mt-1" />
                <span className="text-gray-300">{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training Notes */}
      {training.notes && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Training Notes
          </h3>
          <p className="text-gray-400">{training.notes}</p>
        </div>
      )}
    </div>
  );
};
