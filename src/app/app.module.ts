import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { environment } from '../environments/environment';

// Initialize Firebase
const app = initializeApp(environment.firebase);
const auth = getAuth(app);
const db = getFirestore(app);

// Component imports
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './includes/header/header.component';
import { FooterComponent } from './includes/footer/footer.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { CocktailListComponent } from './pages/cocktail-list/cocktail-list.component';
import { CocktailDetailComponent } from './pages/cocktail-detail/cocktail-detail.component';
import { CocktailSearchComponent } from './pages/cocktail-search/cocktail-search.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    CategoriesComponent,
    CocktailListComponent,
    CocktailDetailComponent,
    CocktailSearchComponent,
    LoginComponent,
    SignupComponent,
    FavoritesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: 'FIREBASE_APP', useValue: app },
    { provide: 'FIREBASE_AUTH', useValue: auth },
    { provide: 'FIREBASE_DB', useValue: db }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
