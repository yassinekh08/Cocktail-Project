import { Component, OnInit } from '@angular/core';
import { CocktailService } from '../../services/cocktail.service';

interface CategoryImages {
  [key: string]: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  loading = true;
  error = '';
  colors: string[] = ['blue', 'red', 'green', 'yellow'];
  
  // Image mapping for categories
  private categoryImages: CategoryImages = {
    'Ordinary Drink': 'assets/images/ordinary.jpg',
    'Cocktail': 'assets/images/cocktail.webp',
    'Shake': 'assets/images/Shake.jpg',
    'Other/Unknown': 'assets/images/other.jpg',
    'Other / Unknown': 'assets/images/other.jpg',
    'Cocoa': 'assets/images/cocoa.jpg',
    'Shot': 'assets/images/shot.webp',
    'Coffee / Tea': 'assets/images/coffee.jpg',
    'Homemade Liqueur': 'assets/images/liqueur.jpg',
    'Punch / Party Drink': 'assets/images/punch.jpeg',
    'Beer': 'assets/images/beer.jpeg',
    'Soft Drink': 'assets/images/soft.jpg'
  };

  constructor(private cocktailService: CocktailService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';
    
    this.cocktailService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.drinks || [];
        this.loading = false;
        // Assign images to each category
        this.categories.forEach(category => {
          category.image = this.getCategoryImage(category.strCategory);
        });
      },
      error: (error) => {
        this.error = 'Failed to load categories. Please try again later.';
        this.loading = false;
        console.error('Error loading categories:', error);
      }
    });
  }

  getColor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  getCategoryImage(category: string): string {
    return this.categoryImages[category] || 'assets/images/other.jpg';
  }
}