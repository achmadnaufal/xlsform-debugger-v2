interface LanguageSelectorProps {
  readonly languages: readonly string[];
  readonly active: string;
  readonly onChange: (lang: string) => void;
}

export function LanguageSelector({ languages, active, onChange }: LanguageSelectorProps) {
  if (languages.length <= 1) return null;

  return (
    <div className="flex gap-1 flex-wrap">
      {languages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
            active === lang
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
