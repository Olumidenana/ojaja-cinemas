/**
 * OJAJA CINEMAS — Core Application & Booking Engine
 * Flagship Location: African Village, Ife Grand Resort & Industrial Hub, Ile-Ife, Osun State
 * Sub-branches: Lagos (Ajah) | Akure
 * Integration: Paystack Inline (NGN Kobo) + Real-time Hall Capacity Intelligence
 * Backend Tagging: [cimen], [cimen-boxoffice], [cimen-online-reservation]
 */

// Global Application State
const AppState = {
  currentBranch: 'Ife Grand Resort (Flagship)',
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
  paystackPublicKey: 'pk_test_d34f0c978b27357492c73042186716091726a57c', // Fallback test key
  useSimulatedPaymentIfKeyFails: true,
  bookingsLedger: [],
  activeFilter: 'all'
};

// Concessions Catalog
const CONCESSIONS_DATA = [
  { id: 'popcorn-caramel', name: 'Royal Caramel Popcorn', size: 'Large Tub', price: 2500, emoji: '🍿' },
  { id: 'popcorn-salted', name: 'Hot Buttery Cinema Popcorn', size: 'Large Tub', price: 2200, emoji: '🍿' },
  { id: 'ife-suya-platter', name: 'Grand Resort Charcoal Suya Platter', size: 'Special', price: 4500, emoji: '🍢' },
  { id: 'chapman-signature', name: 'Signature Nigerian Chilled Chapman', size: '750ml', price: 1800, emoji: '🍹' },
  { id: 'hibiscus-zobo-slush', name: 'Ooni Royal Zobo Slushie (Zero Sugar)', size: '500ml', price: 1500, emoji: '🥤' },
  { id: 'royal-couple-combo', name: 'Royal Duo Combo (2 Popcorn + 2 Drinks + Suya)', size: 'Bundle', price: 9500, emoji: '👑' }
];

// Movies Lineup with Showtimes & Seat Capacities
const MOVIES_DATA = [
  {
    id: 'ori-rebirth',
    title: 'Ori: Rebirth',
    tagline: 'Fate, Mysticism & The Echoes of Ancestral Destiny',
    genre: 'Nollywood / Mysticism / Drama',
    rating: '16+',
    duration: '2h 15m',
    language: 'Yoruba & English (Subtitled)',
    director: 'Tope Adebayo',
    cast: 'Lateef Adedimeji, Femi Adebayo, Bimbo Ademoye',
    format: '4K Laser & Dolby Atmos',
    synopsis: 'A high-flying Lagos urban architect inherits a sacred ancestral medallion from Ile-Ife. As strange visions of ancient Yoruba royalty disrupt his modern life, he must return to the Source to confront a destiny written before his birth.',
    tags: ['cimen', 'featured', 'nollywood-epic', 'red-room'],
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'ori-1',
        time: '1:15 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['A3', 'A4', 'B5', 'C6', 'D7', 'E2'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 7500
      },
      {
        id: 'ori-2',
        time: '4:00 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: Array.from({ length: 84 }, (_, i) => `SEAT-${i}`), // 100% full to showcase alternative times
        status: 'sold_out',
        priceStandard: 4500,
        priceVip: 8000
      },
      {
        id: 'ori-3',
        time: '6:30 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'E1', 'E2', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2'],
        status: 'filling_fast',
        priceStandard: 4500,
        priceVip: 8500
      },
      {
        id: 'ori-4',
        time: '9:15 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['C4', 'C5', 'F2'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 7500
      }
    ]
  },
  {
    id: 'agbaranla-return',
    title: 'Agbaranla: The Return',
    tagline: 'The Mount Zion Cinematic Saga Reborn with Power',
    genre: 'Faith Blockbuster / Supernatural Thriller',
    rating: '13+',
    duration: '2h 28m',
    language: 'English & Yoruba',
    director: 'Damilola Mike-Bamiloye',
    cast: 'Mike Bamiloye, Gloria Bamiloye, Joshua Mike-Bamiloye',
    format: 'Dolby Surround 7.1',
    synopsis: 'A powerful spiritual warfare drama reimagining the legendary Mount Zion classic with breathtaking CGI visual effects, unforgettable intensity, and an emotional journey of redemption.',
    tags: ['cimen', 'blockbuster', 'faith-cinema', 'blue-room'],
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'agb-1',
        time: '11:30 AM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['B4', 'B5', 'C3', 'C4'],
        status: 'available',
        priceStandard: 3500,
        priceVip: 7000
      },
      {
        id: 'agb-2',
        time: '2:45 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: Array.from({ length: 84 }, (_, i) => `SEAT-${i}`),
        status: 'sold_out',
        priceStandard: 4000,
        priceVip: 7500
      },
      {
        id: 'agb-3',
        time: '5:15 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['D4', 'D5', 'D6', 'E4', 'E5'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 8000
      },
      {
        id: 'agb-4',
        time: '8:00 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['A1', 'A2', 'G1', 'G2'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8500
      }
    ]
  },
  {
    id: 'spiderman-brand-new-day',
    title: 'Spider-Man: Brand New Day',
    tagline: 'A Spectacular New Era of High-Flying Action',
    genre: 'Hollywood / Action / Sci-Fi',
    rating: 'PG-13',
    duration: '2h 35m',
    language: 'English',
    director: 'Destin Daniel Cretton',
    cast: 'Tom Holland, Zendaya, Mark Ruffalo',
    format: '3D Laser & Dolby Atmos',
    synopsis: 'Peter Parker navigates a world that has forgotten his identity while confronting a mysterious criminal syndicate threatening the balance of New York City and the multiverse.',
    tags: ['cimen', 'hollywood', '3d-imax', 'blue-room'],
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'spidey-1',
        time: '12:00 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['A3', 'A4', 'B4', 'B5'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8500
      },
      {
        id: 'spidey-2',
        time: '3:30 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: Array.from({ length: 72 }, (_, i) => `SEAT-${i}`),
        status: 'sold_out',
        priceStandard: 5000,
        priceVip: 9000
      },
      {
        id: 'spidey-3',
        time: '6:45 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: Array.from({ length: 68 }, (_, i) => `SEAT-${i}`),
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
    id: 'abanisete',
    title: 'Abanisete',
    tagline: 'Crowns, Borders & The Sacred Royal Treasures',
    genre: 'Yoruba Cultural Epic / Historical Action',
    rating: '15+',
    duration: '2h 08m',
    language: 'Yoruba (English Subtitles)',
    director: 'Afeez Owo',
    cast: 'Ibrahim Chatta, Mide Martins, Odunlade Adekola',
    format: 'Red Room 4K Ultra-Clarity',
    synopsis: 'A gripping historical saga of ancient kingdoms, contested borders, and warlords vying for sovereign supremacy and long-hidden ancestral regalia.',
    tags: ['cimen', 'nollywood-epic', 'red-room'],
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'aba-1',
        time: '1:00 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['B1', 'B2', 'C1'],
        status: 'available',
        priceStandard: 3500,
        priceVip: 7000
      },
      {
        id: 'aba-2',
        time: '4:15 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['D2', 'D3'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 7500
      },
      {
        id: 'aba-3',
        time: '7:30 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['E3', 'E4', 'F3'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 7500
      }
    ]
  },
  {
    id: 'shadow-of-greed',
    title: 'The Shadow of Greed',
    tagline: 'When Wealth Tempts the Soul, Retribution Strikes',
    genre: 'Crime Thriller / Nollywood Noir',
    rating: '18+',
    duration: '1h 58m',
    language: 'English & Pidgin',
    director: 'Kemi Adetiba',
    cast: 'Sola Sobowale, Richard Mofe-Damijo, Chidi Mokeme',
    format: 'Dolby 7.1 Surround',
    synopsis: 'In the shadows of high finance and illicit oil bunkering, two estranged allies collide in a deadly game of betrayal where no one walks away unscarred.',
    tags: ['cimen', 'thriller', 'nollywood-noir'],
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'shg-1',
        time: '2:15 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: Array.from({ length: 72 }, (_, i) => `SEAT-${i}`),
        status: 'sold_out',
        priceStandard: 4000,
        priceVip: 7500
      },
      {
        id: 'shg-2',
        time: '5:45 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['A3', 'B3'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 7500
      },
      {
        id: 'shg-3',
        time: '8:45 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['C1', 'C2', 'D1'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8000
      }
    ]
  },
  {
    id: 'queen-moremi',
    title: 'Queen Moremi: Legend of Ife',
    tagline: 'Sacrifice of a Queen, Liberation of a Holy Dynasty',
    genre: 'Royal Historical Epic / Cultural Heritage',
    rating: '12+',
    duration: '2h 40m',
    language: 'Yoruba & English',
    director: 'Kunle Afolayan',
    cast: 'Sola Sobowale, Kunle Remi, Omowunmi Dada',
    format: 'Dolby Atmos Master Audio',
    synopsis: 'Commissioned under the cultural auspices of the Ooni of Ife, this landmark epic chronicles the courage of Queen Moremi Ajasoro who risked everything to deliver the ancient kingdom of Ife from invincible raiders.',
    tags: ['cimen', 'featured', 'royal-heritage', 'red-room'],
    poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop',
    showtimes: [
      {
        id: 'mor-1',
        time: '11:00 AM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: ['B1', 'B2', 'B3'],
        status: 'available',
        priceStandard: 4000,
        priceVip: 7500
      },
      {
        id: 'mor-2',
        time: '3:00 PM',
        hall: 'Red Room (4K Laser)',
        hallType: 'red',
        totalSeats: 84,
        bookedSeats: Array.from({ length: 70 }, (_, i) => `SEAT-${i}`),
        status: 'filling_fast',
        priceStandard: 4500,
        priceVip: 8000
      },
      {
        id: 'mor-3',
        time: '6:00 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['C1', 'C2'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8500
      },
      {
        id: 'mor-4',
        time: '9:00 PM',
        hall: 'Blue Room (Dolby Atmos)',
        hallType: 'blue',
        totalSeats: 72,
        bookedSeats: ['A1', 'A2', 'D5', 'D6'],
        status: 'available',
        priceStandard: 4500,
        priceVip: 8500
      }
    ]
  }
];

// Seed initial bookings into ledger for realistic reporting
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

  // Pre-seed with realistic transactions tagged with cimen
  AppState.bookingsLedger = [
    {
      ref: 'OJAJA-CIMEN-8941-IFE',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      movieTitle: 'Ori: Rebirth',
      showtime: '4:00 PM',
      hall: 'Red Room (4K Laser)',
      hallType: 'red',
      branch: 'Ife Grand Resort (Flagship)',
      seats: ['D4', 'D5'],
      concessions: [{ name: 'Royal Caramel Popcorn', qty: 2, price: 5000 }],
      totalAmount: 14000,
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
      movieTitle: 'Agbaranla: The Return',
      showtime: '2:45 PM',
      hall: 'Red Room (4K Laser)',
      hallType: 'red',
      branch: 'Ife Grand Resort (Flagship)',
      seats: ['F1', 'F2'],
      concessions: [{ name: 'Signature Nigerian Chilled Chapman', qty: 2, price: 3600 }],
      totalAmount: 18600,
      customerName: 'Pastor Samuel Olaitan',
      customerEmail: 'pastor.olaitan@mountzion.org',
      customerPhone: '08123456789',
      paystackRef: 'pstk_test_11204859182',
      tag: 'cimen-boxoffice',
      status: 'VERIFIED_PAID',
      checkedIn: false
    },
    {
      ref: 'OJAJA-CIMEN-4109-IFE',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      movieTitle: 'Spider-Man: Brand New Day',
      showtime: '3:30 PM',
      hall: 'Blue Room (Dolby Atmos)',
      hallType: 'blue',
      branch: 'Ife Grand Resort (Flagship)',
      seats: ['C3', 'C4', 'C5'],
      concessions: [{ name: 'Royal Duo Combo', qty: 1, price: 9500 }],
      totalAmount: 24500,
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

// Format Currency to Naira
function formatNaira(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

// Render Movies Grid
function renderMoviesGrid() {
  const container = document.getElementById('movies-grid');
  if (!container) return;

  const filteredMovies = MOVIES_DATA.filter(movie => {
    if (AppState.activeFilter === 'all') return true;
    if (AppState.activeFilter === 'nollywood') return movie.genre.toLowerCase().includes('nollywood') || movie.genre.toLowerCase().includes('yoruba');
    if (AppState.activeFilter === 'hollywood') return movie.genre.toLowerCase().includes('hollywood');
    if (AppState.activeFilter === 'red-room') return movie.showtimes.some(st => st.hallType === 'red');
    if (AppState.activeFilter === 'blue-room') return movie.showtimes.some(st => st.hallType === 'blue');
    return true;
  });

  container.innerHTML = filteredMovies.map(movie => {
    return `
      <div class="group relative bg-[#0E1524] rounded-2xl border border-white/5 hover:border-amber-500/40 transition-all duration-300 overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:shadow-amber-500/10">
        <!-- Poster & Badges -->
        <div class="relative aspect-[2/3] overflow-hidden bg-slate-900 cursor-pointer" onclick="openBookingModal('${movie.id}')">
          <img 
            src="${movie.poster}" 
            alt="${movie.title}" 
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-[#0E1524] via-transparent to-black/60"></div>
          
          <!-- Format Badges -->
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span class="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-amber-500 text-slate-950 font-mono shadow-md">
              ${movie.rating}
            </span>
            <span class="px-2.5 py-1 text-xs font-semibold rounded-md bg-black/60 backdrop-blur-md text-amber-400 border border-amber-500/30 font-mono">
              ${movie.duration}
            </span>
          </div>

          <div class="absolute top-3 right-3">
            <span class="px-2.5 py-1 text-[11px] font-bold rounded-md bg-red-600/90 text-white shadow-lg tracking-wide uppercase">
              ${movie.tags.includes('featured') ? '★ ROYAL PICK' : 'NOW SHOWING'}
            </span>
          </div>

          <!-- Quick Preview / Play Trailer Button -->
          <button 
            type="button" 
            onclick="event.stopPropagation(); openMovieDetails('${movie.id}')"
            class="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            title="Read Synopsis & Details"
          >
            <i data-lucide="info" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Details -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 text-xs text-amber-400/90 font-medium mb-1.5 uppercase tracking-wide">
              <span>${movie.genre}</span>
              <span>•</span>
              <span class="text-slate-400">${movie.format}</span>
            </div>
            
            <h3 class="font-serif text-xl font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
              ${movie.title}
            </h3>
            
            <p class="text-xs text-slate-400 mt-1 line-clamp-2">
              ${movie.tagline}
            </p>
          </div>

          <!-- Showtimes Row -->
          <div class="mt-4 pt-4 border-t border-white/5">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-2.5">
              <span class="font-semibold text-slate-300">Today's Showtimes</span>
              <span class="text-[11px] text-amber-500/90">Select to Book</span>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
              ${movie.showtimes.map(st => {
                const isSoldOut = st.status === 'sold_out';
                const isFillingFast = st.status === 'filling_fast';
                
                let badgeClass = 'bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border-white/10';
                let indicator = '';

                if (isSoldOut) {
                  badgeClass = 'bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/60 cursor-pointer';
                  indicator = '<span class="text-[9px] font-bold text-red-400 uppercase tracking-tighter block font-mono">SOLD OUT</span>';
                } else if (isFillingFast) {
                  badgeClass = 'bg-amber-950/30 border-amber-500/30 text-amber-200 hover:bg-amber-500 hover:text-slate-950';
                  indicator = '<span class="text-[9px] font-semibold text-amber-400 block font-mono">FILLING FAST</span>';
                }

                return `
                  <button 
                    type="button" 
                    onclick="handleShowtimeClick('${movie.id}', '${st.id}')"
                    class="p-2 rounded-xl text-left border transition-all duration-200 relative group/btn ${badgeClass}"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-xs tracking-tight">${st.time}</span>
                      <span class="text-[10px] opacity-75 font-mono">${st.hallType === 'red' ? 'RED' : 'BLUE'}</span>
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
              class="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <i data-lucide="ticket" class="w-4 h-4"></i>
              <span>Book Seats & Concessions</span>
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

// Showtime Click Handler with Automatic Capacity & Alternative Times Intelligence
function handleShowtimeClick(movieId, showtimeId) {
  const movie = MOVIES_DATA.find(m => m.id === movieId);
  if (!movie) return;

  const showtime = movie.showtimes.find(st => st.id === showtimeId);
  if (!showtime) return;

  if (showtime.status === 'sold_out') {
    // HALL IS FULL! Trigger the smart Alternative Times recommendation modal
    showHallFullAlert(movie, showtime);
    return;
  }

  // Showtime has seats available, proceed to booking modal with this showtime selected
  openBookingModal(movieId, showtimeId);
}

// Show Intelligent Hall Full Alert with Alternatives
function showHallFullAlert(movie, fullShowtime) {
  // Find available alternative showtimes for this movie
  const alternatives = movie.showtimes.filter(st => st.id !== fullShowtime.id && st.status !== 'sold_out');

  const modalContainer = document.getElementById('hall-full-modal');
  const modalContent = document.getElementById('hall-full-content');
  if (!modalContainer || !modalContent) return;

  modalContent.innerHTML = `
    <div class="relative p-6 sm:p-8 bg-[#0E1524] rounded-3xl border border-red-500/40 shadow-2xl max-w-lg w-full text-slate-100">
      <!-- Glow & Header -->
      <div class="w-16 h-16 rounded-2xl bg-red-950/70 border border-red-500/50 flex items-center justify-center text-red-400 mb-5 mx-auto shadow-lg shadow-red-500/20">
        <i data-lucide="alert-octagon" class="w-8 h-8 animate-pulse"></i>
      </div>

      <div class="text-center">
        <span class="px-3 py-1 text-xs font-mono font-bold uppercase rounded-full bg-red-900/40 text-red-400 border border-red-500/30">
          Hall Capacity Reached
        </span>
        <h3 class="font-serif text-2xl font-bold text-white mt-3">
          ${fullShowtime.hall} is Full!
        </h3>
        <p class="text-sm text-slate-300 mt-2">
          For the <strong class="text-amber-400">${fullShowtime.time}</strong> screening of <strong class="text-white">${movie.title}</strong>, all <strong class="text-red-400">${fullShowtime.totalSeats} seats</strong> have been reserved.
        </p>
      </div>

      <!-- Recommendation Section -->
      <div class="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-white/10">
        <div class="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-3 uppercase tracking-wider">
          <i data-lucide="sparkles" class="w-4 h-4"></i>
          <span>Recommended Alternative Times Today:</span>
        </div>

        ${alternatives.length > 0 ? `
          <div class="space-y-2.5">
            ${alternatives.map(alt => {
              const remaining = alt.totalSeats - alt.bookedSeats.length;
              return `
                <div class="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 hover:border-amber-500/50 transition-all flex items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-base text-white font-mono">${alt.time}</span>
                      <span class="text-xs px-2 py-0.5 rounded bg-white/5 text-amber-300 font-mono">${alt.hallType === 'red' ? 'Red Room' : 'Blue Room'}</span>
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5">
                      <span class="text-emerald-400 font-medium">${remaining} seats available</span> • From ${formatNaira(alt.priceStandard)}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onclick="selectAlternativeShowtime('${movie.id}', '${alt.id}')"
                    class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-transform hover:scale-105 shadow-md flex items-center gap-1.5"
                  >
                    <span>Switch</span>
                    <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <p class="text-xs text-slate-400 text-center py-2">
            All screenings for today are currently fully booked. Please select tomorrow's schedule or check our Lagos/Akure branches.
          </p>
        `}
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex items-center justify-end gap-3">
        <button 
          type="button" 
          onclick="closeHallFullAlert()"
          class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider transition-colors"
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
  closeHallFullAlert();
  openBookingModal(movieId, alternativeShowtimeId);
}

// Open Booking Modal
function openBookingModal(movieId, preselectedShowtimeId = null) {
  const movie = MOVIES_DATA.find(m => m.id === movieId);
  if (!movie) return;

  AppState.selectedMovie = movie;
  
  // Choose requested showtime or first available showtime
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
        <img src="${movie.poster}" alt="${movie.title}" class="w-16 h-24 object-cover rounded-xl shadow-lg border border-white/10">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-500 text-slate-950">${movie.rating}</span>
            <span class="text-xs text-amber-400 font-mono">${movie.duration}</span>
            <span class="text-xs text-slate-400">• ${movie.format}</span>
          </div>
          <h2 class="font-serif text-2xl font-bold text-white mt-1">${movie.title}</h2>
          <p class="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>${AppState.currentBranch}</span>
          </p>
        </div>
      </div>

      <!-- Showtime Switcher Tabs -->
      <div class="w-full md:w-auto">
        <span class="text-[11px] text-slate-400 block mb-1.5 font-medium uppercase tracking-wider">Select Showtime:</span>
        <div class="flex flex-wrap gap-2">
          ${movie.showtimes.map(st => {
            const isSelected = st.id === currentShowtime.id;
            const isSoldOut = st.status === 'sold_out';
            
            if (isSoldOut) {
              return `
                <button 
                  type="button" 
                  onclick="showHallFullAlert(AppState.selectedMovie, AppState.selectedMovie.showtimes.find(s => s.id === '${st.id}'))"
                  class="px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-950/40 text-red-300 text-xs font-mono font-semibold opacity-75 hover:opacity-100 flex items-center gap-1.5"
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
                class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  isSelected 
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
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
      
      <!-- Left Column: Interactive Seat Grid (7 cols on lg) -->
      <div class="lg:col-span-7 p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col items-center">
        
        <!-- Screen Curve & Ambient Glow -->
        <div class="w-full max-w-lg cinema-screen-container text-center mb-8">
          <div class="text-[11px] font-mono tracking-[0.25em] text-amber-400/80 mb-2 uppercase flex items-center justify-center gap-2">
            <i data-lucide="film" class="w-3.5 h-3.5"></i>
            <span>ROYAL 4K DUAL LASER SCREEN</span>
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
            <div class="w-4 h-4 rounded bg-amber-500 border border-amber-400 shadow-sm shadow-amber-500"></div>
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
        <div class="mt-6 w-full max-w-lg p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs font-mono">
          <span class="text-slate-400">Hall: <strong class="text-white">${currentShowtime.hall}</strong></span>
          <span class="text-slate-400">Available: <strong class="text-emerald-400">${currentShowtime.totalSeats - currentShowtime.bookedSeats.length} / ${currentShowtime.totalSeats} seats</strong></span>
        </div>
      </div>

      <!-- Right Column: Concessions + Customer Info + Paystack Checkout (5 cols on lg) -->
      <div class="lg:col-span-5 p-6 bg-[#0B0F17] flex flex-col justify-between overflow-y-auto">
        <div class="space-y-6">
          
          <!-- Selected Seats Display -->
          <div>
            <h4 class="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
              <i data-lucide="armchair" class="w-4 h-4"></i>
              <span>Your Selected Seats (${AppState.selectedSeats.length})</span>
            </h4>
            
            ${AppState.selectedSeats.length === 0 ? `
              <div class="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                Please tap on any available seat in the map to make your reservation.
              </div>
            ` : `
              <div class="flex flex-wrap gap-2">
                ${AppState.selectedSeats.map(seat => `
                  <div class="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center gap-2 text-xs font-mono text-amber-300">
                    <span class="font-bold">${seat.id}</span>
                    <span class="text-[10px] opacity-75">(${seat.tier})</span>
                    <button type="button" onclick="toggleSeat('${seat.id}', '${seat.tier}', ${seat.price})" class="text-amber-400 hover:text-white">✕</button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Concessions / Snacks Selection -->
          <div>
            <h4 class="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
              <i data-lucide="coffee" class="w-4 h-4"></i>
              <span>Add Concessions & Drinks</span>
            </h4>
            
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              ${CONCESSIONS_DATA.map(item => {
                const qty = AppState.selectedConcessions[item.id] || 0;
                return `
                  <div class="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2.5">
                      <span class="text-xl">${item.emoji}</span>
                      <div>
                        <div class="font-bold text-white">${item.name}</div>
                        <div class="text-[11px] text-amber-400/90 font-mono">${formatNaira(item.price)} • ${item.size}</div>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-2 font-mono">
                      <button 
                        type="button" 
                        onclick="updateConcession('${item.id}', -1)"
                        class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm"
                      >-</button>
                      <span class="w-5 text-center font-bold text-white">${qty}</span>
                      <button 
                        type="button" 
                        onclick="updateConcession('${item.id}', 1)"
                        class="w-6 h-6 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm"
                      >+</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Customer Details Form -->
          <div class="space-y-3 pt-2 border-t border-white/10">
            <h4 class="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <i data-lucide="user" class="w-4 h-4"></i>
              <span>Contact & Ticket Dispatch</span>
            </h4>

            <div>
              <label class="text-[11px] text-slate-400 block mb-1">Full Name</label>
              <input 
                type="text" 
                id="customer-name" 
                placeholder="e.g. Olumide Adeleke" 
                value="${AppState.customer.name}"
                oninput="AppState.customer.name = this.value"
                class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 focus:border-amber-500 focus:outline-none text-xs text-white"
              >
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[11px] text-slate-400 block mb-1">Email (for E-Ticket)</label>
                <input 
                  type="email" 
                  id="customer-email" 
                  placeholder="name@gmail.com" 
                  value="${AppState.customer.email}"
                  oninput="AppState.customer.email = this.value"
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 focus:border-amber-500 focus:outline-none text-xs text-white"
                >
              </div>
              <div>
                <label class="text-[11px] text-slate-400 block mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  id="customer-phone" 
                  placeholder="080 1234 5678" 
                  value="${AppState.customer.phone}"
                  oninput="AppState.customer.phone = this.value"
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 focus:border-amber-500 focus:outline-none text-xs text-white"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Total & Paystack Trigger -->
        <div class="pt-5 mt-4 border-t border-white/10">
          <!-- Price Calculation Breakdown -->
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
              <span>Cinema Tax & Tag:</span>
              <span class="text-amber-400">[cimen-boxoffice] (Included)</span>
            </div>
            <div class="flex justify-between text-base font-bold text-amber-400 pt-2 border-t border-white/10">
              <span class="font-serif">Grand Total:</span>
              <span>${formatNaira(calculateGrandTotal())}</span>
            </div>
          </div>

          <!-- Checkout Button -->
          <button 
            type="button" 
            onclick="initiatePaystackCheckout()"
            ${AppState.selectedSeats.length === 0 ? 'disabled' : ''}
            class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01]"
          >
            <i data-lucide="shield-check" class="w-5 h-5"></i>
            <span>Pay With Paystack (${formatNaira(calculateGrandTotal())})</span>
          </button>
          
          <p class="text-[10px] text-center text-slate-500 mt-2 font-mono">
            Secured by Paystack • Instant QR Pass & WhatsApp Confirmation
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
  const movie = AppState.selectedMovie;
  const newShowtime = movie.showtimes.find(st => st.id === showtimeId);
  if (!newShowtime) return;

  if (newShowtime.status === 'sold_out') {
    showHallFullAlert(movie, newShowtime);
    return;
  }

  AppState.selectedShowtime = newShowtime;
  AppState.selectedSeats = []; // reset seat selection when changing showtime
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

            // Create aisle gap in the middle
            const aisleGap = seatNumber === 6 ? 'mr-3 sm:mr-5' : '';

            if (isBooked) {
              return `
                <div 
                  class="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-slate-900 border border-red-500/30 text-red-500/70 text-[9px] flex items-center justify-center font-mono cursor-not-allowed ${aisleGap}"
                  title="Seat ${seatId} (Occupied)"
                >
                  ✕
                </div>
              `;
            }

            let seatClasses = isVipRow 
              ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 hover:bg-amber-500 hover:text-slate-950'
              : 'bg-slate-800 border-white/20 text-slate-300 hover:bg-amber-500 hover:text-slate-950';

            if (isSelected) {
              seatClasses = 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/50 seat-selected';
            }

            return `
              <button 
                type="button" 
                onclick="toggleSeat('${seatId}', '${tier}', ${price})"
                class="seat-btn w-6 h-6 sm:w-7 sm:h-7 rounded-md border text-[10px] font-mono flex items-center justify-center transition-all ${seatClasses} ${aisleGap}"
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

// Seat Selection Toggle
function toggleSeat(seatId, tier, price) {
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

// Concession Increment / Decrement
function updateConcession(itemId, delta) {
  const current = AppState.selectedConcessions[itemId] || 0;
  const next = Math.max(0, current + delta);
  if (next === 0) {
    delete AppState.selectedConcessions[itemId];
  } else {
    AppState.selectedConcessions[itemId] = next;
  }
  renderBookingModalContent();
}

// Calculation Utilities
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
  // 1. Validation
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
  const amountInKobo = grandTotal * 100; // Paystack requires NGN amount in Kobo

  // Unique Booking Ref tagged with cimen
  const bookingRef = `OJAJA-CIMEN-${Math.floor(1000 + Math.random() * 9000)}-IFE`;

  // Build concessions summary
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

  // Check if official PaystackPop is available in browser
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
            { display_name: 'Tag', variable_name: 'cinema_tag', value: 'cimen-boxoffice' }
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

  // Graceful Fallback / Demo Simulator Modal
  openSimulatedPaystackModal(bookingPayload);
}

// High Fidelity Paystack Simulation Modal for Instant Verification
function openSimulatedPaystackModal(bookingPayload) {
  const modal = document.getElementById('paystack-simulator-modal');
  const container = document.getElementById('paystack-simulator-content');
  if (!modal || !container) return;

  container.innerHTML = `
    <div class="p-6 bg-white text-slate-900 rounded-3xl max-w-md w-full shadow-2xl relative font-sans">
      <!-- Paystack Brand Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-[#0BA4DB] flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <div>
            <h4 class="font-bold text-sm text-slate-900">Paystack Checkout</h4>
            <span class="text-[11px] text-emerald-600 font-medium">● Secured 256-bit SSL</span>
          </div>
        </div>
        <button type="button" onclick="closePaystackSimulator()" class="text-slate-400 hover:text-slate-700 text-lg">✕</button>
      </div>

      <!-- Merchant & Transaction Summary -->
      <div class="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div class="text-xs text-slate-500">Merchant</div>
        <div class="font-bold text-base text-slate-900">Ojaja Cinemas (Ife Grand Resort)</div>
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-xs">
          <span class="text-slate-600">${bookingPayload.movieTitle} (${bookingPayload.seats.join(', ')})</span>
          <span class="font-bold text-emerald-700 font-mono text-sm">${formatNaira(bookingPayload.totalAmount)}</span>
        </div>
      </div>

      <!-- Payment Channels Simulation -->
      <div class="space-y-3">
        <p class="text-xs text-slate-500 font-medium">Select Payment Channel:</p>
        
        <button 
          type="button" 
          onclick="executeSimulatedPaymentSuccess('CARD')"
          class="w-full p-3.5 rounded-xl border border-slate-200 hover:border-[#0BA4DB] hover:bg-sky-50/50 flex items-center justify-between transition-all group"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">💳</span>
            <div class="text-left">
              <div class="font-bold text-xs text-slate-900">Pay with Card / Mastercard / Visa / Verve</div>
              <div class="text-[11px] text-slate-500">Instant Authorization</div>
            </div>
          </div>
          <span class="text-xs text-[#0BA4DB] font-bold group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <button 
          type="button" 
          onclick="executeSimulatedPaymentSuccess('TRANSFER')"
          class="w-full p-3.5 rounded-xl border border-slate-200 hover:border-[#0BA4DB] hover:bg-sky-50/50 flex items-center justify-between transition-all group"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">🏦</span>
            <div class="text-left">
              <div class="font-bold text-xs text-slate-900">Pay with Bank Transfer (Wema / Titan / Zenith)</div>
              <div class="text-[11px] text-slate-500">Virtual Dedicated Account</div>
            </div>
          </div>
          <span class="text-xs text-[#0BA4DB] font-bold group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <button 
          type="button" 
          onclick="executeSimulatedPaymentSuccess('USSD')"
          class="w-full p-3.5 rounded-xl border border-slate-200 hover:border-[#0BA4DB] hover:bg-sky-50/50 flex items-center justify-between transition-all group"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">📱</span>
            <div class="text-left">
              <div class="font-bold text-xs text-slate-900">Pay with USSD (*737#, *894#, *901#)</div>
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
  // Update local seat booked status for real-time reactivity
  const showtime = AppState.selectedMovie.showtimes.find(st => st.id === AppState.selectedShowtime.id);
  if (showtime) {
    showtime.bookedSeats.push(...booking.seats);
    if (showtime.bookedSeats.length >= showtime.totalSeats) {
      showtime.status = 'sold_out';
    } else if (showtime.totalSeats - showtime.bookedSeats.length < 15) {
      showtime.status = 'filling_fast';
    }
  }

  // Push to ledger & save
  AppState.bookingsLedger.unshift(booking);
  saveLedger();

  // Close booking modal
  closeBookingModal();

  // Re-render movie cards to reflect updated availability
  renderMoviesGrid();

  // Show Success Toast
  showToast('Booking Confirmed! Your Paystack transaction was successful.', 'success');

  // Open the Digital E-Ticket Pass Modal
  openTicketModal(booking);
}

// Digital E-Ticket Pass Modal with Dynamic QR & Barcode
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
    <div id="printable-ticket-area" class="w-full max-w-md mx-auto ticket-card rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden text-slate-100">
      
      <!-- Top Royal Branding -->
      <div class="p-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-serif font-black text-xl shadow-lg">
            👑
          </div>
          <div>
            <h3 class="font-serif font-bold text-base tracking-wide leading-tight">OJAJA CINEMAS</h3>
            <span class="text-[10px] font-mono tracking-wider uppercase block opacity-90">African Village • Ile-Ife</span>
          </div>
        </div>
        <div class="text-right">
          <span class="px-2.5 py-1 rounded bg-slate-950/20 text-slate-950 font-mono font-bold text-xs uppercase">
            E-TICKET PASS
          </span>
        </div>
      </div>

      <!-- Ticket Main Body -->
      <div class="p-6 bg-[#0E1524] space-y-4">
        <div>
          <span class="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">FEATURE FILM</span>
          <h2 class="font-serif text-2xl font-bold text-white mt-0.5">${booking.movieTitle}</h2>
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
          <div class="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
            <span class="text-[10px] font-mono text-amber-400 font-bold uppercase block mb-1">CONCESSIONS CLAIM</span>
            <div class="text-slate-300 space-y-0.5">
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
    <div class="mt-6 flex flex-wrap items-center justify-center gap-3 no-print">
      <button 
        type="button" 
        onclick="window.print()"
        class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
      >
        <i data-lucide="printer" class="w-4 h-4"></i>
        <span>Print Ticket</span>
      </button>

      <button 
        type="button" 
        onclick="shareTicketWhatsApp()"
        class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
      >
        <i data-lucide="send" class="w-4 h-4"></i>
        <span>Send to WhatsApp</span>
      </button>

      <button 
        type="button" 
        onclick="closeTicketModal()"
        class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
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
🏛️ *Hall:* ${b.hall}
⏰ *Time:* ${b.showtime}
💺 *Seats:* ${b.seats.join(', ')}
💰 *Amount Paid:* ${formatNaira(b.totalAmount)}
🔖 *Booking Ref:* ${b.ref}
🏷️ *Tag:* ${b.tag}

_Present this reference code or QR pass at the entrance turnstile._`;

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Movie Details Modal
function openMovieDetails(movieId) {
  const movie = MOVIES_DATA.find(m => m.id === movieId);
  if (!movie) return;

  const modal = document.getElementById('movie-details-modal');
  const container = document.getElementById('movie-details-content');
  if (!modal || !container) return;

  container.innerHTML = `
    <div class="relative bg-[#0E1524] rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100">
      <!-- Backdrop Banner -->
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

      <!-- Content -->
      <div class="p-6 -mt-16 relative">
        <div class="flex items-end gap-5">
          <img src="${movie.poster}" alt="${movie.title}" class="w-24 h-36 object-cover rounded-xl shadow-2xl border-2 border-amber-500/40">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 text-xs font-mono font-bold rounded bg-amber-500 text-slate-950">${movie.rating}</span>
              <span class="text-xs text-amber-400 font-mono">${movie.duration}</span>
              <span class="text-xs text-slate-400">• ${movie.format}</span>
            </div>
            <h2 class="font-serif text-2xl font-bold text-white">${movie.title}</h2>
            <p class="text-xs text-slate-400">${movie.tagline}</p>
          </div>
        </div>

        <div class="mt-6 space-y-4">
          <div>
            <h4 class="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider mb-1">Synopsis</h4>
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

        <!-- Book CTA -->
        <div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button 
            type="button" 
            onclick="closeMovieDetails(); openBookingModal('${movie.id}')"
            class="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
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
          <div class="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl">
            <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-serif text-xl font-bold text-white">Box Office Dispatch & Verification Hub</h3>
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
          <span class="text-[10px] text-slate-500">Across Red & Blue Halls</span>
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
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 focus:border-amber-500 focus:outline-none text-xs font-mono text-white"
          >
        </div>
        <button 
          type="button" 
          onclick="searchAndCheckinTicket()"
          class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-auto"
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
                    <span class="text-[10px] text-amber-500/80 block">[${b.tag}]</span>
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
                    <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">${b.seats.join(', ')}</span>
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
                      class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
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

  booking.checkedIn = true;
  saveLedger();
  renderAdminHub();
  showToast(`Patron ${booking.customerName} checked in for ${booking.movieTitle}!`, 'success');
}

// Filter Tabs Handler
function setFilter(filterName) {
  AppState.activeFilter = filterName;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('bg-amber-500', 'text-slate-950');
    btn.classList.add('bg-slate-900', 'text-slate-300');
  });

  const activeBtn = document.getElementById(`filter-${filterName}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-900', 'text-slate-300');
    activeBtn.classList.add('bg-amber-500', 'text-slate-950');
  }

  renderMoviesGrid();
}

// Branch Switcher
function setBranch(branchName) {
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

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  // Remove after 4s
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Initialize Application on Window Load
window.addEventListener('DOMContentLoaded', () => {
  initLedger();
  renderMoviesGrid();

  // Keyboard shortcut: Alt + A opens Admin hub
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      openAdminModal();
    }
  });
});
