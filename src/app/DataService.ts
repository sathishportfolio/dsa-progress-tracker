import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { User } from './user.model';
import { Firestore, addDoc, collection, collectionData, doc, query, setDoc, where } from '@angular/fire/firestore';
import { Category } from './dashboard.types';
import { Progress } from './models/Progress';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    constructor(private firestore: Firestore, private http: HttpClient) { }

    addDocument(data: any, type: string): Observable<string> {
        let collectionData = collection(this.firestore, type);

        const docRef = doc(collectionData, type);

        return from(setDoc(docRef, data, { merge: true }).then(() => type));
    }

    // storeProgressMap(progressMap: Map<String, Progress>): Observable<string> {
    //     const collectionData = collection(this.firestore, 'progressMap'); // Change as needed
    //     const docId = 'progressMap';

    //     const progressObject = this.mapToObject(progressMap);
    //     const docRef = doc(collectionData, docId);

    //     return from(setDoc(docRef, progressObject, { merge: true }).then(() => docId));
    // }

    // private mapToObject(map: Map<String, Progress>): { [key: string]: Progress } {
    //     const obj: { [key: string]: Progress } = {};
    //     map.forEach((value, key) => {
    //         obj[key.toString()] = value; // Convert String to string for indexing
    //     });
    //     return obj;
    // }

    getDocuments(): Observable<any[]> {
        const categoryCollection = collection(this.firestore, 'preference');
        return collectionData(query(categoryCollection)) as Observable<any[]>;
    }

    getData(): Observable<any> {
        return this.http.get('assets/json/data_all.json');
    }
}