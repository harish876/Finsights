interface PromptSuggestionsProps {
  label: string;
  append: (message: { role: "user"; content: string }) => void;
  suggestions: string[];
}

export function PromptSuggestions({
  label,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-2">
      <h2 className="text-center text-2xl font-bold">{label}</h2>
      <div className="flex gap-6 text-sm">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => append({ role: "user", content: suggestion })}
            className="px-4 py-2 rounded-full bg-white border border-casca-200  hover:border-casca-500 hover:text-casca-700 transition-colors"
          >
            <p>{suggestion}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
