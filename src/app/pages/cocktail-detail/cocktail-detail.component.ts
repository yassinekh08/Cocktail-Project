import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CocktailService } from '../../services/cocktail.service';
import { Subscription } from 'rxjs';

interface Cocktail {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strInstructions: string;
  strGlass: string;
  strCategory: string;
  strAlcoholic: string;
  [key: string]: string;
}

interface Ingredient {
  name: string;
  measure: string;
}

@Component({
  selector: 'app-cocktail-detail',
  templateUrl: './cocktail-detail.component.html',
  styleUrls: ['./cocktail-detail.component.scss']
})
export class CocktailDetailComponent implements OnInit, OnDestroy {
  cocktail: Cocktail | null = null;
  ingredients: Ingredient[] = [];
  loading = true;
  error = '';
  isLoggedIn = false;
  isFavorite = false;
  private userSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private cocktailService: CocktailService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Subscribe to auth state
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      console.log('Auth state changed:', user);
      this.isLoggedIn = !!user;
      if (this.cocktail) {
        this.isFavorite = user?.favorites?.includes(this.cocktail.idDrink) || false;
        console.log('Updated favorite state:', this.isFavorite);
      }
    });

    // Load cocktail details
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        console.log('Loading cocktail:', id);
        this.loadCocktailDetails(id);
      }
    });
  }

  private async loadCocktailDetails(id: string): Promise<void> {
    try {
      this.loading = true;
      this.error = '';
      const response = await this.cocktailService.getCocktailById(id).toPromise();
      
      if (response) {
        console.log('Cocktail details loaded:', response);
        this.cocktail = response;
        this.ingredients = this.extractIngredients(response);

        // Check if cocktail is in favorites
        const user = this.authService.currentUserValue;
        console.log('Current user when loading cocktail:', user);
        if (user) {
          this.isFavorite = user.favorites?.includes(id) || false;
          console.log('Initial favorite state:', this.isFavorite);
        }
      } else {
        this.error = 'Cocktail not found';
      }
    } catch (err) {
      console.error('Error loading cocktail:', err);
      this.error = 'Failed to load cocktail details';
    } finally {
      this.loading = false;
    }
  }

  private extractIngredients(cocktail: Cocktail): Ingredient[] {
    const ingredients: Ingredient[] = [];
    for (let i = 1; i <= 15; i++) {
      const name = cocktail[`strIngredient${i}`];
      const measure = cocktail[`strMeasure${i}`];
      if (name) {
        ingredients.push({
          name,
          measure: measure || ''
        });
      }
    }
    console.log('Extracted ingredients:', ingredients);
    return ingredients;
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async toggleFavorite(): Promise<void> {
    if (!this.isLoggedIn) {
      console.log('Cannot toggle favorite: not logged in');
      this.error = 'Please log in to add favorites';
      setTimeout(() => this.error = '', 3000); // Clear error after 3 seconds
      return;
    }

    if (!this.cocktail) {
      console.log('Cannot toggle favorite: no cocktail');
      this.error = 'Unable to update favorites. Please try again.';
      setTimeout(() => this.error = '', 3000); // Clear error after 3 seconds
      return;
    }

    try {
      console.log('Current favorite state:', this.isFavorite);
      console.log('Toggling favorite for cocktail:', this.cocktail.idDrink);

      // Store the previous state in case we need to revert
      const previousState = this.isFavorite;
      
      // Optimistically update UI
      this.isFavorite = !this.isFavorite;
      
      try {
        if (!previousState) {
          await this.authService.addToFavorites(this.cocktail.idDrink);
          console.log('Added to favorites');
        } else {
          await this.authService.removeFromFavorites(this.cocktail.idDrink);
          console.log('Removed from favorites');
        }
        
        this.error = ''; // Clear any previous errors
      } catch (error) {
        // Revert the optimistic update if the operation failed
        this.isFavorite = previousState;
        throw error;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      this.error = 'Failed to update favorites. Please try again.';
      setTimeout(() => this.error = '', 3000); // Clear error after 3 seconds
    }
  }
}
