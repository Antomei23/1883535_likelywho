"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./styles.css"; // se già presente

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

const initialCategories = [
  "Game", "Films", "Music", "Food", "Science",
  "Animal", "Book", "Sport", "Culture", "Fashion"
];

const Step2Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId"); // passato da step1

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [gridVisible, setGridVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setGridVisible(true); }, []);

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

  const handleConfirm = async () => {
    if (!groupId) {
      setError("Manca il groupId. Torna allo step precedente.");
      return;
    }
    if (!selectedCategories.length) return;

    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/groups/${groupId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: selectedCategories }),
      });
      if (!res.ok) throw new Error(await res.text());
      // Vai alla pagina di conferma
      router.push(`/crea-gruppo/success?groupId=${encodeURIComponent(groupId)}`);
    } catch (e) {
      console.error(e);
      setError("Errore nel salvataggio delle categorie.");
    } finally {
      setSaving(false);
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

      {error && (
        <div style={{
          background: "#ffecec", color: "#7a0b0b", border: "1px solid #f7c2c2",
          padding: 8, borderRadius: 6, margin: "10px 0"
        }}>
          {error}
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
        disabled={!isConfirmEnabled || saving}
        className={`confirmButton ${isConfirmEnabled ? "activeConfirm" : ""}`}
        onClick={handleConfirm}
      >
        {saving ? "Saving…" : "Confirm Choice"}
      </button>
    </div>
  );
};

export default Step2Page;
