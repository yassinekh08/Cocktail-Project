import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../../services/auth.service';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';

interface UserActivity {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
  type: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  recentActivities: UserActivity[] = [];
  private authSubscription?: Subscription;
  private activitiesSubscription?: () => void;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      console.log('Auth state changed:', user);
      this.isLoggedIn = !!user;
      this.currentUser = user;
      
      if (user) {
        this.setupActivityTracking(user.uid);
      } else {
        this.recentActivities = [];
        if (this.activitiesSubscription) {
          this.activitiesSubscription();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.activitiesSubscription) {
      this.activitiesSubscription();
    }
  }

  setupActivityTracking(userId: string): void {
    const db = getFirestore();
    const activitiesRef = collection(db, 'user_activities');
    const userActivitiesQuery = query(
      activitiesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    this.activitiesSubscription = onSnapshot(userActivitiesQuery, (snapshot) => {
      this.recentActivities = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] as string,
          message: data['message'] as string,
          timestamp: (data['timestamp'] as Timestamp).toDate(),
          type: data['type'] as string
        };
      });
    });
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  onSearch(event: Event): void {
    event.preventDefault();
    const query = this.searchQuery.trim();
    
    if (!query) {
      return;
    }

    // Navigate to search page with query parameter
    this.router.navigate(['/cocktail/search'], {
      queryParams: { q: query }
    });
    
    // Clear the search input
    this.searchQuery = '';
  }
}
