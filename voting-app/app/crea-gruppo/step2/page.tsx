"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./styles.css"; // (se presente nel tuo progetto)
import { getGroup } from "@/lib/api";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

const initialCategories = [
  "Game", "Films", "Music", "Food", "Science",
  "Animal", "Book", "Sport", "Culture", "Fashion"
];

const STORAGE_KEY = (groupId: string) => `group:${groupId}:categories`;

const Step2Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId"); // passato da step1
  const joinCode = searchParams.get("joinCode") || "";

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [gridVisible, setGridVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmEnabled = selectedCategories.length > 0 && !saving;

  useEffect(() => { setGridVisible(true); }, []);

  // Precarica eventuali categorie dal server o da localStorage (fallback)
  useEffect(() => {
    if (!groupId) return;

    (async () => {
      try {
        // usa l'helper che normalizza la risposta
        const g = await getGroup(groupId);

        if (Array.isArray(g?.categories) && g.categories.length > 0) {
          setCategories(prev => Array.from(new Set([...prev, ...g.categories!])));
          setSelectedCategories(Array.from(new Set(g.categories!)));
          return;
        }
      } catch {
        // ignora → passeremo al fallback localStorage
      }

      // fallback: prova da localStorage
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY(groupId));
        if (raw) {
          try {
            const saved: string[] = JSON.parse(raw);
            if (Array.isArray(saved) && saved.length > 0) {
              setCategories(prev => Array.from(new Set([...prev, ...saved])));
              setSelectedCategories(Array.from(new Set(saved)));
            }
          } catch { /* ignore */ }
        }
      }
    })();
  }, [groupId]);


  const filtered = useMemo(
    () => categories.filter(c => c.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(cat => cat !== category) : [...prev, category]
    );
  };

  const chooseRandomCategories = (n = 4) => {
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    setSelectedCategories(Array.from(new Set(shuffled.slice(0, n))));
  };

  const addCategory = () => {
    const c = newCategory.trim();
    if (!c) return;
    // evita duplicati case-insensitive
    const exists = categories.some(x => x.toLowerCase() === c.toLowerCase());
    if (!exists) setCategories(prev => [...prev, c]);
    setNewCategory("");
    setIsAddingCategory(false);
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

      // Tentativo 1: route prevista (da implementare nel gateway)
      const res = await fetch(`${API_BASE}/api/groups/${encodeURIComponent(groupId)}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: selectedCategories }),
      });

      if (res.ok) {
        const q = new URLSearchParams({
          groupId,
          ...(joinCode ? { joinCode } : {}),
        } as any).toString();
        router.push(`/crea-gruppo/success?${q}`);
        return;
      }
      // fallback 404 → localStorage
      if (res.status === 404) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY(groupId), JSON.stringify(selectedCategories));
        }
        const q = new URLSearchParams({
          groupId,
          saved: "local",
          ...(joinCode ? { joinCode } : {}),
        } as any).toString();
        router.push(`/crea-gruppo/success?${q}`);
        return;
      }

      // altri errori dal server: mostra testo di risposta
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `HTTP ${res.status}`);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Errore nel salvataggio delle categorie.");
    } finally {
      setSaving(false);
    }
  };

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
        <button className="toggleButton active" onClick={() => chooseRandomCategories(4)}>
          Choose Randomly
        </button>
        <button className="toggleButton" onClick={() => setIsAddingCategory(true)}>
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
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
          />
          <button className="addCategoryButton" onClick={addCategory}>
            Add
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#ffecec",
            color: "#7a0b0b",
            border: "1px solid #f7c2c2",
            padding: 8,
            borderRadius: 6,
            margin: "10px 0",
          }}
        >
          {error}
        </div>
      )}

      <div className={`grid ${gridVisible ? "fadeIn" : ""}`}>
        {filtered.map((cat) => {
          const selected = selectedCategories.includes(cat);
          return (
            <div
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`categoryBox ${selected ? "selected" : ""}`}
              title={selected ? "Remove from selection" : "Add to selection"}
            >
              {cat}
            </div>
          );
        })}
      </div>

      <button
        disabled={!confirmEnabled}
        className={`confirmButton ${confirmEnabled ? "activeConfirm" : ""}`}
        onClick={handleConfirm}
      >
        {saving ? "Saving…" : "Confirm Choice"}
      </button>

      <p style={{ marginTop: 10, fontSize: 12, color: "#888" }}>
        Tip: questa pagina è già pronta per collegarsi al tuo API Gateway quando aggiungerai
        la route <code>POST /api/groups/:groupId/categories</code>. Fino ad allora, salva in locale.
      </p>
    </div>
  );
};

export default Step2Page;
