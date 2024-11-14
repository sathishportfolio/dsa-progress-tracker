import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, from, map } from 'rxjs';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { User } from './user.model';
import { Firestore, addDoc, collection, collectionData, doc, getDoc, getFirestore, query, setDoc, where } from '@angular/fire/firestore';
import { Category } from './dashboard.types';
import { Progress } from './models/Progress';
import firebase from 'firebase/compat/app';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    constructor(private firestore: Firestore, private http: HttpClient) { }

    addDocument(data: any, type: string): Observable<string> {
        const collectionData = collection(this.firestore, 'dsa-progress-tracker');

        const docRef = doc(collectionData, type);

        return from(setDoc(docRef, { [type]: data }, { merge: true }).then(() => type));
    }

    getDocuments(): Observable<any[]> {
        const categoryCollection = collection(this.firestore, 'dsa-progress-tracker');
        return collectionData(query(categoryCollection)) as Observable<any[]>;
    }

    getDocumentsAsObservable(): Observable<any> {
        const firestore = getFirestore();

        // Define the hardcoded custom IDs
        const customIds = ['preference', 'progressMap'];

        // Create an array of observables for each document
        const observables = customIds.map(customId => {
            const docRef = doc(firestore, 'dsa-progress-tracker', customId);
            return from(getDoc(docRef).then(docSnap => {
                if (docSnap.exists()) {
                    return docSnap.data(); // Return data in the desired format
                } else {
                    throw new Error(`No document found with ID: ${customId}`);
                }
            }));
        });

        // Combine the observables and merge the results into a single object
        return combineLatest(observables).pipe(
            map(results => Object.assign({}, ...results)) // Merge results into a single object
        );
    }
}