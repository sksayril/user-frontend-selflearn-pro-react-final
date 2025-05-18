export interface Category {
  _id: string;
  name: string;
  path: string[];
}

export interface CategoryResponse {
  parents: Category[];
}

export interface SubCategory {
  _id: string;
  name: string;
  type: 'category' | 'content';
  parentId: string;
  path: string[];
  content?: {
    imageUrls: string[];
    pdfUrl?: string;
    text?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SubCategoryResponse {
  subcategories: SubCategory[];
}