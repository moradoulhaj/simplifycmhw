import React from "react";

const TextAreaInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  isValid = true,
}) => {
  const countLines = (text) => {
    if (typeof text !== "string") return 0;
    return text.split("\n").length;
  };
  

  // const countLines = (text) => (text ? text.split("\n").length : 0);
  //  (value.split("\n").length);
  return (
    <div className="w-full">
      <label htmlFor={id} className="block mb-1 text-gray-700 font-semibold">
        {label}
        {id === "proxyInput" ? (
          <span
            className={`inline-flex items-center rounded-md px-2 ml-2 text-xs font-medium  ring-1 ring-inset ring-blue-700/10 ${
              isValid ? "text-blue-700 bg-blue-100 " : "text-red-700 bg-red-100 "
            }`}
          >
            Lines: {countLines(value)}
          </span>
        ) : (
          <span
            className="inline-flex items-center rounded-md bg-blue-100 px-2 ml-2 text-xs font-medium  ring-1 ring-inset ring-blue-700/10 
              text-blue-700 "
          >
            Lines: {countLines(value)}
          </span>
        )}
      </label>
      <textarea
        id={id}
        name={id}
        rows={5}
        style={{ resize: "none" }}
        className={`${isValid ? "focus:ring-indigo-500" : "focus:ring-red-500"} block w-full p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2  focus:outline-none placeholder-gray-400 sm:text-sm`}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextAreaInput;
