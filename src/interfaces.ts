export interface App {
    owner?: string
    admins?: string[]
    authority?: string[]
    trustedAll?: string[]
    objectControl?: boolean
    configuration?: {
        shopSettings?: {
            type?: string
            value?: string
        }
    }
}

export interface Authority {
    administrative: string[]
    ownership: string[]
}

export interface ActiveVote {
    voter: string
    weight: number
    weightWAIV?: number
    percent: number
    rshares_weight: number
    ownership?: boolean
    administrative?: boolean
    owner?: boolean
    master?: boolean
    admin?: boolean
    _id?: {
        getTimestamp(): number
    }
    timestamp?: number
}

export interface AdminVote {
    role: string;
    status: string;
    name: string;
    timestamp: number;
}

export interface Field {
    _id: {
        getTimestamp(): number
    }
    name: string;
    body: string;
    weight: number;
    locale: string;
    creator: string;
    author: string;
    permlink: string;
    active_votes: ActiveVote[];
    weightWAIV?: number;
    createdAt?: number;
    adminVote?: AdminVote
    approvePercent?: number
    items?: Field[]
    id?: string
    type?: string
}

export interface ExposedFieldCounter {
    name: string
    value: number
}


export interface Map {
    type: string;
    coordinates: number[];
}

export interface WobjectStatus {
    title: string;
}

export interface NewsFilter {
    title: string
    permlink: string
    name: string
}

export interface AffiliateLink {
    type: string
    link: string
    image: string
    affiliateCode: string
}

export interface AffiliateCodes {
    affiliateUrlTemplate: string
    affiliateCode: string[]
    affiliateButton: string
    affiliateProductIdTypes: string[]
    affiliateGeoArea: string[]
}

interface OptionBody {
    category: string;
    value: string;
    image: string;
}

export interface Option {
    name: string;
    body: OptionBody;
    weight: number;
    locale: string;
    creator: string;
    author: string;
    permlink: string;
    _id: string;
    active_votes: ActiveVote[];
    weightWAIV: number;
    createdAt: number;
    adminVote: AdminVote;
    approvePercent: number;
    author_permlink: string;
    price: string;
    avatar: string;
}

export interface OptionsMap {
    [key: string]: Option[];
}

export interface Wobject {
    app: string
    community: string
    object_type: string
    default_name: string
    is_posting_open: boolean
    is_extending_open: boolean;
    creator: string;
    author: string;
    authority: Authority | Field;
    author_permlink: string;
    weight: number;
    parent?: string;
    children: string[];
    fields: Field[];
    map: Map;
    activeCampaigns: string[];
    activeCampaignsCount: number;
    status?: WobjectStatus;
    albums_count?: number;
    photos_count?: number;
    preview_gallery: Field[];
    avatar?: string;
    sortCustom?: object | string;
    newsFilter?: NewsFilter[];
    productId?: Field[];
    price?: string;
    affiliateLinks?: AffiliateLink[];
    departments?: string[] | null;
    defaultShowLink?: string;
    topTags?: string[];
    exposedFields?: ExposedFieldCounter[];
    groupId?: string[];
    options?: OptionsMap
    menuItem?: Field[]
    blog?: Field[]
}
