import { GroupedCategory } from "./GroupedCategory";

export interface GroupedCategories {
    [key: string]: GroupedCategory; // Dynamic keys based on category_name
}