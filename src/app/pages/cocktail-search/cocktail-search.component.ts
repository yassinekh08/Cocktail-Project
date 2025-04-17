import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CocktailService } from '../../services/cocktail.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-cocktail-search',
  templateUrl: './cocktail-search.component.html',
  styleUrls: ['./cocktail-search.component.scss']
})
export class CocktailSearchComponent implements OnInit, OnDestroy {
  searchResults: any[] = [];
  loading = false;
  error = '';
  searchQuery = '';
  noResults = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private cocktailService: CocktailService
  ) { }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const query = params['q'];
        if (query) {
          this.searchQuery = query;
          this.searchCocktails(query);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  searchCocktails(query: string): void {
    if (!query.trim()) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.noResults = false;
    this.searchResults = [];

    this.cocktailService.searchCocktailsByName(query)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          if (response && response.drinks) {
            this.searchResults = response.drinks;
            this.noResults = this.searchResults.length === 0;
            console.log('Search results:', this.searchResults);
          } else {
            this.noResults = true;
          }
        },
        error: (error) => {
          console.error('Search error:', error);
          this.error = 'Failed to search cocktails. Please try again.';
          this.searchResults = [];
        }
      });
  }
}
