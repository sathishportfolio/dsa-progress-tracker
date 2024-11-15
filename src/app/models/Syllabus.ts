// models/syllabus.model.ts
import { jsonIgnore } from 'json-ignore';

// Problem Class
export class Problem {
    problem_id: string = ""; // Unique identifier for the problem
    category_id: string = ""; // ID of the category this problem belongs to
    problem_slug: string = ""; // Slug for the problem (URL-friendly version of the name)
    subcategory_slug: string = ""; // Slug for the subcategory
    category_slug: string = ""; // Slug for the category
    subcategory_id: string = ""; // ID of the subcategory
    problem_name: string = ""; // Name of the problem
    problem_rank: number = 0; // Rank of the problem
    hasIDE: number = 0; // Indicates if there's an IDE available (1 = true, 0 = false)
    difficulty: string | null = null; // Difficulty level, can be null
    tufplus_link: string = ""; // Link to coding platform
    lc_link: string = ""; // Link to coding platform
    cs_link: string = ""; // Link to coding platform
    gfg_link: string = ""; // Link to GeeksforGeeks
    post_link: string = ""; // Link to a blog post or article
    yt_link: string = ""; // Link to a YouTube video
    step_title: string = ""; // Title of the step in learning process
    sub_step_title: string = ""; // Title of the sub-step in learning process
    videos_link: string[] = []; // Array of video links

    @jsonIgnore()
    isDone: any; // Property that will be ignored during JSON serialization

    constructor(init?: Partial<Problem>) {
        Object.assign(this, init);
    }
}

// Subcategory Class
export class Subcategory {
    subcategory_id: string = ""; // Unique identifier for the subcategory
    category_name: string = ""; // Name of the category this subcategory belongs to
    category_id: string = ""; // ID of the parent category
    subcategory_slug: string = ""; // Slug for the subcategory
    subcategory_name: string = ""; // Name of the subcategory
    subcategory_rank: number = 0; // Rank of the subcategory
    subcategory_type: string = ""; // Type of the subcategory (e.g., study)

    problems: Problem[] = []; // Array of problems under this subcategory

    @jsonIgnore()
    totalProblems: number;   // Total number of problems in this subcategory (ignored)

    @jsonIgnore()
    doneProblems: number;     // Number of completed problems in this subcategory (ignored)

    @jsonIgnore()
    donePercent: number;      // Percentage of completed problems in this subcategory (ignored)

    constructor(init?: Partial<Subcategory>) {
        Object.assign(this, init);
        this.totalProblems = init?.problems?.length || 0;  // Calculate total problems based on provided array length.
        this.doneProblems = 0;  // Initialize as needed, or calculate based on some logic.
        this.donePercent = 0;   // Initialize as needed, or calculate based on some logic.
    }
}

// Category Class
export class Category {
    category_id: string = ""; // Unique identifier for the category
    category_name: string = ""; // Name of the category
    category_rank: number = 0; // Rank of the category
    category_slug: string = ""; // Slug for the category

    subcategories: Subcategory[] = []; // Array of subcategories under this category

    @jsonIgnore()
    totalProblems: number;   // Total number of problems in this category (ignored)

    @jsonIgnore()
    doneProblems: number;     // Number of completed problems in this category (ignored)

    @jsonIgnore()
    donePercent: number;      // Percentage of completed problems in this category (ignored)

    constructor(init?: Partial<Category>) {
        Object.assign(this, init);
        this.totalProblems = init?.subcategories?.reduce((sum, sub) => sum + (sub.problems.length || 0), 0) || 0;
        this.doneProblems = 0;   // Initialize as needed, or calculate based on some logic.
        this.donePercent = 0;   // Initialize as needed, or calculate based on some logic.
    }
}

// Syllabus Type Definition
export type Syllabus = Category[];