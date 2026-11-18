import { PriceSubmission } from '../types/priceModeration'

/**
 * Seed data for the Price Moderation Queue.
 *
 * These entries are only written to the queue's own localStorage key
 * (`amar-madan-price-moderation-queue`) and never touch the live market list.
 */
export const initialPriceSubmissions: PriceSubmission[] = [
  {
    id: 'pmq-1',
    productName: 'আলু',
    category: 'সবজি',
    suggestedPrice: 47,
    currentPrice: 50,
    location: 'মদন বাজার',
    submittedBy: 'রফিকুল ইসলাম (স্থানীয় ব্যবসায়ী)',
    timestamp: '2026-11-14T09:15:00+06:00',
    status: 'pending',
  },
  {
    id: 'pmq-2',
    productName: 'পেঁয়াজ',
    category: 'সবজি',
    suggestedPrice: 95,
    currentPrice: 90,
    location: 'কাইটাইল বাজার',
    submittedBy: 'সুমন আহমেদ (আড়তদার)',
    timestamp: '2026-11-14T10:40:00+06:00',
    status: 'pending',
  },
  {
    id: 'pmq-3',
    productName: 'ডিম',
    category: 'প্রাণিজ পণ্য',
    suggestedPrice: 90,
    currentPrice: 85,
    location: 'ফতেপুর বাজার',
    submittedBy: 'ফাতেমা বেগম (খুচরা বিক্রেতা)',
    timestamp: '2026-11-14T11:20:00+06:00',
    status: 'pending',
  },
]
