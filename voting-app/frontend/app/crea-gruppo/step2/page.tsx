"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./styles.css"; // stile coerente

const initialCategories = [
  "Game", "Films", "Music", "Food", "Science",
  "Animal", "Book", "Sport", "Culture", "Fashion"
];

const Step2Page = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [gridVisible, setGridVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    setGridVisible(true); 
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const chooseRandomCategories = () => {
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    const randomSelection = shuffled.slice(0, 4);
    setSelectedCategories(randomSelection);
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
      setNewCategory("");
      setIsAddingCategory(false);
    }
  };

  const handleConfirm = () => {
    if (isConfirmEnabled) {
      console.log("Categorie selezionate:", selectedCategories);
      router.push("/crea-gruppo/success");
    }
  };

  const isConfirmEnabled = selectedCategories.length > 0;

  return (
    <div className="page">
      <h2 className="heading">Choose One or More Categories</h2>

      <input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="searchInput"
      />

      <div className="toggleContainer">
        <button
          className="toggleButton active"
          onClick={chooseRandomCategories}
        >
          Choose Randomly
        </button>
        <button
          className="toggleButton"
          onClick={() => setIsAddingCategory(true)}
        >
          Add a Category
        </button>
      </div>

      {isAddingCategory && (
        <div className="addCategoryContainer">
          <input
            type="text"
            placeholder="New category name..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="newCategoryInput"
          />
          <button className="addCategoryButton" onClick={addCategory}>
            Add
          </button>
        </div>
      )}

      <div className={`grid ${gridVisible ? "fadeIn" : ""}`}>
        {categories
          .filter((cat) =>
            cat.toLowerCase().includes(search.toLowerCase())
          )
          .map((cat) => (
            <div
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`categoryBox ${
                selectedCategories.includes(cat) ? "selected" : ""
              }`}
            >
              {cat}
            </div>
          ))}
      </div>

        <button
        disabled={!isConfirmEnabled}
        className={`confirmButton ${isConfirmEnabled ? "activeConfirm" : ""}`}
        onClick={handleConfirm}
      >
        Confirm Choice
      </button>
    </div>
  );
};

export default Step2Page;