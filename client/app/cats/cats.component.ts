import {Component, OnInit} from '@angular/core';
import {Http, Response, URLSearchParams} from '@angular/http';
import {Subject} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import {FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';

import {CatService} from '../services/cat.service';
import {ToastComponent} from '../shared/toast/toast.component';

@Component({
  selector: 'app-cats',
  templateUrl: './cats.component.html',
  styleUrls: ['./cats.component.scss']
})
export class CatsComponent implements OnInit {

  cat = {};
  cats = [];
  isLoading = true;
  isEditing = false;
  datasets = [];
  dtOptions: any = {};
  dtendrer: DataTables.RendererSettings = {};
  dtTrigger: Subject<any> = new Subject();
  addCatForm: FormGroup;
  name = new FormControl('', Validators.required);
  age = new FormControl('', Validators.required);
  weight = new FormControl('', Validators.required);

  constructor(private catService: CatService,
              private formBuilder: FormBuilder,
              private http: Http,
              public toast: ToastComponent) {
  }

  ngOnInit() {
    this.dtendrer = {
      header: 'sami',
      pageButton: 'csv',
    };
    this.dtOptions = {};
    this.dtendrer = {};
    // We use this trigger because fetching the list of persons can be quite long,
    // thus we ensure the data is fetched before rendering
    this.dtTrigger = new Subject();
    this.dtOptions = {
      pagingType: 'full_numbers',

      // Configure the buttons
      buttons: [
        'pdf',
        'csv',
        'excel'
      ]
    };
    this.getCats();
    this.http.get('/api/cats')
      .map(this.extractData)
      .subscribe(persons => {
        this.datasets = [];
        this.datasets = persons;
        // Calling the DT trigger to manually render the table


        this.dtTrigger.next();
      });
    this.addCatForm = this.formBuilder.group({
      name: this.name,
      age: this.age,
      weight: this.weight
    });
  }
  private extractData(res: Response) {

    const body = res.json();


    return body || {};
  }
  getCats() {
    this.catService.getCats().subscribe(
      data => this.cats = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  addCat() {
    this.catService.addCat(this.addCatForm.value).subscribe(
      res => {
        const newCat = res.json();
        console.log(newCat);
        this.cats.push(newCat);
        this.addCatForm.reset();
        this.toast.setMessage('item added successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  enableEditing(cat) {
    this.isEditing = true;
    this.cat = cat;
  }

  cancelEditing() {
    this.isEditing = false;
    this.cat = {};
    this.toast.setMessage('item editing cancelled.', 'warning');
    // reload the cats to reset the editing
    this.getCats();
  }

  editCat(cat) {
    this.catService.editCat(cat).subscribe(
      res => {
        this.isEditing = false;
        this.cat = cat;
        this.toast.setMessage('item edited successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  deleteCat(cat) {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      this.catService.deleteCat(cat).subscribe(
        res => {
          const pos = this.cats.map(elem => elem._id).indexOf(cat._id);
          this.cats.splice(pos, 1);
          this.toast.setMessage('item deleted successfully.', 'success');
        },
        error => console.log(error)
      );
    }
  }

}
