import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

type AdminProduct = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  inventory: number;
  featured: boolean;
  active: boolean;
};

@Component({
  selector: 'ssm-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <main class="admin-shell">
      <header class="admin-header">
        <a href="/" class="admin-brand">SSM <em>SAREES</em><small>ADMIN STUDIO</small></a>
        <a href="/" class="back-link">← View storefront</a>
      </header>
      <section class="admin-login" *ngIf="!token">
        <p class="eyebrow">STORE MANAGEMENT</p>
        <h1>Welcome <i>back.</i></h1>
        <p>Sign in with the administrator account configured for this store.</p>
        <form (ngSubmit)="login()">
          <label>Email<input [(ngModel)]="email" name="email" type="email" autocomplete="username" required></label>
          <label>Password<input [(ngModel)]="password" name="password" type="password" autocomplete="current-password" required></label>
          <button class="admin-primary" [disabled]="busy">{{ busy ? 'Signing in…' : 'Sign in securely' }}</button>
        </form>
        <p class="admin-message error" *ngIf="message">{{ message }}</p>
      </section>
      <section *ngIf="token" class="admin-content">
        <div class="admin-title"><div><p class="eyebrow">CATALOGUE CONTROL</p><h1>Product <i>studio.</i></h1></div><button class="admin-logout" (click)="logout()">Sign out</button></div>
        <p class="admin-message" *ngIf="message" [class.error]="isError">{{ message }}</p>
        <div class="admin-layout">
          <form class="product-editor" (ngSubmit)="saveProduct()">
            <h2>{{ form._id ? 'Edit product' : 'Add a saree' }}</h2>
            <label>Product name<input [(ngModel)]="form.name" name="name" required maxlength="140"></label>
            <label>URL slug<input [(ngModel)]="form.slug" name="slug" required maxlength="160" pattern="[a-z0-9]+(-[a-z0-9]+)*"></label>
            <label>Category<select [(ngModel)]="form.category" name="category"><option *ngFor="let category of categories" [value]="category">{{ category }}</option></select></label>
            <div class="admin-fields"><label>Price (₹)<input [(ngModel)]="form.price" name="price" type="number" min="0" step="1" required></label><label>Stock<input [(ngModel)]="form.inventory" name="inventory" type="number" min="0" step="1" required></label></div>
            <label>Compare-at price (₹)<input [(ngModel)]="form.compareAtPrice" name="compareAtPrice" type="number" min="0" step="1"></label>
            <label>Product image URL<input [(ngModel)]="form.imageUrl" name="imageUrl" type="url" maxlength="2000"></label>
            <label>Description<textarea [(ngModel)]="form.description" name="description" maxlength="2000" rows="4"></textarea></label>
            <label class="check-label"><input [(ngModel)]="form.featured" name="featured" type="checkbox"> Feature on storefront</label>
            <label class="check-label"><input [(ngModel)]="form.active" name="active" type="checkbox"> Active / visible</label>
            <div class="editor-actions"><button class="admin-primary" [disabled]="busy">{{ busy ? 'Saving…' : (form._id ? 'Save changes' : 'Create product') }}</button><button type="button" class="admin-secondary" (click)="resetForm()">Clear</button></div>
          </form>
          <div class="product-list">
            <div class="list-heading"><h2>Products</h2><button class="admin-secondary" (click)="loadProducts()">Refresh</button></div>
            <p class="muted" *ngIf="products.length === 0">No products returned yet. Seed the catalogue or add your first product.</p>
            <article class="admin-product" *ngFor="let product of products">
              <img [src]="product.imageUrl || fallbackImage" [alt]="product.name">
              <div class="admin-product-info"><b>{{ product.name }}</b><small>{{ product.category }} · ₹{{ product.price | number:'1.0-0' }} · Stock {{ product.inventory }}</small><small [class.inactive]="!product.active">{{ product.active ? 'Visible' : 'Archived' }}</small></div>
              <div class="admin-product-actions"><button (click)="editProduct(product)">Edit</button><button *ngIf="product.active" (click)="archiveProduct(product)">Archive</button></div>
            </article>
          </div>
        </div>
        <section class="orders-panel">
          <div class="list-heading"><h2>Recent orders</h2><button class="admin-secondary" (click)="loadOrders()">Refresh orders</button></div>
          <p class="muted" *ngIf="orders.length === 0">No orders to display yet.</p>
          <article class="admin-order" *ngFor="let order of orders">
            <div><b>{{ order.orderNumber }}</b><small>{{ order.customer?.name }} · {{ order.customer?.email }}</small><small>{{ order.createdAt | date:'medium' }}</small></div>
            <div><b>₹{{ order.subtotal | number:'1.0-0' }}</b><small class="order-status">{{ order.status }}</small></div>
            <button *ngIf="order.status === 'pending'" class="admin-secondary" (click)="cancelOrder(order)">Cancel pending</button>
          </article>
        </section>
      </section>
      <footer class="admin-footer">SSM Sarees · Store administration</footer>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#faf7f1;color:#292321;font-family:Arial,sans-serif}.admin-shell{max-width:1240px;margin:auto;padding:0 28px}.admin-header{height:86px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e9e0d7}.admin-brand{font:24px Georgia,serif;letter-spacing:.06em;color:#681f32;text-decoration:none}.admin-brand em{font:11px Arial,sans-serif;letter-spacing:.15em}.admin-brand small{display:block;font:8px Arial,sans-serif;letter-spacing:.2em;margin-top:5px;color:#a27e4b}.back-link{font-size:12px;color:#681f32;text-decoration:none}.admin-login{max-width:430px;margin:80px auto;padding:38px;background:#fffdfa;border:1px solid #e9e0d7}.eyebrow{font-size:10px;letter-spacing:.18em;color:#b38b4c;font-weight:bold}.admin-login h1,.admin-title h1{font:48px Georgia,serif;color:#421321;margin:10px 0}.admin-login h1 i,.admin-title h1 i{color:#b38b4c;font-weight:normal}.admin-login p:not(.eyebrow){font-size:12px;line-height:1.8;color:#7b706c}.admin-login form,.product-editor{display:grid;gap:14px}.admin-shell label{display:grid;gap:6px;font-size:11px;color:#665750}.admin-shell input,.admin-shell select,.admin-shell textarea{width:100%;padding:11px;border:1px solid #ded3c8;background:#fffdfa;color:#292321;border-radius:0;font:12px Arial,sans-serif}.admin-primary,.admin-secondary,.admin-logout{border:1px solid #681f32;padding:12px 15px;font-size:11px;cursor:pointer}.admin-primary{background:#681f32;color:white}.admin-secondary,.admin-logout{background:transparent;color:#681f32}.admin-title{display:flex;align-items:center;justify-content:space-between;margin:38px 0 20px}.admin-title h1{font-size:42px;margin:0}.admin-layout{display:grid;grid-template-columns:minmax(280px,360px) minmax(0,1fr);gap:25px;align-items:start}.product-editor,.product-list{background:#fffdfa;border:1px solid #e9e0d7;padding:22px}.product-editor h2,.product-list h2{font:23px Georgia,serif;color:#421321;margin:0 0 6px}.admin-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.check-label{display:flex!important;align-items:center;grid-template-columns:16px 1fr;gap:9px!important}.check-label input{width:14px}.editor-actions,.list-heading{display:flex;gap:10px;align-items:center;justify-content:space-between}.list-heading{margin-bottom:15px}.admin-product{display:flex;gap:13px;align-items:center;padding:14px 0;border-bottom:1px solid #eee4da}.admin-product img{width:68px;height:86px;object-fit:cover;background:#e8d8c8}.admin-product-info{display:grid;gap:6px;flex:1;min-width:0}.admin-product-info b{font:16px Georgia,serif;color:#421321}.admin-product-info small{font-size:10px;color:#7b706c}.admin-product-info small.inactive{color:#9c3945}.admin-product-actions{display:grid;gap:8px}.admin-product-actions button{border:0;background:none;color:#681f32;font-size:10px;text-decoration:underline;cursor:pointer}.admin-message{font-size:12px;color:#39714b;line-height:1.7}.admin-message.error{color:#a02e3c}.muted{font-size:12px;color:#7b706c}.orders-panel{margin-top:25px;background:#fffdfa;border:1px solid #e9e0d7;padding:22px}.admin-order{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:18px;align-items:center;padding:14px 0;border-bottom:1px solid #eee4da}.admin-order>div{display:grid;gap:6px}.admin-order b{font:14px Georgia,serif;color:#421321}.admin-order small{font-size:10px;color:#7b706c}.order-status{text-transform:uppercase;letter-spacing:.1em}.admin-footer{padding:30px 0;text-align:center;font-size:10px;color:#958780}@media(max-width:850px){.admin-layout{grid-template-columns:1fr}.admin-title h1{font-size:34px}}@media(max-width:500px){.admin-shell{padding:0 14px}.admin-login{margin:35px auto;padding:24px}.admin-product{align-items:flex-start;flex-wrap:wrap}.admin-product-info{min-width:calc(100% - 90px)}.admin-product-actions{margin-left:80px;display:flex}.admin-title{gap:12px}.admin-title h1{font-size:29px}}
  `]
})
export class AdminComponent {
  private readonly apiBase = environment.apiBaseUrl;
  token = localStorage.getItem('ssm_admin_token') || '';
  email = '';
  password = '';
  busy = false;
  message = '';
  isError = false;
  products: AdminProduct[] = [];
  orders: any[] = [];
  categories = ['Silk', 'Festive', 'Everyday', 'Cotton', 'Designer'];
  fallbackImage = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
  form: AdminProduct = this.emptyForm();

  constructor(private readonly http: HttpClient) {
    if (this.token) { this.loadProducts(); this.loadOrders(); }
  }

  private emptyForm(): AdminProduct {
    return { name: '', slug: '', description: '', category: 'Silk', price: 0, compareAtPrice: undefined, imageUrl: '', inventory: 0, featured: false, active: true };
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: 'Bearer ' + this.token });
  }

  login(): void {
    this.busy = true;
    this.message = '';
    this.http.post<any>(this.apiBase + '/auth/login', { email: this.email, password: this.password }).subscribe({
      next: (result) => {
        if (result.user?.role !== 'admin') {
          this.message = 'This account does not have administrator access.';
          this.isError = true;
          this.busy = false;
          return;
        }
        this.token = result.token;
        localStorage.setItem('ssm_admin_token', this.token);
        this.password = '';
        this.loadProducts();
      },
      error: (error) => { this.message = error?.error?.error || 'Sign-in failed.'; this.isError = true; this.busy = false; }
    });
  }

  loadProducts(): void {
    this.http.get<{ items: AdminProduct[] }>(this.apiBase + '/admin/products', { headers: this.headers() }).subscribe({
      next: (response) => { this.products = response.items || []; this.message = ''; this.isError = false; this.busy = false; this.loadOrders(); },
      error: (error) => {
        if (error.status === 401 || error.status === 403) this.logout();
        this.message = error?.error?.error || 'Could not load products.';
        this.isError = true;
        this.busy = false;
      }
    });
  }

  saveProduct(): void {
    this.busy = true;
    this.message = '';
    const request = this.form._id
      ? this.http.patch(this.apiBase + '/admin/products/' + this.form._id, this.form, { headers: this.headers() })
      : this.http.post(this.apiBase + '/admin/products', this.form, { headers: this.headers() });
    request.subscribe({
      next: () => { this.message = 'Product saved.'; this.isError = false; this.resetForm(); this.loadProducts(); },
      error: (error) => { this.message = error?.error?.error || 'Could not save product.'; this.isError = true; this.busy = false; }
    });
  }

  editProduct(product: AdminProduct): void {
    this.form = { ...product };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  archiveProduct(product: AdminProduct): void {
    if (!product._id || !window.confirm('Archive ' + product.name + '? It will no longer appear in the storefront.')) return;
    this.http.delete(this.apiBase + '/admin/products/' + product._id, { headers: this.headers() }).subscribe({
      next: () => { this.message = 'Product archived.'; this.isError = false; this.loadProducts(); },
      error: (error) => { this.message = error?.error?.error || 'Could not archive product.'; this.isError = true; }
    });
  }


  loadOrders(): void {
    if (!this.token) return;
    this.http.get<{ items: any[] }>(this.apiBase + '/admin/orders?limit=25', { headers: this.headers() }).subscribe({
      next: (response) => { this.orders = response.items || []; },
      error: (error) => {
        if (error.status === 401 || error.status === 403) this.logout();
        this.message = error?.error?.error || 'Could not load orders.';
        this.isError = true;
      }
    });
  }

  cancelOrder(order: any): void {
    if (!order?._id || !window.confirm('Cancel pending order ' + order.orderNumber + '?')) return;
    this.http.patch(this.apiBase + '/admin/orders/' + order._id + '/status', { status: 'cancelled' }, { headers: this.headers() }).subscribe({
      next: () => { this.message = 'Order cancelled.'; this.isError = false; this.loadOrders(); },
      error: (error) => { this.message = error?.error?.error || 'Could not cancel order.'; this.isError = true; }
    });
  }

  resetForm(): void { this.form = this.emptyForm(); }
  logout(): void {
    this.token = '';
    localStorage.removeItem('ssm_admin_token');
    this.products = [];
    this.resetForm();
    this.busy = false;
  }
}
