import { useRef } from 'react'
import { toast } from 'react-toastify'

export default function TextAreaWithCopyDesktop({ id, label, value }) {
  const textAreaRef = useRef(null)

  const countLines = text => (text ? text.split('\n').length : 0)

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => toast.success('Copied successfully!'))
      .catch(() => toast.error('Failed to copy.'))
  }

  const copyProfileNumbers = () => {
    const profileNumbers = value
      .split('\n')
      .map(line => line.split(',')[0])
      .join('\n')

    navigator.clipboard
      .writeText(profileNumbers)
      .then(() => toast.success('Profile numbers copied!'))
      .catch(() => toast.error('Failed to copy profile numbers.'))
  }

  return (
    <div className="w-full border p-5 border-gray-300 rounded-lg shadow-md bg-white">
      <label
        htmlFor={id}
        className="block mb-3 text-center font-semibold text-gray-800"
      >
        {label}
        <span className="ml-2 px-2 text-xs font-medium bg-blue-100 text-blue-700 rounded ring-1 ring-blue-700/10">
          Lines: {countLines(value)}
        </span>
      </label>

      <textarea
        id={id}
        rows={12}
        style={{ height: '160px', resize: 'none' }}
        className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 bg-gray-50 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm"
        value={value}
        ref={textAreaRef}
        readOnly
      />

      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={copyProfileNumbers}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md"
          title="Copy profile numbers"
        >
          <i className="ri-numbers-line"></i>
        </button>

        <button
          onClick={copyToClipboard}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md"
          title="Copy full text"
        >
          <i className="ri-clipboard-line"></i>
        </button>
      </div>
    </div>
  )
}
