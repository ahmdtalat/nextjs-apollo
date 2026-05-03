'use client'

import { useState } from 'react'
import type { Purchase } from '../app.types'

// #################################################################################################

interface Props {
  purchase: Purchase
}

// #################################################################################################

export default function PurchaseCard({ purchase }: Props) {
  const { product, user, date } = purchase
  const [imgFailed, setImgFailed] = useState(false)
  const userName = `${user.firstName} ${user.lastName}`
  const formattedDate = new Date(date).toLocaleDateString()
  // Hash product.id to a stable integer for deterministic image seed (same product → same image)
  const imageSeed = product.id
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  // Loremflickr searches Flickr by tag — at least somewhat matches the product name
  const primaryImageUrl = `https://loremflickr.com/400/300/${encodeURIComponent(product.name)}?lock=${imageSeed}`
  // Picsum fallback if loremflickr fails — random landscape but always loads
  const fallbackImageUrl = `https://picsum.photos/seed/${product.id}/400/300`
  const imageSrc = imgFailed ? fallbackImageUrl : primaryImageUrl

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
      {/* Product image — loremflickr primary, picsum fallback on error */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={product.name}
        onError={() => setImgFailed(true)}
        className="aspect-[4/3] w-full object-cover bg-gray-100"
      />

      {/* Card body */}
      <div className="p-3">
        <p className="font-medium text-gray-900 truncate">{product.name}</p>
        <div className="mt-1 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.profilePictureUrl}
            alt={userName}
            className="h-6 w-6 rounded-full object-cover bg-gray-100"
          />
          <p className="text-sm text-gray-500 truncate">{userName}</p>
        </div>
        <p className="mt-1 text-xs text-gray-400">{formattedDate}</p>
      </div>
    </div>
  )
}
