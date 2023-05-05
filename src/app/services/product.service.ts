import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, delay, shareReplay, tap, first, map, mergeAll, BehaviorSubject, switchMap, of, filter } from 'rxjs';
import { Product } from '../products/product.interface';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = 'https://storerestservice.azurewebsites.net/api/products/';
  products$: Observable<Product[]>;

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService) {
    this.initProducts();
  }

  initProducts() {
    let url:string = this.baseUrl + `?$orderby=ModifiedDate%20desc`;

    this.products$ = this
                      .http
                      .get<Product[]>(url)
                      .pipe(
                        delay(1500), // Pour la démo...
                        tap(console.table),
                        shareReplay()
                      );

    this.loadingService.showLoaderUntilCompleted(this.products$);
  }

  insertProduct(newProduct: Product): Observable<Product> {

    let postObs = this.http.post<Product>(this.baseUrl, newProduct).pipe(delay(2000));

    this.loadingService.showLoaderUntilCompleted(postObs);

    return postObs;
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + id);
  }

  resetList() {
    this.initProducts();
  }
}
