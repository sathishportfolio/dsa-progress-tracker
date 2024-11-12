import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgbAccordionModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { Syllabus } from './models/Syllabus';
import { Preference } from './models/Preference';
import { Progress } from './models/Progress';
import { GroupedCategories } from './models/GroupedCategories';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule, NgbAccordionModule, NgbProgressbarModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  syllabus: Syllabus = [];
  filteredSyllabus: Syllabus = [];
  preference: Preference = new Preference();
  progressMap: Map<String, Progress> = new Map();
  numbers = Array.from({ length: 11 }, (_, i) => i);
  items = ['First', 'Second', 'Third'];

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.loadProblems();
  }

  private loadProblems(): void {
    this.httpClient.get<Syllabus>('assets/json/problems.json').subscribe(
      data => {
        this.syllabus = data;
        this.loadPreferences();
      },
      error => {
        console.error('Failed to load problems:', error);
      }
    );
  }

  private loadPreferences(): void {
    const storedPreference = localStorage.getItem('preference');

    if (storedPreference) {
      this.preference = JSON.parse(storedPreference);
    }

    this.loadProgress();
  }

  filterCategoriesBySubcategoryRank(rank: number): Syllabus {
    if (rank === 0) return this.syllabus;

    return this.syllabus.map(category => ({
      ...category,
      subcategories: category.subcategories.filter(sub => sub.subcategory_rank === rank)
    })).filter(category => category.subcategories.length > 0);
  }

  updatePreferences(property: keyof Preference, value: number): void {
    this.preference[property] = Number(value);
    localStorage.setItem('preference', JSON.stringify(this.preference));

    this.loadProgress();
  }

  loadProgress(): void {

    if (!this.preference) {
      this.preference = new Preference();
    }

    this.filteredSyllabus = this.filterCategoriesBySubcategoryRank(this.preference.level);
    const storedProgressMap = localStorage.getItem('progressMap');
    if (storedProgressMap) {
      const parsedArray = JSON.parse(storedProgressMap);
      this.progressMap = new Map(parsedArray);

      this.filteredSyllabus.forEach((category) => {
        category.subcategories.forEach((subcategory) => {
          subcategory.problems.forEach((problem) => {
            if (this.progressMap.has(problem.problem_id)) {
              problem.isDone = this.progressMap.get(problem.problem_id)?.done;
            }
          });
        });
      });
    }
  }

  onCheckboxChange(event: Event, type: String, key: String, status: keyof Progress): void {
    const target = event.target as HTMLInputElement;

    if (target.checked) {
      const progress = this.progressMap.get(key) || new Progress();
      this.setProgress(progress, status);
      this.progressMap.set(key, progress);
    } else {
      this.progressMap.delete(key);
    }

    localStorage.setItem('progressMap', JSON.stringify(Array.from(this.progressMap.entries())));

  }

  private setProgress(progress: Progress, status: keyof Progress): void {
    const now = Date.now();

    switch (status) {
      case "done":
        progress.done = now;
        break;
      case "learn":
        progress.learn = now;
        break;
      case "study":
        progress.study = now;
        break;
      case "read":
        progress.read = now;
        break;
      case "write":
        progress.write = now;
        break;
      case "teach":
        progress.teach = now;
        break;
      case "revisions":
        if (!progress.revisions) progress.revisions = [];
        progress.revisions.push(now);
        break;
      default:
        console.warn(`Unknown status: ${status}`);
    }
  }
}