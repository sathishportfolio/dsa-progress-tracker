import { Problem } from "./Problem";

export interface GroupedCategory {
    category_id: string;
    category_rank: number;
    category_slug: string;
    hasIDE: number;
    problems: Omit<Problem, 'category_id' | 'category_name' | 'category_rank' | 'category_slug' | 'hasIDE'>[];
}