// ─── Catalog Page + CourseCard ────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Search, Clock, Layers, Star, Users, Award } from "lucide-react";
import { cn, getImageUrl } from "../lib/utils";
import { apiFetch } from "../lib/api";
import { BadgeLabel } from "../components/ui/BadgeLabel";
import { AREAS } from "../data/mockData";
import { CourseShowcaseModal } from "../components/modals/CourseShowcaseModal";
import type { View } from "../types";

// ── Course Card ──────────────────────────────────────────────────────────────
type Course = {
  id: number;
  title: string;
  desc?: string;
  image?: string;
  level?: string;
  cert?: boolean;
  duration?: string;
  modules?: number;
  rating?: number;
  students?: number;
  price: number;
  _count?: { modules: number; enrollments: number };
};

export function CourseCard({
  course,
  onEnroll,
  onViewDetails,
}: {
  course: Course;
  onEnroll: (c: Course) => void;
  onViewDetails: (c: Course) => void;
}) {
  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-black">
        <img
          src={getImageUrl(course.image)}
          alt={course.title}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {course.level === "Obrigatório" && (
            <BadgeLabel variant="amber">Obrigatório</BadgeLabel>
          )}
          {course.cert && (
            <BadgeLabel variant="emerald">
              <Award size={10} className="mr-1 inline" />
              Com Certificado
            </BadgeLabel>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono mb-3">
          <span className="flex items-center gap-1.5"><Clock size={13} /> {course.duration || 'N/A'}</span>
          <span className="flex items-center gap-1.5"><Layers size={13} /> {course._count?.modules || course.modules || 0} mód</span>
        </div>

        <h3 className="font-['Barlow_Condensed'] text-2xl font-bold text-foreground leading-tight mb-2 group-hover:text-amber-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {course.desc || 'Sem descrição'}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground mb-0.5">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-foreground">{course.rating || '5.0'}</span>
              <span className="mx-1">·</span>
              <Users size={11} /> {course._count?.enrollments || course.students || 0}
            </div>
            <span className="font-['Barlow_Condensed'] text-xl font-bold text-amber-400">
              R$ {course.price}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(course)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-md transition-colors"
            >
              Ver Curso
            </button>
            <button
              onClick={() => onEnroll(course)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-xs font-semibold rounded-md transition-colors"
            >
              Matricular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CatalogPage({ onEnroll }: { onEnroll: (c: Course) => void }) {
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");
  const [showcaseCourse, setShowcaseCourse] = useState<Course | null>(null);

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const query = selectedArea ? `?area=${selectedArea}` : '';
        const data = await apiFetch(`/courses${query}`);
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [selectedArea]);

  const filteredCourses = courses
    .filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === "price_asc"
        ? a.price - b.price
        : sort === "price_desc"
        ? b.price - a.price
        : 0
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-['Barlow_Condensed'] text-5xl font-bold text-foreground mb-2">
          Catálogo de Cursos
        </h1>
        <p className="text-muted-foreground">{courses.length} cursos disponíveis</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou norma..."
            className="w-full bg-card border border-border rounded-md pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <select
          value={selectedArea || "all"}
          onChange={(e) => setSelectedArea(e.target.value === "all" ? null : e.target.value)}
          className="bg-card border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none"
        >
          <option value="all">Todas as áreas</option>
          {AREAS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-card border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none"
        >
          <option value="popular">Mais populares</option>
          <option value="recent">Mais recentes</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Carregando cursos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onEnroll={onEnroll} 
              onViewDetails={(c) => setShowcaseCourse(c)}
            />
          ))}
          {filteredCourses.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Nenhum curso encontrado com esses filtros.
            </div>
          )}
        </div>
      )}

      {showcaseCourse && (
        <CourseShowcaseModal
          courseId={showcaseCourse.id}
          onClose={() => setShowcaseCourse(null)}
          onEnroll={() => {
            setShowcaseCourse(null);
            onEnroll(showcaseCourse);
          }}
        />
      )}
    </div>
  );
}
