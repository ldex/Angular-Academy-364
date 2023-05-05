import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable, EMPTY, combineLatest, Subscription, tap, catchError, startWith, count, map, debounceTime, filter, distinctUntilChanged } from 'rxjs';

import { Product } from '../product.interface';
import { ProductService } from '../../services/product.service';
import { FavouriteService } from '../../services/favourite.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {

  title: string = 'Products';
  selectedProduct: Product;
  favouriteAdded: Product;

  products$: Observable<Product[]>;
  productsNumber$: Observable<number>;
  filter$: Observable<string>;
  filteredProducts$: Observable<Product[]>;
  filtered$: Observable<boolean>;

  errorMessage;
  filter: FormControl = new FormControl("");

  subscription: Subscription = new Subscription();

  constructor(
    private productService: ProductService,
    private favouriteService: FavouriteService,
    private router: Router) {



  }



  ngOnInit(): void {
    this.products$ = this
                      .productService
                      .products$;

     this.filter$ = this
                      .filter
                      .valueChanges
                      .pipe(
                        map(text => text.trim()),
                        filter(text => text.length == 0 || text.length > 2),
                        debounceTime(500),
                        distinctUntilChanged(),
                        tap(text => {
                          console.log(text);
                          this.resetPagination();
                        }),
                        startWith("")
                      );

      this.filtered$ = this
                          .filter$
                          .pipe(
                            map(text => text.length > 0)
                          )

      this.filteredProducts$ = combineLatest([this.products$, this.filter$])
        .pipe(
          map(([products, filterString]) =>
            products.filter(product =>
              product.name.toLowerCase().includes(filterString.toLowerCase())
            )
          )
        )

      this.productsNumber$ = this
        .filteredProducts$
        .pipe(
          map(products => products.length),
          startWith(0)
        )

        this.subscription.add(
          this
            .favouriteService
            .favouriteAdded$
            .pipe(
              tap(product => console.log(product?.name))
            )
            .subscribe(
              product => this.favouriteAdded = product
            )
        )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get favourites(): number {
    return this.favouriteService.getFavouritesNb();
  }

  // Pagination
  pageSize = 5;
  start = 0;
  end = this.pageSize;
  currentPage = 1;

  previousPage() {
    this.start -= this.pageSize;
    this.end -= this.pageSize;
    this.currentPage--;
    this.selectedProduct = null;
  }

  nextPage() {
    this.start += this.pageSize;
    this.end += this.pageSize;
    this.currentPage++;
    this.selectedProduct = null;
  }

  onSelect(product: Product) {
    this.selectedProduct = product;
    this.router.navigateByUrl('/products/' + product.id);
  }

  reset() {
    this.productService.resetList();
    this.router.navigateByUrl('/products'); // self navigation to force data update
  }

  resetPagination() {
    this.start = 0;
    this.end = this.pageSize;
    this.currentPage = 1;
  }
}
