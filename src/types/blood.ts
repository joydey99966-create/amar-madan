export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export type UnionArea =
  | 'মদন পৌরসভা'
  | 'কাইটাইল ইউনিয়ন'
  | 'চানগাঁও ইউনিয়ন'
  | 'গোবিন্দশ্রী ইউনিয়ন'
  | 'মাঘান সিহাচড় ইউনিয়ন'
  | 'তিয়শ্রী ইউনিয়ন'
  | 'ফতেহপুর ইউনিয়ন'
  | 'জাহাঙ্গীরপুর ইউনিয়ন'
  | 'মদন বাজার'
  | 'কাইটাইল বাজার'
  | 'ফতেপুর বাজার'
  | 'কাইটাইল'
  | 'চানগাঁও'
  | 'গোবিন্দশ্রী'
  | 'গোড়গ্রাম'
  | 'বংশীগ্রাম'
  | 'মাঝেরগ্রাম'
  | 'শিমুলতলা'
  | 'কালিগ্রাম'
  | 'ধলীগ্রাম'

export interface BloodDonor {
  id: string
  name: string
  bloodGroup: BloodGroup
  unionArea: UnionArea | string
  lastDonationDate?: string | null
  phone: string
  availability?: 'available' | 'busy'
  /** New donors stay hidden from the public until approved by an admin. */
  approved?: boolean
  /** Admin-controlled visibility. */
  visible?: boolean
}
