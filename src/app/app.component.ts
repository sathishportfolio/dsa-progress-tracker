import { Component, inject, AfterViewInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgbAccordionModule, NgbProgressbarModule, ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Syllabus, Problem, Category } from './models/Syllabus';
import { Preference } from './models/Preference';
import { Progress } from './models/Progress';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { DataService } from './DataService';

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

  filteredTotalProblems: number = 0;
  filteredDoneProblems: number = 0;
  filteredDonePercent: number = 0;

  preference: Preference = new Preference();
  progressMap: Map<String, Progress> = new Map();
  numbers = Array.from({ length: 11 }, (_, i) => i);

  private modalService = inject(NgbModal);
  closeResult = '';
  selectedProblem!: Problem;

  constructor(private auth: Auth, private httpClient: HttpClient, private dataService: DataService) { }

  ngOnInit() {
    signInWithEmailAndPassword(this.auth, "rsathishkumar4@gmail.com", "Easytype@2024")
      .then(() => {
        console.log("Logged in to google...");
      })
      .catch((error) => {
        console.log("Error while Logging to google...");
      });

    this.dataService.getDocumentsAsObservable().subscribe(progressData => {
      localStorage.setItem('preference', JSON.stringify(progressData.preference));
      localStorage.setItem('progressMap', progressData.progressMap);

      this.loadProblems();
    });
  }

  ngAfterViewInit() {
    this.scrollToExpandedAccordion();
  }

  scrollToExpandedAccordion() {
    const expandedAccordion = document.querySelector('.accordion-collapse.show');

    if (expandedAccordion) {
      expandedAccordion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  open(content: TemplateRef<any>, problem: Problem) {
    this.selectedProblem = problem;
    this.modalService.open(content);
  }

  private loadProblems(): void {
    const storedSyllabus = localStorage.getItem('syllabus');

    if (storedSyllabus) {
      this.syllabus = JSON.parse(storedSyllabus);
      this.loadPreferences();
    } else {
      this.httpClient.get<Syllabus>('assets/json/problems.json').subscribe(
        data => {
          this.syllabus = data;
          localStorage.setItem('syllabus', JSON.stringify(this.syllabus));

          this.loadPreferences();
        },
        error => {
          console.error('Failed to load problems:', error);
        }
      );
    }
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

  updatePreferences(property: keyof Preference, value: any): void {
    switch (property) {
      case 'level':
        this.preference.level = Number(value);
        break;
      case 'category':
        this.preference.category = String(value);
        break;
      case 'subcategory':
        this.preference.category = String(value);
        break;
      case 'showCompleted':
        this.preference.showCompleted = Boolean(value.target.checked);
        break;
      default:
        break;
    }

    let storePreference = JSON.stringify(this.preference);
    localStorage.setItem('preference', storePreference);
    this.dataService.addDocument(this.preference, 'preference').subscribe(
      (newId) => { console.log('Firebase Updated : ', newId) },
      (error) => { console.error('Error Firebase Updating : ', error) }
    );

    this.loadProgress();
  }

  loadProgress(): void {

    if (!this.preference) {
      this.preference = new Preference();
    }

    this.filteredTotalProblems = 0;
    this.filteredDoneProblems = 0;
    this.filteredDonePercent = 0;

    this.filteredSyllabus = this.filterCategoriesBySubcategoryRank(this.preference.level);
    const storedProgressMap = localStorage.getItem('progressMap');
    if (storedProgressMap) {
      const parsedArray = JSON.parse(storedProgressMap);
      this.progressMap = new Map(parsedArray);
    }

    this.filteredSyllabus.forEach((category) => {
      // Initialize counters for the category
      category.totalProblems = 0;
      category.doneProblems = 0;

      category.subcategories.forEach((subcategory) => {
        // Initialize counters for the subcategory
        subcategory.totalProblems = 0;
        subcategory.doneProblems = 0;

        subcategory.problems.forEach((problem) => {
          // Increment total problems count
          subcategory.totalProblems++;

          // Check if the problem is done and update accordingly
          if (this.progressMap.has(problem.problem_id)) {
            problem.isDone = this.progressMap.get(problem.problem_id)?.done;
            if (problem.isDone) {
              // Increment done problems count for subcategory and category
              subcategory.doneProblems++;
              category.doneProblems++;
            }
          }

          // Increment total problems count for the category
          category.totalProblems++;
        });

        // Calculate donePercent for the subcategory
        if (subcategory.totalProblems > 0) {
          subcategory.donePercent = Number(((subcategory.doneProblems / subcategory.totalProblems) * 100).toFixed(2));
        } else {
          subcategory.donePercent = Number('0.00'); // Avoid division by zero, set to string for consistency
        }
      });

      // Calculate donePercent for the category
      if (category.totalProblems > 0) {
        category.donePercent = Number(((category.doneProblems / category.totalProblems) * 100).toFixed(2));
      } else {
        category.donePercent = Number('0.00'); // Avoid division by zero, set to string for consistency
      }

      // Update filtered totals
      this.filteredTotalProblems += category.totalProblems;
      this.filteredDoneProblems += category.doneProblems;
    });

    // Calculate filtered done percent after processing all categories
    if (this.filteredTotalProblems > 0) {
      this.filteredDonePercent = Number(((this.filteredDoneProblems / this.filteredTotalProblems) * 100).toFixed(2));
    } else {
      this.filteredDonePercent = Number('0.00'); // Avoid division by zero, set to string for consistency
    }
  }

  updatecategoryStatus(event: Event, category: Category): void {
    const target = event.target as HTMLInputElement;

    category.subcategories.forEach((subcategory) => {
      subcategory.problems.forEach((problem) => {
        if (target.checked) {
          const progress = this.progressMap.get(problem.problem_id) || new Progress();
          this.setProgress(progress, 'done');
          this.progressMap.set(problem.problem_id, progress);
        } else {
          problem.isDone = false;
          this.progressMap.delete(problem.problem_id);
        }
      });
    });

    this.preference.category = "";
    this.preference.subcategory = "";

    let storePreference = JSON.stringify(this.preference);
    localStorage.setItem('preference', storePreference);
    this.dataService.addDocument(this.preference, 'preference').subscribe(
      (newId) => { console.log('Firebase Updated : ', newId) },
      (error) => { console.error('Error Firebase Updating : ', error) }
    );

    let storeMap = JSON.stringify(Array.from(this.progressMap.entries()));
    localStorage.setItem('progressMap', storeMap);
    this.dataService.addDocument(storeMap, 'progressMap').subscribe(
      (newId) => { console.log('Firebase Updated : ', newId) },
      (error) => { console.error('Error Firebase Updating : ', error) }
    );

    this.loadProgress();
  }

  updateProblemStatus(event: Event, problem: Problem, key: String, status: keyof Progress): void {
    const target = event.target as HTMLInputElement;

    if (target.checked) {
      const progress = this.progressMap.get(key) || new Progress();
      this.setProgress(progress, status);
      this.progressMap.set(key, progress);
    } else {
      this.progressMap.delete(key);
    }

    this.preference.category = problem.category_slug;
    this.preference.subcategory = problem.subcategory_slug;

    let storePreference = JSON.stringify(this.preference);
    localStorage.setItem('preference', storePreference);
    this.dataService.addDocument(this.preference, 'preference').subscribe(
      (newId) => { console.log('Firebase Updated : ', newId) },
      (error) => { console.error('Error Firebase Updating : ', error) }
    );

    let storeMap = JSON.stringify(Array.from(this.progressMap.entries()));
    localStorage.setItem('progressMap', storeMap);
    this.dataService.addDocument(storeMap, 'progressMap').subscribe(
      (newId) => { console.log('Firebase Updated : ', newId) },
      (error) => { console.error('Error Firebase Updating : ', error) }
    );

    this.loadProgress();
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