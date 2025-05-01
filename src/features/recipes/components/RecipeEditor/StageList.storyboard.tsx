import StageList from "./StageList";
import { Recipe } from "../../types/recipe";

export default function StageListStoryboard() {
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
    steps: [],
    stages: [
      {
        id: "stage-1",
        name: "Preparation",
        is_prep_list_task: true,
        sort_order: 0,
        total_time: 30,
      },
      {
        id: "stage-2",
        name: "Cooking",
        is_prep_list_task: false,
        sort_order: 1,
        total_time: 45,
      },
      {
        id: "stage-3",
        name: "Plating",
        is_prep_list_task: false,
        sort_order: 2,
        total_time: 15,
      },
    ],
  };

  const handleChange = (updates: Partial<Recipe>) => {
    console.log("Recipe updated:", updates);
  };

  return (
    <div className="bg-gray-900 p-6 min-h-screen">
      <StageList recipe={sampleRecipe} onChange={handleChange} />
    </div>
  );
}
