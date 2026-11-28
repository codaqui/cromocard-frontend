export interface ListingSummary {
  id: string;
  price: string;
  condition: { name: string } | null;
  seller: { id: string; username: string | null };
}

export interface CardListingsParams {
  page: number;
  pageSize: number;
}
