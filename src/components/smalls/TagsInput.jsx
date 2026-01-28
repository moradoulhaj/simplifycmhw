import { Tags } from "lucide-react";

export default function TagsInput({
  tagsToRemove,
  setTagsToRemove,
  setProcessedContents,
  content,
}) {
  const handleInputChange = (e) => {
    setTagsToRemove(e.target.value);
    if (setProcessedContents) {
      setProcessedContents([]);
    }

  };

  // HandleInputChange
  return (
    <div className="w-full max-w-2xl">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Tags className="w-4 h-4" />

        <span>{content} (one per line)</span>
      </label>
      <textarea
        value={tagsToRemove}
        onChange={handleInputChange}
        className="w-full h-40 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        placeholder={content}
      />
    </div>
  );
}
