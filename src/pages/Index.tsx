import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

const MONTHS = [
  "Январь", "Февраль", "Март", "Гиацинт", "Дубрава", "Ежевик",
  "Жасмин", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const DAYS_SHORT = ["", "", "", "", "", "", ""];

type Note = {
  text: string;
  color: string;
  reminder: boolean;
};

type NotesMap = Record<string, Note>;

const NOTE_COLORS = [
  "hsl(42 85% 58%)",
  "hsl(200 80% 60%)",
  "hsl(330 70% 65%)",
  "hsl(140 60% 55%)",
  "hsl(270 70% 65%)",
];

function getDaysInMonth(_year: number, _month: number) {
  return 28;
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatKey(year: number, month: number, day: number) {
  return `${year}-${month}-${day}`;
}

export default function Index() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [notes, setNotes] = useState<NotesMap>({});
  const [noteText, setNoteText] = useState("");
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
  const [noteReminder, setNoteReminder] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [animKey, setAnimKey] = useState(0);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = useCallback(() => {
    setSlideDir("right");
    setAnimKey(k => k + 1);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDay(null);
    setPanelOpen(false);
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    setSlideDir("left");
    setAnimKey(k => k + 1);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDay(null);
    setPanelOpen(false);
  }, [currentMonth]);

  const handleDayClick = (day: number) => {
    const key = formatKey(currentYear, currentMonth, day);
    setSelectedDay(day);
    setEditingKey(key);
    setNoteText(notes[key]?.text || "");
    setNoteColor(notes[key]?.color || NOTE_COLORS[0]);
    setNoteReminder(notes[key]?.reminder || false);
    setPanelOpen(true);
  };

  const saveNote = () => {
    if (!editingKey) return;
    if (!noteText.trim()) {
      const updated = { ...notes };
      delete updated[editingKey];
      setNotes(updated);
    } else {
      setNotes(prev => ({
        ...prev,
        [editingKey]: { text: noteText, color: noteColor, reminder: noteReminder }
      }));
    }
    setPanelOpen(false);
  };

  const deleteNote = () => {
    if (!editingKey) return;
    const updated = { ...notes };
    delete updated[editingKey];
    setNotes(updated);
    setPanelOpen(false);
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const hasNote = (day: number) => !!notes[formatKey(currentYear, currentMonth, day)];
  const getNoteColor = (day: number) => notes[formatKey(currentYear, currentMonth, day)]?.color;
  const hasReminder = (day: number) => notes[formatKey(currentYear, currentMonth, day)]?.reminder;

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const reminderDays = Object.entries(notes)
    .filter(([, n]) => n.reminder)
    .map(([k, n]) => {
      const [y, m, d] = k.split("-").map(Number);
      return { year: y, month: m, day: d, note: n };
    })
    .sort((a, b) => {
      const da = new Date(a.year, a.month, a.day);
      const db = new Date(b.year, b.month, b.day);
      return da.getTime() - db.getTime();
    })
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-golos">
      {/* Декоративный фон */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(42 85% 58%) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, hsl(200 80% 50%) 0%, transparent 70%)" }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="hsl(42 85% 58%)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 min-h-screen flex flex-col gap-6">

        {/* Заголовок */}
        <header className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="font-cormorant text-5xl font-light tracking-tight" style={{ color: "hsl(var(--primary))" }}>
              Хроника
            </h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              личный календарь событий
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
            <Icon name="Clock" size={14} />
            <span>{today.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</span>
          </div>
        </header>

        <div className="flex gap-5 flex-col lg:flex-row">

          {/* Главная карточка календаря */}
          <div className="flex-1 rounded-3xl p-6 flex flex-col gap-5 animate-fade-in"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 24px 60px -12px hsl(220 20% 4% / 0.6)"
            }}>

            {/* Навигация по месяцу */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                <Icon name="ChevronLeft" size={18} />
              </button>

              <div className="text-center">
                <h2 className="font-cormorant text-3xl font-light" style={{ color: "hsl(var(--foreground))" }}>
                  {MONTHS[currentMonth]}
                </h2>
                <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{currentYear}</span>
              </div>

              <button
                onClick={nextMonth}
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                <Icon name="ChevronRight" size={18} />
              </button>
            </div>

            {/* Дни недели */}
            <div className="grid grid-cols-7 gap-1">
              {DAYS_SHORT.map((d, i) => (
                <div key={d} className="text-center text-xs font-medium py-1"
                  style={{ color: i >= 5 ? "hsl(42 85% 58%)" : "hsl(var(--muted-foreground))" }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Сетка дней */}
            <div
              key={animKey}
              className={slideDir === "left" ? "animate-slide-left" : "animate-slide-right"}
            >
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: totalCells }).map((_, i) => {
                  const dayNum = i - firstDay + 1;
                  const valid = dayNum >= 1 && dayNum <= daysInMonth;
                  const _today = valid && isToday(dayNum);
                  const _hasNote = valid && hasNote(dayNum);
                  const _noteColor = valid && getNoteColor(dayNum);
                  const _hasReminder = valid && hasReminder(dayNum);
                  const isSelected = valid && selectedDay === dayNum && panelOpen;
                  const colIndex = i % 7;
                  const isWeekend = colIndex >= 5;

                  return (
                    <button
                      key={i}
                      disabled={!valid}
                      onClick={() => valid && handleDayClick(dayNum)}
                      className="relative aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 group"
                      style={{
                        background: _today
                          ? "hsl(var(--primary))"
                          : isSelected
                            ? "hsl(var(--muted))"
                            : "transparent",
                        color: _today
                          ? "hsl(var(--primary-foreground))"
                          : !valid
                            ? "transparent"
                            : isWeekend
                              ? "hsl(42 60% 65%)"
                              : "hsl(var(--foreground))",
                        border: isSelected && !_today
                          ? "1px solid hsl(var(--primary))"
                          : "1px solid transparent",
                        cursor: valid ? "pointer" : "default",
                        boxShadow: _today ? "0 4px 20px hsl(42 85% 58% / 0.4)" : "none",
                      }}
                    >
                      {valid && (
                        <>
                          <span className="transition-transform duration-200 group-hover:scale-110 leading-none">
                            {dayNum}
                          </span>
                          {_hasNote && (
                            <span
                              className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full"
                              style={{ background: _noteColor || "hsl(var(--primary))" }}
                            />
                          )}
                          {_hasReminder && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full animate-pulse-gold"
                              style={{ background: "hsl(var(--primary))" }} />
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Счётчик заметок */}
            <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center gap-2 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                <Icon name="FileText" size={13} />
                <span>
                  {Object.keys(notes).length}{" "}
                  {Object.keys(notes).length === 1 ? "заметка" : Object.keys(notes).length < 5 ? "заметки" : "заметок"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs ml-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
                <Icon name="Bell" size={13} />
                <span>{Object.values(notes).filter(n => n.reminder).length} напоминаний</span>
              </div>
            </div>
          </div>

          {/* Правая панель */}
          <div className="w-full lg:w-72 flex flex-col gap-4">

            {/* Панель заметки */}
            {panelOpen && selectedDay && (
              <div className="rounded-3xl p-5 flex flex-col gap-4 animate-fade-in-scale"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  boxShadow: "0 20px 50px -10px hsl(220 20% 4% / 0.5)"
                }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-cormorant text-xl font-medium" style={{ color: "hsl(var(--foreground))" }}>
                    {selectedDay} {MONTHS[currentMonth]}
                  </h3>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                    <Icon name="X" size={14} />
                  </button>
                </div>

                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Запишите событие или мысль..."
                  rows={4}
                  className="w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{
                    background: "hsl(var(--muted))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                    fontFamily: "'Golos Text', sans-serif",
                  }}
                  onFocus={e => { e.target.style.borderColor = "hsl(var(--primary))"; }}
                  onBlur={e => { e.target.style.borderColor = "hsl(var(--border))"; }}
                />

                {/* Выбор цвета */}
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Цвет метки:</span>
                  <div className="flex gap-1.5 ml-auto">
                    {NOTE_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNoteColor(c)}
                        className="w-5 h-5 rounded-full transition-all duration-200"
                        style={{
                          background: c,
                          transform: noteColor === c ? "scale(1.3)" : "scale(1)",
                          boxShadow: noteColor === c ? `0 0 0 2px hsl(var(--card)), 0 0 0 3px ${c}` : "none"
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Напоминание */}
                <button
                  onClick={() => setNoteReminder(r => !r)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm transition-all duration-200"
                  style={{
                    background: noteReminder ? "hsl(42 85% 58% / 0.15)" : "hsl(var(--muted))",
                    border: noteReminder ? "1px solid hsl(42 85% 58% / 0.4)" : "1px solid hsl(var(--border))",
                    color: noteReminder ? "hsl(42 85% 58%)" : "hsl(var(--muted-foreground))",
                  }}>
                  <Icon name={noteReminder ? "BellRing" : "Bell"} size={15} />
                  <span>{noteReminder ? "Напоминание включено" : "Добавить напоминание"}</span>
                </button>

                {/* Кнопки */}
                <div className="flex gap-2">
                  {editingKey && notes[editingKey] && (
                    <button
                      onClick={deleteNote}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{ background: "hsl(0 62.8% 50% / 0.15)", border: "1px solid hsl(0 62.8% 50% / 0.3)", color: "hsl(0 62.8% 65%)" }}>
                      <Icon name="Trash2" size={15} />
                    </button>
                  )}
                  <button
                    onClick={saveNote}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                      boxShadow: "0 4px 20px hsl(42 85% 58% / 0.3)"
                    }}>
                    Сохранить
                  </button>
                </div>
              </div>
            )}

            {/* Напоминания */}
            <div className="rounded-3xl p-5 flex flex-col gap-4 animate-fade-in"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
              }}>
              <div className="flex items-center gap-2">
                <Icon name="BellRing" size={16} style={{ color: "hsl(var(--primary))" }} />
                <h3 className="font-cormorant text-lg font-medium" style={{ color: "hsl(var(--foreground))" }}>
                  Напоминания
                </h3>
              </div>

              {reminderDays.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Нет активных напоминаний</p>
                  <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.6 }}>
                    Кликните на дату и добавьте событие
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {reminderDays.map(({ year, month, day, note }) => (
                    <button
                      key={`${year}-${month}-${day}`}
                      onClick={() => {
                        setCurrentYear(year);
                        setCurrentMonth(month);
                        setTimeout(() => handleDayClick(day), 50);
                      }}
                      className="flex items-start gap-3 p-3 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-95"
                      style={{
                        background: "hsl(var(--muted))",
                        border: `1px solid ${note.color}40`
                      }}>
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse-gold"
                        style={{ background: note.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {day} {MONTHS[month]} {year}
                        </p>
                        <p className="text-sm truncate mt-0.5" style={{ color: "hsl(var(--foreground))" }}>
                          {note.text}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Список заметок этого месяца */}
            {Object.entries(notes).filter(([k]) => {
              const [y, m] = k.split("-").map(Number);
              return y === currentYear && m === currentMonth;
            }).length > 0 && (
              <div className="rounded-3xl p-5 flex flex-col gap-3 animate-fade-in"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                <div className="flex items-center gap-2">
                  <Icon name="FileText" size={15} style={{ color: "hsl(var(--primary))" }} />
                  <h3 className="font-cormorant text-lg font-medium" style={{ color: "hsl(var(--foreground))" }}>
                    В этом месяце
                  </h3>
                </div>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(notes)
                    .filter(([k]) => {
                      const [y, m] = k.split("-").map(Number);
                      return y === currentYear && m === currentMonth;
                    })
                    .sort(([a], [b]) => parseInt(a.split("-")[2]) - parseInt(b.split("-")[2]))
                    .map(([key, note]) => {
                      const day = parseInt(key.split("-")[2]);
                      return (
                        <button
                          key={key}
                          onClick={() => handleDayClick(day)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all hover:scale-[1.01]"
                          style={{ background: "hsl(var(--muted))" }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: note.color }} />
                          <span className="text-xs font-medium w-5 flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>{day}</span>
                          <span className="text-xs truncate" style={{ color: "hsl(var(--foreground))" }}>{note.text}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}