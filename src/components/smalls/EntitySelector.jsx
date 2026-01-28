import { SplitSquareHorizontal } from "lucide-react";

export default function EntitySelector({
  entityName,
  setEntityName,placeholder,
}) {
  const HandleSelectChange = (e) => {
    setEntityName(e.target.value);
  };
  return (
    <div className="w-full max-w-xs">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <SplitSquareHorizontal className="w-4 h-4" />
        <span>Select Entity</span>
      </label>
        <input
          value={entityName}
          onChange={HandleSelectChange}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
          min={0}
          placeholder="Entity number"
        >
          {/* Suggested code may be subject to a license. Learn more: ~LicenseLog:4148738801. */}
        </input>
 
    
    </div>
  );
}
