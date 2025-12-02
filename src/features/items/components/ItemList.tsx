
import ItemCard from "./ItemCard";  
import { ItemResponseDTO } from "../types/types";

interface ItemListProps {
  items: ItemResponseDTO[];
}

export const ItemList = ({ items }: ItemListProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};
