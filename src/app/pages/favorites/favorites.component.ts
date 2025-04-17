import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CocktailService } from '../../services/cocktail.service';
import { firstValueFrom, Subscription } from 'rxjs';

interface Cocktail {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strInstructions?: string;
}

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favoriteCocktails: Cocktail[] = [];
  loading: boolean = true;
  error: string = '';
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private cocktailService: CocktailService
  ) {}

  ngOnInit(): void {
    // Subscribe to user changes to reload favorites when they change
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      console.log('User state changed:', user);
      this.loadFavoriteCocktails();
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async loadFavoriteCocktails(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';

      // Get current user's favorites
      const user = this.authService.currentUserValue;
      console.log('Current user:', user);
      
      if (!user?.favorites || user.favorites.length === 0) {
        console.log('No favorites found');
        this.favoriteCocktails = [];
        this.loading = false;
        return;
      }

      console.log('Loading favorites:', user.favorites);

      // Load each favorite cocktail's details
      const cocktails = await Promise.all(
        user.favorites.map(async (id) => {
          try {
            console.log('Fetching cocktail:', id);
            const cocktail = await firstValueFrom(this.cocktailService.getCocktailById(id));
            console.log('Fetched cocktail:', cocktail);
            return cocktail;
          } catch (error) {
            console.error(`Error loading cocktail ${id}:`, error);
            return null;
          }
        })
      );

      this.favoriteCocktails = cocktails.filter((c): c is Cocktail => c !== null);
      console.log('Loaded favorites:', this.favoriteCocktails);
    } catch (err) {
      this.error = 'Failed to load favorite cocktails';
      console.error('Error loading favorites:', err);
    } finally {
      this.loading = false;
    }
  }

  async removeFromFavorites(cocktailId: string): Promise<void> {
    try {
      console.log('Removing cocktail from favorites:', cocktailId);
      await this.authService.removeFromFavorites(cocktailId);
      this.favoriteCocktails = this.favoriteCocktails.filter(
        c => c.idDrink !== cocktailId
      );
      console.log('Successfully removed cocktail');
    } catch (err) {
      console.error('Error removing from favorites:', err);
      this.error = 'Failed to remove from favorites. Please try again.';
    }
  }
}
