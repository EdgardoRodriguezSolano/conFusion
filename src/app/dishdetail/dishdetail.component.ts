import { Component, OnInit, Inject } from '@angular/core';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Comment } from '../shared/comment';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';

import { switchMap } from 'rxjs/operators';

import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Feedback} from '../shared/feedback';




@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})


export class DishdetailComponent implements OnInit {
  dish: Dish;
  dishes: Dish[];
  dishIds: number[];
  prev: number;
  next: number;
  feedbackForm: FormGroup;
  feedback: Feedback;
  comments: Comment;
  errMess: string;
  dishcopy = null;
  
  formErrors = {
    'author': '',
    'rating': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'This field is required.',
      'minlength': 'Your name must be at least 2 characters long.',
    },
    'comment': {
      'required': 'This field is required.',
    },
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    @Inject('BaseURL') private BaseURL,
    private fb: FormBuilder) { 
      this.createForm();
    }

  createForm() {
    
      this.feedbackForm = this.fb.group({
        author: ['', [Validators.required, Validators.minLength(2)]],
        rating: 5,
        comment: ['', [Validators.required]]
      });

      this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data),
      errmess => this.errMess = <any>errmess);

      this.onValueChanged(); // (re)set validation messages now
    }

    onValueChanged(data?: any) {
      console.log("Author " + this.feedbackForm.value.author);

      if (!this.feedbackForm) { return; }
      const form = this.feedbackForm;
      for (const field in this.formErrors) {
        if (this.formErrors.hasOwnProperty(field)) {
          // clear previous error message (if any)
          this.formErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.validationMessages[field];
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field] += messages[key] + ' ';
              }
            }
          }
        }
      }
    }

    onSubmit() {
      this.feedback = this.feedbackForm.value;
      this.dishservice.getDishes().subscribe(DISHES => this.dishes = DISHES);
      this.comments = {
        'rating': this.feedbackForm.value.rating,
        'comment': this.feedbackForm.value.comment,
        'author': this.feedbackForm.value.author,
        'date': new Date().toISOString()
      }
      this.dishcopy.comments.push(this.comments);
      this.dishcopy.save()
        .subscribe(dish => { this.dish = dish; console.log(this.dish); });
      this.feedbackForm.reset();
      this.feedbackForm.setValue({
        author: '',
        rating: 5,
        comment: ''
      });
    }
  

    ngOnInit() {
      this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(+params['id'])))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); });
    }
  
    setPrevNext(dishId: number) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

  goBack(): void {
    this.location.back();
  }
}
