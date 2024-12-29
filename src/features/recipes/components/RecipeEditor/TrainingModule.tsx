import React from 'react';
import { 
  GraduationCap, 
  AlertTriangle, 
  Award, 
  CheckCircle2, 
  TrendingUp,
  Plus,
  Trash2,
  FileText,
  BookOpen,
  ShieldAlert
} from 'lucide-react';
import type { Recipe, RecipeTraining } from '../../types/recipe';

interface TrainingModuleProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const TrainingModule: React.FC<TrainingModuleProps> = ({ recipe, onChange }) => {
  const updateTraining = (updates: Partial<RecipeTraining>) => {
    onChange({
      training: { ...recipe.training, ...updates }
    });
  };

  const addCertification = () => {
    updateTraining({
      certificationRequired: [...(recipe.training.certificationRequired || []), '']
    });
  };

  const removeCertification = (index: number) => {
    const certs = recipe.training.certificationRequired?.filter((_, i) => i !== index);
    updateTraining({ certificationRequired: certs });
  };

  const addCommonError = () => {
    updateTraining({
      commonErrors: [...(recipe.training.commonErrors || []), '']
    });
  };

  const removeCommonError = (index: number) => {
    const errors = recipe.training.commonErrors?.filter((_, i) => i !== index);
    updateTraining({ commonErrors: errors });
  };

  const addKeyTechnique = () => {
    updateTraining({
      keyTechniques: [...(recipe.training.keyTechniques || []), '']
    });
  };

  const removeKeyTechnique = (index: number) => {
    const techniques = recipe.training.keyTechniques?.filter((_, i) => i !== index);
    updateTraining({ keyTechniques: techniques });
  };

  const addSafetyProtocol = () => {
    updateTraining({
      safetyProtocols: [...(recipe.training.safetyProtocols || []), '']
    });
  };

  const removeSafetyProtocol = (index: number) => {
    const protocols = recipe.training.safetyProtocols?.filter((_, i) => i !== index);
    updateTraining({ safetyProtocols: protocols });
  };

  const addQualityStandard = () => {
    updateTraining({
      qualityStandards: [...(recipe.training.qualityStandards || []), '']
    });
  };

  const removeQualityStandard = (index: number) => {
    const standards = recipe.training.qualityStandards?.filter((_, i) => i !== index);
    updateTraining({ qualityStandards: standards });
  };

  return (
    <div className="space-y-6">
      {/* Skill Level Requirements */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary-400" />
          Skill Level Requirements
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Required Skill Level
            </label>
            <select
              value={recipe.training.requiredSkillLevel}
              onChange={(e) => updateTraining({
                requiredSkillLevel: e.target.value as RecipeTraining['requiredSkillLevel']
              })}
              className="input w-full"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Required Certifications
            </label>
            <div className="space-y-2">
              {recipe.training.certificationRequired?.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Award className="w-4 h-4 text-amber-400" />
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) => {
                        const certs = [...(recipe.training.certificationRequired || [])];
                        certs[index] = e.target.value;
                        updateTraining({ certificationRequired: certs });
                      }}
                      className="bg-transparent border-none text-gray-300 focus:outline-none w-full"
                      placeholder="Enter certification requirement..."
                      autoFocus={!cert}
                    />
                  </div>
                  <button
                    onClick={() => removeCertification(index)}
                    className="text-gray-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addCertification}
                className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Certification
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Prevention */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          Common Error Prevention
        </h3>
        <div className="space-y-4">
          {recipe.training.commonErrors?.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-gray-800/50 rounded-lg p-4"
            >
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div className="flex-1">
                <textarea
                  value={error}
                  onChange={(e) => {
                    const errors = [...(recipe.training.commonErrors || [])];
                    errors[index] = e.target.value;
                    updateTraining({ commonErrors: errors });
                  }}
                  className="input w-full"
                  placeholder="Describe common error and prevention..."
                  autoFocus={!error}
                />
              </div>
              <button
                onClick={() => removeCommonError(index)}
                className="text-gray-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addCommonError}
            className="text-rose-400 hover:text-rose-300 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Common Error
          </button>
        </div>
      </div>

      {/* Key Techniques */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-400" />
          Key Techniques
        </h3>
        <div className="space-y-4">
          {recipe.training.keyTechniques?.map((technique, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-gray-800/50 rounded-lg p-4"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <textarea
                  value={technique}
                  onChange={(e) => {
                    const techniques = [...(recipe.training.keyTechniques || [])];
                    techniques[index] = e.target.value;
                    updateTraining({ keyTechniques: techniques });
                  }}
                  className="input w-full"
                  placeholder="Describe key technique..."
                  autoFocus={!technique}
                />
              </div>
              <button
                onClick={() => removeKeyTechnique(index)}
                className="text-gray-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addKeyTechnique}
            className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Key Technique
          </button>
        </div>
      </div>

      {/* Safety Protocols */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-yellow-400" />
          Safety Protocols
        </h3>
        <div className="space-y-4">
          {recipe.training.safetyProtocols?.map((protocol, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-gray-800/50 rounded-lg p-4"
            >
              <ShieldAlert className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <textarea
                  value={protocol}
                  onChange={(e) => {
                    const protocols = [...(recipe.training.safetyProtocols || [])];
                    protocols[index] = e.target.value;
                    updateTraining({ safetyProtocols: protocols });
                  }}
                  className="input w-full"
                  placeholder="Describe safety protocol..."
                  autoFocus={!protocol}
                />
              </div>
              <button
                onClick={() => removeSafetyProtocol(index)}
                className="text-gray-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addSafetyProtocol}
            className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Safety Protocol
          </button>
        </div>
      </div>

      {/* Quality Standards */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Quality Standards
        </h3>
        <div className="space-y-4">
          {recipe.training.qualityStandards?.map((standard, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-gray-800/50 rounded-lg p-4"
            >
              <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <textarea
                  value={standard}
                  onChange={(e) => {
                    const standards = [...(recipe.training.qualityStandards || [])];
                    standards[index] = e.target.value;
                    updateTraining({ qualityStandards: standards });
                  }}
                  className="input w-full"
                  placeholder="Describe quality standard..."
                  autoFocus={!standard}
                />
              </div>
              <button
                onClick={() => removeQualityStandard(index)}
                className="text-gray-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addQualityStandard}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Quality Standard
          </button>
        </div>
      </div>

      {/* Training Documentation */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          Training Documentation
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Training Notes
            </label>
            <textarea
              value={recipe.training.notes || ''}
              onChange={(e) => updateTraining({ notes: e.target.value })}
              className="input w-full h-32"
              placeholder="Enter any additional training notes or instructions..."
            />
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-medium">Training Requirements</p>
                <p className="text-sm text-gray-300 mt-1">
                  Staff must complete all required certifications and demonstrate proficiency
                  in all key techniques before being assigned to this recipe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};