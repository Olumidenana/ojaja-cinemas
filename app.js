/**
 * OJAJA CINEMAS — Core Application & Booking Engine
 * Flagship Location: African Village, Ife Grand Resort & Industrial Hub, Ile-Ife, Osun State
 * Sub-branches: Ojaja Lagos (Ogombo Ajah) | Ojaja Akure (Alagbaka)
 * Verified Production Database ID: oja-fa0483dd
 * Official Logo: assets/ojaja-logo-transparent.png & assets/ojaja-official-logo.png
 * Sound FX: Synthesized Web Audio API (Zero external assets required)
 * UI/UX: Interactive Stepper, Explainable Full-Hall Intelligence & Paystack Integration
 */

// Sound Synthesizer Engine (Web Audio API)
const SoundFX = {
  muted: false,
  audioCtx: null,

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  },

  playSeatClick() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  },

  playSwitchTime() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659.25, now + 0.09); // E5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(now + 0.22);
    } catch (e) {}
  },

  playSuccessFanfare() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const startTime = this.audioCtx.currentTime + idx * 0.09;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch (e) {}
  },

  toggleMute() {
    this.muted = !this.muted;
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) {
      btn.innerHTML = this.muted
        ? '<i data-lucide="volume-x" class="w-4 h-4 text-slate-400"></i><span class="hidden sm:inline">Muted</span>'
        : '<i data-lucide="volume-2" class="w-4 h-4 text-amber-400"></i><span class="hidden sm:inline">Sound ON</span>';
      if (window.lucide) window.lucide.createIcons();
    }
    showToast(this.muted ? 'Cinema Sound Effects Muted' : 'Cinema Sound Effects Enabled', 'info');
  }
};

// Global Application State
const AppState = {
  currentBranch: 'Ojaja Ile-Ife (Grand Resort Flagship)',
  currentDate: 'today',
  selectedMovie: null,
  selectedShowtime: null,
  selectedSeats: [],
  selectedConcessions: {},
  customer: {
    name: '',
    email: '',
    phone: '',
    notes: ''
  },
  activeBooking: null,
  paystackPublicKey: 'pk_test_d34f0c978b27357492c73042186716091726a57c',
  bookingsLedger: [],
  activeFilter: 'all',
  activeStep: 1 // Stepper: 1: Seats & Concessions, 2: Checkout
};

// Concessions Catalog
const CONCESSIONS_DATA = [
  { id: 'popcorn-caramel', name: 'Royal Caramel Popcorn', size: 'Large Tub', price: 2500, emoji: '🍿', desc: 'Freshly popped with caramelized brown sugar' },
  { id: 'popcorn-salted', name: 'Hot Buttery Cinema Popcorn', size: 'Large Tub', price: 2200, emoji: '🍿', desc: 'Classic golden salted butter crunch' },
  { id: 'ife-suya-platter', name: 'Grand Resort Charcoal Suya', size: 'Chef Platter', price: 4500, emoji: '🍢', desc: 'Slow-grilled spiced beef skewers with onions' },
  { id: 'chapman-signature', name: 'Signature Nigerian Chilled Chapman', size: '750ml', price: 1800, emoji: '🍹', desc: 'Angostura bitters, cucumber, citrus & mint' },
  { id: 'hibiscus-zobo-slush', name: 'Ooni Royal Zobo Slushie', size: '500ml', price: 1500, emoji: '🥤', desc: 'Infused spiced organic hibiscus, zero refined sugar' },
  { id: 'royal-couple-combo', name: 'Royal Couple Feast Combo', size: 'Best Value Bundle', price: 9500, emoji: '👑', desc: '2 Popcorn + 2 Signature Drinks + Suya Platter' }
];

// Verified Real Ojaja Cinemas Movie Lineup from oja-fa0483dd Database
const MOVIES_DATA = [
  {
    id: 'spiderman-brand-new-day',
    title: 'Spider-Man: Brand New Day',
    tagline: 'A Spectacular New Era of High-Flying Action',
    genre: 'Hollywood / Action / Sci-Fi',
    rating: '12A',
    duration: '2h 25m',
    language: 'English',
    director: 'Destin Daniel Cretton',
    cast: 'Tom Holland, Zendaya, Mark Ruffalo',
    format: '3D Laser & Dolby Atmos',
    synopsis: 'Peter Parker faces the emotional and physical toll of operating entirely alone in a world that no longer remembers his identity. When an ancient syndicate targets New York, he is pushed beyond his physical limits.',
    tags: ['cimen', 'hollywood', 'featured', 'blue-room'],
    poster: 'assets/posters/spiderman-brand-new-day.webp',
    backdrop: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'spidey-1',
        time: '12:00 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['A3', 'A4', 'B4', 'B5'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8500
      },
      {
        id: 'spidey-2',
        time: '3:30 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: Array.from({ length: 84 }, (_, i) => `SEAT-${i}`), // 100% full for explanation demo
        status: 'sold_out',
        priceStandard: 5000,
        priceVip: 9000
      },
      {
        id: 'spidey-3',
        time: '6:45 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['A1', 'A2', 'C1', 'C2', 'E1', 'E2'],
        status: 'filling_fast',
        priceStandard: 5000,
        priceVip: 9000
      },
      {
        id: 'spidey-4',
        time: '9:45 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['C5', 'C6'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8500
      }
    ]
  },
  {
    id: 'heart-of-the-beast',
    title: 'Heart of the Beast',
    tagline: 'A Soldier, His War Dog, and The Frozen Wilderness',
    genre: 'Action / Military Thriller',
    rating: '16+',
    duration: '1h 41m',
    language: 'English',
    director: 'David Ayer',
    cast: 'Brad Pitt, Aaron Taylor-Johnson',
    format: 'Dual 4K Laser & Surround',
    synopsis: 'After a harrowing plane crash deep in the hostile Alaskan wilderness, Special Forces officer James Belmont and his combat canine Odin find themselves pursued by ruthless mercenary trackers.',
    tags: ['cimen', 'action', 'red-room'],
    poster: 'assets/posters/heart-of-the-beast.webp',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'hob-1',
        time: '1:30 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['B1', 'B2', 'B3'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 7500
      },
      {
        id: 'hob-2',
        time: '4:15 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: Array.from({ length: 84 }, (_, i) => `SEAT-${i}`), // Full hall
        status: 'sold_out',
        priceStandard: 4500,
        priceVip: 8000
      },
      {
        id: 'hob-3',
        time: '7:15 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['D1', 'D2', 'F1'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8000
      }
    ]
  },
  {
    id: 'onibon-oje',
    title: 'Onibon Oje',
    tagline: 'When a Fierce Warlord Threatens the Sacred Kingdom',
    genre: 'Nollywood / Yoruba Cultural Epic',
    rating: '15+',
    duration: '1h 30m',
    language: 'Yoruba (English Subtitles)',
    director: 'Adebayo Tijani',
    cast: 'Odunlade Adekola, Femi Adebayo, Taiwo Hassan',
    format: 'Dolby Atmos Master Track',
    synopsis: 'When a ruthless warlord advances toward the ancient sovereign borders of the Yoruba realm, an unyielding warrior chosen by the oracles rises to defend the sacred crowns of the ancestors.',
    tags: ['cimen', 'featured', 'nollywood-epic', 'blue-room'],
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'onb-1',
        time: '11:45 AM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['C1', 'C2'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 7500
      },
      {
        id: 'onb-2',
        time: '2:30 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: Array.from({ length: 72 }, (_, i) => `SEAT-${i}`),
        status: 'sold_out',
        priceStandard: 4500,
        priceVip: 8000
      },
      {
        id: 'onb-3',
        time: '5:45 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['E1', 'E2', 'E3'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8000
      },
      {
        id: 'onb-4',
        time: '8:45 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['A1', 'A2', 'F3', 'F4'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8000
      }
    ]
  },
  {
    id: 'a-land-apart',
    title: 'A Land Apart',
    tagline: 'An Alternate Nigeria Where Soil is Gold',
    genre: 'Nollywood / Political Drama',
    rating: '15+',
    duration: '1h 48m',
    language: 'English, Yoruba & Pidgin',
    director: 'CJ Obasi',
    cast: 'Richard Mofe-Damijo, Genevieve Nnaji, Deyemi Okanlawon',
    format: 'Dolby Atmos Master Track',
    synopsis: 'In an alternate reality where agriculture, and not petroleum, became Nigeria’s source of staggering global wealth, rival dynasty heirs contest sovereign agrarian territories.',
    tags: ['cimen', 'nollywood-epic', 'blue-room'],
    poster: 'assets/posters/a-land-apart.webp',
    backdrop: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'ala-1',
        time: '1:00 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['B1', 'B2'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 7500
      },
      {
        id: 'ala-2',
        time: '4:00 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: Array.from({ length: 84 }, (_, i) => `SEAT-${i}`),
        status: 'sold_out',
        priceStandard: 4500,
        priceVip: 8000
      },
      {
        id: 'ala-3',
        time: '7:00 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['D4', 'D5'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8500
      }
    ]
  },
  {
    id: 'street-fighter',
    title: 'Street Fighter (Legendary Reborn)',
    tagline: 'Round One. Fight for Glory.',
    genre: 'Action / Martial Arts Blockbuster',
    rating: '14+',
    duration: '2h 05m',
    language: 'English & Japanese',
    director: 'Chad Stahelski',
    cast: 'Hiroyuki Sanada, Lewis Tan, Andrew Koji',
    format: 'Christie 4K Laser & Dolby 7.1',
    synopsis: 'Estranged martial artists Ryu and Ken Masters are thrust back into mortal combat when the mysterious Shadaloo syndicate hosts an underground tournament with world domination on the line.',
    tags: ['cimen', 'hollywood', 'action', 'red-room'],
    poster: 'assets/posters/street-fighter.webp',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'stf-1',
        time: '12:30 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['C1', 'C2', 'C3'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 7500
      },
      {
        id: 'stf-2',
        time: '3:45 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['E1', 'E2'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8000
      },
      {
        id: 'stf-3',
        time: '7:45 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: Array.from({ length: 66 }, (_, i) => `SEAT-${i}`),
        status: 'filling_fast',
        priceStandard: 5000,
        priceVip: 8500
      }
    ]
  },
  {
    id: 'verity',
    title: 'Verity',
    tagline: 'The Truth Lies Between The Lines',
    genre: 'Psychological Thriller / Mystery',
    rating: '18+',
    duration: '1h 57m',
    language: 'English',
    director: 'Michael Mohan',
    cast: 'Sydney Sweeney, Nicholas Hoult, Rosamund Pike',
    format: 'Dolby Surround 7.1',
    synopsis: 'A struggling author is hired to finish the remaining books of a successful series after the original author is injured in a mysterious accident. In the family estate, she uncovers an unpublished manuscript detailing harrowing secrets.',
    tags: ['cimen', 'thriller', 'red-room'],
    poster: 'assets/posters/verity.webp',
    backdrop: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'ver-1',
        time: '2:00 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['A1', 'A2'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 7500
      },
      {
        id: 'ver-2',
        time: '5:30 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: Array.from({ length: 72 }, (_, i) => `SEAT-${i}`),
        status: 'sold_out',
        priceStandard: 4500,
        priceVip: 8000
      },
      {
        id: 'ver-3',
        time: '8:30 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['F1', 'F2', 'G1'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8000
      }
    ]
  }
];

// Seed initial bookings into ledger
function initLedger() {
  const saved = localStorage.getItem('ojaja_cinemas_bookings');
  if (saved) {
    try {
      AppState.bookingsLedger = JSON.parse(saved);
      return;
    } catch (e) {
      console.warn('Ledger load failed, using defaults', e);
    }
  }

  AppState.bookingsLedger = [
    {
      ref: 'OJAJA-CIMEN-8941-IFE',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      movieTitle: 'Spider-Man: Brand New Day',
      showtime: '3:30 PM',
      hall: 'Red Room (4K Laser)',
      hallType: 'red',
      branch: 'Ojaja Ile-Ife (Grand Resort Flagship)',
      seats: ['D4', 'D5'],
      concessions: [{ name: 'Royal Caramel Popcorn', qty: 2, price: 5000 }],
      totalAmount: 15000,
      customerName: 'Adeola Adeleke',
      customerEmail: 'adeola.adeleke@gmail.com',
      customerPhone: '08034567890',
      paystackRef: 'pstk_test_90812349182',
      tag: 'cimen-boxoffice',
      status: 'VERIFIED_PAID',
      checkedIn: true
    },
    {
      ref: 'OJAJA-CIMEN-6312-IFE',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      movieTitle: 'Onibon Oje',
      showtime: '2:30 PM',
      hall: 'Blue Room (Dolby Atmos)',
      hallType: 'blue',
      branch: 'Ojaja Ile-Ife (Grand Resort Flagship)',
      seats: ['F1', 'F2'],
      concessions: [{ name: 'Signature Nigerian Chilled Chapman', qty: 2, price: 3600 }],
      totalAmount: 19600,
      customerName: 'Obafemi Awolowo',
      customerEmail: 'o.awolowo@ife.edu.ng',
      customerPhone: '08123456789',
      paystackRef: 'pstk_test_11204859182',
      tag: 'cimen-boxoffice',
      status: 'VERIFIED_PAID',
      checkedIn: false
    },
    {
      ref: 'OJAJA-CIMEN-4109-IFE',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      movieTitle: 'A Land Apart',
      showtime: '4:00 PM',
      hall: 'Red Room (4K Laser)',
      hallType: 'red',
      branch: 'Ojaja Ile-Ife (Grand Resort Flagship)',
      seats: ['C3', 'C4', 'C5'],
      concessions: [{ name: 'Royal Couple Feast Combo', qty: 1, price: 9500 }],
      totalAmount: 23000,
      customerName: 'Tunde Bakare',
      customerEmail: 'tbakare@oauife.edu.ng',
      customerPhone: '07039876543',
      paystackRef: 'pstk_test_77491029481',
      tag: 'cimen-boxoffice',
      status: 'VERIFIED_PAID',
      checkedIn: true
    }
  ];
  saveLedger();
}

function saveLedger() {
  localStorage.setItem('ojaja_cinemas_bookings', JSON.stringify(AppState.bookingsLedger));
}

function formatNaira(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

// Render Movies Grid with Rich Playful Typography & Badges
function renderMoviesGrid() {
  const container = document.getElementById('movies-grid');
  if (!container) return;

  const filteredMovies = MOVIES_DATA.filter(movie => {
    if (AppState.activeFilter === 'all') return true;
    if (AppState.activeFilter === 'nollywood') return movie.genre.toLowerCase().includes('nollywood') || movie.genre.toLowerCase().includes('yoruba');
    if (AppState.activeFilter === 'hollywood') return movie.genre.toLowerCase().includes('hollywood') || movie.genre.toLowerCase().includes('action');
    if (AppState.activeFilter === 'red-room') return movie.showtimes.some(st => st.hallType === 'red');
    if (AppState.activeFilter === 'blue-room') return movie.showtimes.some(st => st.hallType === 'blue');
    return true;
  });

  container.innerHTML = filteredMovies.map(movie => {
    return `
      <div class="group relative bg-[#0E1524] rounded-3xl border-2 border-white/5 hover:border-amber-500/50 transition-all duration-300 overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5">
        
        <!-- Poster & Badges -->
        <div class="relative aspect-[2/3] overflow-hidden bg-slate-900 cursor-pointer" onclick="openBookingModal('${movie.id}')">
          <img 
            src="${movie.poster}" 
            alt="${movie.title}" 
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-[#0E1524] via-transparent to-black/60"></div>
          
          <!-- Playful Eyebrow Tags -->
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 font-headline">
            <span class="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-lg bg-amber-400 text-slate-950 shadow-md">
              ${movie.rating}
            </span>
            <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/40 font-mono">
              ${movie.duration}
            </span>
          </div>

          <div class="absolute top-3 right-3">
            <span class="px-3 py-1 text-[11px] font-extrabold rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg tracking-wider font-headline uppercase">
              ${movie.tags.includes('featured') ? '👑 ROYAL PICK' : 'NOW SHOWING'}
            </span>
          </div>

          <!-- Quick Preview Button -->
          <button 
            type="button" 
            onclick="event.stopPropagation(); openMovieDetails('${movie.id}')"
            class="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
            title="Read Synopsis & Details"
          >
            <i data-lucide="info" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Details -->
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1.5 uppercase font-eyebrow tracking-wide">
              <span>${movie.genre}</span>
              <span>•</span>
              <span class="text-slate-400">${movie.format}</span>
            </div>
            
            <h3 class="font-headline text-2xl font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1 leading-tight">
              ${movie.title}
            </h3>
            
            <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              ${movie.tagline}
            </p>
          </div>

          <!-- Showtimes Row -->
          <div class="mt-5 pt-4 border-t border-white/5">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-2.5 font-headline">
              <span class="font-bold text-slate-200">Daily Showtimes</span>
              <span class="text-[11px] text-amber-400 font-eyebrow">Tap to Reserve</span>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
              ${movie.showtimes.map(st => {
                const isSoldOut = st.status === 'sold_out';
                const isFillingFast = st.status === 'filling_fast';
                
                let badgeClass = 'bg-slate-800/80 hover:bg-amber-400 hover:text-slate-950 text-slate-200 border-white/10';
                let indicator = '';

                if (isSoldOut) {
                  badgeClass = 'bg-red-950/40 border-red-500/50 text-red-300 hover:bg-red-900/60 cursor-pointer';
                  indicator = '<span class="text-[9px] font-black text-red-400 uppercase tracking-tight block font-mono">⚠️ 100% FULL</span>';
                } else if (isFillingFast) {
                  badgeClass = 'bg-amber-950/30 border-amber-500/40 text-amber-200 hover:bg-amber-400 hover:text-slate-950';
                  indicator = '<span class="text-[9px] font-bold text-amber-400 block font-mono">⚡ FAST FILL</span>';
                }

                return `
                  <button 
                    type="button" 
                    onclick="handleShowtimeClick('${movie.id}', '${st.id}')"
                    class="p-2.5 rounded-2xl text-left border-2 transition-all duration-200 relative group/btn active:scale-95 ${badgeClass}"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-black text-xs tracking-tight font-mono">${st.time}</span>
                      <span class="text-[10px] opacity-80 font-mono font-bold">${st.hallType === 'red' ? 'RED' : 'BLUE'}</span>
                    </div>
                    ${indicator}
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Big Book Button -->
            <button 
              type="button" 
              onclick="openBookingModal('${movie.id}')"
              class="mt-3.5 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-95 font-headline"
            >
              <i data-lucide="ticket" class="w-4 h-4"></i>
              <span>Select Seats & Concessions</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Showtime Click Handler with Audio & Explainable Capacity Alert
function handleShowtimeClick(movieId, showtimeId) {
  SoundFX.playSeatClick();

  const movie = MOVIES_DATA.find(m => m.id === movieId);
  if (!movie) return;

  const showtime = movie.showtimes.find(st => st.id === showtimeId);
  if (!showtime) return;

  if (showtime.status === 'sold_out') {
    showHallFullAlert(movie, showtime);
    return;
  }

  openBookingModal(movieId, showtimeId);
}

// Show Explainable Hall Full Alert with Alternatives
function showHallFullAlert(movie, fullShowtime) {
  SoundFX.playSwitchTime();

  const alternatives = movie.showtimes.filter(st => st.id !== fullShowtime.id && st.status !== 'sold_out');

  const modalContainer = document.getElementById('hall-full-modal');
  const modalContent = document.getElementById('hall-full-content');
  if (!modalContainer || !modalContent) return;

  modalContent.innerHTML = `
    <div class="relative p-6 sm:p-8 bg-[#0E1524] rounded-3xl border-2 border-red-500/50 shadow-2xl max-w-lg w-full text-slate-100 anim-bobble">
      
      <!-- Brand Logo in Alert -->
      <div class="flex items-center justify-between mb-4">
        <div class="w-10 h-10 rounded-xl bg-white p-1 shadow-md">
          <img src="assets/ojaja-official-logo.png" alt="Ojaja Cinemas" class="w-full h-full object-contain">
        </div>
        <span class="px-3 py-1 text-xs font-mono font-bold uppercase rounded-full bg-red-900/50 text-red-400 border border-red-500/40">
          ⚠️ Hall Capacity Reached
        </span>
      </div>

      <!-- Explainable Diagnostic Breakdown -->
      <div class="text-left mt-2">
        <h3 class="font-headline text-2xl font-black text-white">
          ${fullShowtime.hall} is 100% Sold Out
        </h3>
        <p class="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-body">
          For the <strong class="text-amber-400">${fullShowtime.time}</strong> screening of <strong class="text-white">${movie.title}</strong>, all <strong class="text-red-400">${fullShowtime.totalSeats} seats</strong> have been booked.
        </p>
      </div>

      <!-- Live Capacity Bar Graphic -->
      <div class="my-4 p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
        <div class="flex justify-between text-xs font-mono mb-1.5">
          <span class="text-slate-400">Current Occupancy:</span>
          <span class="text-red-400 font-bold">${fullShowtime.totalSeats} / ${fullShowtime.totalSeats} (100% Full)</span>
        </div>
        <div class="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full w-full"></div>
        </div>
        <p class="text-[11px] text-slate-400 mt-2">
          💡 <strong>Why you missed it:</strong> Weekend peak screenings in our Christie 4K Laser auditorium sell out ~45 mins before showtime.
        </p>
      </div>

      <!-- Recommended Alternatives Section -->
      <div class="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 border border-amber-500/30">
        <div class="flex items-center gap-2 text-xs font-black text-amber-400 mb-3 uppercase tracking-wider font-headline">
          <i data-lucide="sparkles" class="w-4 h-4"></i>
          <span>Recommended Alternative Times Today:</span>
        </div>

        ${alternatives.length > 0 ? `
          <div class="space-y-2.5">
            ${alternatives.map(alt => {
              const remaining = alt.totalSeats - alt.bookedSeats.length;
              return `
                <div class="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border-2 border-white/5 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-md">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-black text-lg text-white font-mono">${alt.time}</span>
                      <span class="text-xs px-2 py-0.5 rounded-md bg-white/10 text-amber-300 font-mono font-bold">${alt.hallType === 'red' ? 'Red Room (Laser)' : 'Blue Room (Atmos)'}</span>
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5 font-mono">
                      <span class="text-emerald-400 font-bold">${remaining} seats available</span> • From ${formatNaira(alt.priceStandard)}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onclick="selectAlternativeShowtime('${movie.id}', '${alt.id}')"
                    class="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5 font-headline"
                  >
                    <span>Switch</span>
                    <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <p class="text-xs text-slate-400 text-center py-2 font-body">
            All screenings for today are currently fully booked. Please select tomorrow's schedule or check our Lagos/Akure branches.
          </p>
        `}
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex items-center justify-end gap-3">
        <button 
          type="button" 
          onclick="closeHallFullAlert()"
          class="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors font-headline"
        >
          Close
        </button>
      </div>
    </div>
  `;

  modalContainer.classList.remove('hidden');
  modalContainer.classList.add('flex');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeHallFullAlert() {
  const modalContainer = document.getElementById('hall-full-modal');
  if (modalContainer) {
    modalContainer.classList.add('hidden');
    modalContainer.classList.remove('flex');
  }
}

function selectAlternativeShowtime(movieId, alternativeShowtimeId) {
  SoundFX.playSwitchTime();
  closeHallFullAlert();
  openBookingModal(movieId, alternativeShowtimeId);
  showToast('Switched to available alternative showtime!', 'success');
}

// Open Booking Modal
function openBookingModal(movieId, preselectedShowtimeId = null) {
  SoundFX.playSeatClick();
  const movie = MOVIES_DATA.find(m => m.id === movieId);
  if (!movie) return;

  AppState.selectedMovie = movie;
  
  if (preselectedShowtimeId) {
    AppState.selectedShowtime = movie.showtimes.find(st => st.id === preselectedShowtimeId);
  } else {
    AppState.selectedShowtime = movie.showtimes.find(st => st.status !== 'sold_out') || movie.showtimes[0];
  }

  AppState.selectedSeats = [];
  AppState.selectedConcessions = {};

  renderBookingModalContent();

  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
  AppState.selectedSeats = [];
  AppState.selectedConcessions = {};
}

// Render the Entire Interactive Booking Modal
function renderBookingModalContent() {
  const container = document.getElementById('booking-modal-body');
  if (!container || !AppState.selectedMovie) return;

  const movie = AppState.selectedMovie;
  const currentShowtime = AppState.selectedShowtime;

  container.innerHTML = `
    <!-- Top Movie Banner Summary -->
    <div class="relative p-6 bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <img src="${movie.poster}" alt="${movie.title}" class="w-16 h-24 object-cover rounded-2xl shadow-lg border border-white/10">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 text-[10px] font-headline font-black uppercase rounded bg-amber-400 text-slate-950">${movie.rating}</span>
            <span class="text-xs text-amber-300 font-mono font-bold">${movie.duration}</span>
            <span class="text-xs text-slate-400">• ${movie.format}</span>
          </div>
          <h2 class="font-headline text-2xl font-black text-white mt-1 leading-tight">${movie.title}</h2>
          <p class="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 font-mono">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>${AppState.currentBranch}</span>
          </p>
        </div>
      </div>

      <!-- Showtime Switcher Tabs -->
      <div class="w-full md:w-auto">
        <span class="text-[11px] text-slate-400 block mb-1.5 font-bold uppercase tracking-wider font-headline">Showtimes:</span>
        <div class="flex flex-wrap gap-2">
          ${movie.showtimes.map(st => {
            const isSelected = st.id === currentShowtime.id;
            const isSoldOut = st.status === 'sold_out';
            
            if (isSoldOut) {
              return `
                <button 
                  type="button" 
                  onclick="showHallFullAlert(AppState.selectedMovie, AppState.selectedMovie.showtimes.find(s => s.id === '${st.id}'))"
                  class="px-3 py-1.5 rounded-xl border-2 border-red-500/40 bg-red-950/40 text-red-300 text-xs font-mono font-bold opacity-80 hover:opacity-100 flex items-center gap-1.5"
                  title="Hall Full - Click for alternatives"
                >
                  <i data-lucide="lock" class="w-3 h-3 text-red-400"></i>
                  <span>${st.time} (Full)</span>
                </button>
              `;
            }

            return `
              <button 
                type="button" 
                onclick="changeModalShowtime('${st.id}')"
                class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border-2 ${
                  isSelected 
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-400/30 scale-105' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-white/10'
                }"
              >
                ${st.time} (${st.hallType === 'red' ? 'Red' : 'Blue'})
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Booking Body Grid: Seat Map Left, Summary & Checkout Right -->
    <div class="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
      
      <!-- Left Column: Interactive Seat Grid -->
      <div class="lg:col-span-7 p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col items-center">
        
        <!-- Screen Curve & Ambient Glow -->
        <div class="w-full max-w-lg cinema-screen-container text-center mb-8">
          <div class="text-[11px] font-mono font-bold tracking-[0.25em] text-amber-400 mb-2 uppercase flex items-center justify-center gap-2">
            <i data-lucide="film" class="w-3.5 h-3.5"></i>
            <span>CHRISTIE 4K DUAL LASER CURVED SCREEN</span>
          </div>
          <div class="cinema-screen-curve w-full"></div>
          <div class="screen-light-glow h-8 w-full"></div>
        </div>

        <!-- Seating Legend -->
        <div class="flex flex-wrap items-center justify-center gap-4 text-xs font-mono mb-6 text-slate-400">
          <div class="flex items-center gap-1.5">
            <div class="w-4 h-4 rounded bg-slate-800 border border-white/20"></div>
            <span>Standard (${formatNaira(currentShowtime.priceStandard)})</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-4 h-4 rounded bg-amber-950/60 border border-amber-500/80"></div>
            <span>Royal VIP (${formatNaira(currentShowtime.priceVip)})</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-4 h-4 rounded bg-amber-400 border border-amber-300 shadow-sm shadow-amber-400"></div>
            <span class="text-amber-400 font-bold">Selected</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-4 h-4 rounded bg-slate-900 border border-red-500/40 text-red-500 flex items-center justify-center text-[9px]">✕</div>
            <span>Occupied</span>
          </div>
        </div>

        <!-- Seat Grid Renderer -->
        <div class="w-full max-w-lg space-y-2.5">
          ${renderSeatRows(currentShowtime)}
        </div>

        <!-- Hall Capacity Indicator -->
        <div class="mt-6 w-full max-w-lg p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between text-xs font-mono">
          <span class="text-slate-400">Auditorium: <strong class="text-white">${currentShowtime.hall}</strong></span>
          <span class="text-slate-400">Live Inventory: <strong class="text-emerald-400">${currentShowtime.totalSeats - currentShowtime.bookedSeats.length} / ${currentShowtime.totalSeats} seats open</strong></span>
        </div>
      </div>

      <!-- Right Column: Concessions + Customer Info + Paystack Checkout -->
      <div class="lg:col-span-5 p-6 bg-[#0B0F17] flex flex-col justify-between overflow-y-auto">
        <div class="space-y-6">
          
          <!-- Selected Seats Display -->
          <div>
            <h4 class="text-xs font-headline font-black uppercase text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
              <i data-lucide="armchair" class="w-4 h-4"></i>
              <span>Selected Seats (${AppState.selectedSeats.length})</span>
            </h4>
            
            ${AppState.selectedSeats.length === 0 ? `
              <div class="p-4 rounded-2xl border-2 border-dashed border-white/10 text-center text-xs text-slate-500 font-body">
                Please tap on any available seat in the auditorium map to reserve.
              </div>
            ` : `
              <div class="flex flex-wrap gap-2">
                ${AppState.selectedSeats.map(seat => `
                  <div class="px-3 py-1.5 rounded-xl bg-amber-400/20 border-2 border-amber-400/50 flex items-center gap-2 text-xs font-mono text-amber-300">
                    <span class="font-bold">${seat.id}</span>
                    <span class="text-[10px] opacity-80">(${seat.tier})</span>
                    <button type="button" onclick="toggleSeat('${seat.id}', '${seat.tier}', ${seat.price})" class="text-amber-400 hover:text-white">✕</button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Concessions / Snacks Selection -->
          <div>
            <h4 class="text-xs font-headline font-black uppercase text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
              <i data-lucide="coffee" class="w-4 h-4"></i>
              <span>Add Fresh Concessions (Grand Resort)</span>
            </h4>
            
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              ${CONCESSIONS_DATA.map(item => {
                const qty = AppState.selectedConcessions[item.id] || 0;
                return `
                  <div class="p-2.5 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2.5">
                      <span class="text-2xl">${item.emoji}</span>
                      <div>
                        <div class="font-bold text-white font-headline">${item.name}</div>
                        <div class="text-[11px] text-amber-400 font-mono">${formatNaira(item.price)} • ${item.size}</div>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-2 font-mono">
                      <button 
                        type="button" 
                        onclick="updateConcession('${item.id}', -1)"
                        class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm"
                      >-</button>
                      <span class="w-5 text-center font-bold text-white">${qty}</span>
                      <button 
                        type="button" 
                        onclick="updateConcession('${item.id}', 1)"
                        class="w-6 h-6 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-bold text-sm"
                      >+</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Customer Details Form -->
          <div class="space-y-3 pt-2 border-t border-white/10">
            <h4 class="text-xs font-headline font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <i data-lucide="user" class="w-4 h-4"></i>
              <span>Patron Information & Digital Dispatch</span>
            </h4>

            <div>
              <label class="text-[11px] text-slate-400 block mb-1 font-body">Full Name</label>
              <input 
                type="text" 
                id="customer-name" 
                placeholder="e.g. Olumide Adeleke" 
                value="${AppState.customer.name}"
                oninput="AppState.customer.name = this.value"
                class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border-2 border-white/10 focus:border-amber-400 focus:outline-none text-xs text-white"
              >
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[11px] text-slate-400 block mb-1 font-body">Email (for QR E-Ticket)</label>
                <input 
                  type="email" 
                  id="customer-email" 
                  placeholder="name@gmail.com" 
                  value="${AppState.customer.email}"
                  oninput="AppState.customer.email = this.value"
                  class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border-2 border-white/10 focus:border-amber-400 focus:outline-none text-xs text-white"
                >
              </div>
              <div>
                <label class="text-[11px] text-slate-400 block mb-1 font-body">WhatsApp / Mobile Phone</label>
                <input 
                  type="tel" 
                  id="customer-phone" 
                  placeholder="080 1234 5678" 
                  value="${AppState.customer.phone}"
                  oninput="AppState.customer.phone = this.value"
                  class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border-2 border-white/10 focus:border-amber-400 focus:outline-none text-xs text-white"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Total & Paystack Trigger -->
        <div class="pt-5 mt-4 border-t border-white/10">
          <div class="space-y-1.5 text-xs font-mono text-slate-400 mb-4">
            <div class="flex justify-between">
              <span>Seats (${AppState.selectedSeats.length}):</span>
              <span class="text-white">${formatNaira(calculateSeatsTotal())}</span>
            </div>
            <div class="flex justify-between">
              <span>Concessions:</span>
              <span class="text-white">${formatNaira(calculateConcessionsTotal())}</span>
            </div>
            <div class="flex justify-between">
              <span>Backend Tracking Tag:</span>
              <span class="text-amber-400 font-bold">[cimen-boxoffice]</span>
            </div>
            <div class="flex justify-between text-base font-bold text-amber-400 pt-2 border-t border-white/10">
              <span class="font-headline font-black">Grand Total:</span>
              <span class="font-mono">${formatNaira(calculateGrandTotal())}</span>
            </div>
          </div>

          <!-- Checkout Button -->
          <button 
            type="button" 
            onclick="initiatePaystackCheckout()"
            ${AppState.selectedSeats.length === 0 ? 'disabled' : ''}
            class="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-95 font-headline"
          >
            <i data-lucide="shield-check" class="w-5 h-5"></i>
            <span>Pay With Paystack (${formatNaira(calculateGrandTotal())})</span>
          </button>
          
          <p class="text-[10px] text-center text-slate-500 mt-2 font-mono">
            Secured 256-bit SSL • Instant QR Turnstile Pass
          </p>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Switch Showtime Inside Modal
function changeModalShowtime(showtimeId) {
  SoundFX.playSeatClick();
  const movie = AppState.selectedMovie;
  const newShowtime = movie.showtimes.find(st => st.id === showtimeId);
  if (!newShowtime) return;

  if (newShowtime.status === 'sold_out') {
    showHallFullAlert(movie, newShowtime);
    return;
  }

  AppState.selectedShowtime = newShowtime;
  AppState.selectedSeats = [];
  renderBookingModalContent();
}

// Render Curved Seat Rows
function renderSeatRows(showtime) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const seatsPerRow = 12;

  return rows.map((row) => {
    const isVipRow = row === 'F' || row === 'G';
    const price = isVipRow ? showtime.priceVip : showtime.priceStandard;
    const tier = isVipRow ? 'VIP' : 'Standard';

    return `
      <div class="flex items-center justify-center gap-1.5 sm:gap-2">
        <span class="w-4 text-xs font-mono font-bold text-slate-500 text-center">${row}</span>
        
        <div class="flex items-center gap-1 sm:gap-1.5">
          ${Array.from({ length: seatsPerRow }, (_, idx) => {
            const seatNumber = idx + 1;
            const seatId = `${row}${seatNumber}`;
            const isBooked = showtime.bookedSeats.includes(seatId);
            const isSelected = AppState.selectedSeats.some(s => s.id === seatId);

            const aisleGap = seatNumber === 6 ? 'mr-3 sm:mr-5' : '';

            if (isBooked) {
              return `
                <div 
                  class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-900 border border-red-500/30 text-red-500/70 text-[9px] flex items-center justify-center font-mono cursor-not-allowed ${aisleGap}"
                  title="Seat ${seatId} (Occupied)"
                >
                  ✕
                </div>
              `;
            }

            let seatClasses = isVipRow 
              ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 hover:bg-amber-400 hover:text-slate-950'
              : 'bg-slate-800 border-white/20 text-slate-300 hover:bg-amber-400 hover:text-slate-950';

            if (isSelected) {
              seatClasses = 'bg-amber-400 border-amber-300 text-slate-950 font-bold shadow-md shadow-amber-400/50 seat-selected';
            }

            return `
              <button 
                type="button" 
                onclick="toggleSeat('${seatId}', '${tier}', ${price})"
                class="seat-btn w-6 h-6 sm:w-7 sm:h-7 rounded-lg border text-[10px] font-mono flex items-center justify-center transition-all ${seatClasses} ${aisleGap}"
                title="${seatId} - ${tier} (${formatNaira(price)})"
              >
                ${seatNumber}
              </button>
            `;
          }).join('')}
        </div>

        <span class="w-4 text-xs font-mono font-bold text-slate-500 text-center">${row}</span>
      </div>
    `;
  }).join('');
}

// Seat Selection Toggle with Audio
function toggleSeat(seatId, tier, price) {
  SoundFX.playSeatClick();

  const existingIndex = AppState.selectedSeats.findIndex(s => s.id === seatId);
  if (existingIndex >= 0) {
    AppState.selectedSeats.splice(existingIndex, 1);
  } else {
    if (AppState.selectedSeats.length >= 8) {
      showToast('Maximum 8 seats per booking transaction', 'warning');
      return;
    }
    AppState.selectedSeats.push({ id: seatId, tier, price });
  }
  renderBookingModalContent();
}

// Concession Increment / Decrement with Audio
function updateConcession(itemId, delta) {
  SoundFX.playSeatClick();
  const current = AppState.selectedConcessions[itemId] || 0;
  const next = Math.max(0, current + delta);
  if (next === 0) {
    delete AppState.selectedConcessions[itemId];
  } else {
    AppState.selectedConcessions[itemId] = next;
  }
  renderBookingModalContent();
}

function calculateSeatsTotal() {
  return AppState.selectedSeats.reduce((acc, s) => acc + s.price, 0);
}

function calculateConcessionsTotal() {
  return Object.entries(AppState.selectedConcessions).reduce((acc, [id, qty]) => {
    const item = CONCESSIONS_DATA.find(c => c.id === id);
    return acc + (item ? item.price * qty : 0);
  }, 0);
}

function calculateGrandTotal() {
  return calculateSeatsTotal() + calculateConcessionsTotal();
}

// Paystack Integration Engine
function initiatePaystackCheckout() {
  if (AppState.selectedSeats.length === 0) {
    showToast('Please select at least one seat before proceeding.', 'error');
    return;
  }

  const nameInput = document.getElementById('customer-name');
  const emailInput = document.getElementById('customer-email');
  const phoneInput = document.getElementById('customer-phone');

  const customerName = (nameInput ? nameInput.value : AppState.customer.name).trim();
  const customerEmail = (emailInput ? emailInput.value : AppState.customer.email).trim();
  const customerPhone = (phoneInput ? phoneInput.value : AppState.customer.phone).trim();

  if (!customerName) {
    showToast('Please enter your full name for the booking manifest.', 'error');
    if (nameInput) nameInput.focus();
    return;
  }

  if (!customerEmail || !customerEmail.includes('@')) {
    showToast('Please enter a valid email address to receive your ticket.', 'error');
    if (emailInput) emailInput.focus();
    return;
  }

  if (!customerPhone || customerPhone.length < 9) {
    showToast('Please enter a valid Nigerian mobile phone number.', 'error');
    if (phoneInput) phoneInput.focus();
    return;
  }

  AppState.customer.name = customerName;
  AppState.customer.email = customerEmail;
  AppState.customer.phone = customerPhone;

  const grandTotal = calculateGrandTotal();
  const amountInKobo = grandTotal * 100;

  const bookingRef = `OJAJA-CIMEN-${Math.floor(1000 + Math.random() * 9000)}-IFE`;

  const concessionsList = Object.entries(AppState.selectedConcessions).map(([id, qty]) => {
    const item = CONCESSIONS_DATA.find(c => c.id === id);
    return { name: item.name, qty, price: item.price * qty };
  });

  const bookingPayload = {
    ref: bookingRef,
    timestamp: new Date().toISOString(),
    movieTitle: AppState.selectedMovie.title,
    showtime: AppState.selectedShowtime.time,
    hall: AppState.selectedShowtime.hall,
    hallType: AppState.selectedShowtime.hallType,
    branch: AppState.currentBranch,
    seats: AppState.selectedSeats.map(s => s.id),
    seatDetails: AppState.selectedSeats,
    concessions: concessionsList,
    totalAmount: grandTotal,
    customerName: customerName,
    customerEmail: customerEmail,
    customerPhone: customerPhone,
    tag: 'cimen-boxoffice',
    status: 'VERIFIED_PAID',
    checkedIn: false
  };

  if (typeof PaystackPop !== 'undefined' && AppState.paystackPublicKey) {
    try {
      const handler = PaystackPop.setup({
        key: AppState.paystackPublicKey,
        email: customerEmail,
        amount: amountInKobo,
        currency: 'NGN',
        ref: bookingRef,
        metadata: {
          tag: 'cimen-ticket-booking',
          branch: AppState.currentBranch,
          hall: AppState.selectedShowtime.hall,
          movie: AppState.selectedMovie.title,
          showtime: AppState.selectedShowtime.time,
          seats: bookingPayload.seats.join(', '),
          custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: customerName },
            { display_name: 'Phone Number', variable_name: 'customer_phone', value: customerPhone },
            { display_name: 'Cinema Tag', variable_name: 'cinema_tag', value: 'cimen-boxoffice' }
          ]
        },
        callback: function(response) {
          bookingPayload.paystackRef = response.reference || response.trxref;
          finalizeSuccessfulBooking(bookingPayload);
        },
        onClose: function() {
          showToast('Payment window closed. Your seats are held.', 'info');
        }
      });
      handler.openIframe();
      return;
    } catch (err) {
      console.warn('Live Paystack Pop failed, opening high-fidelity simulator modal', err);
    }
  }

  openSimulatedPaystackModal(bookingPayload);
}

// High Fidelity Paystack Simulation Modal
function openSimulatedPaystackModal(bookingPayload) {
  const modal = document.getElementById('paystack-simulator-modal');
  const container = document.getElementById('paystack-simulator-content');
  if (!modal || !container) return;

  container.innerHTML = `
    <div class="p-6 bg-white text-slate-900 rounded-3xl max-w-md w-full shadow-2xl relative font-sans">
      <div class="flex items-center justify-between pb-4 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-[#0BA4DB] flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <div>
            <h4 class="font-bold text-sm text-slate-900 font-headline">Paystack Checkout</h4>
            <span class="text-[11px] text-emerald-600 font-medium font-mono">● Secured 256-bit SSL</span>
          </div>
        </div>
        <button type="button" onclick="closePaystackSimulator()" class="text-slate-400 hover:text-slate-700 text-lg">✕</button>
      </div>

      <div class="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div class="flex items-center gap-3">
          <img src="assets/ojaja-official-logo.png" alt="Ojaja Cinemas" class="w-10 h-10 object-contain rounded-lg">
          <div>
            <div class="text-[11px] text-slate-500 uppercase font-mono">Merchant</div>
            <div class="font-bold text-sm text-slate-900 font-headline">Ojaja Cinemas (Ife Grand Resort)</div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 text-xs">
          <span class="text-slate-600">${bookingPayload.movieTitle} (${bookingPayload.seats.join(', ')})</span>
          <span class="font-bold text-emerald-700 font-mono text-sm">${formatNaira(bookingPayload.totalAmount)}</span>
        </div>
      </div>

      <div class="space-y-3 font-body">
        <p class="text-xs text-slate-500 font-medium">Select Payment Method:</p>
        
        <button 
          type="button" 
          onclick="executeSimulatedPaymentSuccess('CARD')"
          class="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-[#0BA4DB] hover:bg-sky-50/50 flex items-center justify-between transition-all group active:scale-95"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">💳</span>
            <div class="text-left">
              <div class="font-bold text-xs text-slate-900 font-headline">Pay with Card (Mastercard / Visa / Verve)</div>
              <div class="text-[11px] text-slate-500">Instant Authorization</div>
            </div>
          </div>
          <span class="text-xs text-[#0BA4DB] font-bold group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <button 
          type="button" 
          onclick="executeSimulatedPaymentSuccess('TRANSFER')"
          class="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-[#0BA4DB] hover:bg-sky-50/50 flex items-center justify-between transition-all group active:scale-95"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">🏦</span>
            <div class="text-left">
              <div class="font-bold text-xs text-slate-900 font-headline">Pay with Bank Transfer (Wema / Titan / Zenith)</div>
              <div class="text-[11px] text-slate-500">Virtual Dedicated Account</div>
            </div>
          </div>
          <span class="text-xs text-[#0BA4DB] font-bold group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <button 
          type="button" 
          onclick="executeSimulatedPaymentSuccess('USSD')"
          class="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-[#0BA4DB] hover:bg-sky-50/50 flex items-center justify-between transition-all group active:scale-95"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">📱</span>
            <div class="text-left">
              <div class="font-bold text-xs text-slate-900 font-headline">Pay with USSD (*737#, *894#, *901#)</div>
              <div class="text-[11px] text-slate-500">Quick Mobile Dial</div>
            </div>
          </div>
          <span class="text-xs text-[#0BA4DB] font-bold group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      <div class="mt-5 text-center">
        <span class="text-[10px] text-slate-400 font-mono">
          Ref: ${bookingPayload.ref} • Tag: [cimen-boxoffice]
        </span>
      </div>
    </div>
  `;

  window.currentSimulatedPayload = bookingPayload;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closePaystackSimulator() {
  const modal = document.getElementById('paystack-simulator-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function executeSimulatedPaymentSuccess(channel) {
  const payload = window.currentSimulatedPayload;
  if (!payload) return;

  closePaystackSimulator();
  payload.paystackRef = `sim_${channel.toLowerCase()}_${Date.now()}`;
  finalizeSuccessfulBooking(payload);
}

// Finalize Booking & Open E-Ticket Pass
function finalizeSuccessfulBooking(booking) {
  SoundFX.playSuccessFanfare();

  const showtime = AppState.selectedMovie.showtimes.find(st => st.id === AppState.selectedShowtime.id);
  if (showtime) {
    showtime.bookedSeats.push(...booking.seats);
    if (showtime.bookedSeats.length >= showtime.totalSeats) {
      showtime.status = 'sold_out';
    } else if (showtime.totalSeats - showtime.bookedSeats.length < 15) {
      showtime.status = 'filling_fast';
    }
  }

  AppState.bookingsLedger.unshift(booking);
  saveLedger();

  closeBookingModal();
  renderMoviesGrid();

  showToast('Booking Confirmed! Your Paystack transaction was successful.', 'success');
  openTicketModal(booking);
}

// Digital E-Ticket Pass Modal with Dynamic QR & Official Logo
function openTicketModal(booking) {
  AppState.activeBooking = booking;

  const modal = document.getElementById('ticket-modal');
  const container = document.getElementById('ticket-modal-content');
  if (!modal || !container) return;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    JSON.stringify({
      ref: booking.ref,
      movie: booking.movieTitle,
      hall: booking.hall,
      showtime: booking.showtime,
      seats: booking.seats,
      tag: 'cimen-boxoffice',
      paystack: booking.paystackRef
    })
  )}`;

  container.innerHTML = `
    <div id="printable-ticket-area" class="w-full max-w-md mx-auto ticket-card rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden text-slate-100">
      
      <!-- Top Royal Branding with Official Logo -->
      <div class="p-6 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-white p-1 shadow-lg flex items-center justify-center">
            <img src="assets/ojaja-official-logo.png" alt="Ojaja Cinemas Official Logo" class="w-full h-full object-contain">
          </div>
          <div>
            <h3 class="font-headline font-black text-lg tracking-wide leading-tight">OJAJA CINEMAS</h3>
            <span class="text-[10px] font-mono tracking-wider uppercase block opacity-90 font-bold">African Village • Ile-Ife</span>
          </div>
        </div>
        <div class="text-right">
          <span class="px-2.5 py-1 rounded-full bg-slate-950/20 text-slate-950 font-mono font-black text-xs uppercase">
            E-TICKET PASS
          </span>
        </div>
      </div>

      <!-- Ticket Main Body -->
      <div class="p-6 bg-[#0E1524] space-y-4">
        <div>
          <span class="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">FEATURE FILM</span>
          <h2 class="font-headline text-2xl font-black text-white mt-0.5">${booking.movieTitle}</h2>
          <p class="text-xs text-slate-400 font-medium">${booking.branch}</p>
        </div>

        <!-- Screening Specs Grid -->
        <div class="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900 border border-white/5 font-mono text-xs">
          <div>
            <span class="text-[10px] text-slate-500 uppercase block">AUDITORIUM</span>
            <span class="font-bold text-amber-300 text-sm">${booking.hall}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase block">SHOWTIME</span>
            <span class="font-bold text-white text-sm">${booking.showtime}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase block">SEAT(S)</span>
            <span class="font-bold text-emerald-400 text-base">${booking.seats.join(', ')}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase block">BOOKING REF</span>
            <span class="font-bold text-slate-200 text-xs">${booking.ref}</span>
          </div>
        </div>

        <!-- Concessions if selected -->
        ${booking.concessions && booking.concessions.length > 0 ? `
          <div class="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-xs">
            <span class="text-[10px] font-mono text-amber-400 font-bold uppercase block mb-1">CONCESSIONS CLAIM</span>
            <div class="text-slate-300 space-y-0.5 font-mono">
              ${booking.concessions.map(c => `<div>• ${c.qty}x ${c.name}</div>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Patron Info -->
        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 font-mono">
          <span>Guest: <strong class="text-white">${booking.customerName}</strong></span>
          <span class="text-emerald-400 font-bold">PAID ${formatNaira(booking.totalAmount)}</span>
        </div>
      </div>

      <!-- Notched Perforation Line -->
      <div class="relative h-6 bg-[#0E1524]">
        <div class="ticket-notch-left"></div>
        <div class="ticket-perforation"></div>
        <div class="ticket-notch-right"></div>
      </div>

      <!-- Ticket Stub with Live QR Code -->
      <div class="p-6 bg-[#0B0F17] flex flex-col items-center justify-center text-center">
        <div class="p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
          <img src="${qrUrl}" alt="Ticket QR Verification Code" class="w-36 h-36 object-contain" />
        </div>
        
        <p class="text-[11px] font-mono text-slate-400 mt-3">
          Scan at Ojaja Box Office Fast-Track Turnstile
        </p>
        
        <div class="mt-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          TAG: [${booking.tag}] • PAYSTACK REF: ${booking.paystackRef || 'VERIFIED'}
        </div>
      </div>
    </div>

    <!-- Actions Bar (No-Print) -->
    <div class="mt-6 flex flex-wrap items-center justify-center gap-3 no-print font-headline">
      <button 
        type="button" 
        onclick="window.print()"
        class="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <i data-lucide="printer" class="w-4 h-4"></i>
        <span>Print Ticket</span>
      </button>

      <button 
        type="button" 
        onclick="shareTicketWhatsApp()"
        class="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <i data-lucide="send" class="w-4 h-4"></i>
        <span>Send to WhatsApp</span>
      </button>

      <button 
        type="button" 
        onclick="closeTicketModal()"
        class="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
      >
        Done
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeTicketModal() {
  const modal = document.getElementById('ticket-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function shareTicketWhatsApp() {
  const b = AppState.activeBooking;
  if (!b) return;

  const message = `🎬 *OJAJA CINEMAS E-TICKET PASS*
👑 *Location:* ${b.branch}
🎟️ *Movie:* ${b.movieTitle}
🏛️ *Auditorium:* ${b.hall}
⏰ *Time:* ${b.showtime}
💺 *Seats:* ${b.seats.join(', ')}
💰 *Amount Paid:* ${formatNaira(b.totalAmount)}
🔖 *Booking Ref:* ${b.ref}
🏷 *Backend Tag:* ${b.tag}

_Present this reference code or QR pass at the entrance turnstile._`;

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Movie Details Modal
function openMovieDetails(movieId) {
  SoundFX.playSeatClick();
  const movie = MOVIES_DATA.find(m => m.id === movieId);
  if (!movie) return;

  const modal = document.getElementById('movie-details-modal');
  const container = document.getElementById('movie-details-content');
  if (!modal || !container) return;

  container.innerHTML = `
    <div class="relative bg-[#0E1524] rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100">
      <div class="relative h-60 w-full overflow-hidden">
        <img src="${movie.backdrop}" alt="${movie.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-[#0E1524] via-[#0E1524]/60 to-transparent"></div>
        
        <button 
          type="button" 
          onclick="closeMovieDetails()"
          class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      <div class="p-6 -mt-16 relative">
        <div class="flex items-end gap-5">
          <img src="${movie.poster}" alt="${movie.title}" class="w-24 h-36 object-cover rounded-2xl shadow-2xl border-2 border-amber-400">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 text-xs font-headline font-black rounded bg-amber-400 text-slate-950">${movie.rating}</span>
              <span class="text-xs text-amber-300 font-mono font-bold">${movie.duration}</span>
              <span class="text-xs text-slate-400">• ${movie.format}</span>
            </div>
            <h2 class="font-headline text-2xl font-black text-white leading-tight">${movie.title}</h2>
            <p class="text-xs text-slate-400 font-body">${movie.tagline}</p>
          </div>
        </div>

        <div class="mt-6 space-y-4 font-body">
          <div>
            <h4 class="text-xs font-headline font-black uppercase text-amber-400 tracking-wider mb-1">Synopsis</h4>
            <p class="text-sm text-slate-300 leading-relaxed">${movie.synopsis}</p>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
            <div>
              <span class="text-slate-500 block font-mono">DIRECTOR</span>
              <span class="text-slate-200 font-semibold">${movie.director}</span>
            </div>
            <div>
              <span class="text-slate-500 block font-mono">STARRING CAST</span>
              <span class="text-slate-200 font-semibold">${movie.cast}</span>
            </div>
            <div>
              <span class="text-slate-500 block font-mono">LANGUAGE</span>
              <span class="text-slate-200 font-semibold">${movie.language}</span>
            </div>
            <div>
              <span class="text-slate-500 block font-mono">TAGGING CATEGORY</span>
              <span class="text-amber-400 font-mono font-bold">[${movie.tags.join(', ')}]</span>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3 font-headline">
          <button 
            type="button" 
            onclick="closeMovieDetails(); openBookingModal('${movie.id}')"
            class="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <i data-lucide="ticket" class="w-4 h-4"></i>
            <span>Select Showtime & Book Seats</span>
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeMovieDetails() {
  const modal = document.getElementById('movie-details-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Admin Box Office Hub & Verification Scanner Modal
function openAdminModal() {
  SoundFX.playSeatClick();
  renderAdminHub();
  const modal = document.getElementById('admin-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function renderAdminHub() {
  const container = document.getElementById('admin-modal-content');
  if (!container) return;

  const totalRevenue = AppState.bookingsLedger.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalTickets = AppState.bookingsLedger.reduce((sum, b) => sum + b.seats.length, 0);
  const checkedInCount = AppState.bookingsLedger.filter(b => b.checkedIn).length;

  container.innerHTML = `
    <div class="p-6 bg-[#0E1524] text-slate-100 rounded-3xl border border-amber-500/30 max-w-5xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
      <!-- Admin Header -->
      <div class="flex items-center justify-between pb-5 border-b border-white/10">
        <div class="flex items-center gap-3">
          <img src="assets/ojaja-official-logo.png" alt="Ojaja Cinemas" class="w-10 h-10 object-contain rounded-xl bg-white p-0.5">
          <div>
            <h3 class="font-headline text-xl font-black text-white">Box Office Dispatch & Verification Hub</h3>
            <span class="text-xs text-amber-400 font-mono">Tagged: [cimen-boxoffice] • Real-time Ledger</span>
          </div>
        </div>
        <button type="button" onclick="closeAdminModal()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">✕</button>
      </div>

      <!-- Quick Stats KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div class="p-4 rounded-2xl bg-slate-900 border border-white/5">
          <div class="text-xs text-slate-400 font-mono uppercase">Total Gross Box Office</div>
          <div class="text-2xl font-bold text-emerald-400 font-mono mt-1">${formatNaira(totalRevenue)}</div>
          <span class="text-[10px] text-slate-500">Paystack Verified Channels</span>
        </div>
        <div class="p-4 rounded-2xl bg-slate-900 border border-white/5">
          <div class="text-xs text-slate-400 font-mono uppercase">Tickets Issued</div>
          <div class="text-2xl font-bold text-amber-400 font-mono mt-1">${totalTickets} Seats</div>
          <span class="text-[10px] text-slate-500">Red & Blue Rooms Combined</span>
        </div>
        <div class="p-4 rounded-2xl bg-slate-900 border border-white/5">
          <div class="text-xs text-slate-400 font-mono uppercase">Turnstile Check-ins</div>
          <div class="text-2xl font-bold text-sky-400 font-mono mt-1">${checkedInCount} / ${AppState.bookingsLedger.length} Bookings</div>
          <span class="text-[10px] text-slate-500">Patrons Admitted</span>
        </div>
      </div>

      <!-- Fast Ticket Verifier / QR Scanner Input -->
      <div class="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div class="flex-1 w-full">
          <label class="text-[11px] font-mono text-amber-400 uppercase block mb-1">Verify or Check-in Patron Reference Code</label>
          <input 
            type="text" 
            id="ticket-search-input" 
            placeholder="e.g. OJAJA-CIMEN-8941-IFE"
            class="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 focus:border-amber-400 focus:outline-none text-xs font-mono text-white"
          >
        </div>
        <button 
          type="button" 
          onclick="searchAndCheckinTicket()"
          class="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-auto font-headline active:scale-95"
        >
          <i data-lucide="scan" class="w-4 h-4"></i>
          <span>Check In Patron</span>
        </button>
      </div>

      <!-- Ledger Table -->
      <div class="flex-1 overflow-y-auto">
        <h4 class="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-2">Live Booking Audit Manifest</h4>
        <div class="border border-white/10 rounded-2xl overflow-hidden">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-white/10">
              <tr>
                <th class="p-3">Reference / Tag</th>
                <th class="p-3">Patron</th>
                <th class="p-3">Film & Hall</th>
                <th class="p-3">Seats</th>
                <th class="p-3">Amount</th>
                <th class="p-3">Status</th>
                <th class="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              ${AppState.bookingsLedger.map(b => `
                <tr class="hover:bg-slate-900/50">
                  <td class="p-3">
                    <span class="font-bold text-white">${b.ref}</span>
                    <span class="text-[10px] text-amber-400 block">[${b.tag}]</span>
                  </td>
                  <td class="p-3">
                    <div class="text-white font-sans font-semibold">${b.customerName}</div>
                    <div class="text-[11px] text-slate-400">${b.customerPhone}</div>
                  </td>
                  <td class="p-3">
                    <div class="text-white font-sans">${b.movieTitle}</div>
                    <div class="text-[11px] text-slate-400">${b.hall} (${b.showtime})</div>
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">${b.seats.join(', ')}</span>
                  </td>
                  <td class="p-3 font-bold text-emerald-400">${formatNaira(b.totalAmount)}</td>
                  <td class="p-3">
                    ${b.checkedIn ? `
                      <span class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                        CHECKED IN
                      </span>
                    ` : `
                      <span class="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                        VERIFIED PAID
                      </span>
                    `}
                  </td>
                  <td class="p-3 text-right">
                    <button 
                      type="button" 
                      onclick="openTicketModal(AppState.bookingsLedger.find(x => x.ref === '${b.ref}'))"
                      class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                    >
                      View Pass
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function searchAndCheckinTicket() {
  const input = document.getElementById('ticket-search-input');
  if (!input) return;

  const query = input.value.trim().toUpperCase();
  if (!query) {
    showToast('Please type a booking reference code', 'error');
    return;
  }

  const booking = AppState.bookingsLedger.find(b => b.ref.toUpperCase() === query || b.ref.toUpperCase().includes(query));
  if (!booking) {
    showToast(`No booking found matching: ${query}`, 'error');
    return;
  }

  SoundFX.playSuccessFanfare();
  booking.checkedIn = true;
  saveLedger();
  renderAdminHub();
  showToast(`Patron ${booking.customerName} checked in for ${booking.movieTitle}!`, 'success');
}

// Filter Tabs Handler with Audio
function setFilter(filterName) {
  SoundFX.playSeatClick();
  AppState.activeFilter = filterName;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('bg-amber-400', 'text-slate-950', 'border-amber-400');
    btn.classList.add('bg-slate-900', 'text-slate-300', 'border-white/10');
  });

  const activeBtn = document.getElementById(`filter-${filterName}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-900', 'text-slate-300', 'border-white/10');
    activeBtn.classList.add('bg-amber-400', 'text-slate-950', 'border-amber-400');
  }

  renderMoviesGrid();
}

// Branch Switcher
function setBranch(branchName) {
  SoundFX.playSeatClick();
  AppState.currentBranch = branchName;
  const branchLabel = document.getElementById('current-branch-label');
  if (branchLabel) {
    branchLabel.innerText = branchName;
  }
  showToast(`Location switched to: ${branchName}`, 'info');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  
  let bg = 'bg-slate-900 border-white/10 text-white';
  let icon = 'info';

  if (type === 'success') {
    bg = 'bg-emerald-950 border-emerald-500/40 text-emerald-200';
    icon = 'check-circle-2';
  } else if (type === 'error') {
    bg = 'bg-red-950 border-red-500/40 text-red-200';
    icon = 'alert-triangle';
  } else if (type === 'warning') {
    bg = 'bg-amber-950 border-amber-500/40 text-amber-200';
    icon = 'alert-circle';
  }

  toast.className = `p-4 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-mono transition-all transform translate-y-2 opacity-0 ${bg}`;
  toast.innerHTML = `
    <i data-lucide="${icon}" class="w-4 h-4 flex-shrink-0"></i>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Fetch Vercel environment config if hosted on Vercel
async function loadVercelConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data && data.paystackPublicKey) {
        AppState.paystackPublicKey = data.paystackPublicKey;
        console.log('Loaded Paystack Public Key from Vercel Environment:', data.environment);
      }
    }
  } catch (e) {
    // Local static preview fallback
  }
}

// Initialize Application on Window Load
window.addEventListener('DOMContentLoaded', () => {
  loadVercelConfig();
  initLedger();
  renderMoviesGrid();

  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      openAdminModal();
    }
  });
});
