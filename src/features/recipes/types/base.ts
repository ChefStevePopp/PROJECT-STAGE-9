// Path: src/features/recipes/types/base.ts

/**
 * Recipe status indicates the current state in the workflow
 */
 export type RecipeStatus = 'draft' | 'review' | 'approved' | 'archived';

 /**
  * Recipe type distinguishes between prepared ingredients and final dishes
  */
 export type RecipeType = 'prepared' | 'final';
 
 /**
  * Allergen severity levels for ingredient warnings
  */
 export type AllergenSeverity = 'contains' | 'may_contain' | 'cross_contact';
 
 /**
  * Temperature units used in recipes
  */
 export type TemperatureUnit = 'F' | 'C';
 
 /**
  * Warning levels for recipe steps
  */
 export type WarningLevel = 'low' | 'medium' | 'high';
 
 /**
  * Skill levels required for recipe preparation
  */
 export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
 
 /**
  * Media types that can be attached to recipes
  */
 export type MediaType = 'image' | 'video';
 
 /**
  * Ingredient types in a recipe
  */
 export type IngredientType = 'raw' | 'prepared';
 
 /**
  * Common measurement units used in recipes
  */
 export type MeasurementUnit =
   | 'g'
   | 'kg'
   | 'oz'
   | 'lb'
   | 'ml'
   | 'l'
   | 'tsp'
   | 'tbsp'
   | 'cup'
   | 'pint'
   | 'quart'
   | 'gallon'
   | 'unit'
   | 'piece'
   | 'each';
 
 /**
  * Container types for storage
  */
 export type ContainerType =
   | 'hotel-pan'
   | 'sheet-pan'
   | 'container'
   | 'bottle'
   | 'bag'
   | 'box'
   | 'other';
 
 /**
  * Base interface for all database entities
  */
 export interface BaseEntity {
   id?: string;
   created_at?: string;
   updated_at?: string;
   organization_id: string;
 }
 
 /**
  * Base interface for all user-modifiable entities
  */
 export interface AuditableEntity extends BaseEntity {
   created_by?: string;
   modified_by?: string;
 }
 
 /**
  * Base interface for all sortable entities
  */
 export interface SortableEntity {
   sort_order: number;
 }
 
 /**
  * Base interface for all entities with optional notes
  */
 export interface NotableEntity {
   notes?: string;
 }
 
 /**
  * Temperature specification interface
  */
 export interface Temperature {
   value: number;
   unit: TemperatureUnit;
   tolerance?: number;
 }
 
 /**
  * Time specification interface
  */
 export interface TimeSpecification {
   prep_time?: number;
   cook_time?: number;
   rest_time?: number;
   total_time?: number;
 }
 
 /**
  * Yield specification interface
  */
 export interface YieldSpecification {
   amount: number;
   unit: MeasurementUnit;
 }
 
 /**
  * Cost specification interface
  */
 export interface CostSpecification {
   cost_per_unit: number;
   labor_cost_per_hour: number;
   total_cost: number;
   target_cost_percent: number;
 }
 
 /**
  * Storage specification interface
  */
 export interface StorageSpecification {
   location?: string;
   container?: string;
   container_type?: ContainerType;
   shelf_life?: string;
 }
 
 /**
  * Classification specification interface
  */
 export interface Classification {
   major_group?: string;
   category?: string;
   sub_category?: string;
   station?: string;
 }
 