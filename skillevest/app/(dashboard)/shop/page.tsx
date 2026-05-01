'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Star, ChevronLeft, BookOpen, Filter } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  category: string
  price: number
  rating: number
  reviewCount: number
  coverColor: string
  badge?: string
}

const BOOKS: Book[] = [
  { id: '1', title: 'Freelancing in Nigeria', author: 'Adewale Okonkwo', category: 'freelancing', price: 4500, rating: 4.8, reviewCount: 124, coverColor: '#4F46E5', badge: 'Bestseller' },
  { id: '2', title: 'UI/UX Design Mastery', author: 'Chioma Nwosu', category: 'design', price: 6000, rating: 4.6, reviewCount: 89, coverColor: '#DB2777' },
  { id: '3', title: 'Python for Beginners', author: 'Emeka Eze', category: 'tech', price: 5500, rating: 4.7, reviewCount: 203, coverColor: '#059669', badge: 'New' },
  { id: '4', title: 'Digital Marketing 101', author: 'Fatima Abdullahi', category: 'marketing', price: 3500, rating: 4.5, reviewCount: 67, coverColor: '#D97706' },
  { id: '5', title: 'Personal Finance for Graduates', author: 'Oluwaseun Adeyemi', category: 'finance', price: 4000, rating: 4.9, reviewCount: 156, coverColor: '#0891B2', badge: 'Top Rated' },
  { id: '6', title: 'Content Writing Secrets', author: 'Blessing Okafor', category: 'freelancing', price: 3000, rating: 4.4, reviewCount: 45, coverColor: '#7C3AED' },
  { id: '7', title: 'Web Development Bootcamp', author: 'Tunde Ola', category: 'tech', price: 7500, rating: 4.8, reviewCount: 312, coverColor: '#DC2626' },
  { id: '8', title: 'Social Media Marketing', author: 'Aisha Mohammed', category: 'marketing', price: 4200, rating: 4.3, reviewCount: 78, coverColor: '#0D9488' },
]

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'freelancing', label: 'Freelancing' },
  { id: 'design', label: 'Design' },
  { id: 'tech', label: 'Tech' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'finance', label: 'Finance' },
]

function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={10}
          className={s <= Math.round(rating) ? 'text-[#F5A623] fill-[#F5A623]' : 'text-gray-300'}
        />
      ))}
      <span className="text-gray-400 text-[10px] ml-1">{rating}</span>
    </div>
  )
}

function BookCard({ book, onAddToCart }: { book: Book; onAddToCart: () => void }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div
        className="relative w-full aspect-[3/4] flex items-center justify-center"
        style={{ backgroundColor: book.coverColor }}
      >
        {book.badge && (
          <span className="absolute top-2 left-2 bg-[#F5A623] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
            {book.badge}
          </span>
        )}
        <BookOpen size={32} className="text-white/60" />
      </div>
      <div className="p-3">
        <p className="text-gray-900 font-bold text-xs leading-snug line-clamp-2 mb-1">{book.title}</p>
        <p className="text-gray-400 text-[10px] mb-1.5">{book.author}</p>
        <StarRating rating={book.rating} />
        <div className="flex items-center justify-between mt-2.5">
          <p className="text-gray-900 font-black text-sm">{fmt(book.price)}</p>
          <button
            onClick={onAddToCart}
            className="bg-[#F5A623] text-black text-[10px] font-bold px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ShopBooksPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [cartCount, setCartCount] = useState(0)

  const featuredBook = BOOKS[4]

  const filtered = BOOKS.filter((b) => {
    const matchCat = activeCategory === 'all' || b.category === activeCategory
    const matchQ = !query || b.title.toLowerCase().includes(query.toLowerCase()) || b.author.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <div className="min-h-screen bg-[#F9F9FB] pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-gray-900 font-black text-lg leading-none">Bookshop</h1>
              <p className="text-gray-400 text-xs mt-0.5">{BOOKS.length} books available</p>
            </div>
          </div>
          <div className="relative">
            <button className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <ShoppingCart size={18} className="text-gray-700" />
            </button>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#F5A623] text-black text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, authors…"
            className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[#F5A623] text-black'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#F5A623]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured book */}
        {activeCategory === 'all' && !query && (
          <div
            className="relative rounded-2xl overflow-hidden p-5 flex items-center gap-4"
            style={{ backgroundColor: featuredBook.coverColor }}
          >
            <div className="flex-1">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                Featured
              </span>
              <h2 className="text-white font-black text-lg leading-snug mt-2">{featuredBook.title}</h2>
              <p className="text-white/70 text-xs mb-3">{featuredBook.author}</p>
              <div className="flex items-center gap-3">
                <p className="text-white font-black text-xl">{fmt(featuredBook.price)}</p>
                <button
                  onClick={() => setCartCount((c) => c + 1)}
                  className="bg-white text-gray-900 font-bold text-xs px-4 py-2 rounded-xl active:scale-95 transition-transform"
                >
                  Buy Now
                </button>
              </div>
            </div>
            <div className="w-20 h-28 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={32} className="text-white/70" />
            </div>
          </div>
        )}

        {/* Book grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900 font-bold text-sm">
              {activeCategory === 'all' ? 'All Books' : CATEGORIES.find((c) => c.id === activeCategory)?.label}
              <span className="text-gray-400 font-normal ml-1">({filtered.length})</span>
            </h2>
            <button className="flex items-center gap-1 text-gray-500 text-xs font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
              <Filter size={12} /> Sort
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No books found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onAddToCart={() => setCartCount((c) => c + 1)}
                />
              ))}
            </div>
          )}
        </div>

        <p className="text-gray-400 text-xs text-center pb-2">SkillVest Bookshop · Knowledge that earns 📚</p>
      </div>
    </div>
  )
}
