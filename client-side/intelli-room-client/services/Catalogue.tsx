import api from './AxiosInstance';

// Assuming your catalogue API returns an array of products
interface Product {
  id: string;
  name: string;
  price: number;
  // ... other product details
}

// API Function
export const getCatalogue = async (): Promise<Product[]> => {
  const response = await api.get('/get_catalogue');
  return response.data;
};