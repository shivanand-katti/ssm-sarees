import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type Saree = {
  id: number;
  name: string;
  category: string;
  price: number;
  tag: string;
  image: string;
  tone: string;
};

@Component({
  selector: 'ssm-root',
  standalone: true,
  imports: [CommonModule],
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
      <button class="bag-button" (click)="showBag = !showBag" [attr.aria-label]="'Shopping bag, ' + cartCount + ' items">
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
        <div class="filter-row" aria-label="Filter sarees">
          <button *ngFor="let category of categories" [class.active]="activeCategory === category" (click)="activeCategory = category">{{ category }}</button>
          <span class="result-count">{{ filteredSarees.length }} styles</span>
        </div>
        <div class="product-grid">
          <article class="product-card" *ngFor="let saree of filteredSarees">
            <div class="product-image" [style.background]="saree.tone">
              <img [src]="saree.image" [alt]="saree.name" loading="lazy">
              <span class="product-tag">{{ saree.tag }}</span>
              <button class="quick-add" (click)="addToBag(saree)" [attr.aria-label]="'Add ' + saree.name + ' to bag">+</button>
            </div>
            <div class="product-meta"><span>{{ saree.category }}</span><span>✦ Curated pick</span></div>
            <h3>{{ saree.name }}</h3>
            <div class="product-bottom"><span class="price">₹{{ saree.price | number:'1.0-0' }}</span><button (click)="addToBag(saree)">Add to bag <span>↗</span></button></div>
          </article>
        </div>
        <p class="catalogue-note">A preview collection — product names, prices and imagery are sample content while the store is being built.</p>
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
        <small class="catalogue-note">Demo cart only. Secure checkout will be connected after the API and payment setup.</small>
        <p *ngIf="checkoutMessage" class="success-message">{{ checkoutMessage }}</p>
      </aside>
    </div>
    <footer><a class="footer-brand" href="#">SSM <em>SAREES</em></a><span>Tradition, thoughtfully chosen.</span><span>© {{ currentYear }} SSM Sarees</span></footer>
    <div class="toast" *ngIf="toast">{{ toast }}</div>
  `
})
export class AppComponent {
  menuOpen = false;
  showBag = false;
  subscribed = false;
  toast = '';
  checkoutMessage = '';
  activeCategory = 'All sarees';
  cart: Saree[] = [];
  currentYear = new Date().getFullYear();
  categories = ['All sarees', 'Silk', 'Festive', 'Everyday'];
  sarees: Saree[] = [
    { id: 1, name: 'The Gulmohar Silk', category: 'Silk', price: 4299, tag: 'BESTSELLER', tone: '#e8d8c8', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85' },
    { id: 2, name: 'The Marigold Edit', category: 'Festive', price: 3599, tag: 'FESTIVE FAVOURITE', tone: '#e9d7bb', image: 'https://images.unsplash.com/photo-1610189012906-4c5c2bfa8b1e?auto=format&fit=crop&w=800&q=85' },
    { id: 3, name: 'The Rosewood Classic', category: 'Silk', price: 5199, tag: 'TIMELESS', tone: '#ead8d5', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e4?auto=format&fit=crop&w=800&q=85' },
    { id: 4, name: 'The Everyday Muse', category: 'Everyday', price: 1899, tag: 'EASY ELEGANCE', tone: '#deded0', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85' }
  ];

  get filteredSarees(): Saree[] {
    return this.activeCategory === 'All sarees' ? this.sarees : this.sarees.filter(s => s.category === this.activeCategory);
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
    this.checkoutMessage = 'Checkout will be enabled after backend and payment integration.';
  }
}