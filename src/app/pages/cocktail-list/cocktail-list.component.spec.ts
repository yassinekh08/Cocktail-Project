import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailListComponent } from './cocktail-list.component';

describe('CocktailListComponent', () => {
  let component: CocktailListComponent;
  let fixture: ComponentFixture<CocktailListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CocktailListComponent]
    });
    fixture = TestBed.createComponent(CocktailListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
