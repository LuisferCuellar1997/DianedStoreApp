import { Component, inject, output, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';


@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.html',
  styleUrl:'./search-bar.css'
})

export class SearchBar {

  termino = output<string>();
  private fb = inject(FormBuilder);

  searchForm = this.fb.group({
    term: [''],
  });

  constructor() {
    this.searchForm.controls.term.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.termino.emit(value ?? '');
      });
  }
}


