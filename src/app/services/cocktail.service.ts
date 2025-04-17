import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CocktailService {
  private baseUrl = 'https://www.thecocktaildb.com/api/json/v1/1';

  constructor(private http: HttpClient) { }

  // Get all categories
  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/list.php?c=list`);
  }

  // Get cocktails by category
  getCocktailsByCategory(category: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/filter.php?c=${category}`);
  }

  // Get cocktail by name
  searchCocktailsByName(name: string): Observable<any> {
    console.log('Searching for cocktails with name:', name);
    const url = `${this.baseUrl}/search.php?s=${encodeURIComponent(name)}`;
    console.log('API URL:', url);
    return this.http.get(url).pipe(
      tap(response => {
        console.log('API Response:', response);
      })
    );
  }

  // Get cocktail details by ID
  getCocktailById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/lookup.php?i=${id}`).pipe(
      map((response: any) => {
        if (response && response.drinks && response.drinks[0]) {
          const drink = response.drinks[0];
          console.log('Fetched cocktail:', drink); // Debug log
          return drink;
        }
        console.log('No cocktail found for ID:', id); // Debug log
        return null;
      })
    );
  }
} 