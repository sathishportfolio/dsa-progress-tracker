export interface Problem {
    problem_slug: string;
    problem_name: string;
    selected?: boolean;
}

export interface Subcategory {
    subcategory_slug: string;
    subcategory_name: string;
    problems: Problem[];
    selected?: boolean;
}

export interface Category {
    category_id: string;
    category_slug: string;
    category_name: string;
    subcategories: Subcategory[];
    selected?: boolean;
}