import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

export interface User {
  uid: string;
  email: string;
  name?: string;
  favorites?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private app = initializeApp(environment.firebase);
  private auth = getAuth(this.app);
  private db = getFirestore(this.app);
  
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();

    // Listen to Firebase auth state changes
    onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('Firebase auth state changed:', firebaseUser); // Debug log
      if (firebaseUser) {
        try {
          const userData = await this.getUserData(firebaseUser.uid);
          console.log('User data retrieved:', userData); // Debug log
          
          // If user data doesn't exist in Firestore, create it
          if (!userData) {
            const newUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              favorites: []
            };
            await setDoc(doc(this.db, 'users', firebaseUser.uid), newUser);
            this.currentUserSubject.next(newUser);
          } else {
            this.currentUserSubject.next({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || '',
              favorites: userData.favorites || []
            });
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          this.currentUserSubject.next(null);
        }
      } else {
        console.log('No user signed in'); // Debug log
        this.currentUserSubject.next(null);
      }
    });
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log('Attempting login for:', email); // Debug log
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Login successful, user:', userCredential.user); // Debug log

      // Get user data from Firestore
      const userData = await this.getUserData(userCredential.user.uid);
      console.log('Retrieved user data:', userData); // Debug log

      // Update the current user state
      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: userData?.name || userCredential.user.displayName || '',
        favorites: userData?.favorites || []
      };

      console.log('Updating user state with:', user); // Debug log
      this.currentUserSubject.next(user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      this.currentUserSubject.next(null);
      throw error;
    }
  }

  async signup(name: string, email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Update profile with name
      await updateProfile(user, { displayName: name });

      // Create user document in Firestore
      const userData: User = {
        uid: user.uid,
        email: user.email!,
        name: name,
        favorites: []
      };

      await setDoc(doc(this.db, 'users', user.uid), userData);
      this.currentUserSubject.next(userData);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  private async getUserData(uid: string): Promise<User | null> {
    try {
      console.log('Getting user data for uid:', uid);
      const docRef = doc(this.db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Found user data:', data);
        return {
          uid: data['uid'],
          email: data['email'],
          name: data['name'] || '',
          favorites: Array.isArray(data['favorites']) ? data['favorites'] : []
        };
      } else {
        console.log('No user document found');
        return null;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  private async trackActivity(userId: string, type: string, message: string): Promise<void> {
    try {
      const activitiesRef = collection(this.db, 'user_activities');
      await addDoc(activitiesRef, {
        userId,
        type,
        message,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  async addToFavorites(cocktailId: string): Promise<void> {
    const user = this.currentUserValue;
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      console.log('Adding cocktail to favorites:', cocktailId);
      const userRef = doc(this.db, 'users', user.uid);
      
      // Get current user data to ensure it exists
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.name || '',
          favorites: [cocktailId]
        });
      } else {
        // Update existing document
        await updateDoc(userRef, {
          favorites: arrayUnion(cocktailId)
        });
      }

      // Update local state
      const updatedFavorites = [...new Set([...(user.favorites || []), cocktailId])];
      this.currentUserSubject.next({
        ...user,
        favorites: updatedFavorites
      });

      // Track activity
      await this.trackActivity(user.uid, 'favorite_add', `Added cocktail ${cocktailId} to favorites`);

      console.log('Successfully added to favorites');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  async removeFromFavorites(cocktailId: string): Promise<void> {
    const user = this.currentUserValue;
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      console.log('Removing cocktail from favorites:', cocktailId);
      const userRef = doc(this.db, 'users', user.uid);
      
      // Get current user data
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        console.log('User document not found');
        return;
      }
      
      // Update Firestore
      await updateDoc(userRef, {
        favorites: arrayRemove(cocktailId)
      });

      // Update local state
      const updatedFavorites = user.favorites?.filter(id => id !== cocktailId) || [];
      this.currentUserSubject.next({
        ...user,
        favorites: updatedFavorites
      });

      // Track activity
      await this.trackActivity(user.uid, 'favorite_remove', `Removed cocktail ${cocktailId} from favorites`);

      console.log('Successfully removed from favorites');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }
}