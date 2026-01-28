import React from 'react';

const ConfirmModal = ({ isOpen, separator, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm mx-auto">
                <h3 className="text-xl font-semibold text-gray-800">Confirm Separator</h3>
                <p className="mt-4 text-gray-700">
                    The auto-detected separator is: <strong className="text-blue-700">{separator == ";" ? "Semicolon" : "New Line"}</strong>
                </p>
                <div className="mt-6 flex justify-end">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-700 transition-colors duration-200"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                    <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
