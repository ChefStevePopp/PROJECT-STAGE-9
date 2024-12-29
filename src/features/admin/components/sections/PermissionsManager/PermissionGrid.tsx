import React from 'react';
import { Check, X } from 'lucide-react';
import { KITCHEN_ROLES, type KitchenRole } from '@/config/kitchen-roles';
import { Tooltip } from './Tooltip';

interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface Feature {
  id: string;
  label: string;
  description?: string;
}

interface PermissionGridProps {
  activeRole: KitchenRole;
  features: Feature[];
  onPermissionChange?: (feature: string, action: keyof Permission, value: boolean) => void;
  isEditable?: boolean;
}

export const PermissionGrid: React.FC<PermissionGridProps> = ({
  activeRole,
  features,
  onPermissionChange,
  isEditable = false
}) => {
  const renderPermissionToggle = (
    feature: Feature,
    action: keyof Permission,
    hasAccess: boolean
  ) => {
    const toggleClass = `p-2 rounded-lg transition-colors ${
      hasAccess 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-gray-700/50 text-gray-400'
    } ${isEditable ? 'cursor-pointer hover:bg-opacity-75' : ''}`;

    const content = (
      <div className={toggleClass}>
        {hasAccess ? (
          <Check className="w-4 h-4" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </div>
    );

    if (isEditable && onPermissionChange) {
      return (
        <button
          onClick={() => onPermissionChange(feature.id, action, !hasAccess)}
          className={toggleClass}
        >
          {content}
        </button>
      );
    }

    return content;
  };

  return (
    <div className="bg-gray-800/50 rounded-lg">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white">
          {KITCHEN_ROLES[activeRole].label} Permissions
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          {KITCHEN_ROLES[activeRole].description}
        </p>
      </div>

      <div className="p-4">
        <div className="grid gap-4">
          {features.map(feature => (
            <div 
              key={feature.id}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-white font-medium">{feature.label}</h4>
                  {feature.description && (
                    <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(['view', 'create', 'edit', 'delete'] as const).map(action => {
                    const hasAccess = KITCHEN_ROLES[activeRole].permissions[feature.id][action];
                    return (
                      <Tooltip
                        key={action}
                        content={`Can ${action} ${feature.label.toLowerCase()}`}
                      >
                        {renderPermissionToggle(feature, action, hasAccess)}
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};