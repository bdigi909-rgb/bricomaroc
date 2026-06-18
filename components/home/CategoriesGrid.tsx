import Link from 'next/link'
import type { Category } from '@/types'

interface CategoriesGridProps {
  categories: Category[]
}

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <section>
      <p className="section-label mb-3">Catégories</p>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-2">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/artisans?categorie=${cat.slug}`}
            className="flex flex-col items-center gap-1.5 p-3 bg-white border border-[var(--color-border)] rounded-xl
                       hover:border-green-300 hover:bg-green-50 hover:-translate-y-0.5
                       transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-200"
            style={{ borderTopColor: cat.couleur, borderTopWidth: 3 }}
          >
            <span className="text-xl leading-none">{cat.icone}</span>
            <span className="text-[11px] font-semibold text-ink text-center leading-tight">
              {cat.nom}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
