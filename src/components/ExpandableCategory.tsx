"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ChevronUpIcon from "@/assets/icon/ic_chevron_up_19.svg";

interface SubcategoryItem {
  id: number;
  name: string;
}

interface ExpandableCategoryProps {
  title: string;
  content: SubcategoryItem[];
  isLast?: boolean;
}

const ExpandableCategory = ({
  title,
  content,
  isLast = false,
}: ExpandableCategoryProps) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSubcategoryClick = (subcategory: SubcategoryItem) => {
    // URL에 한글을 사용하기 위해 encodeURIComponent 사용
    const parentSlug = encodeURIComponent(title);
    const childSlug = encodeURIComponent(subcategory.name);
    router.push(
      `/categories/${parentSlug}/${childSlug}?category_id=${subcategory.id}`
    );
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        className="px-5 py-[18px] flex justify-between items-center cursor-pointer"
        onClick={handleToggle}
      >
        <span
          className={`select-none font-medium ${
            isExpanded ? "text-[#133A1B]" : "text-black"
          }`}
        >
          {title}
        </span>
        <ChevronUpIcon
          className={`transition-transform duration-300 ${
            isExpanded ? "rotate-0" : "rotate-180"
          }`}
        />
      </button>
      {!isLast && !isExpanded && (
        <div className="mx-5 border-b border-[#D9D9D9]"></div>
      )}
      <div
        className={`w-full bg-[#F5F5F5] px-5 overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-100 opacity-100" : "max-h-0"
        }`}
      >
        <div className="py-5 px-6 flex flex-col gap-4">
          {content.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleSubcategoryClick(item)}
              className="text-sm text-black text-left cursor-pointer hover:opacity-70 transition-opacity"
              aria-label={`${item.name} 카테고리 보기`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpandableCategory;
