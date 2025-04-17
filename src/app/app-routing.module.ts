import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { AuthGuard } from './guards/auth.guard';
import { CategoriesComponent } from './pages/categories/categories.component';
import { CocktailListComponent } from './pages/cocktail-list/cocktail-list.component';
import { CocktailDetailComponent } from './pages/cocktail-detail/cocktail-detail.component';
import { CocktailSearchComponent } from './pages/cocktail-search/cocktail-search.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';

const routes: Routes = [
  {
    path: 'favorites', 
    component: FavoritesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories', 
    component: CategoriesComponent
  },
  {
    path: 'categories/cocktails', 
    component: CocktailListComponent
  },
  {
    path: 'cocktail/search', 
    component: CocktailSearchComponent
  },
  {
    path: 'cocktail/details/:id', 
    component: CocktailDetailComponent
  },
  {
    path: 'cocktail/:id', 
    component: CocktailDetailComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: '', 
    redirectTo: 'categories', 
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
