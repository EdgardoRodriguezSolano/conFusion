import { Injectable } from '@angular/core';
import { Feedback } from '../shared/feedback';
import { Restangular } from 'ngx-restangular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private restangular: Restangular) { }

  submitFeedback(fb:Feedback): Observable<Feedback>{
    return this.restangular.all('feedback').post(fb);
  }

  getFeedbacks(): Observable<Feedback[]> {
    return this.restangular.all('feedback').getList();
  }
}
