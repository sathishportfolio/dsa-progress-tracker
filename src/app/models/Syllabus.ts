// models/problem.model.ts
export interface Problem {
    problem_id: string; // Unique identifier for the problem
    category_id: string; // ID of the category this problem belongs to
    problem_slug: string; // Slug for the problem (URL-friendly version of the name)
    subcategory_slug: string; // Slug for the subcategory
    category_slug: string; // Slug for the category
    subcategory_id: string; // ID of the subcategory
    problem_name: string; // Name of the problem
    problem_rank: number; // Rank of the problem
    hasIDE: number; // Indicates if there's an IDE available (1 = true, 0 = false)
    difficulty: string; // Difficulty level, can be null
    tufplus_link: string; // Link to coding platform
    lc_link: string; // Link to coding platform
    cs_link: string; // Link to coding platform
    gfg_link: string; // Link to GeeksforGeeks
    post_link: string; // Link to a blog post or article
    yt_link: string; // Link to a YouTube video
    step_title: string; // Title of the step in learning process
    sub_step_title: string; // Title of the sub-step in learning process
    videos_link: String[];

    isDone: any;
}

// models/subcategory.model.ts
export interface Subcategory {
    subcategory_id: string; // Unique identifier for the subcategory
    category_name: string; // Name of the category this subcategory belongs to
    category_id: string; // ID of the parent category
    subcategory_slug: string; // Slug for the subcategory
    subcategory_name: string; // Name of the subcategory
    subcategory_rank: number; // Rank of the subcategory
    subcategory_type: string; // Type of the subcategory (e.g., study)
    problems: Problem[]; // Array of problems under this subcategory

    totalProblems: number;
    doneProblems: number;
    donePercent: number;
}

// models/category.model.ts
export interface Category {
    category_id: string; // Unique identifier for the category
    category_name: string; // Name of the category
    category_rank: number; // Rank of the category
    category_slug: string; // Slug for the category
    subcategories: Subcategory[]; // Array of subcategories under this category

    totalProblems: number;
    doneProblems: number;
    donePercent: number;
}

// models/data.model.ts (optional)
export type Syllabus = Category[];