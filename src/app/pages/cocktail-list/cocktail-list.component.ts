import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CocktailService } from '../../services/cocktail.service';

@Component({
  selector: 'app-cocktail-list',
  templateUrl: './cocktail-list.component.html',
  styleUrls: ['./cocktail-list.component.css']
})
export class CocktailListComponent implements OnInit {
  cocktails: any[] = [];
  filteredCocktails: any[] = [];
  category: string = '';
  loading = true;
  error = '';
  searchTerm: string = '';

  constructor(
    private route: ActivatedRoute,
    private cocktailService: CocktailService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.category = params['category'];
      if (this.category) {
        this.loadCocktails();
      }
    });
  }

  loadCocktails(): void {
    this.loading = true;
    this.error = '';
    
    this.cocktailService.getCocktailsByCategory(this.category).subscribe({
      next: (response) => {
        this.cocktails = response.drinks || [];
        this.filteredCocktails = [...this.cocktails];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load cocktails. Please try again later.';
        this.loading = false;
        console.error('Error loading cocktails:', error);
      }
    });
  }

  searchCocktails(event: any): void {
    const term = event.target.value.toLowerCase();
    this.searchTerm = term;
    
    if (!term) {
      this.filteredCocktails = [...this.cocktails];
      return;
    }

    this.filteredCocktails = this.cocktails.filter(cocktail => 
      cocktail.strDrink.toLowerCase().includes(term)
    );
  }
}
