export interface PageMeta {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  }
  
  export interface PageResult<T> {
    content: T[];
    page: PageMeta;
  }