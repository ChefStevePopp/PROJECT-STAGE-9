import { InstructionEditor } from "./InstructionEditor";
import { Recipe } from "../../types/recipe";

export default function InstructionEditorStoryboard() {
  const sampleRecipe: Recipe = {
    id: "sample-recipe-1",
    organization_id: "org-123",
    name: "Sample Recipe",
    description: "A sample recipe for testing",
    type: "prepared",
    status: "draft",
    prep_time: 30,
    cook_time: 45,
    yield_amount: 4,
    yield_unit: "servings",
    ingredients: [],
    steps: [
      {
        id: "step-1",
        instruction: "Chop the vegetables",
        notes: "Cut into 1-inch pieces",
        warning_level: "low",
        time_in_minutes: 5,
        stage_id: "stage-1",
        is_quality_control_point: false,
        is_critical_control_point: false,
      },
      {
        id: "step-2",
        instruction: "Cook the vegetables",
        notes: "Medium heat",
        warning_level: "medium",
        time_in_minutes: 10,
        stage_id: "stage-2",
        is_quality_control_point: false,
        is_critical_control_point: false,
      },
    ],
    stages: [
      {
        id: "stage-1",
        name: "Preparation",
        is_prep_list_task: true,
        sort_order: 0,
        total_time: 5,
      },
      {
        id: "stage-2",
        name: "Cooking",
        is_prep_list_task: false,
        sort_order: 1,
        total_time: 10,
      },
    ],
  };

  const handleChange = (updates: Partial<Recipe>) => {
    console.log("Recipe updated:", updates);
  };

  return (
    <div className="bg-gray-900 p-6 min-h-screen">
      <InstructionEditor recipe={sampleRecipe} onChange={handleChange} />
    </div>
  );
}
