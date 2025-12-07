import { useItem } from "../hooks/useItems";

export const ItemDetails = ({ id }: { id: string }) => {
  const { item, loading } = useItem(id);

  if (loading) return <p>Loading item...</p>;
  if (!item) return <p>Item not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-2xl">
      <img src={item.imageUrl} alt={item.name} className="rounded-xl mb-4" />
      <h1 className="text-2xl font-bold">{item.name}</h1>
      <p className="text-gray-600">{item.brand?.name}</p>
      <p className="text-gray-800 mt-2">${item.price}</p>
      <p className="mt-4">{item.description}</p>
    </div>
  );
};
