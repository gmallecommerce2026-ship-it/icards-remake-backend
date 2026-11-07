// Kiểu của dữ liệu seed. File data/catalog.seed.ts được sinh từ các module mock của FE
// nên mọi giá trị khớp 1-1 với những gì FE đang hiển thị.
import type {
  CategoryItem, LabeledValue, PostBlock, ProductVariant, ShippingKind, ShopCategory, SlugCategoryItem,
  TemplateCategory, TemplateMotif, TemplatePalette, TemplateSample, ThumbKind, Tone,
} from '../catalog/catalog.types.js';

export interface TemplateSeed {
  slug: string;
  name: string;
  category: TemplateCategory;
  tagline: string;
  description: string;
  price: number;
  popularity: number;
  createdAt: string;
  features: string[];
  previewImage?: string;
  motif: TemplateMotif;
  palette: TemplatePalette;
  sample: TemplateSample;
}

export interface ProductSeed {
  slug: string;
  name: string;
  category: ShopCategory;
  summary: string;
  description: string;
  thumb: ThumbKind;
  tone: Tone;
  variants: ProductVariant[];
  shipping: ShippingKind;
  leadTime: string;
  highlights: string[];
  specs: LabeledValue[];
}

export interface ServiceSeed {
  slug: string;
  name: string;
  summary: string;
  description: string;
  priceFrom: number;
  duration: string;
  audience: string;
  includes: string[];
}

export interface PostSeed {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readMinutes: number;
  author: string;
  tone: Tone;
  content: PostBlock[];
}

export interface FaqItemSeed {
  id: string;
  group: string;
  q: string;
  a: string;
}

export interface CatalogSeed {
  templateCategories: CategoryItem[];
  templates: TemplateSeed[];
  shopCategories: CategoryItem[];
  products: ProductSeed[];
  services: ServiceSeed[];
  servicesProcess: { title: string; text: string }[];
  blogCategories: SlugCategoryItem[];
  posts: PostSeed[];
  faqGroups: SlugCategoryItem[];
  faqItems: FaqItemSeed[];
  professionalProcess: { title: string; description: string }[];
  professionalTiers: {
    id: string;
    name: string;
    description: string;
    price: string;
    features: string[];
    isPopular?: boolean;
  }[];
  professionalPortfolio: { id: string; name: string; client: string; tone: Tone }[];
}
