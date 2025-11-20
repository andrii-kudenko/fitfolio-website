import { useItems } from "../hooks/useItems";
import ItemCard from "./ItemCard";  
import { Item } from "../lib/types";

interface ItemListProps {
  items: Item[];
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
