'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { apiRequest } from '@/lib/api-client'
import { useAuth } from '@/context/AuthContext'

interface WishlistContextType {
  wishlistIds: Set<string>
  wishlistCount: number
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => Promise<void>
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())

  /* The provider wraps the whole app, admin included — but the dashboard has
     no wishlist, so fetching one there is a request per admin page for data
     nothing renders. Storefront routes still fetch normally, and navigating
     from the admin back to the shop re-runs this effect. */
  const isAdminRoute = (pathname || '').startsWith('/admin')

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated || isAdminRoute) {
      setWishlistIds(new Set())
      return
    }
    try {
      const data = await apiRequest<{ product: { _id: string } }[]>('/wishlist')
      const ids = Array.isArray(data)
        ? data.map((item: any) => item?.product?._id ?? item?.productId ?? '').filter(Boolean)
        : []
      setWishlistIds(new Set(ids))
    } catch {
      setWishlistIds(new Set())
    }
  }, [isAuthenticated, isAdminRoute])

  useEffect(() => {
    refreshWishlist()
  }, [refreshWishlist])

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds],
  )

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return

      const alreadyIn = wishlistIds.has(productId)

      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev)
        if (alreadyIn) {
          next.delete(productId)
        } else {
          next.add(productId)
        }
        return next
      })

      try {
        if (alreadyIn) {
          await apiRequest(`/wishlist/${productId}`, { method: 'DELETE' })
        } else {
          await apiRequest('/wishlist', {
            method: 'POST',
            body: JSON.stringify({ productId }),
          })
        }
      } catch {
        // Revert on error
        setWishlistIds((prev) => {
          const next = new Set(prev)
          if (alreadyIn) {
            next.add(productId)
          } else {
            next.delete(productId)
          }
          return next
        })
      }
    },
    [isAuthenticated, wishlistIds],
  )

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.size,
        isInWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider')
  return ctx
}
