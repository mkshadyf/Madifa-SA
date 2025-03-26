import { CategoryItem } from "@shared/types";
import { Link } from "wouter";

interface CategorySectionProps {
  categories: CategoryItem[];
}

const CategorySection = ({ categories }: CategorySectionProps) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">Browse Categories</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.id}`}>
            <a className="block relative group overflow-hidden rounded-lg h-32">
              <img 
                src={category.thumbnailUrl} 
                alt={category.name} 
                className="w-full h-full object-cover transition group-hover:scale-110 duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <h3 className="text-white font-medium text-lg">{category.name}</h3>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
