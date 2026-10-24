import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';

type Saree = {
  id: number;
  name: string;
  category: string;
  price: number;
  tag: string;
  image: string;
  tone: string;
  slug?: string;
  productId?: string;
};

type ApiProduct = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  imageUrl?: string;
  description?: string;
  featured?: boolean;
};

@Component({
  selector: 'ssm-storefront',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="announcement">A little tradition, a lot of elegance <span>✦</span> Thoughtfully curated sarees</div>
    <header class="site-header">
      <button class="mobile-menu" aria-label="Open menu" (click)="menuOpen = !menuOpen">☰</button>
      <a class="brand" href="#" aria-label="SSM Sarees home">
        <span class="brand-mark">S</span>
        <span class="brand-name">SSM <em>SAREES</em><small>WOVEN WITH TRADITION</small></span>
      </a>
      <nav [class.open]="menuOpen">
        <a href="#collections" (click)="menuOpen = false">Collections</a>
        <a href="#story" (click)="menuOpen = false">Our Story</a>
        <a href="#promise" (click)="menuOpen = false">Our Promise</a>
      </nav>
      <button class="bag-button" (click)="showBag = !showBag" [attr.aria-label]="'Shopping bag, ' + cartCount + ' items'">
        Bag <span class="bag-count">{{ cartCount }}</span>
      </button>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow"><span></span> THE ART OF INDIAN ELEGANCE</p>
          <h1>Every weave<br>has a <i>story.</i></h1>
          <p class="hero-description">Sarees that carry the beauty of tradition and the spirit of the woman who wears them.</p>
          <a class="primary-button" href="#collections">Explore the collection <span>↗</span></a>
          <div class="hero-note"><span class="note-star">✳</span><span>Made for your moments.<br><b>Remembered for a lifetime.</b></span></div>
        </div>
        <div class="hero-art" role="img" aria-label="Elegant silk saree in warm burgundy and gold tones">
          <div class="hero-image"></div>
          <div class="hero-stamp"><span>TIMELESS</span><b>Elegance</b><span>✦ SINCE ALWAYS ✦</span></div>
          <div class="hero-caption">THE FESTIVE EDIT <span>01 / 03</span></div>
        </div>
      </section>

      <section class="trust-strip" id="promise">
        <div><span>✦</span><p><b>Tradition in every thread</b><small>Curated with care</small></p></div>
        <div><span>◇</span><p><b>Quality you can feel</b><small>Made for lasting memories</small></p></div>
        <div><span>♡</span><p><b>Personal, always</b><small>Here to help you choose</small></p></div>
      </section>

      <section class="collection section-wrap" id="collections">
        <div class="section-heading">
          <div><p class="eyebrow">FIND YOUR FOREVER SAREE</p><h2>Curated <i>collections</i></h2></div>
          <p>From everyday grace to once-in-a-lifetime celebrations, find the weave that feels like you.</p>
        </div>
        <div class="catalogue-status" *ngIf="loadingProducts">Loading the collection…</div>
        <div class="catalogue-status error" *ngIf="catalogueError">{{ catalogueError }}</div>
        <div class="filter-row" aria-label="Filter sarees">
          <button *ngFor="let category of categories" [class.active]="activeCategory === category" (click)="selectCategory(category)">{{ category }}</button>
          <span class="result-count">{{ filteredSarees.length }} styles</span>
        </div>
        <div class="product-grid">
          <article class="product-card" *ngFor="let saree of filteredSarees">
            <div class="product-image" [style.background]="saree.tone">
              <img [src]="saree.image" [alt]="saree.name" loading="lazy">
              <span class="product-tag">{{ saree.tag }}</span>
              <button class="quick-add" (click)="addToBag(saree)" [attr.aria-label]="'Add ' + saree.name + ' to bag'">+</button>
            </div>
            <div class="product-meta"><span>{{ saree.category }}</span><span>✦ Curated pick</span></div>
            <h3>{{ saree.name }}</h3>
            <div class="product-bottom"><span class="price">₹{{ saree.price | number:'1.0-0' }}</span><button (click)="addToBag(saree)">Add to bag <span>↗</span></button></div>
          </article>
        </div>
        <p class="catalogue-note" *ngIf="!apiConnected">Showing the preview catalogue until the product API is configured.</p>
      </section>

      <section class="story-band" id="story">
        <div class="story-art"><div class="story-photo"></div><span class="story-seal">✦<br>MADE<br>WITH<br>CARE</span></div>
        <div class="story-copy"><p class="eyebrow">MORE THAN SIX YARDS</p><h2>A tradition that<br>feels <i>like you.</i></h2><p>A saree is never just fabric. It is a first celebration, a family heirloom, a quiet confidence, and a memory waiting to happen. At SSM Sarees, we believe your next favourite should feel special from the very first glance.</p><a href="#collections" class="text-link">Find your saree <span>→</span></a></div>
      </section>
      <section class="newsletter">
        <p class="eyebrow">A NOTE FROM OUR WORLD</p><h2>Good things are <i>woven slowly.</i></h2><p>New collections, styling inspiration and little stories from the world of sarees.</p>
        <form (submit)="subscribe($event)"><label class="sr-only" for="email">Email address</label><input id="email" type="email" placeholder="Your email address" required><button type="submit">Keep me in the loop ↗</button></form>
        <small *ngIf="subscribed" class="success-message">Thank you! Newsletter sign-up will be connected when the backend is ready.</small>
      </section>
    </main>

    <div class="bag-overlay" *ngIf="showBag" (click)="showBag = false">
      <aside class="bag-panel" (click)="$event.stopPropagation()">
        <div class="bag-heading"><h2>Your bag <span>({{ cartCount }})</span></h2><button (click)="showBag = false" aria-label="Close bag">×</button></div>
        <p *ngIf="cart.length === 0" class="empty-bag">Your bag is waiting for something beautiful.</p>
        <div class="bag-line" *ngFor="let item of cart"><img [src]="item.image" [alt]="item.name"><div><b>{{ item.name }}</b><span>₹{{ item.price | number:'1.0-0' }}</span><button (click)="removeFromBag(item.id)">Remove</button></div></div>
        <div class="bag-total" *ngIf="cart.length"><span>Subtotal</span><b>₹{{ cartTotal | number:'1.0-0' }}</b></div>
        <button class="primary-button checkout-button" [disabled]="cart.length === 0" (click)="checkoutNotice()">Continue to checkout ↗</button>
        <form class="checkout-form" *ngIf="checkoutOpen" (submit)="startCheckout($event)">
          <p class="eyebrow">DELIVERY DETAILS</p>
          <label>Full name<input name="name" autocomplete="name" required maxlength="100"></label>
          <label>Email<input name="email" type="email" autocomplete="email" required maxlength="254"></label>
          <label>Phone<input name="phone" type="tel" autocomplete="tel" required maxlength="20"></label>
          <label>Address<textarea name="address" autocomplete="street-address" required maxlength="500"></textarea></label>
          <label>City<input name="city" autocomplete="address-level2" required maxlength="100"></label>
          <label>State<input name="state" autocomplete="address-level1" required maxlength="100"></label>
          <label>PIN code<input name="postalCode" inputmode="numeric" autocomplete="postal-code" required maxlength="12"></label>
          <button class="primary-button checkout-button" type="submit" [disabled]="paymentBusy">{{ paymentBusy ? "Preparing payment…" : "Pay securely with Razorpay" }}</button>
        </form>
        <small class="catalogue-note">Checkout requires Razorpay test credentials on the API. Never use live keys before full testing.</small>
        <p *ngIf="checkoutMessage" class="success-message">{{ checkoutMessage }}</p>
      </aside>
    </div>
    <footer><a class="footer-brand" href="#">SSM <em>SAREES</em></a><span>Tradition, thoughtfully chosen.</span><span>© {{ currentYear }} SSM Sarees</span></footer>
    <div class="toast" *ngIf="toast">{{ toast }}</div>
  `
})
export class StorefrontComponent implements OnInit {
  menuOpen = false;
  showBag = false;
  subscribed = false;
  toast = '';
  checkoutMessage = '';
  checkoutOpen = false;
  paymentBusy = false;
  activeCategory = 'All sarees';
  loadingProducts = false;
  apiConnected = false;
  catalogueError = '';
  private readonly apiBase = environment.apiBaseUrl;
  cart: Saree[] = [];
  currentYear = new Date().getFullYear();
  categories = ['All sarees', 'Silk', 'Festive', 'Everyday', 'Cotton', 'Designer'];
  sarees: Saree[] = [
    { id: 1, name: 'The Gulmohar Silk', category: 'Silk', price: 4299, tag: 'BESTSELLER', tone: '#e8d8c8', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85' },
    { id: 2, name: 'The Marigold Edit', category: 'Festive', price: 3599, tag: 'FESTIVE FAVOURITE', tone: '#e9d7bb', image: 'https://images.unsplash.com/photo-1610189012906-4c5c2bfa8b1e?auto=format&fit=crop&w=800&q=85' },
    { id: 3, name: 'The Rosewood Classic', category: 'Silk', price: 5199, tag: 'TIMELESS', tone: '#ead8d5', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e4?auto=format&fit=crop&w=800&q=85' },
    { id: 4, name: 'The Everyday Muse', category: 'Everyday', price: 1899, tag: 'EASY ELEGANCE', tone: '#deded0', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85' }
  ];
  private readonly previewCatalogue: Saree[] = this.sarees.map((item) => ({ ...item }));

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.catalogueError = '';
    let params = new HttpParams().set('limit', '24');
    if (this.activeCategory !== 'All sarees') params = params.set('category', this.activeCategory);
    this.http.get<{ items: ApiProduct[] }>(this.apiBase + '/products', { params }).subscribe({
      next: (response) => {
        if (Array.isArray(response.items) && response.items.length) {
          this.sarees = response.items.map((product, index) => ({
            id: index + 1,
            productId: product._id,
            slug: product.slug,
            name: product.name,
            category: product.category,
            price: product.price,
            tag: product.featured ? 'CURATED PICK' : 'MADE TO BE LOVED',
            tone: '#e8d8c8',
            image: product.imageUrl || ''
          }));
          this.apiConnected = true;
        } else if (Array.isArray(response.items)) {
          this.sarees = [];
          this.apiConnected = true;
        }
        this.loadingProducts = false;
      },
      error: () => {
        this.apiConnected = false;
        this.catalogueError = 'We could not reach the live catalogue yet. Showing preview styles instead.';
        this.loadingProducts = false;
      }
    });
  }

  get filteredSarees(): Saree[] {
    return this.sarees;
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    if (this.apiConnected) this.loadProducts();
    else this.sarees = this.activeCategory === 'All sarees' ? this.previewCatalogue.map((item) => ({ ...item })) : this.previewCatalogue.filter(s => s.category === category);
  }
  get cartCount(): number { return this.cart.length; }
  get cartTotal(): number { return this.cart.reduce((sum, item) => sum + item.price, 0); }

  addToBag(saree: Saree): void {
    this.cart = [...this.cart, saree];
    this.toast = saree.name + ' added to your bag';
    this.checkoutMessage = '';
    setTimeout(() => this.toast = '', 2400);
  }
  removeFromBag(id: number): void {
    const index = this.cart.findIndex(item => item.id === id);
    if (index >= 0) this.cart = this.cart.filter((_, i) => i !== index);
  }
  subscribe(event: Event): void {
    event.preventDefault();
    this.subscribed = true;
  }
  checkoutNotice(): void {
    if (!this.apiConnected || this.cart.some(item => !item.productId)) {
      this.checkoutMessage = 'Secure checkout is available once the live product API is connected.';
      return;
    }
    this.checkoutOpen = !this.checkoutOpen;
    this.checkoutMessage = '';
  }

  async startCheckout(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const values = Object.fromEntries(new FormData(form).entries());
    const customer = { name: String(values['name'] || ''), email: String(values['email'] || ''), phone: String(values['phone'] || ''), address: String(values['address'] || ''), city: String(values['city'] || ''), state: String(values['state'] || ''), postalCode: String(values['postalCode'] || '') };
    const quantities = new Map<string, number>();
    for (const item of this.cart) if (item.productId) quantities.set(item.productId, (quantities.get(item.productId) || 0) + 1);
    this.paymentBusy = true;
    this.checkoutMessage = '';
    try {
      await this.loadRazorpayScript();
      const created = await this.http.post<any>(this.apiBase + '/orders/create-payment', { customer, items: Array.from(quantities.entries()).map(([productId, quantity]) => ({ productId, quantity })) }).toPromise();
      const RazorpayCtor = (window as any).Razorpay;
      if (!RazorpayCtor || !created?.razorpayOrderId) throw new Error('Secure payment could not be initialized.');
      const payment = new RazorpayCtor({ key: created.keyId, amount: created.amount, currency: created.currency, name: 'SSM Sarees', description: 'Order ' + created.orderNumber, order_id: created.razorpayOrderId, prefill: { name: customer.name, email: customer.email, contact: customer.phone }, theme: { color: '#681f32' },
        handler: async (response: any) => {
          try {
            const verified = await this.http.post<any>(this.apiBase + '/orders/verify-payment', response).toPromise();
            if (!verified?.success) throw new Error('Payment verification did not complete.');
            this.cart = []; this.checkoutOpen = false; this.checkoutMessage = 'Payment confirmed. Order number: ' + verified.orderNumber + '.'; this.loadProducts();
          } catch { this.checkoutMessage = 'Payment was submitted but confirmation could not be retrieved. Please contact support with your payment ID.'; }
          finally { this.paymentBusy = false; }
        },
        modal: { ondismiss: () => { this.paymentBusy = false; } }
      });
      payment.on('payment.failed', (response: any) => { this.checkoutMessage = response?.error?.description || 'Payment did not complete. Please try again.'; this.paymentBusy = false; });
      payment.open();
    } catch (error: any) { this.checkoutMessage = error?.error?.error || error?.message || 'Could not start checkout. Please try again.'; this.paymentBusy = false; }
  }

  private loadRazorpayScript(): Promise<void> {
    if ((window as any).Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(); script.onerror = () => reject(new Error('Could not load Razorpay checkout.')); document.head.appendChild(script); });
  }
}